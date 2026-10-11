/**
 * Progress Service
 * Analyzes learning records to recommend next activities and generate progress summaries.
 */

/**
 * Identify the optimal next learning task from active plans
 */
function recommendNextTask(plan, completedTaskIds = []) {
  if (!plan || !Array.isArray(plan.milestones)) {
    return {
      recommendation: 'Create or activate a learning plan to receive customized daily tasks.',
      task: null
    };
  }

  // Find first uncompleted task
  for (const milestone of plan.milestones) {
    if (Array.isArray(milestone.tasks)) {
      for (const task of milestone.tasks) {
        const taskId = task.id || `${milestone.weekNumber}-${task.title}`;
        if (!completedTaskIds.includes(taskId) && !task.completed) {
          return {
            recommendation: `Next up: ${task.title} (Week ${milestone.weekNumber})`,
            task: {
              ...task,
              id: taskId,
              weekNumber: milestone.weekNumber,
              milestoneTitle: milestone.title
            },
            reason: 'This aligns with your current milestone sequence and builds foundational knowledge.'
          };
        }
      }
    }
  }

  return {
    recommendation: `Congratulations! You have completed all scheduled tasks for "${plan.title}". Take a capstone quiz or create your next goal!`,
    task: null,
    reason: 'Milestones achieved'
  };
}

/**
 * Summarize student progress and calculate statistics
 */
function summarizeProgress(stats = {}) {
  const {
    totalTasks = 0,
    completedTasks = 0,
    quizAttempts = [],
    studySessions = [],
    currentStreakDays = 1
  } = stats;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  let averageQuizScore = 0;
  if (quizAttempts.length > 0) {
    const totalScorePct = quizAttempts.reduce((acc, q) => {
      const pct = q.totalQuestions > 0 ? (q.score / q.totalQuestions) * 100 : 0;
      return acc + pct;
    }, 0);
    averageQuizScore = Math.round(totalScorePct / quizAttempts.length);
  }

  const totalStudyMinutes = studySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

  let feedback = '';
  if (completionRate > 75) {
    feedback = 'Exceptional momentum! You are in the top tier of roadmap completion.';
  } else if (completionRate > 40) {
    feedback = 'Steady progress. Keep maintaining your daily study habits to hit this week\'s milestone.';
  } else {
    feedback = 'Great start! Focus on completing 1 practical exercise today to build your streak.';
  }

  return {
    completionRate,
    totalTasks,
    completedTasks,
    averageQuizScore,
    totalStudyMinutes,
    currentStreakDays,
    feedback
  };
}

module.exports = {
  recommendNextTask,
  summarizeProgress
};
