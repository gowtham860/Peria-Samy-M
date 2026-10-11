/**
 * Learning Plan Generator Service
 * Generates personalized roadmaps via AI and provides verified fallback templates.
 */

const { AIProvider } = require('./ai-provider');

/**
 * Verified curriculum templates for fallback generation
 */
const VERIFIED_TEMPLATES = {
  'full-stack web development': {
    title: 'Full-Stack Modern Web Engineering Roadmap',
    learningObjectives: [
      'Master semantic HTML5, modern CSS3 (Flexbox/Grid), and responsive UI design',
      'Gain fluency in modern JavaScript (ES6+), DOM APIs, and asynchronous programming',
      'Build robust REST APIs using Node.js, Express, and secure database connections',
      'Deploy full-stack applications with CI/CD and production cloud hosting'
    ],
    milestones: [
      {
        weekNumber: 1,
        title: 'Modern Frontend Foundations & Responsive Design',
        objective: 'Build semantic, accessible, and responsive user interfaces from scratch',
        tasks: [
          {
            title: 'HTML5 Semantic Layouts & ARIA Standards',
            description: 'Structure modern web pages using semantic tags, accessibility best practices, and SEO metadata.',
            estimatedMinutes: 45,
            category: 'Theory',
            practicalExercise: 'Refactor an unsemantic generic div-soup page into accessible semantic HTML.',
            resources: [
              { title: 'MDN Web Docs: Semantic HTML', url: 'https://developer.mozilla.org/en-US/docs/Glossary/Semantics', type: 'docs' },
              { title: 'web.dev Learn Accessibility', url: 'https://web.dev/learn/accessibility/', type: 'tutorial' }
            ]
          },
          {
            title: 'CSS Grid & Flexbox Masterclass',
            description: 'Build complex, responsive dashboard layouts without external CSS frameworks.',
            estimatedMinutes: 60,
            category: 'Practical',
            practicalExercise: 'Create a responsive 3-column dashboard with collapsible sidebar using pure CSS Grid and Flexbox.',
            resources: [
              { title: 'CSS-Tricks: Complete Guide to Flexbox', url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/', type: 'docs' },
              { title: 'CSS Grid Garden Interactive Game', url: 'https://cssgridgarden.com/', type: 'practice' }
            ]
          },
          {
            title: 'Modern CSS Custom Properties & Dark Mode',
            description: 'Implement scalable CSS variables and seamless light/dark theme toggles with smooth transitions.',
            estimatedMinutes: 45,
            category: 'Practical',
            practicalExercise: 'Build a theme toggle that respects user prefers-color-scheme and persists selection to localStorage.',
            resources: [
              { title: 'MDN: Using CSS Custom Properties', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties', type: 'docs' }
            ]
          }
        ],
        miniProject: {
          title: 'Responsive SaaS Product Landing Page',
          description: 'A pixel-perfect, mobile-friendly landing page with sticky navigation, feature cards, and theme switcher.',
          checklist: [
            'Zero layout overflow on 320px mobile screens',
            'Full dark/light mode toggle with localStorage persistence',
            '100% Lighthouse accessibility score'
          ]
        },
        assessmentCheckpoint: 'Evaluate responsive layout on 3 viewport breakpoints and ensure full keyboard navigation.'
      },
      {
        weekNumber: 2,
        title: 'Modern JavaScript (ES6+), Async & DOM Engineering',
        objective: 'Master state management, event delegation, and asynchronous API calls',
        tasks: [
          {
            title: 'ES6+ Syntax, Closures, and Scope Mechanics',
            description: 'Deep dive into arrow functions, destructuring, rest/spread, closures, and the event loop.',
            estimatedMinutes: 50,
            category: 'Theory',
            practicalExercise: 'Write custom implementations of map, filter, reduce, and debounce functions.',
            resources: [
              { title: 'JavaScript.info: The Modern JavaScript Tutorial', url: 'https://javascript.info/', type: 'tutorial' }
            ]
          },
          {
            title: 'Async JavaScript: Promises, Async/Await & Fetch',
            description: 'Handle concurrent requests, error handling with try/catch, and abort signals.',
            estimatedMinutes: 60,
            category: 'Practical',
            practicalExercise: 'Build a weather or Github user search widget with debounced inputs and error toasts.',
            resources: [
              { title: 'MDN: How to use Promises', url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Promises', type: 'docs' }
            ]
          }
        ],
        miniProject: {
          title: 'Interactive Real-Time Task & Goal Tracker',
          description: 'A rich single-page task manager with filterable categories, drag-and-drop, and localStorage sync.',
          checklist: [
            'CRUD operations for tasks with instant UI updates',
            'Filter by status (All, Active, Completed)',
            'Clean error state when empty or network operations fail'
          ]
        },
        assessmentCheckpoint: 'Build a functioning async data fetcher with robust error handling and loading indicators.'
      },
      {
        weekNumber: 3,
        title: 'Backend API Development with Node.js & Express',
        objective: 'Build secure RESTful microservices with input validation and authentication',
        tasks: [
          {
            title: 'Node.js Runtime & Express Server Setup',
            description: 'Understand the Node.js event loop, modules, middleware chain, and REST routing.',
            estimatedMinutes: 55,
            category: 'Theory',
            practicalExercise: 'Create an Express server with structured routing, centralized error handler, and request logging.',
            resources: [
              { title: 'Express.js Official Documentation', url: 'https://expressjs.com/', type: 'docs' }
            ]
          },
          {
            title: 'JWT Authentication & Password Hashing',
            description: 'Implement secure user signup, bcrypt hashing, JSON Web Token generation, and auth middleware.',
            estimatedMinutes: 70,
            category: 'Practical',
            practicalExercise: 'Protect private endpoints using Bearer token verification and role checking.',
            resources: [
              { title: 'OWASP Authentication Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html', type: 'docs' }
            ]
          }
        ],
        miniProject: {
          title: 'Secure Notes & Bookmark REST API',
          description: 'A complete REST service with authentication, rate limiting, and input validation.',
          checklist: [
            'Secure password hashing with bcrypt',
            'Protected routes requiring valid JWT',
            'Input sanitization preventing injection attacks'
          ]
        },
        assessmentCheckpoint: 'Verify API endpoints using Postman / curl with automated HTTP test cases.'
      },
      {
        weekNumber: 4,
        title: 'Database Architecture, Cloud Integration & Deployment',
        objective: 'Connect persistence layers and deploy a production-ready application to the cloud',
        tasks: [
          {
            title: 'Database Design: NoSQL vs Relational Modeling',
            description: 'Model documents, relations, indexing, and transactional integrity.',
            estimatedMinutes: 50,
            category: 'Theory',
            practicalExercise: 'Design schema for a collaborative learning app with user profiles, enrollments, and reviews.',
            resources: [
              { title: 'Firebase Firestore Documentation', url: 'https://firebase.google.com/docs/firestore', type: 'docs' }
            ]
          },
          {
            title: 'Production Deployment & Continuous Integration',
            description: 'Deploy frontend to Firebase Hosting / Vercel, secure environment variables, and configure HTTPS.',
            estimatedMinutes: 60,
            category: 'Practical',
            practicalExercise: 'Set up an automated GitHub Actions pipeline that lints and deploys on git push.',
            resources: [
              { title: 'Firebase Hosting Guide', url: 'https://firebase.google.com/docs/hosting', type: 'docs' }
            ]
          }
        ],
        miniProject: {
          title: 'Full-Stack Portfolio Capstone Application',
          description: 'A connected web application featuring authentication, persistent database, dynamic UI, and cloud hosting.',
          checklist: [
            'Live public URL with custom domain or Firebase Hosting subdomain',
            'Zero console errors and secure environment variables',
            'Responsive on all mobile and desktop devices'
          ]
        },
        assessmentCheckpoint: 'Deploy live application and conduct comprehensive cross-browser audit.'
      }
    ],
    completionCriteria: [
      'Successfully deployed 4 working projects to live URLs with clean source code on GitHub',
      'Pass all frontend accessibility and performance audits (Lighthouse > 90)',
      'Demonstrate ability to build secure RESTful backends with database integration'
    ]
  }
};

/**
 * Generate fallback template dynamically for any skill
 */
function generateFallbackPlan(sanitized) {
  const normalizedSkill = sanitized.skill.toLowerCase().trim();
  const baseTemplate = VERIFIED_TEMPLATES[normalizedSkill] || VERIFIED_TEMPLATES['full-stack web development'];

  // Scale weeks if requested duration is different
  const requestedWeeks = sanitized.durationWeeks || 4;
  const milestones = [];

  for (let w = 1; w <= requestedWeeks; w++) {
    const templateIndex = (w - 1) % baseTemplate.milestones.length;
    const sourceMilestone = baseTemplate.milestones[templateIndex];
    milestones.push({
      weekNumber: w,
      title: `Week ${w}: ${sanitized.skill} — ${sourceMilestone.title.split('—').pop() || sourceMilestone.title}`,
      objective: sourceMilestone.objective.replace('Web Development', sanitized.skill),
      tasks: sourceMilestone.tasks.map((task, idx) => ({
        ...task,
        id: `w${w}-t${idx + 1}`,
        estimatedMinutes: Math.min(sanitized.minutesPerDay, task.estimatedMinutes)
      })),
      miniProject: {
        ...sourceMilestone.miniProject,
        title: `${sanitized.skill} Milestone ${w} Project: ${sourceMilestone.miniProject.title}`
      },
      assessmentCheckpoint: sourceMilestone.assessmentCheckpoint
    });
  }

  return {
    title: `${sanitized.skill} Personalized Learning Roadmap`,
    targetSkill: sanitized.skill,
    proficiencyLevel: sanitized.level,
    goal: sanitized.goal || `Become proficient in ${sanitized.skill}`,
    durationWeeks: requestedWeeks,
    minutesPerDay: sanitized.minutesPerDay,
    learningObjectives: baseTemplate.learningObjectives.map(obj => obj.replace('Web Development', sanitized.skill)),
    milestones,
    completionCriteria: baseTemplate.completionCriteria,
    isFallback: true,
    fallbackNotice: 'Generated using SkillPath AI verified curriculum framework.'
  };
}

/**
 * Generate personalized plan using AI provider with automatic fallback
 */
async function generatePlan(sanitized, aiProvider = new AIProvider()) {
  if (!aiProvider.hasApiKey()) {
    return generateFallbackPlan(sanitized);
  }

  const systemInstruction = `You are SkillPath AI's Chief Curriculum Architect.
Generate an exceptionally high-quality, comprehensive, and practical learning roadmap.
Output MUST strictly follow the JSON schema requested.
All suggested resources must be real, official, reputable platforms (MDN, official docs, freeCodeCamp, etc.).
Adapt content precisely to the user's level (${sanitized.level}), daily commitment (${sanitized.minutesPerDay} mins/day), and goal (${sanitized.goal}).
Language: ${sanitized.language === 'tamil' ? 'Tamil (தமிழ்) where appropriate for explanations, while keeping technical code terms in English' : 'English'}.`;

  const prompt = `Create a ${sanitized.durationWeeks}-week personalized learning roadmap for:
Skill: "${sanitized.skill}"
Proficiency: "${sanitized.level}"
Goal: "${sanitized.goal}"
Time per day: ${sanitized.minutesPerDay} minutes
Style: "${sanitized.learningStyle}"
Prior Knowledge: "${sanitized.existingKnowledge || 'None specified'}"
Difficulty Areas: "${sanitized.difficultyAreas || 'None specified'}"

JSON Schema format:
{
  "title": "string (Catchy roadmap title)",
  "targetSkill": "${sanitized.skill}",
  "proficiencyLevel": "${sanitized.level}",
  "goal": "${sanitized.goal}",
  "durationWeeks": ${sanitized.durationWeeks},
  "minutesPerDay": ${sanitized.minutesPerDay},
  "learningObjectives": ["string", "string", "string"],
  "milestones": [
    {
      "weekNumber": 1,
      "title": "string",
      "objective": "string",
      "tasks": [
        {
          "title": "string",
          "description": "string",
          "estimatedMinutes": ${sanitized.minutesPerDay},
          "category": "Theory" | "Practical" | "Project" | "Assessment",
          "practicalExercise": "string",
          "resources": [
            { "title": "string", "url": "https://...", "type": "docs" | "tutorial" | "video" }
          ]
        }
      ],
      "miniProject": {
        "title": "string",
        "description": "string",
        "checklist": ["string", "string"]
      },
      "assessmentCheckpoint": "string"
    }
  ],
  "completionCriteria": ["string", "string"]
}`;

  try {
    const aiResult = await aiProvider.generateStructuredJson(prompt, systemInstruction);

    // Validate that the output contains milestones
    if (aiResult && Array.isArray(aiResult.milestones) && aiResult.milestones.length > 0) {
      return {
        ...aiResult,
        targetSkill: sanitized.skill,
        proficiencyLevel: sanitized.level,
        durationWeeks: sanitized.durationWeeks,
        minutesPerDay: sanitized.minutesPerDay,
        isFallback: false
      };
    } else {
      throw new Error('AI output missing required milestones structure');
    }
  } catch (err) {
    console.warn('AI plan generation failed or invalid schema, falling back to verified template:', err.message);
    const fallback = generateFallbackPlan(sanitized);
    fallback.fallbackNotice = `AI provider note: ${err.message}. Showing verified curriculum template.`;
    return fallback;
  }
}

module.exports = {
  generatePlan,
  generateFallbackPlan
};
