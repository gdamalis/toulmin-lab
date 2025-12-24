import { NextRequest } from "next/server";
import { withAuth } from "@/lib/api/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/responses";
import { navigateToStep, findChatSessionByIdForUser, addMessageToChatSession } from "@/lib/mongodb/chat-sessions";
import { ToulminStep, ChatMessage } from "@/types/chat";
import { v4 as uuidv4 } from 'uuid';

const VALID_STEPS: ToulminStep[] = [
  'intro', 'claim', 'warrant', 'warrantBacking', 
  'grounds', 'groundsBacking', 'qualifier', 'rebuttal'
];

const STEP_LABELS: Record<ToulminStep, { en: string; es: string }> = {
  intro: { en: 'Introduction', es: 'Introducción' },
  claim: { en: 'Claim', es: 'Enunciado' },
  warrant: { en: 'Warrant', es: 'Garantía' },
  warrantBacking: { en: 'Warrant Backing', es: 'Respaldo de Garantía' },
  grounds: { en: 'Grounds', es: 'Evidencia' },
  groundsBacking: { en: 'Grounds Backing', es: 'Respaldo de Evidencia' },
  qualifier: { en: 'Qualifier', es: 'Cualificador' },
  rebuttal: { en: 'Rebuttal', es: 'Refutación' },
  done: { en: 'Complete', es: 'Completo' }
};

/**
 * POST /api/chat/sessions/[id]/navigate/[step] - Navigate to a specific step
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string; step: string }> }
) {
  return withAuth(async (request, _context, auth) => {
    try {
      const params = await context.params;
      const sessionId = params.id;
      const targetStep = params.step as ToulminStep;

      if (!VALID_STEPS.includes(targetStep)) {
        return createErrorResponse("Invalid step", 400);
      }

      const session = await findChatSessionByIdForUser(sessionId, auth.userId);
      if (!session) {
        return createErrorResponse("Session not found", 404);
      }

      if (session.status === 'completed') {
        return createErrorResponse("Cannot navigate in completed session", 400);
      }

      // Navigate to target step
      const result = await navigateToStep(sessionId, auth.userId, targetStep);

      if (!result.success) {
        return createErrorResponse("Failed to navigate", 500);
      }

      // Add system message about navigation
      const stepLabel = STEP_LABELS[targetStep][session.language] || targetStep;
      const systemMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: session.language === 'es'
          ? `Navegando a: ${stepLabel}. ${result.loadedDraft ? 'He cargado tu contenido anterior como borrador.' : 'Empecemos a trabajar en esta parte.'}`
          : `Navigating to: ${stepLabel}. ${result.loadedDraft ? "I've loaded your previous content as a draft." : "Let's work on this part."}`,
        timestamp: new Date(),
        metadata: {
          step: targetStep,
          isSystemNavigation: true
        }
      };

      await addMessageToChatSession(sessionId, systemMessage);

      // Get updated session
      const updatedSession = await findChatSessionByIdForUser(sessionId, auth.userId);

      return createSuccessResponse({
        navigated: true,
        currentStep: targetStep,
        loadedDraft: result.loadedDraft,
        currentDraft: updatedSession?.drafts[targetStep as keyof typeof updatedSession.drafts],
        systemMessage
      });

    } catch (error) {
      console.error("Error navigating to step:", error);
      return createErrorResponse(
        error instanceof Error ? error.message : "Failed to navigate",
        500
      );
    }
  })(request, context);
}
