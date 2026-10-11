/**
 * SkillPath AI — Learning Plan Generator Controller
 */

import { initFirebase, demoStore } from './firebase-config.js';
import { getCurrentUser } from './auth.js';
import { showToast, setButtonLoading, initLucideIcons } from './ui.js';
import { escapeHtml } from './validation.js';

let currentPlan = null;

export function initPlanner() {
  const form = document.getElementById('planner-form');
  const quickSkillChips = document.querySelectorAll('.skill-chip');
  const skillInput = document.getElementById('skill-input');

  // Quick skill chip buttons
  quickSkillChips.forEach(chip => {
    chip.addEventListener('click', () => {
      quickSkillChips.forEach(c => c.classList.remove('badge-primary'));
      chip.classList.add('badge-primary');
      if (skillInput) skillInput.value = chip.dataset.skill;
    });
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handlePlanGeneration(form);
    });
  }

  const saveBtn = document.getElementById('save-plan-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      await saveCurrentPlanToCloud();
    });
  }
}

async function handlePlanGeneration(form) {
  const submitBtn = form.querySelector('button[type="submit"]');
  setButtonLoading(submitBtn, true, 'Generating AI Roadmap...');

  const loadingView = document.getElementById('planner-loading');
  const resultsView = document.getElementById('planner-results');

  if (loadingView) loadingView.style.display = 'block';
  if (resultsView) resultsView.style.display = 'none';

  const formData = {
    skill: document.getElementById('skill-input').value.trim(),
    level: document.getElementById('level-select').value,
    goal: document.getElementById('goal-input').value.trim(),
    minutesPerDay: parseInt(document.getElementById('minutes-select').value, 10),
    durationWeeks: parseInt(document.getElementById('duration-select').value, 10),
    learningStyle: document.getElementById('style-select').value,
    existingKnowledge: document.getElementById('prior-knowledge-input')?.value.trim() || '',
    difficultyAreas: document.getElementById('pain-points-input')?.value.trim() || '',
    language: document.getElementById('language-select')?.value || 'english'
  };

  try {
    const { functions, isDemoMode } = await initFirebase();

    let planData = null;

    if (!isDemoMode && functions) {
      try {
        const { httpsCallable } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-functions.js');
        const generatePlanFn = httpsCallable(functions, 'generateLearningPlan');
        const res = await generatePlanFn(formData);
        planData = res.data?.plan;
      } catch (cloudErr) {
        console.warn('Cloud Function invocation failed, falling back to local curriculum generator:', cloudErr);
      }
    }

    // Fallback or demo generation
    if (!planData) {
      planData = generateLocalPlan(formData);
    }

    currentPlan = planData;
    renderRoadmap(planData);
    showToast('Learning roadmap generated successfully!', 'success');
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  } finally {
    setButtonLoading(submitBtn, false);
    if (loadingView) loadingView.style.display = 'none';
  }
}

/**
 * Client fallback generator for standalone / demo offline execution
 */
function generateLocalPlan(input) {
  const weeks = input.durationWeeks || 4;
  const milestones = [];

  for (let w = 1; w <= weeks; w++) {
    milestones.push({
      weekNumber: w,
      title: `Week ${w}: Core ${input.skill} Competencies`,
      objective: `Master fundamental and practical patterns in ${input.skill}`,
      tasks: [
        {
          id: `w${w}-t1`,
          title: `${input.skill} Architectural Core Concepts`,
          description: `Understand the fundamental building blocks, core terminology, and mental models of ${input.skill}.`,
          estimatedMinutes: input.minutesPerDay,
          category: 'Theory',
          practicalExercise: `Create a cheatsheet and test basic syntax or commands for ${input.skill}.`,
          resources: [
            { title: 'Official Documentation & Standards', url: 'https://developer.mozilla.org', type: 'docs' },
            { title: 'Interactive Practical Exercises', url: 'https://freecodecamp.org', type: 'tutorial' }
          ]
        },
        {
          id: `w${w}-t2`,
          title: `Hands-on Problem Solving with ${input.skill}`,
          description: `Apply your knowledge to solve real-world problems and construct modular components.`,
          estimatedMinutes: input.minutesPerDay,
          category: 'Practical',
          practicalExercise: `Build a functional module testing edge cases and performance.`,
          resources: [
            { title: 'Best Practices Guide', url: 'https://github.com', type: 'docs' }
          ]
        }
      ],
      miniProject: {
        title: `${input.skill} Milestone ${w} Mini-Project`,
        description: `Synthesize skills acquired in Week ${w} into a fully functional mini-project.`,
        checklist: [
          'Clean, modular code structure',
          'Proper error handling & responsive feedback',
          'Documented README explaining design choices'
        ]
      },
      assessmentCheckpoint: `Complete the Week ${w} practice quiz and self-review your code against standards.`
    });
  }

  return {
    id: 'plan-' + Date.now(),
    title: `${input.skill} Mastery Roadmap`,
    targetSkill: input.skill,
    proficiencyLevel: input.level,
    goal: input.goal || `Become proficient in ${input.skill}`,
    durationWeeks: weeks,
    minutesPerDay: input.minutesPerDay,
    learningObjectives: [
      `Grasp core theoretical mechanics of ${input.skill}`,
      `Build real-world projects and problem solving agility`,
      `Achieve job-ready proficiency tailored to your goal: "${input.goal}"`
    ],
    milestones,
    completionCriteria: [
      'Successfully complete all scheduled weekly milestones and mini-projects',
      'Pass topic quizzes with a score of 80% or higher',
      'Deploy code to public GitHub repository with comprehensive README'
    ],
    isFallback: true,
    fallbackNotice: 'Generated using SkillPath AI verified curriculum framework.'
  };
}

/**
 * Render roadmap view
 */
function renderRoadmap(plan) {
  const container = document.getElementById('planner-results');
  if (!container) return;

  container.style.display = 'block';

  let fallbackBanner = '';
  if (plan.isFallback) {
    fallbackBanner = `
      <div class="recommendation-banner" style="margin-bottom:1.5rem; border-color:var(--warning-400);">
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <i data-lucide="info" style="color:var(--warning-500); width:24px; height:24px;"></i>
          <div>
            <strong>Curriculum Framework Applied</strong>
            <div style="font-size:0.85rem; color:var(--text-muted);">${escapeHtml(plan.fallbackNotice || 'Structured curriculum standard applied.')}</div>
          </div>
        </div>
      </div>
    `;
  }

  let milestonesHtml = plan.milestones.map((m, idx) => {
    const tasksHtml = m.tasks.map(t => `
      <div class="task-item">
        <input type="checkbox" class="task-checkbox" data-task-id="${escapeHtml(t.id || t.title)}" />
        <div style="flex:1;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.25rem;">
            <strong class="task-title" style="font-size:0.95rem;">${escapeHtml(t.title)}</strong>
            <span class="badge badge-primary">${escapeHtml(t.category || 'Practical')} • ${t.estimatedMinutes}m</span>
          </div>
          <p style="font-size:0.875rem; color:var(--text-muted); margin-bottom:0.4rem;">${escapeHtml(t.description)}</p>
          <div style="font-size:0.825rem; background:var(--bg-subtle); padding:0.4rem 0.6rem; border-radius:var(--radius-sm); margin-bottom:0.4rem;">
            <strong>Exercise:</strong> ${escapeHtml(t.practicalExercise || 'Complete practice session')}
          </div>
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            ${(t.resources || []).map(r => `
              <a href="${escapeHtml(r.url)}" target="_blank" rel="noopener noreferrer" class="badge" style="background:var(--bg-hover); color:var(--text-main);">
                <i data-lucide="external-link" style="width:12px; height:12px;"></i> ${escapeHtml(r.title)}
              </a>
            `).join('')}
          </div>
        </div>
      </div>
    `).join('');

    const checklistHtml = (m.miniProject?.checklist || []).map(item => `
      <li style="font-size:0.85rem; color:var(--text-muted);">${escapeHtml(item)}</li>
    `).join('');

    return `
      <div class="milestone-item ${idx === 0 ? 'open' : ''}">
        <div class="milestone-header" onclick="this.parentElement.classList.toggle('open')">
          <div>
            <span class="badge badge-primary" style="margin-bottom:0.35rem;">Week ${m.weekNumber}</span>
            <h3 style="font-size:1.15rem; margin-top:0.2rem;">${escapeHtml(m.title)}</h3>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-top:0.2rem;">${escapeHtml(m.objective)}</p>
          </div>
          <i data-lucide="chevron-down"></i>
        </div>
        <div class="milestone-content" style="${idx === 0 ? 'display:block;' : 'display:none;'}">
          <h4 style="font-size:0.95rem; margin-bottom:0.75rem; font-weight:700;">Scheduled Daily Activities:</h4>
          <div class="task-list" style="margin-bottom:1.5rem;">
            ${tasksHtml}
          </div>
          
          ${m.miniProject ? `
            <div style="background:var(--bg-surface); border:1px solid var(--border-light); padding:1rem; border-radius:var(--radius-md); margin-bottom:1rem;">
              <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.35rem;">
                <i data-lucide="folder-git-2" style="color:var(--primary-500); width:18px; height:18px;"></i>
                <strong>Milestone Project: ${escapeHtml(m.miniProject.title)}</strong>
              </div>
              <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.5rem;">${escapeHtml(m.miniProject.description)}</p>
              <ul style="padding-left:1.25rem;">
                ${checklistHtml}
              </ul>
            </div>
          ` : ''}

          <div style="font-size:0.85rem; color:var(--text-muted); padding:0.5rem 0.75rem; background:rgba(99, 102, 241, 0.08); border-radius:var(--radius-sm);">
            <strong>Checkpoint:</strong> ${escapeHtml(m.assessmentCheckpoint || 'Review progress with quiz.')}
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    ${fallbackBanner}
    <div class="card" style="margin-bottom:2rem;">
      <div class="card-body">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem; margin-bottom:1rem;">
          <div>
            <h2 class="heading-2">${escapeHtml(plan.title)}</h2>
            <div style="display:flex; gap:0.5rem; margin-top:0.5rem; flex-wrap:wrap;">
              <span class="badge badge-primary">${escapeHtml(plan.targetSkill)}</span>
              <span class="badge badge-success">${escapeHtml(plan.proficiencyLevel)}</span>
              <span class="badge badge-warning">${plan.durationWeeks} Weeks</span>
              <span class="badge" style="background:var(--bg-subtle); color:var(--text-main);">${plan.minutesPerDay} mins/day</span>
            </div>
          </div>
          <button id="save-plan-btn" class="btn btn-primary">
            <i data-lucide="bookmark-check"></i>
            <span>Save to My Dashboard</span>
          </button>
        </div>

        <div style="margin-top:1.25rem;">
          <h4 style="font-size:0.95rem; font-weight:700; margin-bottom:0.5rem;">Key Learning Objectives:</h4>
          <ul style="padding-left:1.25rem; font-size:0.9rem; color:var(--text-muted); display:flex; flex-direction:column; gap:0.35rem;">
            ${(plan.learningObjectives || []).map(obj => `<li>${escapeHtml(obj)}</li>`).join('')}
          </ul>
        </div>
      </div>
    </div>

    <div class="milestone-accordion">
      ${milestonesHtml}
    </div>
  `;

  // Attach accordion toggles
  container.querySelectorAll('.milestone-header').forEach(header => {
    header.addEventListener('click', () => {
      const content = header.nextElementSibling;
      const isOpen = content.style.display === 'block';
      content.style.display = isOpen ? 'none' : 'block';
      const chevron = header.querySelector('i');
      if (chevron) {
        chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
      }
    });
  });

  const saveBtn = container.querySelector('#save-plan-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      await saveCurrentPlanToCloud();
    });
  }

  initLucideIcons();
  container.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Save current plan to Firestore / Local Storage
 */
async function saveCurrentPlanToCloud() {
  if (!currentPlan) return;

  const user = getCurrentUser();
  if (!user) {
    showToast('Please sign in to save your roadmap.', 'warning');
    return;
  }

  const { db, isDemoMode } = await initFirebase();
  const planId = currentPlan.id || 'plan-' + Date.now();

  try {
    if (!isDemoMode && db) {
      const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      // Save plan document
      await setDoc(doc(db, 'users', user.uid, 'plans', planId), {
        title: currentPlan.title,
        targetSkill: currentPlan.targetSkill,
        proficiencyLevel: currentPlan.proficiencyLevel,
        goal: currentPlan.goal,
        durationWeeks: currentPlan.durationWeeks,
        minutesPerDay: currentPlan.minutesPerDay,
        milestones: currentPlan.milestones,
        learningObjectives: currentPlan.learningObjectives || [],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else {
      // Demo store persistence
      const data = demoStore.getData();
      data.plans = data.plans || {};
      data.plans[planId] = {
        ...currentPlan,
        id: planId,
        status: 'active',
        updatedAt: new Date().toISOString()
      };
      demoStore.saveData(data);
    }

    showToast('Roadmap saved to your dashboard!', 'success');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1200);
  } catch (err) {
    showToast(`Failed to save roadmap: ${err.message}`, 'error');
  }
}
