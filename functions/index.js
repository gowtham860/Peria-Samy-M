/**
 * SkillPath AI — Cloud Functions Entry Point
 * Implements secure callable functions for AI roadmap generation, tutoring,
 * quiz generation, evaluation, and progress intelligence.
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

const { AIProvider } = require('./modules/ai-provider');
const { checkRateLimit } = require('./modules/rate-limiter');
const {
  validatePlanInput,
  validateExplainInput,
  validateQuizInput
} = require('./modules/validators');
const { generatePlan } = require('./modules/planner-service');
const { generateQuiz, evaluateQuiz } = require('./modules/quiz-service');
const { recommendNextTask, summarizeProgress } = require('./modules/progress-service');

// Instantiate AI Provider using server-side secret / env
const aiProvider = new AIProvider();

/**
 * 1. generateLearningPlan
 */
exports.generateLearningPlan = onCall(
  {
    cors: true,
    maxInstances: 10,
    timeoutSeconds: 60
  },
  async (request) => {
    // 1. Verify Authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated to generate learning plans.');
    }
    const uid = request.auth.uid;

    // 2. Enforce Rate Limiting
    const rateCheck = checkRateLimit(uid, 10, 60000);
    if (!rateCheck.allowed) {
      throw new HttpsError(
        'resource-exhausted',
        `Rate limit exceeded. Please wait ${Math.ceil(rateCheck.resetInMs / 1000)} seconds before requesting again.`
      );
    }

    // 3. Validate Inputs
    const validation = validatePlanInput(request.data);
    if (!validation.valid) {
      throw new HttpsError('invalid-argument', validation.errors.join('; '));
    }

    try {
      // 4. Generate structured plan (via Gemini or verified fallback)
      const plan = await generatePlan(validation.sanitized, aiProvider);
      return { success: true, plan };
    } catch (err) {
      console.error('generateLearningPlan error:', err);
      throw new HttpsError('internal', `Failed to generate learning plan: ${err.message}`);
    }
  }
);

/**
 * 2. explainTopic (AI Tutor)
 */
exports.explainTopic = onCall(
  {
    cors: true,
    maxInstances: 15,
    timeoutSeconds: 45
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated to consult the AI Tutor.');
    }
    const uid = request.auth.uid;

    const rateCheck = checkRateLimit(uid, 20, 60000);
    if (!rateCheck.allowed) {
      throw new HttpsError(
        'resource-exhausted',
        `Rate limit exceeded. Please wait ${Math.ceil(rateCheck.resetInMs / 1000)}s.`
      );
    }

    const validation = validateExplainInput(request.data);
    if (!validation.valid) {
      throw new HttpsError('invalid-argument', validation.errors.join('; '));
    }

    const { topic, question, level, language, planContext } = validation.sanitized;

    if (!aiProvider.hasApiKey()) {
      return {
        success: true,
        isFallback: true,
        topic,
        explanation: `**${topic} Overview**\n\n${topic} is a fundamental concept in modern technology. When learning at the **${level}** level, focus on understanding the core mental model first.\n\n*Key takeaway*: Always practice by writing small code snippets and testing how edge cases behave.\n\n*(AI API key is unconfigured on server; this is a simulated tutor response. Add GEMINI_API_KEY to activate live AI answers.)*`,
        example: '// Example code concept\nconsole.log("Practice makes perfect in " + "' + topic + '");',
        practiceExercise: `Write a 5-line program demonstrating your understanding of ${topic}.`
      };
    }

    const isTamil = language === 'tamil';
    const systemPrompt = `You are SkillPath AI's expert personal tutor.
Your mission is to provide clear, intuitive, and accurate technical explanations.
Level: ${level}.
Language: ${isTamil ? 'Tamil (தமிழ்) for natural explanations, while preserving English technical terms and code keywords' : 'English'}.
${planContext ? `Context from student roadmap: "${planContext}"` : ''}

Always structure your explanation with:
1. Clear mental model / ELI5 explanation.
2. Real-world analogy.
3. Clean code or practical demonstration.
4. One quick self-check question or mini-exercise.
5. End with a short reminder encouraging the student to verify critical details and practice hands-on.`;

    const prompt = `Topic: "${topic}"\nStudent question: "${question}"`;

    try {
      const responseText = await aiProvider.generateText(prompt, systemPrompt, {
        temperature: 0.3,
        maxOutputTokens: 2048
      });

      return {
        success: true,
        isFallback: false,
        topic,
        explanation: responseText
      };
    } catch (err) {
      console.error('explainTopic error:', err);
      throw new HttpsError('internal', `AI Tutor service error: ${err.message}`);
    }
  }
);

/**
 * 3. generateQuiz
 */
exports.generateQuiz = onCall(
  {
    cors: true,
    maxInstances: 10,
    timeoutSeconds: 45
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated to generate quizzes.');
    }
    const uid = request.auth.uid;

    const rateCheck = checkRateLimit(uid, 12, 60000);
    if (!rateCheck.allowed) {
      throw new HttpsError('resource-exhausted', 'Rate limit exceeded for quiz generation.');
    }

    const validation = validateQuizInput(request.data);
    if (!validation.valid) {
      throw new HttpsError('invalid-argument', validation.errors.join('; '));
    }

    try {
      const quiz = await generateQuiz(validation.sanitized, aiProvider);
      return { success: true, quiz };
    } catch (err) {
      console.error('generateQuiz error:', err);
      throw new HttpsError('internal', `Quiz generation error: ${err.message}`);
    }
  }
);

/**
 * 4. evaluateQuiz
 */
exports.evaluateQuiz = onCall(
  {
    cors: true
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated to submit quiz results.');
    }

    const { questions, userAnswers } = request.data || {};
    if (!Array.isArray(questions) || !userAnswers || typeof userAnswers !== 'object') {
      throw new HttpsError('invalid-argument', 'Questions array and userAnswers map are required.');
    }

    try {
      const evaluation = evaluateQuiz(questions, userAnswers);
      return { success: true, evaluation };
    } catch (err) {
      console.error('evaluateQuiz error:', err);
      throw new HttpsError('internal', `Quiz evaluation error: ${err.message}`);
    }
  }
);

/**
 * 5. recommendNextTask
 */
exports.recommendNextTask = onCall(
  {
    cors: true
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated.');
    }

    const { plan, completedTaskIds } = request.data || {};
    try {
      const recommendation = recommendNextTask(plan, completedTaskIds || []);
      return { success: true, recommendation };
    } catch (err) {
      console.error('recommendNextTask error:', err);
      throw new HttpsError('internal', `Recommendation error: ${err.message}`);
    }
  }
);

/**
 * 6. summarizeProgress
 */
exports.summarizeProgress = onCall(
  {
    cors: true
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated.');
    }

    const stats = request.data || {};
    try {
      const summary = summarizeProgress(stats);
      return { success: true, summary };
    } catch (err) {
      console.error('summarizeProgress error:', err);
      throw new HttpsError('internal', `Summary error: ${err.message}`);
    }
  }
);
