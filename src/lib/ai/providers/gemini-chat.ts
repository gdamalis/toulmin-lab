import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  ChatMessage, 
  ToulminStep, 
  ArgumentProgress, 
  AIChatResult,
  ChatAIProvider,
  ClassifierResult,
  DraftReviewResult,
  DraftState,
  QualifierDraft
} from '@/types/chat';
import { Locale } from '@/i18n/settings';
import { createBaseProvider, DEFAULT_RATE_LIMITS } from '../provider-interface';
import { AIProviderConfig, AIServiceError } from '@/types/ai';

/**
 * Classifier system prompts
 */
const CLASSIFIER_SYSTEM_PROMPT = {
  en: `You are a precise intent classifier for an educational Toulmin argument wizard.
Analyze the user's message and classify their intent.

CURRENT CONTEXT:
- Current step: {{currentStep}}
- Completed parts: {{completedParts}}

Available intents:
- ask_question: User asks for explanation, examples, or help
- propose: User provides content for the current step
- revise: User wants to modify a SPECIFIC previous part (must identify which in targetPart)
- confirm_part: User explicitly confirms (e.g., "yes", "looks good", "confirm")
- request_next: User asks to move to next step
- meta_help: User asks about the overall process

REVISION DETECTION - If user mentions wanting to change/edit/revise:
- "claim", "thesis", "position", "main point" → targetPart: "claim"
- "warrant", "reasoning", "logic", "connection" → targetPart: "warrant"
- "evidence", "grounds", "data", "facts" → targetPart: "grounds"
- "backing" for warrant → targetPart: "warrantBacking"
- "backing" for evidence/grounds → targetPart: "groundsBacking"
- "qualifier", "certainty", "probability" → targetPart: "qualifier"
- "rebuttal", "counter", "objection" → targetPart: "rebuttal"
- If unclear which part, use targetPart matching the step they mention, or "current" if they want to revise the current step's draft

Return strict JSON matching this schema:
{
  "intent": "ask_question | propose | revise | confirm_part | request_next | meta_help",
  "targetPart": "claim | warrant | warrantBacking | grounds | groundsBacking | qualifier | rebuttal | current | none",
  "extracted": { "text": "extracted content if any" },
  "confidence": 0.0-1.0
}`,
  es: `Eres un clasificador de intenciones para un asistente educativo de argumentación Toulmin.
Analiza el mensaje del usuario y clasifica su intención.

CONTEXTO ACTUAL:
- Paso actual: {{currentStep}}
- Partes completadas: {{completedParts}}

Intenciones disponibles:
- ask_question: Usuario pregunta por explicación, ejemplos o ayuda
- propose: Usuario proporciona contenido para el paso actual
- revise: Usuario quiere modificar una parte ESPECÍFICA anterior (debe identificar cuál en targetPart)
- confirm_part: Usuario confirma explícitamente (ej: "sí", "se ve bien", "confirmar")
- request_next: Usuario pide avanzar al siguiente paso
- meta_help: Usuario pregunta sobre el proceso general

DETECCIÓN DE REVISIÓN - Si el usuario menciona querer cambiar/editar/revisar:
- "claim", "tesis", "posición", "punto principal", "enunciado" → targetPart: "claim"
- "warrant", "garantía", "razonamiento", "lógica", "conexión" → targetPart: "warrant"
- "evidence", "grounds", "evidencia", "datos", "hechos" → targetPart: "grounds"
- "respaldo" de la garantía → targetPart: "warrantBacking"
- "respaldo" de la evidencia → targetPart: "groundsBacking"
- "qualifier", "cualificador", "certeza", "probabilidad" → targetPart: "qualifier"
- "rebuttal", "refutación", "contra", "objeción" → targetPart: "rebuttal"
- Si no está claro, usar targetPart del paso mencionado, o "current" si quieren revisar el borrador actual

Devuelve JSON estricto según este esquema:
{
  "intent": "ask_question | propose | revise | confirm_part | request_next | meta_help",
  "targetPart": "claim | warrant | warrantBacking | grounds | groundsBacking | qualifier | rebuttal | current | none",
  "extracted": { "text": "contenido extraído si existe" },
  "confidence": 0.0-1.0
}`
};

/**
 * Readiness rubrics for each step
 */
const READINESS_RUBRICS: Record<string, { en: string; es: string }> = {
  claim: {
    en: `A ready claim must:
1. Be ONE debatable assertion (not a fact everyone agrees on)
2. NOT include evidence or "because..." reasoning
3. Be specific enough to argue for
4. NOT include citations or source references

Issues to flag:
- Multiple claims in one statement
- Evidence embedded in the claim
- Too vague or too broad
- Statement of fact rather than arguable position`,
    es: `Un enunciado listo debe:
1. Ser UNA afirmación debatible (no un hecho aceptado por todos)
2. NO incluir evidencia o razonamiento "porque..."
3. Ser suficientemente específico para argumentar
4. NO incluir citas o referencias de fuentes

Problemas a señalar:
- Múltiples enunciados en una declaración
- Evidencia incrustada en el enunciado
- Demasiado vago o amplio
- Declaración de hecho en lugar de posición argumentable`
  },
  warrant: {
    en: `A ready warrant must:
1. Be a GENERAL PRINCIPLE or rule, not specific evidence
2. Explain WHY grounds support the claim (the logical bridge)
3. Be stated as: "If X, then Y" OR "When X, Y follows" OR "X generally leads to Y"
4. NOT repeat the grounds or add new evidence

Issues to flag:
- Provides more evidence instead of logical principle
- Too specific to this case (not generalizable)
- Simply restates the claim or grounds
- Missing the bridging logic`,
    es: `Una garantía lista debe:
1. Ser un PRINCIPIO GENERAL o regla, no evidencia específica
2. Explicar POR QUÉ la evidencia apoya el enunciado (puente lógico)
3. Formularse como: "Si X, entonces Y" O "Cuando X, Y resulta" O "X generalmente lleva a Y"
4. NO repetir la evidencia o agregar nueva evidencia

Problemas a señalar:
- Proporciona más evidencia en lugar de principio lógico
- Demasiado específico para este caso (no generalizable)
- Simplemente reafirma el enunciado o evidencia
- Falta la lógica de conexión`
  },
  warrantBacking: {
    en: `Ready warrant backing must:
1. Provide credible SOURCES for the warrant
2. Include references to authority, research, or established principles
3. Be specific about where the warrant's validity comes from

Issues to flag:
- No sources provided
- Vague or unverifiable sources
- Confuses grounds sources with warrant sources`,
    es: `El respaldo de garantía listo debe:
1. Proporcionar FUENTES creíbles para la garantía
2. Incluir referencias a autoridad, investigación o principios establecidos
3. Ser específico sobre de dónde proviene la validez de la garantía

Problemas a señalar:
- No se proporcionan fuentes
- Fuentes vagas o no verificables
- Confunde fuentes de evidencia con fuentes de garantía`
  },
  grounds: {
    en: `Ready grounds must:
1. Provide specific EVIDENCE (data, facts, examples)
2. Be relevant to the claim
3. Be verifiable or observable
4. NOT be opinions or assumptions

Issues to flag:
- Too general or vague
- Opinion stated as fact
- Not directly relevant to claim
- Missing specific details`,
    es: `La evidencia lista debe:
1. Proporcionar EVIDENCIA específica (datos, hechos, ejemplos)
2. Ser relevante para el enunciado
3. Ser verificable u observable
4. NO ser opiniones o suposiciones

Problemas a señalar:
- Demasiado general o vago
- Opinión presentada como hecho
- No directamente relevante al enunciado
- Faltan detalles específicos`
  },
  groundsBacking: {
    en: `Ready grounds backing must:
1. Provide credible SOURCES for the evidence
2. Include specific citations, studies, or references
3. Establish why the evidence is trustworthy

Issues to flag:
- No sources provided
- Unreliable or questionable sources
- Sources don't match the evidence provided`,
    es: `El respaldo de evidencia listo debe:
1. Proporcionar FUENTES creíbles para la evidencia
2. Incluir citas específicas, estudios o referencias
3. Establecer por qué la evidencia es confiable

Problemas a señalar:
- No se proporcionan fuentes
- Fuentes poco confiables o cuestionables
- Las fuentes no coinciden con la evidencia proporcionada`
  },
  qualifier: {
    en: `A ready qualifier must:
1. Indicate the level of certainty (necessarily, probably, plausibly, usually, etc.)
2. Be appropriate for the strength of the argument
3. Be a single word or short phrase

Issues to flag:
- No qualifier provided
- Qualifier doesn't match argument strength
- Too complex or multiple qualifiers`,
    es: `Un calificador listo debe:
1. Indicar el nivel de certeza (necesariamente, probablemente, plausiblemente, usualmente, etc.)
2. Ser apropiado para la fuerza del argumento
3. Ser una sola palabra o frase corta

Problemas a señalar:
- No se proporciona calificador
- El calificador no coincide con la fuerza del argumento
- Demasiado complejo o múltiples calificadores`
  },
  rebuttal: {
    en: `A ready rebuttal must:
1. Identify specific scenarios where the claim might be FALSE
2. Be realistic and relevant counter-arguments
3. Acknowledge limitations of the argument

Issues to flag:
- Too vague or generic
- Doesn't actually challenge the claim
- Confuses rebuttal with qualifier
- No specific conditions provided`,
    es: `Una refutación lista debe:
1. Identificar escenarios específicos donde el enunciado podría ser FALSO
2. Ser contra-argumentos realistas y relevantes
3. Reconocer limitaciones del argumento

Problemas a señalar:
- Demasiado vago o genérico
- No desafía realmente el enunciado
- Confunde refutación con calificador
- No se proporcionan condiciones específicas`
  }
};

/**
 * Step introduction prompts
 */
const STEP_PROMPTS: Record<string, { en: string; es: string }> = {
  intro: {
    en: `Welcome! I'll help you build a strong argument using Stephen Toulmin's model. 

The Toulmin model breaks down arguments into clear components:
1. **Claim**: Your main thesis
2. **Warrant**: The logical principle connecting evidence to claim
3. **Warrant Backing**: Sources supporting that principle
4. **Grounds**: Your evidence
5. **Grounds Backing**: Sources for your evidence
6. **Qualifier**: How certain you are
7. **Rebuttal**: When your claim might not hold

Let's start! What topic or claim would you like to argue for?`,
    es: `¡Bienvenido! Te ayudaré a construir un argumento sólido usando el modelo de Stephen Toulmin.

El modelo Toulmin descompone argumentos en componentes claros:
1. **Enunciado**: Tu tesis principal
2. **Garantía**: El principio lógico que conecta evidencia con enunciado
3. **Respaldo de Garantía**: Fuentes que apoyan ese principio
4. **Evidencia**: Tus datos
5. **Respaldo de Evidencia**: Fuentes para tu evidencia
6. **Calificador**: Cuán seguro estás
7. **Refutación**: Cuándo tu enunciado podría no ser válido

¡Comencemos! ¿Qué tema o enunciado te gustaría argumentar?`
  },
  claim: {
    en: `Now let's work on your **Claim** - the main thesis you want to argue for.

A good claim should be:
- Clear and specific
- Arguable (not a universally accepted fact)
- Something you can support with evidence

Please state your claim clearly. What is the main point you want to argue?`,
    es: `Ahora trabajemos en tu **Enunciado** - la tesis principal que quieres argumentar.

Un buen enunciado debe ser:
- Claro y específico
- Discutible (no un hecho universalmente aceptado)
- Algo que puedas apoyar con evidencia

Por favor, expresa tu enunciado claramente. ¿Cuál es el punto principal que quieres argumentar?`
  },
  warrant: {
    en: `Great! Now let's establish the **Warrant** - the logical bridge between your evidence and claim.

The warrant explains WHY your evidence supports your claim. It's typically:
- A general principle or rule
- Stated as "If X, then Y" or "When X, Y follows"
- NOT more evidence, but the reasoning that connects evidence to claim

How does your evidence logically support your claim? What's the underlying principle?`,
    es: `¡Excelente! Ahora establezcamos la **Garantía** - el puente lógico entre tu evidencia y enunciado.

La garantía explica POR QUÉ tu evidencia apoya tu enunciado. Típicamente es:
- Un principio general o regla
- Expresada como "Si X, entonces Y" o "Cuando X, Y resulta"
- NO más evidencia, sino el razonamiento que conecta evidencia con enunciado

¿Cómo tu evidencia apoya lógicamente tu enunciado? ¿Cuál es el principio subyacente?`
  },
  warrantBacking: {
    en: `Excellent warrant! Now let's add **Warrant Backing** - sources that support your logical principle.

This could be:
- Academic research or theories
- Expert consensus
- Established principles in your field
- Authoritative sources

What makes this logical connection valid? What sources or authority support this reasoning?`,
    es: `¡Excelente garantía! Ahora agreguemos **Respaldo de Garantía** - fuentes que apoyan tu principio lógico.

Esto podría ser:
- Investigación académica o teorías
- Consenso de expertos
- Principios establecidos en tu campo
- Fuentes autorizadas

¿Qué hace válida esta conexión lógica? ¿Qué fuentes o autoridad apoyan este razonamiento?`
  },
  grounds: {
    en: `Now let's gather your **Grounds** - the evidence that supports your claim.

Good grounds include:
- Statistical data
- Research findings  
- Historical examples
- Observable facts
- Expert testimony

What evidence do you have to support your claim?`,
    es: `Ahora reunamos tu **Evidencia** - los datos que apoyan tu enunciado.

Buena evidencia incluye:
- Datos estadísticos
- Hallazgos de investigación
- Ejemplos históricos
- Hechos observables
- Testimonio de expertos

¿Qué evidencia tienes para apoyar tu enunciado?`
  },
  groundsBacking: {
    en: `Good evidence! Now let's add **Grounds Backing** - the sources for your evidence.

This establishes credibility:
- Where did this data come from?
- What study or research?
- Which expert or organization?
- When was it published?

What are the sources for your evidence?`,
    es: `¡Buena evidencia! Ahora agreguemos **Respaldo de Evidencia** - las fuentes de tu evidencia.

Esto establece credibilidad:
- ¿De dónde provienen estos datos?
- ¿Qué estudio o investigación?
- ¿Qué experto u organización?
- ¿Cuándo fue publicado?

¿Cuáles son las fuentes de tu evidencia?`
  },
  qualifier: {
    en: `Now let's add a **Qualifier** - indicating how certain you are about your claim.

Common qualifiers:
- **Necessarily**: Universal, always true
- **Probably**: Highly likely but not certain
- **Plausibly**: Could be true under certain conditions
- **Usually**: True in most cases
- **Likely**: More probable than not

What qualifier best describes the certainty of your claim?`,
    es: `Ahora agreguemos un **Calificador** - indicando cuán seguro estás de tu enunciado.

Calificadores comunes:
- **Necesariamente**: Universal, siempre verdadero
- **Probablemente**: Muy probable pero no seguro
- **Plausiblemente**: Podría ser verdadero bajo ciertas condiciones
- **Usualmente**: Verdadero en la mayoría de los casos
- **Probablemente**: Más probable que no

¿Qué calificador describe mejor la certeza de tu enunciado?`
  },
  rebuttal: {
    en: `Finally, let's consider the **Rebuttal** - scenarios where your claim might not hold true.

Think about:
- What circumstances could make your claim invalid?
- What exceptions might exist?
- What counter-arguments should you acknowledge?

This shows intellectual honesty and strengthens your overall argument.

Under what conditions might your claim be false or not apply?`,
    es: `Finalmente, consideremos la **Refutación** - escenarios donde tu enunciado podría no ser válido.

Piensa en:
- ¿Qué circunstancias podrían invalidar tu enunciado?
- ¿Qué excepciones podrían existir?
- ¿Qué contra-argumentos deberías reconocer?

Esto muestra honestidad intelectual y fortalece tu argumento general.

¿Bajo qué condiciones tu enunciado podría ser falso o no aplicar?`
  }
};

/**
 * Create Gemini chat provider with structured outputs
 */
export const createGeminiChatProvider = (apiKey: string): ChatAIProvider => {
  const config: AIProviderConfig = {
    name: 'gemini',
    apiKey,
    model: 'gemini-2.0-flash-exp',
    maxTokens: 2048,
    temperature: 0.7
  };

  const rateLimit = DEFAULT_RATE_LIMITS.gemini;
  const baseProvider = createBaseProvider(config, rateLimit);
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: config.model ?? 'gemini-2.0-flash-exp' });

  /**
   * Fast client-side intent heuristics to reduce API calls
   * Returns null if intent cannot be determined locally
   */
  const tryLocalClassification = (
    userMessage: string,
    currentStep: ToulminStep
  ): ClassifierResult | null => {
    const msg = userMessage.toLowerCase().trim();
    
    // Question patterns - obvious questions don't need API classification
    const questionPatterns = [
      /^(what|how|why|when|where|who|can you|could you|would you|is it|are there|do i|should i)/i,
      /\?$/,
      /^(explain|tell me|help me understand|i don't understand|what does .+ mean)/i
    ];
    
    if (questionPatterns.some(p => p.test(msg))) {
      return {
        intent: 'ask_question',
        targetPart: currentStep,
        extracted: { text: userMessage },
        confidence: 0.8
      };
    }
    
    // Confirmation patterns
    const confirmPatterns = [
      /^(yes|yep|yeah|ok|okay|sure|confirm|looks good|that's good|perfect|great|lgtm|approved)$/i,
      /^(sí|si|vale|confirmar|correcto|perfecto|bien)$/i
    ];
    
    if (confirmPatterns.some(p => p.test(msg))) {
      return {
        intent: 'confirm_part',
        targetPart: currentStep,
        extracted: { text: userMessage },
        confidence: 0.9
      };
    }
    
    // Next step patterns
    const nextPatterns = [
      /^(next|continue|move on|go to next|siguiente|continuar|avanzar)$/i,
      /^(let's move|ready for next|what's next)$/i
    ];
    
    if (nextPatterns.some(p => p.test(msg))) {
      return {
        intent: 'request_next',
        targetPart: currentStep,
        extracted: { text: userMessage },
        confidence: 0.9
      };
    }
    
    // If message is substantial (more than a few words), likely a proposal
    const wordCount = msg.split(/\s+/).length;
    if (wordCount >= 5 && !msg.includes('?')) {
      return {
        intent: 'propose',
        targetPart: currentStep,
        extracted: { text: userMessage },
        confidence: 0.7
      };
    }
    
    // Cannot determine locally - will need API call
    return null;
  };

  /**
   * Classify user intent with full context
   */
  const classifyIntent = async (
    userMessage: string,
    currentStep: ToulminStep,
    argumentProgress: ArgumentProgress,
    language: Locale
  ): Promise<ClassifierResult> => {
    // Try local classification first to save API calls
    const localResult = tryLocalClassification(userMessage, currentStep);
    if (localResult && localResult.confidence >= 0.7) {
      return localResult;
    }

    // Build completed parts context
    const completedParts = Object.entries(argumentProgress)
      .filter(([key, value]) => value && key !== 'topic' && key !== 'argumentTitle')
      .map(([key, value]) => `${key}: "${String(value).substring(0, 60)}${String(value).length > 60 ? '...' : ''}"`)
      .join(', ') || 'None';

    // Fill in context placeholders in prompt
    const promptTemplate = CLASSIFIER_SYSTEM_PROMPT[language]
      .replace('{{currentStep}}', currentStep)
      .replace('{{completedParts}}', completedParts);

    const prompt = `${promptTemplate}

User message: "${userMessage}"

Classify intent and extract content:`;

    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          maxOutputTokens: 300,
          temperature: 0.3
        }
      });
      
      const json = JSON.parse(result.response.text());
      return json as ClassifierResult;
    } catch (error) {
      console.error('Classification error:', error);
      // Default to propose if classification fails
      return {
        intent: 'propose',
        targetPart: currentStep,
        extracted: { text: userMessage },
        confidence: 0.5
      };
    }
  };

  /**
   * Generate draft and review
   */
  const generateDraftAndReview = async (
    step: ToulminStep,
    userMessage: string,
    conversationHistory: ChatMessage[],
    currentDraft: DraftState | undefined,
    language: Locale
  ): Promise<DraftReviewResult> => {
    const rubric = READINESS_RUBRICS[step]?.[language] || '';
    const historyText = conversationHistory.slice(-4).map(m => 
      `${m.role === 'user' ? 'Student' : 'Assistant'}: ${m.content}`
    ).join('\n\n');
    
    const prompt = `You are an educational assistant helping students with Toulmin argumentation.
Current step: ${step}

${rubric}

Based on the user's latest input and conversation history, generate or refine a draft for this step.
Then perform a self-review using the rubric above.

Return strict JSON:
{
  "draft": "the proposed text for this step",
  "self_review": {
    "isReady": true/false,
    "issues": ["list of specific issues found"],
    "suggestedEdits": "concrete suggestions for improvement"
  },
  "nextStepRecommendation": "stay | advance"
}

Only recommend "advance" if isReady is true and you're confident the student understands this step.

Conversation history:
${historyText}

Latest user input: "${userMessage}"
${currentDraft ? `Current draft: "${currentDraft.text}"` : 'No draft yet'}

Generate draft and review:`;

    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          maxOutputTokens: 800,
          temperature: 0.7
        }
      });
      
      const json = JSON.parse(result.response.text());
      return json as DraftReviewResult;
    } catch (error) {
      console.error('Draft generation error:', error);
      // Return a simple draft on error
      return {
        draft: userMessage,
        self_review: {
          isReady: false,
          issues: ['Unable to review at this time'],
          suggestedEdits: 'Please try again or refine your input'
        },
        nextStepRecommendation: 'stay'
      };
    }
  };

  /**
   * Answer a question without advancing
   */
  const answerQuestion = async (
    question: string,
    currentStep: ToulminStep,
    conversationHistory: ChatMessage[],
    language: Locale
  ): Promise<string> => {
    const stepPrompt = STEP_PROMPTS[currentStep]?.[language] || '';
    const historyText = conversationHistory.slice(-4).map(m => 
      `${m.role === 'user' ? 'Student' : 'Assistant'}: ${m.content}`
    ).join('\n\n');
    
    const prompt = `You are an educational assistant helping students build Toulmin arguments.
Current step: ${currentStep}

Context for this step:
${stepPrompt}

Recent conversation:
${historyText}

Student's question: "${question}"

Provide a helpful, educational answer that guides them back to working on the current step (${currentStep}).
Keep your response concise and encouraging.

Your response:`;

    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.8
        }
      });
      
      return result.response.text() || "I'm here to help! Please let me know what you'd like to know.";
    } catch (error) {
      console.error('Question answering error:', error);
      return language === 'es'
        ? "Estoy aquí para ayudarte. Por favor intenta reformular tu pregunta."
        : "I'm here to help! Please try rephrasing your question.";
    }
  };

  /**
   * Main chat response generation
   */
  const generateChatResponse = async (
    messages: ChatMessage[],
    currentStep: ToulminStep,
    currentDraft: DraftState | QualifierDraft | undefined,
    argumentProgress: ArgumentProgress,
    language: Locale = 'en'
  ): Promise<AIChatResult> => {
    try {
      await baseProvider.handleRateLimit();

      // Handle intro step specially
      if (currentStep === 'intro' && messages.length === 0) {
        return {
          success: true,
          message: STEP_PROMPTS.intro[language]
        };
      }

      const lastUserMessage = messages.filter(m => m.role === 'user').pop();
      if (!lastUserMessage) {
        return {
          success: true,
          message: STEP_PROMPTS[currentStep]?.[language] || 'Please continue...'
        };
      }

      // Step 1: Classify intent with full context
      const classification = await classifyIntent(
        lastUserMessage.content,
        currentStep,
        argumentProgress,
        language
      );

      // Step 2: Handle based on intent
      if (classification.intent === 'ask_question' || classification.intent === 'meta_help') {
        const answer = await answerQuestion(
          lastUserMessage.content,
          currentStep,
          messages,
          language
        );
        
        return {
          success: true,
          message: answer,
          classification
        };
      }

      // Step 3: For propose/revise, generate draft & review
      if (classification.intent === 'propose' || classification.intent === 'revise') {
        const draftResult = await generateDraftAndReview(
          currentStep, 
          lastUserMessage.content, 
          messages,
          currentDraft as DraftState | undefined,
          language
        );
        
        // Format response message
        const responseMessage = draftResult.self_review.isReady
          ? (language === 'es'
            ? `Excelente! Aquí está tu borrador:\n\n"${draftResult.draft}"\n\nSe ve bien! Puedes confirmar este contenido, refinarlo más, o saltar este paso.`
            : `Great! Here's your draft:\n\n"${draftResult.draft}"\n\nThis looks good! You can confirm this content, refine it further, or skip this step.`)
          : (language === 'es'
            ? `Aquí está tu borrador:\n\n"${draftResult.draft}"\n\nHay algunas cosas que podríamos mejorar. Revisa los problemas señalados y refina tu contenido.`
            : `Here's your draft:\n\n"${draftResult.draft}"\n\nThere are a few things we could improve. Review the issues flagged and refine your content.`);
        
        return {
          success: true,
          message: responseMessage,
          draftReview: draftResult,
          classification
        };
      }

      // For other intents, provide guidance
      return {
        success: true,
        message: STEP_PROMPTS[currentStep]?.[language] || 'Please continue working on this step.',
        classification
      };

    } catch (error) {
      console.error('Gemini chat generation error:', error);

      return {
        success: false,
        message: language === 'es'
          ? 'Lo siento, encontré un error. Por favor intenta de nuevo.'
          : 'I apologize, but I encountered an error. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  /**
   * Validate step content
   */
  const validateStepContent = async (
    step: ToulminStep,
    content: string,
    argumentProgress: ArgumentProgress,
    language: Locale = 'en'
  ) => {
    const minLengths: Record<string, number> = {
      claim: 10,
      warrant: 15,
      warrantBacking: 10,
      grounds: 20,
      groundsBacking: 10,
      qualifier: 3,
      rebuttal: 15
    };

    const minLength = minLengths[step] || 5;
    const isValid = content.trim().length >= minLength;

    return {
      valid: isValid,
      extractedContent: content.trim(),
      suggestions: isValid ? [] : [`Please provide more detail for your ${step}.`]
    };
  };

  /**
   * Generate step guidance
   */
  const generateStepGuidance = async (
    step: ToulminStep,
    argumentProgress: ArgumentProgress,
    language: Locale = 'en'
  ) => {
    const stepPrompt = STEP_PROMPTS[step]?.[language];

    return {
      message: stepPrompt || 'Please continue with your argument.',
      examples: [],
      tips: []
    };
  };

  return {
    generateChatResponse,
    validateStepContent,
    generateStepGuidance
  };
};

/**
 * Default Gemini chat provider instance
 */
export const createDefaultGeminiChatProvider = (): ChatAIProvider => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }

  return createGeminiChatProvider(apiKey);
};
