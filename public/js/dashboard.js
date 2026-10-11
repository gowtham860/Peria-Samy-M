/**
 * SkillPath AI — Main Dashboard Controller
 */

import { fetchUserProgressData, renderAnalyticsCharts, logStudySession } from './progress.js';
import { showToast, initLucideIcons } from './ui.js';
import { escapeHtml } from './validation.js';

export async function initDashboard() {
  const data = await fetchUserProgressData();
  const plans = data.plans || [];
  const quizzes = data.quizzes || [];
  const sessions = data.sessions || [];

  updateDashboardStats(plans, quizzes, sessions);
  renderActivePlans(plans);
  renderNextRecommendation(plans);
  renderAnalyticsCharts(sessions, quizzes);

  // Quick study logger buttons
  document.querySelectorAll('.quick-log-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const mins = parseInt(btn.dataset.minutes, 10) || 30;
      await logStudySession(mins);
      const updatedData = await fetchUserProgressData();
      updateDashboardStats(updatedData.plans, updatedData.quizzes, updatedData.sessions);
      renderAnalyticsCharts(updatedData.sessions, updatedData.quizzes);
    });
  });
}

function updateDashboardStats(plans, quizzes, sessions) {
  let totalTasks = 0;
  let completedTasks = 0;

  plans.forEach(p => {
    (p.milestones || []).forEach(m => {
      (m.tasks || []).forEach(t => {
        totalTasks++;
        if (t.completed) completedTasks++;
      });
    });
  });

  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  let avgQuizScore = 0;
  if (quizzes.length > 0) {
    const totalScorePct = quizzes.reduce((acc, q) => {
      const pct = q.totalQuestions > 0 ? (q.score / q.totalQuestions) * 100 : 0;
      return acc + pct;
    }, 0);
    avgQuizScore = Math.round(totalScorePct / quizzes.length);
  }

  const streakDays = Math.max(1, sessions.length);

  document.getElementById('stat-active-plans').textContent = plans.length;
  document.getElementById('stat-tasks-completed').textContent = `${completedTasks} / ${totalTasks}`;
  document.getElementById('stat-completion-pct').textContent = `${completionPct}%`;
  document.getElementById('stat-streak-days').textContent = `${streakDays} Days`;
  document.getElementById('stat-quiz-score').textContent = `${avgQuizScore}%`;
}

function renderNextRecommendation(plans) {
  const container = document.getElementById('next-task-recommendation');
  if (!container) return;

  // Find first incomplete task across plans
  let nextTask = null;
  let parentPlan = null;

  for (const p of plans) {
    for (const m of (p.milestones || [])) {
      for (const t of (m.tasks || [])) {
        if (!t.completed) {
          nextTask = t;
          parentPlan = p;
          break;
        }
      }
      if (nextTask) break;
    }
    if (nextTask) break;
  }

  if (nextTask && parentPlan) {
    container.innerHTML = `
      <div style="display:flex; align-items:flex-start; gap:1rem;">
        <div style="width:48px; height:48px; border-radius:var(--radius-md); background:var(--primary-600); color:#fff; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
          <i data-lucide="sparkles" style="width:24px; height:24px;"></i>
        </div>
        <div>
          <span class="badge badge-primary" style="margin-bottom:0.35rem;">Recommended Next Activity</span>
          <h3 style="font-size:1.15rem; font-weight:700;">${escapeHtml(nextTask.title)}</h3>
          <p style="font-size:0.875rem; color:var(--text-muted); margin-top:0.25rem;">
            From "${escapeHtml(parentPlan.title)}" • Estimated duration: ${nextTask.estimatedMinutes || 30} mins
          </p>
        </div>
      </div>
      <div style="display:flex; gap:0.75rem; align-items:center;">
        <a href="assistant.html" class="btn btn-outline btn-sm">
          <i data-lucide="help-circle" style="width:14px; height:14px;"></i>
          <span>Ask Tutor</span>
        </a>
        <a href="planner.html" class="btn btn-primary btn-sm">
          <span>Start Task</span>
          <i data-lucide="arrow-right" style="width:14px; height:14px;"></i>
        </a>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div style="display:flex; align-items:center; gap:1rem;">
        <i data-lucide="check-check" style="width:32px; height:32px; color:var(--success-500);"></i>
        <div>
          <h3 style="font-size:1.1rem; font-weight:700;">All caught up!</h3>
          <p style="font-size:0.875rem; color:var(--text-muted);">You have no pending tasks. Generate a new roadmap or test your knowledge with a quiz.</p>
        </div>
      </div>
      <a href="planner.html" class="btn btn-primary btn-sm">
        <i data-lucide="plus"></i>
        <span>Create New Roadmap</span>
      </a>
    `;
  }

  initLucideIcons();
}

function renderActivePlans(plans) {
  const container = document.getElementById('active-plans-container');
  if (!container) return;

  if (plans.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align:center; padding:3rem;">
        <i data-lucide="map" style="width:40px; height:40px; margin:0 auto 1rem; color:var(--primary-500); opacity:0.8;"></i>
        <h3 style="font-size:1.2rem; font-weight:700; margin-bottom:0.5rem;">No Active Roadmaps Yet</h3>
        <p style="color:var(--text-muted); font-size:0.9rem; max-width:400px; margin:0 auto 1.5rem;">
          Generate your personalized AI-driven learning roadmap to get daily milestones and practice quizzes.
        </p>
        <a href="planner.html" class="btn btn-primary">
          <i data-lucide="sparkles"></i>
          <span>Generate My First Roadmap</span>
        </a>
      </div>
    `;
    initLucideIcons();
    return;
  }

  container.innerHTML = plans.map(p => {
    let planTotal = 0;
    let planDone = 0;
    (p.milestones || []).forEach(m => {
      (m.tasks || []).forEach(t => {
        planTotal++;
        if (t.completed) planDone++;
      });
    });
    const pct = planTotal > 0 ? Math.round((planDone / planTotal) * 100) : 0;

    return `
      <div class="card card-hover" style="margin-bottom:1.5rem;">
        <div class="card-body">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
            <div>
              <span class="badge badge-primary">${escapeHtml(p.targetSkill)}</span>
              <h3 style="font-size:1.25rem; font-weight:700; margin-top:0.35rem;">${escapeHtml(p.title)}</h3>
            </div>
            <span class="badge ${pct === 100 ? 'badge-success' : 'badge-warning'}">${pct}% Complete</span>
          </div>

          <div class="progress-container" style="margin: 0.75rem 0 1.25rem 0;">
            <div class="progress-fill" style="width: ${pct}%;"></div>
          </div>

          <div style="display:flex; justify-content:space-between; font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">
            <span>${p.durationWeeks} Weeks • ${p.minutesPerDay} mins/day</span>
            <span>${planDone} of ${planTotal} tasks finished</span>
          </div>

          <div style="display:flex; gap:0.75rem;">
            <a href="planner.html" class="btn btn-secondary btn-sm" style="flex:1;">
              <i data-lucide="list"></i>
              <span>View Full Roadmap</span>
            </a>
            <a href="quizzes.html" class="btn btn-outline btn-sm">
              <i data-lucide="award"></i>
              <span>Take Quiz</span>
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');

  initLucideIcons();
}
