const test = require('node:test');
const assert = require('node:assert/strict');
const { generateFallbackPlan } = require('../../functions/modules/planner-service');

test('generateFallbackPlan creates structured 4-week roadmap', () => {
  const plan = generateFallbackPlan({
    skill: 'Python Data Science',
    level: 'beginner',
    goal: 'Become a data analyst',
    minutesPerDay: 45,
    durationWeeks: 4,
    language: 'english'
  });

  assert.equal(plan.targetSkill, 'Python Data Science');
  assert.equal(plan.proficiencyLevel, 'beginner');
  assert.equal(plan.durationWeeks, 4);
  assert.equal(plan.isFallback, true);
  assert.equal(plan.milestones.length, 4);
  assert.ok(plan.milestones[0].tasks.length > 0);
  assert.ok(plan.milestones[0].miniProject.title.length > 0);
  assert.ok(plan.completionCriteria.length > 0);
});
