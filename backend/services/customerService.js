// customerService.js
// Looks up mock "existing SBI customer" profiles. This powers the
// hyper-personalisation angle: if a user identifies themselves as an
// existing customer, the agent can reference their real relationship
// history (products held, recent activity, life signals) instead of
// starting from a completely cold conversation every time.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CUSTOMERS_PATH = path.join(__dirname, "..", "data", "customers.json");
const customers = JSON.parse(fs.readFileSync(CUSTOMERS_PATH, "utf-8"));

/**
 * Looks up a customer by ID (case-insensitive, trims whitespace).
 * Returns null if not found -- the agent should treat that as a
 * new/prospective customer rather than erroring out.
 */
export function findCustomerById(customerId) {
  if (!customerId) return null;
  const normalized = String(customerId).trim().toUpperCase();
  return customers.find((c) => c.customerId.toUpperCase() === normalized) || null;
}

export function getAllCustomerIds() {
  return customers.map((c) => c.customerId);
}
