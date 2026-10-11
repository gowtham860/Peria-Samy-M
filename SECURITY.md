# Security & Privacy Policy — SkillPath AI

## 1. Security Architecture Overview
SkillPath AI enforces a defense-in-depth security model:
- **Zero Frontend Secrets**: AI provider keys (e.g., Google Gemini) and administrative credentials are never stored or exposed within browser assets, JavaScript, HTML, CSS, or git repositories.
- **Server-Side Authorization**: All sensitive operations are handled via authenticated Firebase Cloud Functions (`onCall`), which verify the caller's Firebase Auth JWT before executing any AI logic or database mutation.
- **Strict Firestore Rules**: All document read/write rules restrict access strictly to `request.auth.uid == userId`. No public or cross-user reads or writes are permitted.
- **Strict Input Validation**: Cloud functions enforce length limits, type validation, and sanitary boundaries on all inputs to protect against prompt injection and denial-of-service payloads.
- **Untrusted AI Output Handling**: AI responses are strictly validated against strict JSON schemas. AI-generated text is rendered via DOM text properties (`textContent` or sanitized markdown parser) and never executed directly as executable script or unsafe innerHTML.

## 2. Reporting Vulnerabilities
If you identify a security vulnerability in SkillPath AI, please do not file a public issue. Email security reports directly to `security@skillpath-ai.example.com`. We aim to acknowledge receipt within 24 hours.

## 3. Data Retention & Account Deletion
- Users have full ownership over their learning data.
- When an account is deleted via the user profile settings, the platform triggers an atomic cleanup that removes the user document, subcollections (plans, tasks, quiz attempts, study sessions), and the Firebase Authentication user record.

## 4. AI Limitations & Disclaimers
SkillPath AI provides AI-assisted tutoring and roadmap generation. AI-generated explanations and quizzes are assistive tools and should not be treated as official academic accreditation or certified employment guarantees.
