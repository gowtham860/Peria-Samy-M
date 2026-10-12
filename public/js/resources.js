import { showToast, initLucideIcons } from './ui.js';
import { escapeHtml } from './validation.js';
import { COURSES } from './courses-data.js';

export const CURATED_RESOURCES = [
  {
    id: 'res-1',
    title: 'MDN Web Docs (Mozilla)',
    category: 'Frontend',
    type: 'Official Documentation',
    description: 'The premier open-standard reference for HTML5, CSS3, Web APIs, and JavaScript mechanics.',
    url: 'https://developer.mozilla.org',
    tags: ['HTML', 'CSS', 'JavaScript']
  },
  {
    id: 'res-2',
    title: 'freeCodeCamp Interactive Curriculum',
    category: 'Full-Stack',
    type: 'Interactive Tutorials',
    description: 'Hands-on project-based certifications spanning responsive web design, algorithms, and microservices.',
    url: 'https://www.freecodecamp.org',
    tags: ['Web', 'Python', 'Algorithms']
  },
  {
    id: 'res-3',
    title: 'Official Python Documentation & Tutorials',
    category: 'AI & Data',
    type: 'Official Documentation',
    description: 'Standard library reference, PEP style guides, and tutorial series for Python 3.12+.',
    url: 'https://docs.python.org/3/',
    tags: ['Python', 'Backend', 'Data']
  },
  {
    id: 'res-4',
    title: 'Docker Official Getting Started Guide',
    category: 'DevOps',
    type: 'Official Documentation',
    description: 'Practical guide to containerization, Dockerfiles, multi-stage builds, and Docker Compose.',
    url: 'https://docs.docker.com/get-started/',
    tags: ['Containers', 'DevOps', 'Cloud']
  },
  {
    id: 'res-5',
    title: 'Harvard CS50: Introduction to Computer Science',
    category: 'CS Fundamentals',
    type: 'Free Course',
    description: 'World-renowned introduction to algorithms, memory management, data structures, and software design.',
    url: 'https://cs50.harvard.edu/x/',
    tags: ['Algorithms', 'C', 'Python', 'Web']
  },
  {
    id: 'res-6',
    title: 'Exercism Code Practice & Mentorship',
    category: 'Practice',
    type: 'Practice Platform',
    description: 'Code fluency track across 70+ programming languages with automated test suites.',
    url: 'https://exercism.org',
    tags: ['Practice', 'TDD', 'Algorithms']
  }
];

export const PROJECT_LABS = [
  {
    id: 'proj-1',
    title: 'Personal Developer Portfolio & Blog',
    level: 'Beginner',
    category: 'Frontend',
    tools: ['HTML5', 'CSS Grid', 'JavaScript', 'GitHub Pages'],
    milestones: [
      'Design accessible typography and light/dark theme toggle',
      'Implement responsive project showcase grid',
      'Deploy to GitHub Pages with automated CI'
    ],
    outcome: 'A live portfolio ready to share with recruiters and clients.'
  },
  {
    id: 'proj-2',
    title: 'Full-Stack Task & Notes REST API',
    level: 'Intermediate',
    category: 'Backend',
    tools: ['Node.js', 'Express', 'JWT', 'MongoDB/Firestore'],
    milestones: [
      'Model user authentication with bcrypt and JWT tokens',
      'Design RESTful routes with express-validator and rate-limiting',
      'Write automated integration tests and deploy to cloud'
    ],
    outcome: 'Demonstrable knowledge of secure server-side engineering.'
  },
  {
    id: 'proj-3',
    title: 'AI Document Knowledge Base & Chat',
    level: 'Advanced',
    category: 'AI & Data',
    tools: ['Python/Node', 'Gemini API', 'Vector Embeddings', 'Docker'],
    milestones: [
      'Extract text from user-uploaded PDFs and generate embeddings',
      'Perform similarity search and provide grounded AI citations',
      'Containerize full service with Docker Compose'
    ],
    outcome: 'Production-caliber AI application highlighting state-of-the-art LLM orchestration.'
  }
];

export function initResources() {
  renderCourses(COURSES);
  renderResources(CURATED_RESOURCES);
  renderProjects(PROJECT_LABS);

  // 1. Course Track filter tabs
  document.querySelectorAll('.course-track-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.course-track-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const track = btn.dataset.track;
      const filtered = track === 'all'
        ? COURSES
        : COURSES.filter(c => c.category.toLowerCase() === track.toLowerCase());
      renderCourses(filtered);
    });
  });

  // 2. Course Search Input
  const courseSearchInput = document.getElementById('course-catalog-search');
  if (courseSearchInput) {
    courseSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const filtered = COURSES.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q))
      );
      renderCourses(filtered);
    });
  }

  // 3. Documentation Category filter tabs
  document.querySelectorAll('.resource-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.resource-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const cat = btn.dataset.category;
      const filtered = cat === 'all' 
        ? CURATED_RESOURCES 
        : CURATED_RESOURCES.filter(r => r.category.toLowerCase().includes(cat.toLowerCase()));
      renderResources(filtered);
    });
  });

  // 4. Resource Search Input
  const searchInput = document.getElementById('resource-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const filtered = CURATED_RESOURCES.filter(r => 
        r.title.toLowerCase().includes(query) || 
        r.description.toLowerCase().includes(query) ||
        r.tags.some(t => t.toLowerCase().includes(query))
      );
      renderResources(filtered);
    });
  }
}

function renderCourses(courses) {
  const container = document.getElementById('course-catalog-grid');
  if (!container) return;

  if (courses.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--text-muted);">
        <i data-lucide="search-x" style="width:36px; height:36px; margin:0 auto 1rem; opacity:0.6;"></i>
        <p>No courses match your search criteria. Try a different query.</p>
      </div>
    `;
    initLucideIcons();
    return;
  }

  container.innerHTML = courses.map(c => {
    const categoryBadgeClass = c.category === 'Technology'
      ? 'badge-primary'
      : c.category === 'AI & Data'
      ? 'badge-primary'
      : c.category === 'Cybersecurity'
      ? 'badge-warning'
      : 'badge-success';

    return `
      <div class="card card-hover">
        <div class="card-body">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
            <span class="badge ${categoryBadgeClass}">${escapeHtml(c.category)}</span>
            <span style="font-size:0.75rem; font-weight:700; color:var(--text-muted);">#${c.id}</span>
          </div>

          <h3 style="font-size:1.15rem; font-weight:700; margin-bottom:0.35rem;">${escapeHtml(c.title)}</h3>
          
          <div style="display:flex; gap:0.5rem; margin-bottom:0.75rem; font-size:0.8rem; color:var(--text-muted);">
            <span><strong>${c.weeks}</strong> Weeks</span>
            <span>•</span>
            <span><strong>${c.minutes}</strong> mins/day</span>
            <span>•</span>
            <span class="badge badge-sm" style="background:var(--bg-subtle); color:var(--text-main);">${escapeHtml(c.level)}</span>
          </div>

          <p style="font-size:0.875rem; color:var(--text-muted); line-height:1.5; margin-bottom:1rem;">
            ${escapeHtml(c.description)}
          </p>

          <div style="display:flex; gap:0.35rem; flex-wrap:wrap; margin-bottom:1.25rem;">
            ${c.tags.map(t => `<span class="badge" style="background:var(--bg-hover); font-size:0.725rem; color:var(--text-main);">#${escapeHtml(t)}</span>`).join('')}
          </div>

          <a href="planner.html?course=${encodeURIComponent(c.title)}" class="btn btn-primary btn-sm" style="width:100%;">
            <i data-lucide="sparkles" style="width:14px; height:14px;"></i>
            <span>Generate AI Roadmap</span>
          </a>
        </div>
      </div>
    `;
  }).join('');

  initLucideIcons();
}

function renderResources(list) {
  const container = document.getElementById('resources-grid');
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--text-muted);">
        <i data-lucide="search-x" style="width:36px; height:36px; margin:0 auto 1rem; opacity:0.6;"></i>
        <p>No resources match your search criteria.</p>
      </div>
    `;
    initLucideIcons();
    return;
  }

  container.innerHTML = list.map(r => `
    <div class="card card-hover">
      <div class="card-body">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
          <span class="badge badge-primary">${escapeHtml(r.type)}</span>
          <span class="badge" style="background:var(--bg-subtle); color:var(--text-muted); font-size:0.75rem;">${escapeHtml(r.category)}</span>
        </div>
        <h3 style="font-size:1.15rem; font-weight:700; margin-bottom:0.5rem;">${escapeHtml(r.title)}</h3>
        <p style="font-size:0.875rem; color:var(--text-muted); margin-bottom:1rem; line-height:1.5;">${escapeHtml(r.description)}</p>
        <div style="display:flex; gap:0.4rem; flex-wrap:wrap; margin-bottom:1.25rem;">
          ${r.tags.map(t => `<span class="badge" style="background:var(--bg-hover); color:var(--text-main); font-size:0.75rem;">#${escapeHtml(t)}</span>`).join('')}
        </div>
        <a href="${escapeHtml(r.url)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="width:100%;">
          <i data-lucide="external-link" style="width:14px; height:14px;"></i>
          <span>Open Resource</span>
        </a>
      </div>
    </div>
  `).join('');

  initLucideIcons();
}

function renderProjects(projects) {
  const container = document.getElementById('projects-grid');
  if (!container) return;

  container.innerHTML = projects.map(p => {
    const levelBadge = p.level === 'Beginner' ? 'badge-success' : p.level === 'Intermediate' ? 'badge-primary' : 'badge-warning';
    return `
      <div class="card card-hover">
        <div class="card-body">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
            <span class="badge ${levelBadge}">${escapeHtml(p.level)}</span>
            <span class="badge" style="background:var(--bg-subtle); color:var(--text-muted);">${escapeHtml(p.category)}</span>
          </div>
          <h3 style="font-size:1.15rem; font-weight:700; margin-bottom:0.4rem;">${escapeHtml(p.title)}</h3>
          <div style="font-size:0.8rem; color:var(--primary-600); font-weight:600; margin-bottom:0.75rem;">
            Stack: ${p.tools.join(' • ')}
          </div>
          <h4 style="font-size:0.85rem; font-weight:700; margin-bottom:0.35rem;">Milestones:</h4>
          <ul style="padding-left:1.2rem; font-size:0.825rem; color:var(--text-muted); margin-bottom:0.85rem; display:flex; flex-direction:column; gap:0.25rem;">
            ${p.milestones.map(m => `<li>${escapeHtml(m)}</li>`).join('')}
          </ul>
          <div style="font-size:0.8rem; background:rgba(16, 185, 129, 0.08); padding:0.5rem 0.75rem; border-radius:var(--radius-sm); margin-bottom:1rem;">
            <strong>Expected Outcome:</strong> ${escapeHtml(p.outcome)}
          </div>
          <button class="btn btn-secondary btn-sm add-project-btn" data-project-title="${escapeHtml(p.title)}" style="width:100%;">
            <i data-lucide="plus-circle" style="width:14px; height:14px;"></i>
            <span>Add Project to Roadmap</span>
          </button>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.add-project-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast(`Added "${btn.dataset.projectTitle}" to your learning tasks!`, 'success');
    });
  });

  initLucideIcons();
}
