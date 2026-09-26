# SpectrumX - Adaptive Personalized Learning Platform

SpectrumX is an AI-powered adaptive learning engine that diagnoses student root-cause knowledge gaps, maps prerequisite dependencies into an interactive Directed Acyclic Graph (DAG), dynamically tailors learning paths with Bayesian Knowledge Tracing (BKT), and adjusts assessment difficulty in real-time.

---

## 🌟 Key Features

1. **Free Firebase Firestore Database**:
   - Pre-configured and connected with free Firebase project `savvy-throne-qlxdt`.
   - Automatic real-time synchronization for student profiles, course domains, syllabi, PYQs, and quiz results.
   - Zero-friction anonymous & authenticated student access.

2. **Multimodal Syllabus & PYQ PDF Ingestion**:
   - Ingests university syllabus PDFs to automatically create **student-named course domains**.
   - Extracts examination paper patterns, section breakdowns, and unit marks allocations.
   - Upload Previous Year Question (PYQ) papers to extract marking schemes, point deduction criteria, and common student traps.

3. **Gemini 3.8 Flash Adaptive Quiz Generation**:
   - Synthesizes adaptive exam questions directly grounded in the syllabus chapters and PYQ error traps.
   - 3-Tier high-availability backup strategy ensures 100% quiz generation uptime.

4. **Cognitive Explainability & Remediation**:
   - Identifies whether errors stem from surface mistakes or upstream prerequisite gaps.
   - Micro-lessons with interactive code fixers and AI Socratic Tutor.

---

## 🚀 Quick Start (Running via GitHub)

### 1. Clone & Install Dependencies
```bash
git clone <your-github-repo-url>
cd spectrumx-adaptive-ai
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Add your free Gemini API key to `.env`:
```env
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Get a free key in 30 seconds at [Google AI Studio](https://aistudio.google.com/app/apikey))*

### 3. Launch Full-Stack Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Database Architecture (Firebase Firestore)

The application includes `firebase-applet-config.json` and `firestore.rules`.
Collections automatically synchronized:
- `users`: Student profile, mastery metrics, and calibrated level (`Beginner`, `Intermediate`, `Advanced`).
- `courses`: Student-created subject domains with DAG prerequisite nodes.
- `syllabi`: Extracted syllabus modules, examination patterns, and diagnostic blueprints.
- `pyqs`: Uploaded Previous Year Question papers with marking schemes and question lists.
- `assessments`: Diagnostic results, Item Response Theory (IRT) $\theta$ values, and remediation plans.

---

## 🛡️ 3-Tier Backup AI Architecture

| Tier | Engine | Function |
| :--- | :--- | :--- |
| **Tier 1 (Primary)** | Gemini 3.8 Flash Multimodal | Direct binary PDF ingestion (`inlineData: application/pdf`). |
| **Tier 2 (Fallback 1)** | Compact Text-Chunked Gemini | Text-stream extraction with 80% reduced token payload. |
| **Tier 3 (Fallback 2)** | Deterministic Rule-Based Engine | Local algorithmic generator from chapter weights and PYQ traps; runs offline with zero 500 errors. |

---

## 📜 Build & Production
```bash
npm run build
npm start
```
