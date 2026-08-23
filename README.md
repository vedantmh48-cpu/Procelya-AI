<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&height=220&section=header&text=PROCELYA%20AI&fontSize=50&fontColor=FFFFFF&fontAlignY=40&animation=fadeIn&color=0:FF6B00,50:FFB84D,100:FF6B00" width="100%" alt="PROCELYA AI"/>
# ⚡ Procelya AI

### Intelligent Workflow Automation Platform

*Describe it. Detect it. Deploy it.*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-orange?style=for-the-badge&logo=github)](https://vedantmh48-cpu.github.io/Procelya-AI/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-1.5%20Flash-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)

</div>

---

## 🧠 What is Procelya AI?

**Procelya AI** is a no-code/low-code workflow automation platform that turns plain English business requirements into fully executable, multi-step workflows — powered by Google Gemini AI.

Just describe what you want:

> *"When an order is placed, notify the vendor, create an invoice, update inventory, and send a confirmation to the customer."*

Procelya detects the workflow, visualizes it as an interactive flow diagram, persists it to MongoDB, and executes it in real-time with live step-by-step SSE streaming.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Workflow Detection** | Powered by Gemini 1.5 Flash — converts natural language into structured workflow IR |
| 🔁 **Rule-Based Fallback** | Deterministic detector kicks in when no API key is configured |
| 🗺️ **Visual Flow Diagram** | Interactive node graph built with React Flow showing steps, conditions & connections |
| ▶️ **Real-Time Execution** | Live step execution with SSE streaming — watch each step run in real time |
| 📊 **Dashboard Analytics** | Execution trends, success rates, top workflows, and live activity feed |
| 🏢 **Business Registration** | Multi-step business onboarding with industry, size, location & verification |
| 🔐 **Auth System** | Sign in / register with password strength meter and demo credentials |
| 🌗 **Light / Dark Mode** | Full theme support with smooth transitions |
| 📱 **Mobile Responsive** | Fully optimized for phones and tablets |
| 📄 **PDF Export** | Export workflow definitions as PDF documents |
| 🔑 **API Key Management** | Manage access tokens per project |
| 🔔 **Notifications Center** | In-app notification system |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)           │
│                                                     │
│  AuthPage  ──►  BusinessAuthPage  ──►  App          │
│                                        │            │
│  Dashboard │ Builder │ Workflows │ Executions ...   │
│                                        │            │
│         API Client (fetch + SSE)       │            │
└────────────────────────┬───────────────┘            │
                         │ REST + SSE                 │
┌────────────────────────▼───────────────┐            │
│              Backend (Express.js)      │            │
│                                        │            │
│  /api/workflow/detect                  │            │
│  /api/workflow/create                  │            │
│  /api/workflow/trigger  ──► SSE Stream │            │
│  /api/workflow/runs                    │            │
│                                        │            │
│  ┌──────────────┐  ┌─────────────────┐ │            │
│  │  AI Service  │  │ Execution Engine│ │            │
│  │ Gemini 1.5   │  │ Condition Eval  │ │            │
│  │ Flash API    │  │ Input Mapping   │ │            │
│  └──────────────┘  │ SSE Emitter     │ │            │
│                    └─────────────────┘ │            │
└────────────────────────┬───────────────┘            │
                         │                            │
              ┌──────────▼──────────┐                 │
              │   MongoDB Atlas     │                 │
              │  Workflows          │                 │
              │  WorkflowRuns       │                 │
              │  ProjectContexts    │                 │
              └─────────────────────┘                 │
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API key *(optional — falls back to rule-based detection)*

---

### Frontend

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Runs at `http://localhost:5173`

---

### Backend

```bash
cd backend

# Install dependencies
npm install

# Copy env file and fill in your values
cp .env.example .env

# Seed sample project context
npm run seed

# Start server
npm run dev
```

Runs at `http://localhost:5000`

---

### Environment Variables

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/procelya
AI_API_KEY=your_gemini_api_key_here
```

> If `AI_API_KEY` is not set, the platform uses the built-in rule-based workflow detector automatically.

---

## 🔄 How It Works

```
1. User describes a business requirement in plain English
        │
        ▼
2. Backend calls Gemini 1.5 Flash with strict project context rules
        │
        ▼
3. AI returns a structured Workflow IR (JSON)
        │
        ▼
4. Frontend renders an interactive flow diagram
        │
        ▼
5. User accepts → workflow saved to MongoDB
        │
        ▼
6. User triggers execution with a custom payload
        │
        ▼
7. Engine resolves input mappings, evaluates conditions,
   dispatches to function/operation/form registries
        │
        ▼
8. Each step result is streamed live via SSE to the UI
```

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/            # API client + demo backend
│   ├── components/     # Reusable UI components
│   │   ├── WorkflowDiagram.jsx   # React Flow diagram
│   │   ├── ExecutionLog.jsx      # Live step log
│   │   ├── AIEditPanel.jsx       # AI-powered edit panel
│   │   └── ...
│   ├── views/          # Page-level views
│   │   ├── DashboardView.jsx
│   │   ├── BuilderView.jsx
│   │   ├── WorkflowsView.jsx
│   │   └── ...
│   ├── pages/          # Auth pages
│   │   ├── AuthPage.jsx
│   │   └── BusinessAuthPage.jsx
│   └── context/        # React context (Auth, Health)
│
backend/
├── engine/
│   ├── executor.js         # Core execution engine + SSE
│   ├── functionRegistry.js # Safe function handlers
│   ├── operationRegistry.js
│   ├── formController.js
│   └── validator.js
├── services/
│   ├── aiService.js        # Gemini AI + rule-based fallback
│   └── aiEditService.js
├── models/             # Mongoose schemas
├── routes/             # Express routes
└── server.js
```

---

## 🎯 Workflow Step Types

| Action Type | Description |
|---|---|
| `function` | Calls a named function from the function registry |
| `operation` | Calls a named operation (e.g. UpdateInventory) |
| `formCreate` | Creates a new record in a schema |
| `formUpdate` | Updates an existing record |
| `formDelete` | Deletes a record |

Each step supports:
- **Input Mapping** — `{{trigger.fieldName}}` or `{{step-001.outputField}}`
- **Conditions** — `==`, `!=`, `>`, `<`, `>=`, `<=`, `contains`, `exists`
- **Failure Handling** — `abort`, `skip`, or `redirect` to another step

---

## 🌐 Live Demo

👉 **[https://vedantmh48-cpu.github.io/Procelya-AI/](https://vedantmh48-cpu.github.io/Procelya-AI/)**

Demo credentials:
```
Email:    admin@procelya.ai
Password: admin123
```

---

## 🛠️ Tech Stack

**Frontend**
- React 18 + Vite 8
- React Flow (workflow diagram)
- Lucide React (icons)
- Tailwind CSS + custom CSS
- jsPDF (export)

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- Server-Sent Events (SSE) for real-time streaming
- Google Gemini 1.5 Flash API

---

## 📜 License

MIT © 2026 Procelya AI

---

<div align="center">
  <sub>Built with ⚡ for the future of intelligent automation</sub>
</div>
