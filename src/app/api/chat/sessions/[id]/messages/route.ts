import { NextRequest } from "next/server";
import { withAuth } from "@/lib/api/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/responses";
import { parseRequestBody } from "@/lib/api/middleware";
import { 
  findChatSessionByIdForUser,
  addMessageToChatSession,
  updateDraft,
  updateSuggestedActions,
  navigateToStep,
  confirmPartAndAdvance
} from "@/lib/mongodb/chat-sessions";
import { ChatMessage, DraftState, SuggestedAction, ToulminStep } from "@/types/chat";
import { ToulminArgumentPart } from "@/types/toulmin";
import { generateChatResponse, stepToPartName } from "@/lib/services/chat-ai";
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/chat/sessions/[id]/messages - Send a message and get AI response
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAuth(async (request, _context, auth) => {
    try {
      const params = await context.params;
      const sessionId = params.id;
      const body = await parseRequestBody<{ content: string }>(request);

      if (!sessionId) {
        return createErrorResponse("Session ID is required", 400);
      }

      if (!body?.content?.trim()) {
        return createErrorResponse("Message content is required", 400);
      }

      // Verify session belongs to user
      const session = await findChatSessionByIdForUser(sessionId, auth.userId);
      if (!session) {
        return createErrorResponse("Chat session not found", 404);
      }

      if (session.status === 'completed') {
        return createErrorResponse("Cannot send messages to completed session", 400);
      }

      // Create user message
      const userMessage: ChatMessage = {
        id: uuidv4(),
        role: 'user',
        content: body.content.trim(),
        timestamp: new Date(),
        metadata: {
          step: session.currentStep
        }
      };

      // Add user message to session
      await addMessageToChatSession(sessionId, userMessage);

      // Get current draft for this step
      const currentDraft = session.drafts[session.currentStep as keyof typeof session.drafts];

      // Generate AI response (includes classification + draft/review)
      const aiResult = await generateChatResponse(
        [...session.messages, userMessage],
        session.currentStep,
        currentDraft,
        session.argumentProgress,
        session.language
      );

      if (!aiResult.success) {
        return createErrorResponse(
          aiResult.error || "Failed to generate AI response",
          500
        );
      }

      // Track the effective current step (may change due to navigation)
      let effectiveStep = session.currentStep;
      let navigatedTo: ToulminStep | undefined;
      let confirmedPart: string | undefined;
      let advancedToStep: ToulminStep | undefined;

      // Handle intent-based actions
      const classification = aiResult.classification;
      if (classification) {
        // Handle revision intent - navigate to target step
        if (classification.intent === 'revise' && classification.targetPart !== 'none') {
          const targetStep = classification.targetPart === 'current' 
            ? session.currentStep 
            : classification.targetPart as ToulminStep;
          
          // Only navigate if different from current step and it's a valid argument step
          const validSteps: ToulminStep[] = ['claim', 'warrant', 'warrantBacking', 'grounds', 'groundsBacking', 'qualifier', 'rebuttal'];
          if (targetStep !== session.currentStep && validSteps.includes(targetStep)) {
            const navResult = await navigateToStep(sessionId, auth.userId, targetStep);
            if (navResult.success) {
              effectiveStep = targetStep;
              navigatedTo = targetStep;
            }
          }
        }

        // Handle confirm_part intent - auto-confirm if draft is ready
        if (classification.intent === 'confirm_part') {
          const currentDraftState = session.drafts[session.currentStep as keyof typeof session.drafts];
          if (currentDraftState?.isReady && currentDraftState?.text) {
            const partName = stepToPartName(session.currentStep);
            if (partName) {
              try {
                const confirmResult = await confirmPartAndAdvance(
                  sessionId,
                  auth.userId,
                  partName as keyof ToulminArgumentPart,
                  currentDraftState.text
                );
                if (confirmResult.success) {
                  effectiveStep = confirmResult.nextStep;
                  advancedToStep = confirmResult.nextStep;
                  confirmedPart = session.currentStep;
                }
              } catch {
                // If confirmation fails, continue with normal flow
                console.error('Auto-confirm failed, continuing with normal response');
              }
            }
          }
        }

        // Handle request_next intent - advance if draft is ready
        if (classification.intent === 'request_next') {
          const currentDraftState = session.drafts[session.currentStep as keyof typeof session.drafts];
          if (currentDraftState?.isReady && currentDraftState?.text) {
            const partName = stepToPartName(session.currentStep);
            if (partName) {
              try {
                const confirmResult = await confirmPartAndAdvance(
                  sessionId,
                  auth.userId,
                  partName as keyof ToulminArgumentPart,
                  currentDraftState.text
                );
                if (confirmResult.success) {
                  effectiveStep = confirmResult.nextStep;
                  advancedToStep = confirmResult.nextStep;
                  confirmedPart = session.currentStep;
                }
              } catch {
                console.error('Auto-advance failed, continuing with normal response');
              }
            }
          }
        }
      }

      // If draft was generated, update it in DB
      if (aiResult.draftReview) {
        const newDraft: DraftState = {
          text: aiResult.draftReview.draft,
          isReady: aiResult.draftReview.self_review.isReady,
          issues: aiResult.draftReview.self_review.issues,
          suggestedEdits: aiResult.draftReview.self_review.suggestedEdits,
          lastUpdatedAt: new Date()
        };
        
        await updateDraft(sessionId, session.currentStep, newDraft);
        
        // Compute suggested actions
        const actions: SuggestedAction[] = newDraft.isReady 
          ? ['confirm', 'refine', 'skip']
          : ['refine', 'skip'];
        
        await updateSuggestedActions(sessionId, actions);
      }

      // Create AI message with navigation/confirmation context
      const aiMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: aiResult.message,
        timestamp: new Date(),
        metadata: {
          step: effectiveStep,
          draftState: aiResult.draftReview ? {
            isReady: aiResult.draftReview.self_review.isReady,
            issues: aiResult.draftReview.self_review.issues
          } : undefined,
          navigatedTo,
          confirmedPart,
          advancedToStep
        }
      };

      // Add AI message to session
      await addMessageToChatSession(sessionId, aiMessage);

      // Get updated session state
      const updatedSession = await findChatSessionByIdForUser(sessionId, auth.userId);

      return createSuccessResponse({
        userMessage,
        aiMessage,
        currentDraft: updatedSession?.drafts[effectiveStep as keyof typeof updatedSession.drafts],
        suggestedActions: updatedSession?.suggestedActions || [],
        currentStep: effectiveStep,
        // Include navigation/confirmation info in response
        navigatedTo,
        confirmedPart,
        advancedToStep,
        argumentProgress: updatedSession?.argumentProgress
      });

    } catch (error) {
      console.error("Error processing chat message:", error);
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to process message",
        500
      );
    }
  })(request, context);
}
