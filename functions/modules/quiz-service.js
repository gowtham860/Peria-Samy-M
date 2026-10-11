/**
 * Adaptive Quiz Service
 * Generates topic-specific quizzes via AI and evaluates student performance.
 */

const { AIProvider } = require('./ai-provider');

const VERIFIED_QUIZ_BANK = {
  javascript: [
    {
      id: 1,
      question: "Which of the following describes the difference between '==' and '===' in JavaScript?",
      options: [
        "'==' performs type coercion before comparison, whereas '===' strictly checks both value and type.",
        "'===' performs type coercion before comparison, whereas '==' strictly checks both value and type.",
        "Both perform strict equality checks with zero coercion differences.",
        "'===' can only be used with primitive numbers and strings."
      ],
      correctAnswer: 0,
      explanation: "The loose equality operator '==' converts operands of different types before checking equality, while the strict equality operator '===' compares both value and type without coercion.",
      conceptTag: "Type Coercion"
    },
    {
      id: 2,
      question: "What is a closure in JavaScript?",
      options: [
        "A syntax error caused by unclosed parentheses or brackets.",
        "A function bundled together with references to its lexical environment, allowing access to an outer function's scope.",
        "A method used to immediately terminate an asynchronous event loop.",
        "A garbage collection mechanism that clears unused variables."
      ],
      correctAnswer: 1,
      explanation: "A closure gives a function access to its outer scope from an inner function, preserved even after the outer function has finished executing.",
      conceptTag: "Closures & Scope"
    },
    {
      id: 3,
      question: "What does the Event Loop in JavaScript do?",
      options: [
        "It executes all asynchronous callbacks synchronously in parallel threads.",
        "It continuously monitors the Call Stack and Task Queue, pushing queued tasks to the stack when it becomes empty.",
        "It compiles JavaScript bytecode into machine language prior to execution.",
        "It prevents infinite loops by auto-terminating long while statements."
      ],
      correctAnswer: 1,
      explanation: "The Event Loop continuously checks if the Call Stack is empty; if so, it dequeues tasks from the Microtask Queue and Callback Queue onto the Call Stack.",
      conceptTag: "Event Loop & Concurrency"
    },
    {
      id: 4,
      question: "Which array method creates a new array with all elements that pass a test implemented by the provided function?",
      options: [
        "forEach()",
        "reduce()",
        "filter()",
        "map()"
      ],
      correctAnswer: 2,
      explanation: "Array.prototype.filter() creates a shallow copy of a portion of a given array, filtered down to just the elements from the given array that pass the test.",
      conceptTag: "Array Methods"
    },
    {
      id: 5,
      question: "What happens when you declare a variable with 'const'?",
      options: [
        "The variable becomes immutable, meaning properties of an object assigned to it cannot be changed.",
        "The variable cannot be reassigned, but if it holds an object or array, its properties or elements can still be mutated.",
        "The variable is globally hoisted and accessible before initialization.",
        "The variable is automatically frozen using Object.freeze()."
      ],
      correctAnswer: 1,
      explanation: "'const' creates an immutable binding; the identifier cannot be reassigned, but the values inside a mutated object or array remain mutable.",
      conceptTag: "Variable Declaration"
    }
  ]
};

/**
 * Generate fallback questions if AI is unreachable
 */
function getFallbackQuiz(topic, difficulty, count = 5) {
  const bank = VERIFIED_QUIZ_BANK.javascript.slice(0, count);
  return {
    topic: topic || 'Web Development & Programming Fundamentals',
    difficulty: difficulty || 'intermediate',
    questions: bank,
    isFallback: true,
    fallbackNotice: 'Generated from SkillPath AI verified test bank.'
  };
}

/**
 * Generate adaptive quiz via AI or verified bank
 */
async function generateQuiz(sanitized, aiProvider = new AIProvider()) {
  if (!aiProvider.hasApiKey()) {
    return getFallbackQuiz(sanitized.topic, sanitized.level, sanitized.questionCount);
  }

  const systemInstruction = `You are a certified technical examiner and educator.
Generate a high-quality ${sanitized.level} multiple-choice quiz for the topic "${sanitized.topic}".
Output must be strictly valid JSON matching the schema.
Questions must be intellectually engaging, test practical comprehension, and avoid trivial trivia.
Each question must contain 4 options, 1 correct index (0-3), and an insightful explanation.`;

  const prompt = `Generate ${sanitized.questionCount} multiple-choice questions for:
Topic: "${sanitized.topic}"
Difficulty Level: "${sanitized.level}"

JSON Schema format:
{
  "topic": "${sanitized.topic}",
  "difficulty": "${sanitized.level}",
  "questions": [
    {
      "id": 1,
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": 0,
      "explanation": "string explaining why the correct choice is right and others are wrong",
      "conceptTag": "string"
    }
  ]
}`;

  try {
    const result = await aiProvider.generateStructuredJson(prompt, systemInstruction);
    if (result && Array.isArray(result.questions) && result.questions.length > 0) {
      return {
        ...result,
        topic: sanitized.topic,
        difficulty: sanitized.level,
        isFallback: false
      };
    }
    throw new Error('Invalid quiz questions array from AI');
  } catch (err) {
    console.warn('AI quiz generation failed, using fallback:', err.message);
    const fallback = getFallbackQuiz(sanitized.topic, sanitized.level, sanitized.questionCount);
    fallback.fallbackNotice = `AI provider note: ${err.message}. Showing verified test bank.`;
    return fallback;
  }
}

/**
 * Evaluate submitted quiz answers
 */
function evaluateQuiz(questions, userAnswers) {
  let score = 0;
  const total = questions.length;
  const review = [];
  const weakConcepts = [];

  questions.forEach((q, idx) => {
    const selected = userAnswers[q.id !== undefined ? q.id : idx];
    const isCorrect = selected === q.correctAnswer;
    if (isCorrect) {
      score += 1;
    } else {
      if (q.conceptTag && !weakConcepts.includes(q.conceptTag)) {
        weakConcepts.push(q.conceptTag);
      }
    }

    review.push({
      questionId: q.id,
      question: q.question,
      options: q.options,
      selectedAnswer: selected !== undefined ? selected : null,
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation,
      conceptTag: q.conceptTag
    });
  });

  const percentage = Math.round((score / total) * 100);

  let recommendation = '';
  if (percentage >= 80) {
    recommendation = 'Outstanding performance! You have grasped the core principles firmly. Ready for advanced practice.';
  } else if (percentage >= 50) {
    recommendation = `Good effort. We recommend reviewing these topics: ${weakConcepts.join(', ') || 'key fundamentals'} before taking the next test.`;
  } else {
    recommendation = `Focus on reinforcing foundational concepts: ${weakConcepts.join(', ') || 'core principles'}. Use the AI Tutor to clarify these topics.`;
  }

  return {
    score,
    totalQuestions: total,
    percentage,
    passed: percentage >= 70,
    weakConcepts,
    recommendation,
    review
  };
}

module.exports = {
  generateQuiz,
  evaluateQuiz,
  getFallbackQuiz
};
