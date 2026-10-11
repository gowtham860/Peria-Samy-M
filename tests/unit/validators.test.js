const test = require('node:test');
const assert = require('node:assert/strict');
const {
  validatePlanInput,
  validateExplainInput,
  validateQuizInput,
  sanitizeString
} = require('../../functions/modules/validators');

test('sanitizeString trims and truncates correctly', () => {
  assert.equal(sanitizeString('  hello world  ', 5), 'hello');
  assert.equal(sanitizeString(12345), '');
  assert.equal(sanitizeString(null), '');
});

test('validatePlanInput passes on valid input', () => {
  const result = validatePlanInput({
    skill: 'Full-Stack Web Development',
    level: 'intermediate',
    goal: 'Get hired as frontend engineer',
    minutesPerDay: 45,
    durationWeeks: 8,
    language: 'english'
  });

  assert.equal(result.valid, true);
  assert.equal(result.sanitized.skill, 'Full-Stack Web Development');
  assert.equal(result.sanitized.durationWeeks, 8);
  assert.equal(result.sanitized.minutesPerDay, 45);
});

test('validatePlanInput fails on invalid parameters', () => {
  const result = validatePlanInput({
    skill: 'A', // too short
    level: 'master', // invalid level
    minutesPerDay: 5, // below min
    durationWeeks: 60 // above max
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.length >= 3);
});

test('validateExplainInput validates topics and prompts', () => {
  const valid = validateExplainInput({
    topic: 'Closures in JS',
    question: 'How do closures retain scope?',
    level: 'intermediate',
    language: 'tamil'
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.sanitized.language, 'tamil');

  const invalid = validateExplainInput({ topic: '' });
  assert.equal(invalid.valid, false);
});

test('validateQuizInput validates counts and topics', () => {
  const valid = validateQuizInput({
    topic: 'React Hooks',
    questionCount: 10,
    level: 'advanced'
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.sanitized.questionCount, 10);

  const invalid = validateQuizInput({
    topic: 'React',
    questionCount: 50 // exceeds limit
  });
  assert.equal(invalid.valid, false);
});
