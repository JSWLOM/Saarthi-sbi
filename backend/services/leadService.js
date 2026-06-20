// leadService.js
// Simple JSON-file-backed "database" for hackathon scope.
// Each lead record tracks profile, score, recommendation, and conversation stage.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LEADS_PATH = path.join(__dirname, "..", "data", "leads.json");

function readLeads() {
  const raw = fs.readFileSync(LEADS_PATH, "utf-8");
  return JSON.parse(raw || "[]");
}

function writeLeads(leads) {
  fs.writeFileSync(LEADS_PATH, JSON.stringify(leads, null, 2));
}

export function getLead(leadId) {
  const leads = readLeads();
  return leads.find((l) => l.id === leadId) || null;
}

export function getAllLeads() {
  return readLeads();
}

export function createLead(leadId) {
  const leads = readLeads();
  const newLead = {
    id: leadId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    profile: {
      occupation: "unknown",
      primaryGoal: "unclear",
      urgency: "unknown",
      riskAppetite: "unknown",
      notes: "",
    },
    score: null,
    tier: "cold",
    scoreReasoning: "",
    recommendedProducts: [],
    recommendationJustification: "",
    handoff: null,
    existingCustomer: null,
    stage: "conversation_started",
    messages: [],
  };
  leads.push(newLead);
  writeLeads(leads);
  return newLead;
}

export function setExistingCustomer(leadId, customerProfile) {
  const leads = readLeads();
  const lead = leads.find((l) => l.id === leadId);
  if (!lead) return null;

  lead.existingCustomer = customerProfile; // null if lookup found no match
  lead.updatedAt = new Date().toISOString();
  if (customerProfile) {
    lead.stage = "existing_customer_identified";
  }
  writeLeads(leads);
  return lead;
}

export function updateLeadProfile(leadId, profileUpdates) {
  const leads = readLeads();
  const lead = leads.find((l) => l.id === leadId);
  if (!lead) return null;

  lead.profile = { ...lead.profile, ...profileUpdates };
  lead.updatedAt = new Date().toISOString();
  lead.stage = "qualifying";
  writeLeads(leads);
  return lead;
}

export function setLeadScore(leadId, score, tier, reasoning) {
  const leads = readLeads();
  const lead = leads.find((l) => l.id === leadId);
  if (!lead) return null;

  lead.score = score;
  lead.tier = tier;
  lead.scoreReasoning = reasoning || "";
  lead.updatedAt = new Date().toISOString();
  lead.stage = "scored";
  writeLeads(leads);
  return lead;
}

export function setLeadRecommendation(leadId, productIds, justification) {
  const leads = readLeads();
  const lead = leads.find((l) => l.id === leadId);
  if (!lead) return null;

  lead.recommendedProducts = productIds;
  lead.recommendationJustification = justification || "";
  lead.updatedAt = new Date().toISOString();
  lead.stage = "recommended";
  writeLeads(leads);
  return lead;
}

export function setLeadHandoff(leadId, reason) {
  const leads = readLeads();
  const lead = leads.find((l) => l.id === leadId);
  if (!lead) return null;

  lead.handoff = { reason, flaggedAt: new Date().toISOString() };
  lead.updatedAt = new Date().toISOString();
  lead.stage = "handoff_requested";
  writeLeads(leads);
  return lead;
}

export function appendMessage(leadId, role, text) {
  const leads = readLeads();
  const lead = leads.find((l) => l.id === leadId);
  if (!lead) return null;

  lead.messages.push({ role, text, at: new Date().toISOString() });
  writeLeads(leads);
  return lead;
}
