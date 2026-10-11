const test = require('node:test');
const assert = require('node:assert/strict');
const { recommendNextTask, summarizeProgress } = require('../../functions/modules/progress-service');

test('recommendNextTask picks the first incomplete task in sequence', () => {
  const plan = {
    title: 'Test Roadmap',
    milestones: [
      {
        weekNumber: 1,
        title: 'Milestone 1',
        tasks: [
          { id: 't1', title: 'Task 1', completed: true },
          { id: 't2', title: 'Task 2', completed: false }
        ]
      }
    ]
  };

  const rec = recommendNextTask(plan, ['t1']);
  assert.equal(rec.task.id, 't2');
  assert.equal(rec.task.title, 'Task 2');
});

test('summarizeProgress calculates correct percentages and feedback', () => {
  const summary = summarizeProgress({
    totalTasks: 20,
    completedTasks: 16,
    quizAttempts: [{ score: 4, totalQuestions: 5 }],
    studySessions: [{ durationMinutes: 45 }, { durationMinutes: 60 }],
    currentStreakDays: 5
  });

  assert.equal(summary.completionRate, 80);
  assert.equal(summary.averageQuizScore, 80);
  assert.equal(summary.totalStudyMinutes, 105);
  assert.equal(summary.currentStreakDays, 5);
  assert.ok(summary.feedback.includes('Exceptional'));
});
