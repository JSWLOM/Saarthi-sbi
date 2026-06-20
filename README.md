# Saarthi — AI Onboarding Concierge

Built for **SBI Hackathon 2026 (Global Fintech Fest)** — Theme: Agentic AI & Emerging Tech, Problem Statement: Customer Acquisition.

Saarthi is a conversational AI agent that identifies a prospect's financial need, qualifies them through natural conversation, and converts them by recommending the right SBI product — using Gemini function-calling as an agentic reasoning loop rather than a scripted chatbot.

## Architecture

```
User ↔ React Chat UI (frontend)
         ↓
   Express API (/api/chat)
         ↓
   Gemini 2.0 Flash (system prompt + function-calling tools)
         ↓
   Tools: update_lead_profile / score_lead / recommend_product / trigger_handoff
         ↓
   JSON lead store ← also read by → Dashboard UI
```

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **AI/Agent layer:** Google Gemini API (`gemini-2.0-flash`) with native function calling
- **Storage:** JSON file (`leads.json`, `products.json`) — sufficient for prototype scope

## Setup

### 1. Get a free Gemini API key
Go to https://aistudio.google.com/app/apikey and generate a free API key.

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
# open .env and paste your Gemini API key into GEMINI_API_KEY
npm run dev
```
Backend runs on `http://localhost:5000`.

### 3. Frontend setup (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

### 4. Open the app
Visit `http://localhost:5173` in your browser. Chat with Saarthi on the left; watch the live lead dashboard update on the right as the agent calls its tools.

## How the "agentic" part works

Instead of a single prompt-response chatbot, Saarthi uses Gemini's function calling so the model can decide, mid-conversation, to:
1. `lookup_existing_customer` — if the user shares a customer ID, pull their real relationship history (existing products, recent activity, life signals) and personalise the rest of the conversation around it
2. `update_lead_profile` — record occupation, goal, urgency, risk appetite as they're revealed
3. `score_lead` — compute a qualification score (0-100) and tier (cold/warm/hot)
4. `recommend_product` — suggest 1-2 specific products with justification, only once qualified
5. `trigger_handoff` — flag for a human RM if the case is complex or the user is stuck

This loop (`backend/services/geminiService.js`) lets the agent reason about *when* to act, not just *what to say* — the core difference between a scripted bot and an agentic system.

### Hyper-personalisation for existing customers

To demonstrate the "hyper-personalised" part of the brief beyond a single session, `backend/data/customers.json` holds a small mock dataset of existing SBI customers (ID, products held, recent activity, life signals). Try the IDs `SBI1001`–`SBI1004` in the chat to see Saarthi recognise a returning customer and tailor its questions/recommendations around what they already have rather than starting cold. In a real deployment this would be a live core-banking/CRM lookup instead of a JSON file.

## Project Structure

```
saarthi/
├── backend/
│   ├── server.js              # Express app, API routes
│   ├── services/
│   │   ├── geminiService.js   # Agentic conversation + function-calling loop
│   │   ├── leadService.js     # JSON-backed lead storage
│   │   └── customerService.js # Mock existing-customer lookup
│   ├── tools/
│   │   └── toolDefinitions.js # Gemini function declarations
│   └── data/
│       ├── products.json      # SBI product catalog
│       ├── customers.json     # Mock existing-customer profiles
│       └── leads.json         # Lead records (generated at runtime)
└── frontend/
    └── src/
        ├── App.jsx
        ├── components/
        │   ├── ChatWidget.jsx # Conversational UI
        │   └── Dashboard.jsx  # Live lead insights panel
        └── api/chatApi.js     # Backend API calls
```

## Roadmap (post-hackathon)

- Real authentication + integration with SBI's actual customer data systems
- Multi-language support for wider reach
- Extend the same agent architecture to power Digital Adoption and Digital Engagement themes
- A/B testing different qualification strategies to optimize conversion
