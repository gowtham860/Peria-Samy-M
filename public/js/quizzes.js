/**
 * SkillPath AI — Adaptive Quiz System & Performance Evaluator
 */

import { initFirebase, demoStore } from './firebase-config.js';
import { getCurrentUser } from './auth.js';
import { showToast, setButtonLoading, initLucideIcons } from './ui.js';
import { escapeHtml } from './validation.js';

let currentQuiz = null;
let currentQuestionIndex = 0;
let userAnswers = {};
let quizTimerInterval = null;
let secondsElapsed = 0;

export function initQuizzes() {
  const launchForm = document.getElementById('quiz-launcher-form');
  if (launchForm) {
    launchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await startQuiz();
    });
  }

  const prevBtn = document.getElementById('quiz-prev-btn');
  const nextBtn = document.getElementById('quiz-next-btn');
  const submitBtn = document.getElementById('quiz-submit-btn');

  if (prevBtn) prevBtn.addEventListener('click', () => navigateQuestion(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => navigateQuestion(1));
  if (submitBtn) submitBtn.addEventListener('click', submitQuiz);

  const retakeBtn = document.getElementById('quiz-retake-btn');
  if (retakeBtn) {
    retakeBtn.addEventListener('click', () => {
      document.getElementById('quiz-results-view').style.display = 'none';
      document.getElementById('quiz-launcher-view').style.display = 'block';
    });
  }
}

async function startQuiz() {
  const topic = document.getElementById('quiz-topic-input').value.trim() || 'JavaScript Core';
  const level = document.getElementById('quiz-level-select').value;
  const count = parseInt(document.getElementById('quiz-count-select').value, 10) || 5;

  const submitBtn = document.querySelector('#quiz-launcher-form button[type="submit"]');
  setButtonLoading(submitBtn, true, 'Generating Adaptive Quiz...');

  try {
    const { functions, isDemoMode } = await initFirebase();
    let quizData = null;

    if (!isDemoMode && functions) {
      try {
        const { httpsCallable } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-functions.js');
        const genQuizFn = httpsCallable(functions, 'generateQuiz');
        const res = await genQuizFn({ topic, level, questionCount: count });
        quizData = res.data?.quiz;
      } catch (err) {
        console.warn('Functions error, falling back to local quiz bank:', err);
      }
    }

    if (!quizData) {
      quizData = getLocalFallbackQuiz(topic, level, count);
    }

    currentQuiz = quizData;
    currentQuestionIndex = 0;
    userAnswers = {};
    secondsElapsed = 0;

    document.getElementById('quiz-launcher-view').style.display = 'none';
    document.getElementById('quiz-runner-view').style.display = 'block';
    document.getElementById('quiz-results-view').style.display = 'none';

    startTimer();
    renderCurrentQuestion();
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  } finally {
    setButtonLoading(submitBtn, false);
  }
}

function startTimer() {
  clearInterval(quizTimerInterval);
  const timerEl = document.getElementById('quiz-timer');
  quizTimerInterval = setInterval(() => {
    secondsElapsed++;
    const mins = Math.floor(secondsElapsed / 60);
    const secs = secondsElapsed % 60;
    if (timerEl) {
      timerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
  }, 1000);
}

function renderCurrentQuestion() {
  if (!currentQuiz || !currentQuiz.questions[currentQuestionIndex]) return;

  const q = currentQuiz.questions[currentQuestionIndex];
  const total = currentQuiz.questions.length;

  document.getElementById('quiz-progress-text').textContent = `Question ${currentQuestionIndex + 1} of ${total}`;
  document.getElementById('quiz-progress-bar').style.width = `${((currentQuestionIndex + 1) / total) * 100}%`;
  document.getElementById('quiz-question-title').textContent = q.question;

  const optionsContainer = document.getElementById('quiz-options-container');
  optionsContainer.innerHTML = '';

  const selectedAnswer = userAnswers[q.id !== undefined ? q.id : currentQuestionIndex];

  q.options.forEach((opt, idx) => {
    const card = document.createElement('div');
    card.className = `quiz-option-card ${selectedAnswer === idx ? 'selected' : ''}`;
    card.innerHTML = `
      <div style="width:24px; height:24px; border-radius:50%; border:1.5px solid var(--border-medium); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.8rem;">
        ${String.fromCharCode(65 + idx)}
      </div>
      <div style="flex:1;">${escapeHtml(opt)}</div>
    `;

    card.addEventListener('click', () => {
      userAnswers[q.id !== undefined ? q.id : currentQuestionIndex] = idx;
      renderCurrentQuestion();
    });

    optionsContainer.appendChild(card);
  });

  // Navigation button states
  const prevBtn = document.getElementById('quiz-prev-btn');
  const nextBtn = document.getElementById('quiz-next-btn');
  const submitBtn = document.getElementById('quiz-submit-btn');

  if (prevBtn) prevBtn.disabled = currentQuestionIndex === 0;
  if (nextBtn) nextBtn.style.display = currentQuestionIndex === total - 1 ? 'none' : 'inline-flex';
  if (submitBtn) submitBtn.style.display = currentQuestionIndex === total - 1 ? 'inline-flex' : 'none';

  initLucideIcons();
}

function navigateQuestion(offset) {
  const newIndex = currentQuestionIndex + offset;
  if (newIndex >= 0 && newIndex < currentQuiz.questions.length) {
    currentQuestionIndex = newIndex;
    renderCurrentQuestion();
  }
}

async function submitQuiz() {
  clearInterval(quizTimerInterval);

  let score = 0;
  const total = currentQuiz.questions.length;
  const weakConcepts = [];
  const review = [];

  currentQuiz.questions.forEach((q, idx) => {
    const selected = userAnswers[q.id !== undefined ? q.id : idx];
    const isCorrect = selected === q.correctAnswer;
    if (isCorrect) {
      score++;
    } else {
      if (q.conceptTag && !weakConcepts.includes(q.conceptTag)) {
        weakConcepts.push(q.conceptTag);
      }
    }

    review.push({
      question: q.question,
      options: q.options,
      selectedAnswer: selected,
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation,
      conceptTag: q.conceptTag
    });
  });

  const percentage = Math.round((score / total) * 100);

  // Save attempt to database
  await saveQuizAttempt({
    topic: currentQuiz.topic,
    difficulty: currentQuiz.difficulty,
    score,
    totalQuestions: total,
    percentage,
    timeSpentSeconds: secondsElapsed
  });

  // Display results view
  document.getElementById('quiz-runner-view').style.display = 'none';
  const resultsView = document.getElementById('quiz-results-view');
  resultsView.style.display = 'block';

  document.getElementById('quiz-score-display').textContent = `${score} / ${total} (${percentage}%)`;
  document.getElementById('quiz-feedback-text').textContent = percentage >= 80 
    ? 'Mastery demonstrated! Outstanding performance.' 
    : percentage >= 50 
    ? 'Good effort! Review the explanations below to reinforce weaker areas.' 
    : 'Foundational review recommended. Dive deeper into the concepts below.';

  const reviewContainer = document.getElementById('quiz-review-container');
  reviewContainer.innerHTML = review.map((r, idx) => `
    <div class="card" style="margin-bottom:1rem; border-left: 4px solid ${r.isCorrect ? 'var(--success-500)' : 'var(--danger-500)'};">
      <div class="card-body">
        <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
          <strong>Question ${idx + 1}: ${escapeHtml(r.question)}</strong>
          <span class="badge ${r.isCorrect ? 'badge-success' : 'badge-warning'}">${r.isCorrect ? 'Correct' : 'Needs Review'}</span>
        </div>
        <div style="font-size:0.875rem; margin-bottom:0.5rem; color:var(--text-muted);">
          Your answer: <strong>${r.selectedAnswer !== undefined ? escapeHtml(r.options[r.selectedAnswer]) : 'Not answered'}</strong><br/>
          Correct answer: <strong style="color:var(--success-600);">${escapeHtml(r.options[r.correctAnswer])}</strong>
        </div>
        <div style="font-size:0.85rem; background:var(--bg-subtle); padding:0.65rem; border-radius:var(--radius-sm);">
          <strong>Explanation:</strong> ${escapeHtml(r.explanation || 'Verified answer.')}
        </div>
      </div>
    </div>
  `).join('');

  initLucideIcons();
  resultsView.scrollIntoView({ behavior: 'smooth' });
}

async function saveQuizAttempt(attemptData) {
  const user = getCurrentUser();
  if (!user) return;

  const { db, isDemoMode } = await initFirebase();
  const attemptId = 'attempt-' + Date.now();

  try {
    if (!isDemoMode && db) {
      const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      await setDoc(doc(db, 'users', user.uid, 'quizAttempts', attemptId), {
        ...attemptData,
        createdAt: new Date().toISOString()
      });
    } else {
      const data = demoStore.getData();
      data.quizzes = data.quizzes || [];
      data.quizzes.push({
        id: attemptId,
        ...attemptData,
        createdAt: new Date().toISOString()
      });
      demoStore.saveData(data);
    }
  } catch (err) {
    console.warn('Failed to save quiz attempt:', err);
  }
}

function getLocalFallbackQuiz(topic, level, count) {
  const sampleBank = [
    {
      id: 1,
      question: "Which data structure uses LIFO (Last In, First Out) ordering?",
      options: ["Queue", "Stack", "Binary Tree", "Hash Map"],
      correctAnswer: 1,
      explanation: "A Stack operates on Last-In, First-Out principle (like a stack of plates).",
      conceptTag: "Data Structures"
    },
    {
      id: 2,
      question: "What does the HTTP 404 status code indicate?",
      options: ["Unauthorized", "Internal Server Error", "Resource Not Found", "Bad Request"],
      correctAnswer: 2,
      explanation: "HTTP 404 Not Found indicates that the origin server did not find a current representation for the target resource.",
      conceptTag: "HTTP & Networking"
    },
    {
      id: 3,
      question: "In relational databases, which keyword is used to eliminate duplicate rows in query results?",
      options: ["UNIQUE", "DISTINCT", "FILTER", "CLEAN"],
      correctAnswer: 1,
      explanation: "SELECT DISTINCT removes duplicate rows from the result set in SQL.",
      conceptTag: "Databases & SQL"
    },
    {
      id: 4,
      question: "What is the primary advantage of using containerization (e.g., Docker)?",
      options: [
        "It eliminates the need for unit testing.",
        "It packages code and dependencies together, ensuring consistent execution across environments.",
        "It automatically translates Python to Assembly.",
        "It makes databases run without storage."
      ],
      correctAnswer: 1,
      explanation: "Docker containers encapsulate code, libraries, and runtime dependencies to guarantee parity across local dev and production.",
      conceptTag: "DevOps & Containers"
    },
    {
      id: 5,
      question: "Which of the following is true regarding asynchronous programming in JavaScript?",
      options: [
        "async functions always return a Promise.",
        "async functions block the main browser thread until completed.",
        "await can be used outside async functions anywhere in any file without modules.",
        "Promises cannot catch errors thrown inside executor functions."
      ],
      correctAnswer: 0,
      explanation: "An async function always wraps its return value in a Promise.",
      conceptTag: "Asynchronous JavaScript"
    }
  ];

  return {
    topic: topic,
    difficulty: level,
    questions: sampleBank.slice(0, count)
  };
}
