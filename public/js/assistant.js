/**
 * SkillPath AI — Conversational AI Learning Assistant
 */

import { initFirebase, callBackend } from './firebase-config.js';
import { initLucideIcons } from './ui.js';
import { escapeHtml } from './validation.js';

export function initAssistant() {
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const langSelect = document.getElementById('chat-language-select');
  const levelSelect = document.getElementById('chat-level-select');

  // Suggested prompt chips
  document.querySelectorAll('.prompt-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      if (chatInput) {
        chatInput.value = chip.dataset.prompt;
        chatInput.focus();
      }
    });
  });

  if (chatForm) {
    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const question = chatInput.value.trim();
      if (!question) return;

      chatInput.value = '';
      await handleSendMessage(question, {
        language: langSelect?.value || 'english',
        level: levelSelect?.value || 'beginner'
      });
    });
  }
}

async function handleSendMessage(question, options) {
  const messagesContainer = document.getElementById('chat-messages');
  if (!messagesContainer) return;

  // Append user message
  appendMessage('user', question);

  // Append thinking bubble
  const thinkingId = 'thinking-' + Date.now();
  const thinkingBubble = document.createElement('div');
  thinkingBubble.id = thinkingId;
  thinkingBubble.className = 'message-bubble message-ai';
  thinkingBubble.innerHTML = `
    <div style="display:flex; align-items:center; gap:0.5rem; color:var(--text-muted);">
      <span class="spinner spinner-dark" style="width:14px; height:14px;"></span>
      <span>AI Tutor is thinking...</span>
    </div>
  `;
  messagesContainer.appendChild(thinkingBubble);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  try {
    const { functions, isDemoMode } = await initFirebase();
    let responseText = '';

    // 1. Try local backend first
    const backendRes = await callBackend('explainTopic', {
      topic: question.slice(0, 50),
      question: question,
      level: options.level,
      language: options.language
    });
    if (backendRes?.explanation) {
      responseText = backendRes.explanation;
    }

    // 2. Try Firebase Functions if live and configured
    if (!responseText && !isDemoMode && functions) {
      try {
        const { httpsCallable } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-functions.js');
        const explainTopicFn = httpsCallable(functions, 'explainTopic');
        const res = await explainTopicFn({
          topic: question.slice(0, 50),
          question: question,
          level: options.level,
          language: options.language
        });
        responseText = res.data?.explanation || '';
      } catch (err) {
        console.warn('Functions error, switching to demo response:', err);
      }
    }

    // 3. Fallback simulated response
    if (!responseText) {
      responseText = generateSimulatedTutorResponse(question, options);
    }

    // Remove thinking indicator
    document.getElementById(thinkingId)?.remove();
    appendMessage('ai', responseText);
  } catch (err) {
    document.getElementById(thinkingId)?.remove();
    appendMessage('ai', `Sorry, I encountered an issue: ${err.message}. Please try again.`);
  }
}

function appendMessage(sender, content) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const bubble = document.createElement('div');
  bubble.className = `message-bubble message-${sender}`;

  if (sender === 'user') {
    bubble.textContent = content;
  } else {
    // Render markdown-like formatting safely
    bubble.innerHTML = renderFormattedContent(content);
  }

  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
  initLucideIcons();
}

function renderFormattedContent(text) {
  let safe = escapeHtml(text);
  
  // Format code blocks ```code```
  safe = safe.replace(/```([a-z]*)\n([\s\S]*?)```/gi, (match, lang, code) => {
    return `<pre><code>${code}</code></pre>`;
  });

  // Format inline `code`
  safe = safe.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Format bold **text**
  safe = safe.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Format line breaks
  safe = safe.replace(/\n/g, '<br/>');

  return safe;
}

function generateSimulatedTutorResponse(question, { language, level }) {
  const isTamil = language === 'tamil';

  if (isTamil) {
    return `**வணக்கம்! (Hello!)**\n\nஉங்கள் கேள்வி: "${question}"\n\n**எளிய விளக்கம் (Simple Explanation):**\nகம்ப்யூட்டர் சயின்ஸில் இந்த கருத்து மிக முக்கியமானது. தொடக்க நிலையில் இதை ஒரு நிஜ வாழ்க்கை உதாரணத்துடன் ஒப்பிட்டு பார்க்கலாம்.\n\n\`\`\`javascript\n// மாதிரி குறியீடு (Sample Code)\nconst learner = "SkillPath Student";\nconsole.log("தொடர்ந்து பயிற்சி செய்யுங்கள்: " + learner);\n\`\`\`\n\n**பயிற்சி வினா (Exercise):**\nஇதை நீங்கள் புரிந்துகொள்ள ஒரு சிறு நிரலை எழுதிப் பாருங்கள்.\n\n*(குறிப்பு: AI விடைகளை சுயமாக சரிபார்த்து உறுதி செய்யவும்)*`;
  }

  return `### Concept Breakdown: "${question}"\n\nHere is an intuitive explanation tailored to the **${level}** level:\n\n1. **Mental Model**: Think of this as a structured system where inputs produce predictable outputs without side effects.\n2. **Practical Example**:\n\`\`\`javascript\n// Practical code demonstration\nfunction demonstrateConcept(input) {\n  return \`Processing \${input} successfully\`;\n}\nconsole.log(demonstrateConcept("Core Pattern"));\n\`\`\`\n3. **Quick Practice**: Write a small function that uses this concept and handles edge cases like empty inputs.\n\n*Tip: Always verify critical technical specifications with official documentation.*`;
}
