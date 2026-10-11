const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateQuiz, getFallbackQuiz } = require('../../functions/modules/quiz-service');

test('getFallbackQuiz returns verified questions', () => {
  const quiz = getFallbackQuiz('JavaScript', 'intermediate', 3);
  assert.equal(quiz.questions.length, 3);
  assert.equal(quiz.isFallback, true);
  assert.ok(quiz.questions[0].options.length === 4);
});

test('evaluateQuiz calculates scores and identifies weak areas', () => {
  const questions = [
    { id: 1, question: 'Q1', options: ['A', 'B'], correctAnswer: 0, conceptTag: 'Syntax' },
    { id: 2, question: 'Q2', options: ['A', 'B'], correctAnswer: 1, conceptTag: 'Async' }
  ];

  // User answered Q1 correctly (0) and Q2 incorrectly (0 instead of 1)
  const answers = { 1: 0, 2: 0 };
  const result = evaluateQuiz(questions, answers);

  assert.equal(result.score, 1);
  assert.equal(result.totalQuestions, 2);
  assert.equal(result.percentage, 50);
  assert.deepEqual(result.weakConcepts, ['Async']);
  assert.ok(result.recommendation.length > 0);
});
