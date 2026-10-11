/**
 * Input validators and sanitizers for SkillPath AI Cloud Functions
 */

function sanitizeString(input, maxLength = 500) {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
}

function validatePlanInput(data) {
  const errors = [];
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request payload must be an object'] };
  }

  const skill = sanitizeString(data.skill, 100);
  if (!skill || skill.length < 2) {
    errors.push('Target skill must be between 2 and 100 characters');
  }

  const validLevels = ['beginner', 'intermediate', 'advanced'];
  const level = (data.level || '').toLowerCase().trim();
  if (!validLevels.includes(level)) {
    errors.push(`Proficiency level must be one of: ${validLevels.join(', ')}`);
  }

  const minutesPerDay = parseInt(data.minutesPerDay, 10);
  if (isNaN(minutesPerDay) || minutesPerDay < 10 || minutesPerDay > 480) {
    errors.push('Minutes per day must be an integer between 10 and 480');
  }

  const durationWeeks = parseInt(data.durationWeeks, 10);
  if (isNaN(durationWeeks) || durationWeeks < 1 || durationWeeks > 52) {
    errors.push('Duration in weeks must be an integer between 1 and 52');
  }

  const validLanguages = ['english', 'tamil'];
  const language = (data.language || 'english').toLowerCase().trim();
  if (!validLanguages.includes(language)) {
    errors.push('Preferred language must be either English or Tamil');
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: {
      skill,
      level,
      goal: sanitizeString(data.goal, 200),
      minutesPerDay,
      durationWeeks,
      learningStyle: sanitizeString(data.learningStyle, 100) || 'hands-on',
      existingKnowledge: sanitizeString(data.existingKnowledge, 300),
      difficultyAreas: sanitizeString(data.difficultyAreas, 300),
      language
    }
  };
}

function validateExplainInput(data) {
  const errors = [];
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request payload must be an object'] };
  }

  const topic = sanitizeString(data.topic, 200);
  if (!topic || topic.length < 2) {
    errors.push('Topic must be between 2 and 200 characters');
  }

  const question = sanitizeString(data.question, 1000);
  if (!question || question.length < 3) {
    errors.push('Question or prompt must be between 3 and 1000 characters');
  }

  const level = (data.level || 'beginner').toLowerCase().trim();
  const language = (data.language || 'english').toLowerCase().trim();

  return {
    valid: errors.length === 0,
    errors,
    sanitized: {
      topic,
      question,
      level,
      language,
      planContext: sanitizeString(data.planContext, 500)
    }
  };
}

function validateQuizInput(data) {
  const errors = [];
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request payload must be an object'] };
  }

  const topic = sanitizeString(data.topic, 150);
  if (!topic || topic.length < 2) {
    errors.push('Topic must be between 2 and 150 characters');
  }

  const count = parseInt(data.questionCount, 10) || 5;
  if (count < 1 || count > 15) {
    errors.push('Question count must be between 1 and 15');
  }

  const level = (data.level || 'intermediate').toLowerCase().trim();

  return {
    valid: errors.length === 0,
    errors,
    sanitized: {
      topic,
      level,
      questionCount: count
    }
  };
}

module.exports = {
  sanitizeString,
  validatePlanInput,
  validateExplainInput,
  validateQuizInput
};
