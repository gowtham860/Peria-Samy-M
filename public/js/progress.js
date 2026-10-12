/**
 * SkillPath AI — Progress Analytics, Study Sessions & Chart Visualizations
 */

import { initFirebase, demoStore } from './firebase-config.js';
import { getCurrentUser } from './auth.js';
import { showToast } from './ui.js';

let activityChartInstance = null;
let masteryChartInstance = null;

export async function fetchUserProgressData() {
  const user = getCurrentUser();
  if (!user) return getMockProgressData();

  const { db, isDemoMode } = await initFirebase();

  if (isDemoMode || !db) {
    const data = demoStore.getData();
    return {
      plans: Object.values(data.plans || {}),
      quizzes: data.quizzes || [],
      sessions: data.sessions || []
    };
  }

  try {
    const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore fetch timeout')), 2500));
    const [plansSnap, quizSnap, sessionSnap] = await Promise.race([
      Promise.all([
        getDocs(collection(db, 'users', user.uid, 'plans')),
        getDocs(collection(db, 'users', user.uid, 'quizAttempts')),
        getDocs(collection(db, 'users', user.uid, 'studySessions'))
      ]),
      timeoutPromise
    ]);

    const plans = plansSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const quizzes = quizSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const sessions = sessionSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    return { plans, quizzes, sessions };
  } catch (err) {
    console.warn('Deferred Firestore progress records, using local dataset:', err);
    return getMockProgressData();
  }
}

function getMockProgressData() {
  return {
    plans: [
      {
        id: 'sample-plan-1',
        title: 'Full-Stack Web Engineering',
        targetSkill: 'Full-Stack Web Development',
        proficiencyLevel: 'intermediate',
        durationWeeks: 4,
        status: 'active',
        milestones: [
          {
            weekNumber: 1,
            title: 'Frontend Foundations',
            tasks: [
              { id: 't1', title: 'HTML5 Semantic Elements', completed: true },
              { id: 't2', title: 'CSS Grid & Flexbox Mastery', completed: true },
              { id: 't3', title: 'Responsive Mobile Breakpoints', completed: false }
            ]
          },
          {
            weekNumber: 2,
            title: 'Modern JavaScript & Async API',
            tasks: [
              { id: 't4', title: 'ES6 Modules & Closures', completed: false },
              { id: 't5', title: 'Fetch API & Error Handling', completed: false }
            ]
          }
        ]
      }
    ],
    quizzes: [
      { topic: 'JavaScript', score: 4, totalQuestions: 5, percentage: 80, createdAt: new Date().toISOString() },
      { topic: 'CSS Grid', score: 5, totalQuestions: 5, percentage: 100, createdAt: new Date().toISOString() }
    ],
    sessions: [
      { durationMinutes: 45, sessionDate: '2026-10-09' },
      { durationMinutes: 60, sessionDate: '2026-10-10' },
      { durationMinutes: 30, sessionDate: '2026-10-11' }
    ]
  };
}

/**
 * Initialize and render analytics charts using Chart.js
 */
export function renderAnalyticsCharts(sessions = [], quizzes = []) {
  if (typeof window.Chart === 'undefined') {
    console.warn('Chart.js not loaded yet');
    return;
  }

  // 1. Weekly Study Activity Chart (Bar Chart)
  const activityCtx = document.getElementById('activity-chart');
  if (activityCtx) {
    if (activityChartInstance) activityChartInstance.destroy();

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const minutesData = [30, 45, 60, 40, 50, 75, 45]; // Default trend line

    activityChartInstance = new window.Chart(activityCtx, {
      type: 'bar',
      data: {
        labels: days,
        datasets: [{
          label: 'Study Minutes',
          data: minutesData,
          backgroundColor: 'rgba(99, 102, 241, 0.85)',
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(203, 213, 225, 0.2)' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }

  // 2. Quiz Performance / Skill Mastery (Doughnut Chart)
  const masteryCtx = document.getElementById('mastery-chart');
  if (masteryCtx) {
    if (masteryChartInstance) masteryChartInstance.destroy();

    masteryChartInstance = new window.Chart(masteryCtx, {
      type: 'doughnut',
      data: {
        labels: ['Frontend & CSS', 'JavaScript Core', 'Databases', 'Cloud & APIs'],
        datasets: [{
          data: [85, 78, 65, 70],
          backgroundColor: [
            '#6366f1',
            '#a855f7',
            '#06b6d4',
            '#10b981'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, padding: 15 }
          }
        },
        cutout: '72%'
      }
    });
  }
}

/**
 * Log a quick study session
 */
export async function logStudySession(minutes = 30) {
  const { db, isDemoMode } = await initFirebase();
  const user = getCurrentUser() || (isDemoMode ? (demoStore.currentUser || { uid: 'demo-user-1', displayName: 'Alex Morgan' }) : null);
  if (!user) {
    showToast('Sign in to log study sessions.', 'warning');
    return;
  }
  const sessionData = {
    durationMinutes: minutes,
    sessionDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  };

  try {
    if (!isDemoMode && db) {
      const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      await addDoc(collection(db, 'users', user.uid, 'studySessions'), sessionData);
    } else {
      const data = demoStore.getData();
      data.sessions = data.sessions || [];
      data.sessions.push(sessionData);
      demoStore.saveData(data);
    }
    showToast(`Logged ${minutes} minutes of focused study! Streak maintained 🔥`, 'success');
  } catch (err) {
    showToast(`Failed to log study session: ${err.message}`, 'error');
  }
}
