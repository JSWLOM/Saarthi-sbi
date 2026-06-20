// chatApi.js
// Thin wrapper around fetch calls to the backend.

const BASE_URL = "http://localhost:5000/api";

export async function startLead() {
  const res = await fetch(`${BASE_URL}/lead/start`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to start lead session");
  return res.json();
}

export async function sendChatMessage(leadId, message) {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ leadId, message }),
  });
  if (!res.ok) throw new Error("Chat request failed");
  return res.json();
}

export async function fetchLead(leadId) {
  const res = await fetch(`${BASE_URL}/lead/${leadId}`);
  if (!res.ok) throw new Error("Failed to fetch lead");
  return res.json();
}

export async function fetchAllLeads() {
  const res = await fetch(`${BASE_URL}/leads`);
  if (!res.ok) throw new Error("Failed to fetch leads");
  return res.json();
}
