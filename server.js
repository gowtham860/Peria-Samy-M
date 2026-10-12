/**
 * SkillPath AI — Unified Full-Stack Local Development Server
 * Serves the frontend static assets and provides the backend AI & learning services.
 * Zero external dependencies (uses native Node.js HTTP & fs modules).
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { exec } = require('child_process');

// 1. Simple .env file loader for local secrets (e.g., GEMINI_API_KEY)
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...values] = trimmed.split('=');
          const val = values.join('=').trim().replace(/^["']|["']$/g, '');
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = val;
          }
        }
      });
      console.log('Environment variables loaded from .env');
    } catch (e) {
      console.warn('Could not read .env file:', e.message);
    }
  }
}

loadEnv();

// 2. Load backend modules
const { AIProvider } = require('./functions/modules/ai-provider');
const { generatePlan } = require('./functions/modules/planner-service');
const { generateQuiz, evaluateQuiz } = require('./functions/modules/quiz-service');
const { recommendNextTask, summarizeProgress } = require('./functions/modules/progress-service');
const {
  validatePlanInput,
  validateExplainInput,
  validateQuizInput
} = require('./functions/modules/validators');

const aiProvider = new AIProvider(
  process.env.GEMINI_API_KEY,
  process.env.AI_MODEL_NAME || 'gemini-2.5-flash'
);

let cliPort = process.env.PORT;
for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if ((arg === '-l' || arg === '-p' || arg === '--listen' || arg === '--port') && process.argv[i + 1]) {
    cliPort = process.argv[i + 1];
    break;
  }
}
const PORT = parseInt(cliPort || '3000', 10);
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  // Include both standard format and Firebase Callable { result } envelope
  const payload = {
    ...data,
    result: data
  };
  res.end(JSON.stringify(payload));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 5 * 1024 * 1024) {
        reject(new Error('Request entity too large'));
      }
    });
    req.on('end', () => {
      if (!body.trim()) return resolve({});
      try {
        const parsed = JSON.parse(body);
        // Firebase Functions callable wraps data in { data: ... }
        if (parsed && typeof parsed.data !== 'undefined') {
          resolve(parsed.data);
        } else {
          resolve(parsed);
        }
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = reqUrl.pathname;

  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    });
    return res.end();
  }

  // ==========================================
  // BACKEND API ROUTES
  // Supports both /api/<endpoint> and Firebase Callable path: /<project>/<region>/<endpoint>
  // ==========================================

  const isEndpoint = (name) => {
    return pathname === `/api/${name}` || 
           pathname.endsWith(`/${name}`) ||
           pathname === `/${name}`;
  };

  if (isEndpoint('health') && req.method === 'GET') {
    return sendJson(res, 200, {
      status: 'ok',
      backend: 'SkillPath AI Local Backend',
      version: '1.0.0',
      aiConfigured: aiProvider.hasApiKey(),
      model: aiProvider.modelName
    });
  }

  if (isEndpoint('generateLearningPlan') && req.method === 'POST') {
    try {
      const data = await parseJsonBody(req);
      const validation = validatePlanInput(data);
      if (!validation.valid) {
        return sendJson(res, 400, { success: false, error: validation.errors.join('; ') });
      }

      const plan = await generatePlan(validation.sanitized, aiProvider);
      return sendJson(res, 200, { success: true, plan });
    } catch (err) {
      console.error('generateLearningPlan error:', err);
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  if (isEndpoint('explainTopic') && req.method === 'POST') {
    try {
      const data = await parseJsonBody(req);
      const validation = validateExplainInput(data);
      if (!validation.valid) {
        return sendJson(res, 400, { success: false, error: validation.errors.join('; ') });
      }

      const { topic, question, level, language, planContext } = validation.sanitized;

      if (!aiProvider.hasApiKey()) {
        const isTamil = language === 'tamil';
        const explanation = isTamil
          ? `**${topic} பற்றிய விளக்கம்**\n\n${topic} நவீன மென்பொருள் உருவாக்கத்தில் மிக முக்கிய பங்கு வகிக்கிறது. **${level}** நிலையில் இதன் அடிப்படைக் கருத்துகளை முதலில் புரிந்துகொள்ளுங்கள்.\n\n*முக்கிய குறிப்பு*: எளிய மாதிரி நிரல்களை எழுதிப் பார்த்து பயிற்சி பெறுங்கள்.`
          : `### Concept Breakdown: "${topic}"\n\nHere is an intuitive explanation tailored to the **${level}** level:\n\n1. **Mental Model**: Think of this as a structured pattern where inputs reliably yield predicted outputs.\n2. **Practical Usage**: Real-world applications use this to keep code maintainable and bug-free.\n3. **Quick Practice**: Write a small sample function exploring edge cases.`;

        return sendJson(res, 200, {
          success: true,
          isFallback: true,
          topic,
          explanation
        });
      }

      const isTamil = language === 'tamil';
      const systemPrompt = `You are SkillPath AI's expert personal tutor.
Provide clear, intuitive, and accurate technical explanations.
Level: ${level}.
Language: ${isTamil ? 'Tamil (தமிழ்) for natural explanations, while preserving English technical terms and code keywords' : 'English'}.
${planContext ? `Context from student roadmap: "${planContext}"` : ''}

Always structure your explanation with:
1. Clear mental model / intuitive explanation.
2. Real-world analogy.
3. Clean code or practical demonstration.
4. One quick self-check question or mini-exercise.
5. End with a short reminder encouraging the student to verify critical details and practice hands-on.`;

      const prompt = `Topic: "${topic}"\nStudent question: "${question}"`;
      const responseText = await aiProvider.generateText(prompt, systemPrompt, {
        temperature: 0.3,
        maxOutputTokens: 2048
      });

      return sendJson(res, 200, {
        success: true,
        isFallback: false,
        topic,
        explanation: responseText
      });
    } catch (err) {
      console.error('explainTopic error:', err);
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  if (isEndpoint('generateQuiz') && req.method === 'POST') {
    try {
      const data = await parseJsonBody(req);
      const validation = validateQuizInput(data);
      if (!validation.valid) {
        return sendJson(res, 400, { success: false, error: validation.errors.join('; ') });
      }

      const quiz = await generateQuiz(validation.sanitized, aiProvider);
      return sendJson(res, 200, { success: true, quiz });
    } catch (err) {
      console.error('generateQuiz error:', err);
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  if (isEndpoint('evaluateQuiz') && req.method === 'POST') {
    try {
      const data = await parseJsonBody(req);
      const { questions, userAnswers } = data || {};
      if (!Array.isArray(questions) || !userAnswers || typeof userAnswers !== 'object') {
        return sendJson(res, 400, { success: false, error: 'Questions array and userAnswers map are required.' });
      }

      const evaluation = evaluateQuiz(questions, userAnswers);
      return sendJson(res, 200, { success: true, evaluation });
    } catch (err) {
      console.error('evaluateQuiz error:', err);
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  if (isEndpoint('recommendNextTask') && req.method === 'POST') {
    try {
      const data = await parseJsonBody(req);
      const { plan, completedTaskIds } = data || {};
      const recommendation = recommendNextTask(plan, completedTaskIds || []);
      return sendJson(res, 200, { success: true, recommendation });
    } catch (err) {
      console.error('recommendNextTask error:', err);
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  if (isEndpoint('summarizeProgress') && req.method === 'POST') {
    try {
      const data = await parseJsonBody(req);
      const summary = summarizeProgress(data || {});
      return sendJson(res, 200, { success: true, summary });
    } catch (err) {
      console.error('summarizeProgress error:', err);
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // ==========================================
  // STATIC FRONTEND SERVING
  // ==========================================
  let sanitizedPath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (sanitizedPath.toLowerCase().startsWith('/public/') || sanitizedPath.toLowerCase().startsWith('\\public\\')) {
    sanitizedPath = sanitizedPath.slice(7);
  } else if (sanitizedPath.toLowerCase() === '/public' || sanitizedPath.toLowerCase() === '\\public') {
    sanitizedPath = '/index.html';
  }
  if (sanitizedPath === '/' || sanitizedPath === '\\') {
    sanitizedPath = '/index.html';
  }

  let filePath = path.join(PUBLIC_DIR, sanitizedPath);

  // If path has no extension and doesn't exist, check for .html equivalent
  if (!fs.existsSync(filePath) && !path.extname(filePath)) {
    const htmlCandidate = filePath + '.html';
    if (fs.existsSync(htmlCandidate)) {
      filePath = htmlCandidate;
    }
  }

  // If a directory is requested, serve index.html within it
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // Fallback to index.html if file still does not exist (prevents directory listings or raw errors)
  if (!fs.existsSync(filePath)) {
    filePath = path.join(PUBLIC_DIR, 'index.html');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache, must-revalidate' : 'max-age=86400',
      'X-Content-Type-Options': 'nosniff'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

function openBrowser(targetUrl) {
  if (process.env.CI || process.env.NO_OPEN) return;
  const startCmd = process.platform === 'win32' ? `start "" "${targetUrl}"` :
                   process.platform === 'darwin' ? `open "${targetUrl}"` :
                   `xdg-open "${targetUrl}"`;

  exec(startCmd, (err) => {
    if (err) {
      console.log(`Open in browser: ${targetUrl}`);
    }
  });
}

server.listen(PORT, () => {
  const localUrl = `http://localhost:${PORT}`;
  console.log(`\n=============================================================`);
  console.log(`  🚀 SkillPath AI Full-Stack Server Running`);
  console.log(`  🌐 Website URL: ${localUrl}`);
  console.log(`  ⚙️  Backend API: ${localUrl}/api/health`);
  console.log(`  🤖 Gemini AI:   ${aiProvider.hasApiKey() ? 'CONFIGURED (Live AI Active)' : 'UNSET (Verified Curriculum Standards Active)'}`);
  console.log(`=============================================================\n`);

  openBrowser(localUrl);
});

