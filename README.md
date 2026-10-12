# SkillPath AI — Intelligent Personalized Learning & Career Roadmap Platform

SkillPath AI is a modern, production-oriented educational SaaS website designed to help students, fresh graduates, job seekers, and working professionals build structured learning roadmaps, practice with adaptive AI quizzes, master technical concepts with an AI Tutor (supporting English and Tamil), track daily streaks, and prepare for career opportunities.

---

## 1. Architecture & Technology Stack

### Frontend
- **HTML5 & CSS3**: Semantic structures, responsive design tokens, light/dark themes, and accessible components.
- **Vanilla JavaScript (ES Modules)**: Fast, modern, modular architecture (`public/js/`). Zero framework lock-in.
- **Chart.js**: Visual learning analytics (weekly study activity, skill topic accuracy).
- **Lucide Icons**: Consistent, clean iconography.

### Backend & Database
- **Firebase Authentication**: User accounts, email verification, password reset, and secure session handling.
- **Cloud Firestore**: Granular user isolation (`users/{uid}`, `plans`, `tasks`, `quizAttempts`, `studySessions`).
- **Firebase Cloud Functions (Node.js 20)**: Secure server-side execution of AI prompts, rate limiting, and output validation.
- **Firebase Hosting**: High-speed CDN delivery with HTTP security headers and caching policies.
- **Firebase Emulator Suite**: Local sandbox for testing Auth, Firestore, and Functions without cloud costs.

### AI Integration
- **Google Gemini API**: Server-side integration via adapter (`functions/modules/ai-provider.js`).
- **Resilient Fallback Framework**: If the AI API is offline or unconfigured, verified curriculum standards generate high-quality roadmaps and quizzes seamlessly.
- **Dual Language**: Support for English and Tamil (தமிழ்).

---

## 2. Directory Structure

```
skillpath-ai/
├── public/
│   ├── index.html              # Modern responsive landing page & auth modal
│   ├── dashboard.html          # Main learning analytics & active roadmaps
│   ├── planner.html            # Multi-step personalized roadmap generator
│   ├── assistant.html          # AI Tutor chat with English & Tamil support
│   ├── quizzes.html            # Adaptive technical practice test runner
│   ├── resources.html          # Resource explorer & project labs
│   ├── profile.html            # Profile, career readiness checklists, danger zone
│   ├── css/
│   │   ├── main.css            # Design tokens, variables, typography, reset
│   │   ├── components.css      # Buttons, cards, modals, forms, toasts
│   │   ├── dashboard.css       # Sidebar, stats cards, timeline, chat layout
│   │   └── responsive.css      # Breakpoints & mobile drawer navigation
│   ├── js/
│   │   ├── app.js              # Application bootstrapper & modal binder
│   │   ├── firebase-config.js  # Live Firebase / Emulator / Demo mode adapter
│   │   ├── auth.js             # Registration, login, logout, account deletion
│   │   ├── navigation.js       # Sidebar & theme toggle controller
│   │   ├── planner.js          # Questionnaire & roadmap rendering
│   │   ├── dashboard.js        # Analytics orchestrator & next task engine
│   │   ├── assistant.js        # Conversational AI Tutor controller
│   │   ├── quizzes.js          # Timed quiz runner & review generator
│   │   ├── resources.js        # Resource directory & project labs
│   │   ├── progress.js         # Chart.js visualizer & study session logger
│   │   ├── validation.js       # Sanitization & input error validation
│   │   └── ui.js               # Toasts, modals, loading spinners, Lucide
│   └── assets/
│       ├── logo.svg            # Vector logo emblem
│       └── illustrations/
│           └── hero-illustration.svg
├── functions/
│   ├── index.js                # Cloud Functions callable entry point
│   ├── package.json            # Functions dependencies (Node 20)
│   └── modules/
│       ├── ai-provider.js      # Gemini API adapter with JSON parsing
│       ├── planner-service.js  # Roadmap synthesis & verified fallbacks
│       ├── quiz-service.js     # Quiz generator & evaluation logic
│       ├── progress-service.js # Analytics & next-task recommender
│       ├── validators.js       # Server input sanitizers & length rules
│       └── rate-limiter.js     # Sliding-window user rate limiting
├── tests/
│   ├── unit/                   # Unit test suite for validators, planner, quizzes
│   └── e2e/                    # Playwright browser end-to-end test suite
├── firestore.rules             # Strict user-isolated Firestore security rules
├── firestore.indexes.json      # Firestore compound index definitions
├── firebase.json               # Firebase CLI & emulator configuration
├── .firebaserc.example         # Example Firebase project target
├── .env.example                # Safe environment variable template
├── .gitignore                  # Git ignore rules
├── package.json                # Project scripts
├── SECURITY.md                 # Security architecture & disclosures
└── README.md                   # This documentation
```

---

## 3. Getting Started on Windows PowerShell

### Prerequisites
- Node.js LTS (v20+ or v24+) installed.
- VS Code installed.
- Optional: Firebase CLI (`npm install -g firebase-tools`).

### Step 1: Install Backend Dependencies
In Windows PowerShell at the root of the workspace:

```powershell
cd functions
npm install
cd ..
```

### Step 2: Run Unit Tests
Verify all core algorithms, validation rules, and fallbacks:

```powershell
npm run test:unit
```

### Step 3: Run the Application (Full-Stack Frontend + Backend + Auto-Open)
Start the unified platform server:

```powershell
npm start
```

This immediately:
1. Starts the frontend and local AI backend services on **http://localhost:3000**.
2. Automatically launches your default web browser directly to the SkillPath AI website.
3. Automatically maps all routes directly to the platform (never showing directory index listings).

*(Alternative static-only server: `npm run serve` or `npx serve public -l 3000`)*

*Note: SkillPath AI includes an In-Browser Demo Mode.* You can register, generate roadmaps, chat with the tutor, take quizzes, and log study sessions immediately out-of-the-box even before connecting cloud keys!

---

## 4. Connecting Firebase & Cloud Functions

### Step 1: Create a Firebase Project
1. Visit the [Firebase Console](https://console.firebase.google.com/) and create a project named `skillpath-ai`.
2. Enable **Firebase Authentication** (Email/Password provider).
3. Enable **Cloud Firestore** in Production mode.
4. Enable **Firebase Hosting** and **Cloud Functions**.

### Step 2: Configure Frontend Credentials
Edit `public/js/firebase-config.js` or set global configuration variables matching your project credentials from **Project Settings > General > Your apps > Web app**:

```javascript
export const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Step 3: Configure AI Server-Side Secret
Never place your Google Gemini API key on the frontend. Store it securely in Cloud Functions:

```powershell
firebase functions:secrets:set GEMINI_API_KEY
```
When prompted, paste your Gemini API key (from [Google AI Studio](https://aistudio.google.com/)).

### Step 4: Run Firebase Local Emulators (Optional)
To test Auth, Firestore rules, and Functions locally:

```powershell
firebase emulators:start
```
- Emulator UI: [http://localhost:4000](http://localhost:4000)
- Hosting Emulator: [http://localhost:5000](http://localhost:5000)
- Functions Emulator: [http://localhost:5001](http://localhost:5001)

---

## 5. Deployment to Production

### Deploy Firestore Rules & Indexes
```powershell
firebase deploy --only firestore
```

### Deploy Cloud Functions
```powershell
firebase deploy --only functions
```

### Deploy Frontend Website to Firebase Hosting
```powershell
firebase deploy --only hosting
```

Or deploy all resources at once:
```powershell
firebase deploy
```

Your website will be live at `https://<your-project-id>.web.app`.

---

## 6. Security & Privacy Guarantees

1. **User Data Isolation**:
   `firestore.rules` enforces that users can **only** read and write documents where `request.auth.uid == userId`. No user can inspect or modify another student's roadmaps or quiz scores.
2. **Server-Side API Key Storage**:
   The Gemini API key is accessed exclusively inside Node.js Cloud Functions via server secrets.
3. **No Unsafe Execution**:
   AI text is strictly sanitized and rendered as formatted text/markdown. AI outputs are never evaluated via `eval()` or injected as raw executable scripts.
4. **Complete Account Deletion**:
   The "Danger Zone" in `public/profile.html` provides atomic cleanup, deleting the user's Firestore records and removing the Firebase Auth account.

---

## 7. Troubleshooting Guide

| Issue | Cause | Resolution |
| :--- | :--- | :--- |
| Roadmaps show "Curriculum Framework Applied" | `GEMINI_API_KEY` is not set or quota exceeded | Run `firebase functions:secrets:set GEMINI_API_KEY`. The platform automatically serves verified curriculum standards as a zero-downtime fallback. |
| Icons not showing | CDN script loading delay | Lucide is loaded via `unpkg.com/lucide`. Ensure internet access or bundle locally. |
| Auth errors during sign in | Email/Password provider not enabled in Firebase | Go to Firebase Console > Authentication > Sign-in method and enable Email/Password. |
| CORS error calling Functions | Cloud Function not deployed with callable protocol | Callable functions (`onCall`) automatically handle CORS. Ensure your client SDK matches the deployed Firebase project. |
