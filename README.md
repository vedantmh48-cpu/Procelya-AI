<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&height=260&section=header&text=PROCELYA%20AI&fontSize=60&fontColor=FFFFFF&fontAlignY=42&desc=Intelligent%20Workflow%20Automation%20Platform&descSize=20&descAlignY=62&descColor=FFD9B3&animation=fadeIn&color=0:FF6B00,50:FFB84D,100:FF6B00" width="100%"/>

<br/>

<img src="https://img.shields.io/badge/⚡_Describe_it-FF6B00?style=for-the-badge&labelColor=1a1a1a" />
<img src="https://img.shields.io/badge/🔍_Detect_it-FFB84D?style=for-the-badge&labelColor=1a1a1a" />
<img src="https://img.shields.io/badge/🚀_Deploy_it-FF6B00?style=for-the-badge&labelColor=1a1a1a" />

<br/><br/>

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-Visit%20Now-FF6B00?style=for-the-badge&logo=github&logoColor=white)](https://vedantmh48-cpu.github.io/Procelya-AI/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-1.5%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<br/>

> **Turn plain English into fully executable, multi-step business workflows — powered by Google Gemini AI.**

<br/>

</div>

---

## 🧠 What is Procelya AI?

**Procelya AI** is a no-code / low-code workflow automation platform. Just describe a business requirement in plain English and Procelya will detect the workflow, visualize it as an interactive flow diagram, persist it to MongoDB, and execute it in real-time with live SSE streaming.

<br/>

<div align="center">

```
💬  "When an order is placed, notify the vendor, create an invoice,
     update inventory, and send a confirmation to the customer."
```

**↓ One click later ↓**

```
✅  Workflow detected  →  📊 Visualized  →  💾 Saved  →  ▶️ Executed live
```

</div>

<br/>

---

## ✨ Features

<div align="center">

| | Feature | Description |
|:---:|:---|:---|
| 🤖 | **AI Workflow Detection** | Gemini 1.5 Flash converts natural language into structured Workflow IR |
| 🔁 | **Rule-Based Fallback** | Deterministic detector works with zero API key configuration |
| 🗺️ | **Visual Flow Diagram** | Interactive React Flow node graph with steps, conditions & connections |
| ▶️ | **Real-Time Execution** | Live step-by-step SSE streaming — watch each step run as it happens |
| 📊 | **Dashboard Analytics** | Execution trends, success rates, top workflows & live activity feed |
| 🏢 | **Business Onboarding** | Multi-step registration with industry, size, location & verification |
| 🔐 | **Auth System** | Sign in / register with password strength meter & demo credentials |
| ✏️ | **AI Edit Panel** | Refine individual workflow steps using natural language |
| 🌗 | **Light / Dark Mode** | Full theme support with smooth transitions |
| 📱 | **Mobile Responsive** | Fully optimized for phones and tablets |
| 📄 | **PDF & JSON Export** | Export workflow definitions as PDF or raw JSON |
| 🔑 | **API Key Management** | Manage and scope access tokens per project |
| 🔔 | **Notifications Center** | In-app notification system for all workflow events |
| ❓ | **Help & Feedback** | Built-in FAQ, feedback form, star ratings & contact form |

</div>

<br/>

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Frontend  (React + Vite)                  │
│                                                              │
│   AuthPage  ──►  BusinessAuthPage  ──►  App                 │
│                                          │                   │
│   Dashboard │ Builder │ Workflows │ Executions │ Help ...    │
│                                          │                   │
│            API Client  (fetch + SSE)     │                   │
└──────────────────────────┬───────────────┘                   │
                           │  REST + SSE                       │
┌──────────────────────────▼───────────────┐                   │
│            Backend  (Express.js)         │                   │
│                                          │                   │
│   POST  /api/workflow/detect             │                   │
│   POST  /api/workflow/create             │                   │
│   POST  /api/workflow/trigger ──► SSE    │                   │
│   GET   /api/workflow/runs               │                   │
│                                          │                   │
│   ┌──────────────┐   ┌────────────────┐  │                   │
│   │  AI Service  │   │Execution Engine│  │                   │
│   │ Gemini 1.5   │   │Condition Eval  │  │                   │
│   │  Flash API   │   │Input Mapping   │  │                   │
│   └──────────────┘   │SSE Emitter     │  │                   │
│                      └────────────────┘  │                   │
└──────────────────────────┬───────────────┘                   │
                           │                                   │
                ┌──────────▼──────────┐                        │
                │    MongoDB Atlas    │                        │
                │  • Workflows        │                        │
                │  • WorkflowRuns     │                        │
                │  • ProjectContexts  │                        │
                └─────────────────────┘                        │
```

<br/>

---

## 🔄 How It Works

<div align="center">

```
 1  ✍️  User describes a business requirement in plain English
                            │
                            ▼
 2  🤖  Backend calls Gemini 1.5 Flash with project context rules
                            │
                            ▼
 3  📦  AI returns a structured Workflow IR (JSON)
                            │
                            ▼
 4  🗺️  Frontend renders an interactive React Flow diagram
                            │
                            ▼
 5  💾  User accepts → workflow saved to MongoDB
                            │
                            ▼
 6  ▶️  User triggers execution with a custom JSON payload
                            │
                            ▼
 7  ⚙️  Engine resolves input mappings, evaluates conditions,
        dispatches to function / operation / form registries
                            │
                            ▼
 8  📡  Each step result is streamed live via SSE to the UI
```

</div>

<br/>

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **MongoDB** (local or Atlas)
- **Google Gemini API key** *(optional — falls back to rule-based detection)*

<br/>

### ⚡ Quick Start

**1 — Clone the repo**

```bash
git clone https://github.com/vedantmh48-cpu/Procelya-AI.git
cd Procelya-AI
```

**2 — Frontend**

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

**3 — Backend**

```bash
cd backend
npm install
cp .env.example .env   # fill in your values
npm run seed           # seed sample project context
npm run dev
# → http://localhost:5000
```

**4 — Environment Variables** — create `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/procelya
AI_API_KEY=your_gemini_api_key_here
```

> 💡 If `AI_API_KEY` is omitted, the platform automatically uses the built-in rule-based workflow detector.

<br/>

---

## 🎯 Workflow Step Types

<div align="center">

| Action Type | Description |
|:---:|:---|
| `function` | Calls a named function from the Function Registry (e.g. `SendEmail`, `NotifyVendor`) |
| `operation` | Calls a named operation (e.g. `UpdateInventory`, `ProcessPayment`) |
| `formCreate` | Creates a new record in a MongoDB schema |
| `formUpdate` | Updates an existing record matched by condition |
| `formDelete` | Deletes a record matched by condition |

</div>

<br/>

Each step supports:

```
📥  Input Mapping    →   {{trigger.fieldName}}  or  {{step-001.outputField}}
🔀  Conditions       →   ==  !=  >  <  >=  <=  contains  exists
⚠️  Failure Handling →   abort  |  skip  |  redirect → stepId
```

<br/>

---

## 📁 Project Structure

```
Procelya-AI/
│
├── frontend/
│   └── src/
│       ├── api/              # API client + demo backend
│       ├── components/       # Reusable UI components
│       │   ├── WorkflowDiagram.jsx   # React Flow diagram
│       │   ├── ExecutionLog.jsx      # Live step log
│       │   ├── AIEditPanel.jsx       # AI-powered edit panel
│       │   └── Sidebar.jsx           # Navigation sidebar
│       ├── views/            # Page-level views
│       │   ├── DashboardView.jsx
│       │   ├── BuilderView.jsx
│       │   ├── WorkflowsView.jsx
│       │   ├── ExecutionsView.jsx
│       │   ├── HowToUseView.jsx      # Full guide + Help + Contact
│       │   └── ...
│       ├── pages/            # Auth pages
│       │   ├── AuthPage.jsx
│       │   └── BusinessAuthPage.jsx
│       └── context/          # React context (Auth, Health)
│
└── backend/
    ├── engine/
    │   ├── executor.js           # Core execution engine + SSE
    │   ├── functionRegistry.js   # Safe function handlers
    │   ├── operationRegistry.js
    │   ├── formController.js
    │   └── validator.js
    ├── services/
    │   ├── aiService.js          # Gemini AI + rule-based fallback
    │   └── aiEditService.js
    ├── models/                   # Mongoose schemas
    ├── routes/                   # Express routes
    └── server.js
```

<br/>

---

## 🛠️ Tech Stack

<div align="center">

**Frontend**

![React](https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=flat-square&logo=vite&logoColor=white)
![React Flow](https://img.shields.io/badge/React_Flow-FF0072?style=flat-square&logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Lucide](https://img.shields.io/badge/Lucide_React-F56565?style=flat-square)
![jsPDF](https://img.shields.io/badge/jsPDF-Export-orange?style=flat-square)

**Backend**

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=flat-square)
![SSE](https://img.shields.io/badge/SSE-Real--Time_Streaming-FF6B00?style=flat-square)
![Gemini](https://img.shields.io/badge/Gemini_1.5_Flash-4285F4?style=flat-square&logo=google&logoColor=white)

</div>

<br/>

---

## 🌐 Live Demo

<div align="center">

### 👉 [https://vedantmh48-cpu.github.io/Procelya-AI/](https://vedantmh48-cpu.github.io/Procelya-AI/)

| Field | Value |
|:---:|:---:|
| 📧 Email | `admin@procelya.ai` |
| 🔑 Password | `admin123` |

</div>

<br/>

---

## 📜 License

<div align="center">

MIT © 2026 **Procelya AI**

Released under the [MIT License](LICENSE) — free to use, modify, and distribute.

</div>

<br/>

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&height=120&section=footer&color=0:FF6B00,50:FFB84D,100:FF6B00" width="100%"/>

**Built with ⚡ for the future of intelligent automation**

[![GitHub](https://img.shields.io/badge/Star_on_GitHub-⭐-yellow?style=for-the-badge&logo=github)](https://github.com/vedantmh48-cpu/Procelya-AI)

</div>
