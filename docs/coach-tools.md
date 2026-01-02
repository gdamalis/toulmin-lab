# Coach AI Tool Contract

This document describes the JSON schema and trigger rules for the AI coach that guides users through building Toulmin arguments.

## Overview

The coach uses a structured JSON response format that the UI consumes to:
1. Display assistant messages
2. Show proposed text updates via `ProposedUpdateCard`
3. Advance through Toulmin steps
4. Finalize the argument when complete

## Response Schema

```typescript
interface CoachAIResult {
  // Required: The tutor's response message (2-3 sentences max)
  assistantText: string;
  
  // Required: Current Toulmin step being worked on
  step: ToulminStep;
  
  // Optional: Confidence score 0-1 for step completion
  confidence?: number;
  
  // Optional: Proposed text update - triggers ProposedUpdateCard
  proposedUpdate?: {
    field: ToulminStep;    // Must match current step
    value: string;         // The proposed text (non-empty)
    rationale: string;     // Brief explanation
  };
  
  // Optional: A guiding question to help the user
  nextQuestion?: string;
  
  // Optional: Whether to advance to next step
  shouldAdvance?: boolean;
  
  // Required when shouldAdvance=true: Next step in sequence
  nextStep?: ToulminStep;
  
  // Optional: True when all 7 steps are complete
  isComplete?: boolean;
}

type ToulminStep = 
  | 'claim'
  | 'grounds'
  | 'warrant'
  | 'groundsBacking'
  | 'warrantBacking'
  | 'qualifier'
  | 'rebuttal';
```

## ProposedUpdateCard Triggers

The `ProposedUpdateCard` component displays when the AI includes a `proposedUpdate` in its response. The AI should include this in the following scenarios:

### 1. User Confirms/Accepts

When the user explicitly accepts or confirms a suggestion:
- "yes", "ok", "that works", "use that"
- "sí", "me sirve", "definitivamente está bien" (Spanish)

**AI must** include `proposedUpdate` with the confirmed text.

### 2. Explicit Rewrite Request

When the user asks for text improvement:
- "rewrite", "improve", "rephrase", "fix", "help me word"
- "reescribe", "mejora", "arregla" (Spanish)

The API detects these patterns and adds context to the prompt. **AI should** propose an improved version based on the user's existing text.

### 3. Proactive Weak-Text Detection

When the current step field contains text that is:
- Weak or incomplete
- Misaligned (e.g., grounds in the claim field)
- Doesn't fit the Toulmin element definition

**AI may** proactively suggest improvements with explanation.

### When NOT to Include proposedUpdate

- Current step field is empty (guide user to write first)
- No text provided for this step yet
- Just asking a clarifying question
- User hasn't engaged with the current step

## Server-Side Validation

The API (`/api/coach`) enforces the contract:

1. **Step coercion**: `step` and `proposedUpdate.field` are forced to match the session's current step
2. **Empty value removal**: `proposedUpdate` with empty `value` is stripped
3. **shouldAdvance guards**: 
   - Stripped if no `proposedUpdate` and draft field is empty
   - Converted to `isComplete=true` on rebuttal step
4. **nextStep correction**: Automatically set to correct next step when `shouldAdvance=true`
5. **Schema validation**: Final result must pass `CoachAIResultSchema`

## UI Handling (ChatPanel)

The `ChatPanel` component:

1. Streams partial responses for real-time display
2. Parses final NDJSON line for complete result
3. Only accepts `proposedUpdate` when `field === currentStep`
4. Shows `ProposedUpdateCard` when `proposedUpdate` is present
5. On confirm: saves to draft, advances step, triggers next coach turn
6. On reject: clears proposal, user can continue conversation

## Error Handling

NDJSON error responses:
- `{ error: 'coach_stream_failed' }` - Stream processing error
- `{ error: 'coach_validation_failed' }` - Schema validation failure
- `{ error: 'coach_empty_response' }` - Empty assistantText
- `{ error: 'coach_step_mismatch' }` - Step doesn't match session

The UI displays appropriate error messages and allows retry.

