# Saarthi — AI Onboarding Concierge

> Built for **SBI Hackathon 2026 (Global Fintech Fest)**
> Theme: Agentic AI & Emerging Tech · Problem Statement: Customer Acquisition
> Team: **Syntax Sirens** — Om Jaiswal & Nysha Katiyar

---

Saarthi is a conversational AI agent that replaces SBI's static onboarding forms with an intelligent, adaptive dialogue. It identifies a prospect's financial need, qualifies them in real time, and converts them by recommending the right SBI product — using an agentic tool-calling loop rather than a scripted decision tree.

For existing SBI customers, Saarthi goes further: it looks up their real relationship history and opens with a hyper-personalised observation based on their actual products, transaction signals, and life events — not a generic greeting.

---

## Demo

Try these flows after setup:

| Flow | What to type | What to watch |
|------|-------------|---------------|
| New customer | *"I just started freelancing and want to manage my money better"* | Agent asks targeted follow-ups, dashboard populates live, recommendation appears |
| Existing customer | `SBI1003` | Agent recognises Kavita, references her home loan search, focuses on gap in her portfolio |
| Complex case | *"I need help, this is confusing, can I speak to someone"* | `trigger_handoff` fires, dashboard shows handoff flag |

Available customer IDs: `SBI1001` · `SBI1002` · `SBI1003` · `SBI1004`

---

## Architecture

```
Browser
├── Chat Widget (React)        ← user types here
└── Live Lead Dashboard (React) ← updates in real time

         ↕  POST /api/chat

Express Backend (Node.js)
├── server.js                  ← API routes
├── services/
│   ├── geminiService.js       ← agentic loop (Groq API + tool execution)
│   ├── leadService.js         ← lead record read/write
│   └── customerService.js     ← existing customer lookup
└── data/
    ├── products.json          ← SBI product catalog (6 products)
    ├── customers.json         ← mock existing customers (SBI1001–SBI1004)
    └── leads.json             ← live lead records (runtime-generated)

         ↕  Groq API (Llama 3.3 70B, function calling)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 |
| Backend | Node.js + Express (ES modules) |
| AI / Agent | Groq API — `llama-3.3-70b-versatile` with function calling |
| Storage | JSON files (prototype) — swap-ready for PostgreSQL / MongoDB |

---

## How the Agentic Loop Works

Saarthi is not a scripted chatbot. On every message, the full conversation history is sent to Groq's Llama 3.3 70B model along with five tool declarations. The model reasons over the conversation and decides autonomously which tools to call and when — the developer never hardcodes this logic.

**The 5 tools:**

| Tool | What it does |
|------|-------------|
| `lookup_existing_customer` | Fetches a customer's relationship history by ID for hyper-personalisation |
| `update_lead_profile` | Writes occupation, goal, urgency, risk appetite as they emerge from conversation |
| `score_lead` | Computes a 0–100 qualification score and cold / warm / hot tier with reasoning |
| `recommend_product` | Selects 1–2 products from the catalog with a plain-language justification |
| `trigger_handoff` | Flags the conversation for human RM intervention |

The loop repeats — model reasons, calls tools if needed, results fed back — until the model produces a final text reply. Safety cap: 6 iterations per turn.

**Why this is agentic, not scripted:** two customers sending the same opening message can trigger completely different tool sequences depending on what information is present or missing in their conversation. The model decides.

---

## Project Structure

```
saarthi/
├── backend/
│   ├── server.js              # Express app — 4 API endpoints
│   ├── loadEnv.js             # Loads .env before any module initialises
│   ├── services/
│   │   ├── geminiService.js   # Agentic conversation + Groq tool-calling loop
│   │   ├── leadService.js     # JSON-backed lead storage (CRUD)
│   │   └── customerService.js # Existing customer lookup by ID
│   ├── tools/
│   │   └── toolDefinitions.js # OpenAI-compatible function declarations
│   └── data/
│       ├── products.json      # 6 SBI products across savings/investment/loan/insurance
│       ├── customers.json     # 4 mock existing customers with realistic activity data
│       └── leads.json         # Runtime lead records (auto-created, commit as empty [])
└── frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx            # Layout shell + header
        ├── index.css          # Design tokens (navy/gold banking palette)
        ├── main.jsx
        ├── api/
        │   └── chatApi.js     # Fetch wrappers for backend endpoints
        └── components/
            ├── ChatWidget.jsx # Conversational UI with typing indicator
            └── Dashboard.jsx  # Live lead insights with SVG score gauge
```

---

## Setup

### Prerequisites
- Node.js v18+
- A free Groq API key — get one at [console.groq.com](https://console.groq.com)

### 1. Clone and set up the backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in your key:

```
GROQ_API_KEY=your_groq_key_here
PORT=5000
```

Start the backend:

```bash
npm run dev
```

Backend runs on `http://localhost:5000`. You should see:
```
Saarthi backend running on http://localhost:5000
```

### 2. Set up the frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

### 3. Open the app

Visit `http://localhost:5173`. Chat with Saarthi on the left; watch the live lead dashboard update on the right as the agent calls its tools in real time.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/lead/start` | Create a new lead session, returns `leadId` |
| `POST` | `/api/chat` | Send a message, returns agent reply + updated lead state |
| `GET` | `/api/lead/:id` | Fetch current state of a single lead |
| `GET` | `/api/leads` | List all leads with summary (dashboard / ops view) |

---

## Hyper-Personalisation for Existing Customers

`backend/data/customers.json` holds mock SBI customer profiles with realistic relationship history — products held, recent transaction signals, and life-event indicators. When a customer shares their ID, `lookup_existing_customer` fetches this data and the agent immediately shifts its conversation to reference specific gaps in their portfolio rather than starting from zero.

In a production deployment, this JSON lookup would be replaced by a live core-banking or CRM API call with no changes to the agent logic.

---

## Roadmap

- Integration with SBI YONO app as an in-app concierge
- Multilingual support via Llama 3.3's built-in Hindi / Tamil / Bengali capability
- Extend the same agentic architecture to power Digital Adoption (proactive nudges) and Digital Engagement (life-event triggered outreach) themes
- Real database backend (PostgreSQL) — the service abstraction layer makes this a drop-in swap
- A/B testing different qualification strategies to optimise conversion rate
