// server.js
// Entry point: Express API exposing chat (agent) and dashboard (lead) endpoints.

import "./loadEnv.js"; // must be the first import — loads .env before anything else touches process.env

import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";

import { runAgentTurn, getLeadSnapshot } from "./services/geminiService.js";
import {
  createLead,
  getLead,
  getAllLeads,
  appendMessage,
} from "./services/leadService.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "saarthi-backend" });
});

// Start a new conversation/lead. Returns a leadId the frontend stores
// (e.g. in React state) to use on subsequent /chat calls.
app.post("/api/lead/start", (req, res) => {
  const leadId = uuidv4();
  const lead = createLead(leadId);
  res.json({ leadId, lead });
});

// Main chat endpoint: the agentic conversation loop.
app.post("/api/chat", async (req, res) => {
  try {
    const { leadId, message } = req.body;
    if (!leadId || !message) {
      return res.status(400).json({ error: "leadId and message are required" });
    }

    const lead = getLead(leadId);
    if (!lead) {
      return res.status(404).json({ error: "Lead not found. Start a new session." });
    }

    // Record user message
    appendMessage(leadId, "user", message);
    const updatedLead = getLead(leadId);

    const { reply, toolCallsMade } = await runAgentTurn(
      leadId,
      updatedLead.messages.slice(0, -1), // history before this new message
      message
    );

    // Record assistant reply
    appendMessage(leadId, "model", reply);

    const finalLead = getLead(leadId);

    res.json({
      reply,
      toolCallsMade,
      lead: finalLead,
    });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Something went wrong processing the chat." });
  }
});

// Get a single lead's current state (used by dashboard / chat to refresh)
app.get("/api/lead/:leadId", (req, res) => {
  const lead = getLeadSnapshot(req.params.leadId);
  if (!lead) return res.status(404).json({ error: "Lead not found" });
  res.json({ lead });
});

// Dashboard: list all leads with summary info
app.get("/api/leads", (req, res) => {
  const leads = getAllLeads();
  const summary = leads.map((l) => ({
    id: l.id,
    createdAt: l.createdAt,
    occupation: l.profile?.occupation,
    primaryGoal: l.profile?.primaryGoal,
    score: l.score,
    tier: l.tier,
    stage: l.stage,
    recommendedProducts: l.recommendedProducts,
    handoff: l.handoff,
  }));
  res.json({ leads: summary });
});

app.listen(PORT, () => {
  console.log(`Saarthi backend running on http://localhost:${PORT}`);
});
