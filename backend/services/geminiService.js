// geminiService.js
// Core agentic loop — now using Groq API (llama-3.3-70b-versatile) instead of
// Gemini. Groq's free tier is faster and more generous on RPM for demo purposes.
// Tool-calling logic, lead store integration, and system prompt are unchanged.

import "../loadEnv.js";
import Groq from "groq-sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  getLead,
  updateLeadProfile,
  setLeadScore,
  setLeadRecommendation,
  setLeadHandoff,
  setExistingCustomer,
} from "./leadService.js";
import { findCustomerById } from "./customerService.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRODUCTS_PATH = path.join(__dirname, "..", "data", "products.json");
const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, "utf-8"));

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `
You are Saarthi, a warm and sharp AI onboarding concierge for SBI (State Bank of India).

Your job has three stages, handled naturally within conversation (not as a rigid script):
0. RECOGNISE (if applicable): If the user mentions they're already an SBI customer or shares a
   customer ID (format like SBI1001), call lookup_existing_customer immediately. If a match is found,
   greet them by name and acknowledge their existing relationship, then IMMEDIATELY identify the most
   specific, concrete gap or opportunity in their real data — not a generic "how can I help" question.
   Look at their existingProducts, recentActivity, and lifeSignals and name the ONE most relevant
   observation explicitly (e.g. "I notice you don't have any investment product yet, and your business
   cash flow has been growing" or "I see you've been checking home loan eligibility — are you actively
   house-hunting?"). Your very next message after recognising them must reference a specific detail
   from their data, never a generic prompt. If no match is found, continue as a new prospective
   customer without mentioning the failed lookup.
1. IDENTIFY: Understand who the user is and what they actually need. Ask open, natural questions.
2. QUALIFY: Once you sense their occupation, goal, urgency, and risk appetite, call update_lead_profile
   to record it, then call score_lead to assess how strong/actionable this lead is. If this is an
   existing customer, factor their real activity/life signals into the score and reasoning.
3. CONVERT: Once the need is clear and the lead is reasonably qualified, call recommend_product with
   1-2 specific product IDs from the catalog below, with a clear plain-language justification. For
   existing customers, prefer products that complement what they already hold rather than duplicating
   it. Then guide the user toward a next step (start application / book a callback).

If at any point the user explicitly asks for a human, seems frustrated, or the case is complex/high
value, call trigger_handoff with a reason.

Rules:
- Ask only ONE question at a time. Keep messages short and conversational, not a wall of text.
- Do not recommend a product until you have at least occupation and primaryGoal reasonably clear.
- Only recommend products that exist in the catalog below. Never invent products or guarantee approval.
- Be encouraging but honest — do not promise loan/insurance approval, only eligibility guidance.
- After calling a tool, continue the conversation naturally based on the result.
- Never invent customer data. Only reference existing-customer details from a real lookup call.

Product catalog:
${JSON.stringify(products, null, 2)}
`;

// Tool definitions in Groq/OpenAI format
const tools = [
  {
    type: "function",
    function: {
      name: "lookup_existing_customer",
      description:
        "Look up an existing SBI customer's profile by their customer ID. Call this as soon as a customer ID is shared so you can personalise the conversation using their real relationship history.",
      parameters: {
        type: "object",
        properties: {
          customerId: {
            type: "string",
            description: "The customer ID as provided by the user, e.g. SBI1001",
          },
        },
        required: ["customerId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_lead_profile",
      description:
        "Update the structured profile of the lead based on information revealed in the conversation. Call this whenever the user shares occupation, goal, income signal, urgency, or risk appetite.",
      parameters: {
        type: "object",
        properties: {
          occupation: {
            type: "string",
            description: "e.g. salaried, freelancer, self_employed, student, business_owner, unknown",
          },
          primaryGoal: {
            type: "string",
            description: "e.g. savings, investment, loan, insurance, business_banking, unclear",
          },
          urgency: { type: "string", description: "low, medium, or high" },
          riskAppetite: { type: "string", description: "low, medium, high, or unknown" },
          notes: { type: "string", description: "Any other useful free-text context about the lead" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "score_lead",
      description:
        "Compute a qualification score (0-100) for the lead based on how clear and actionable their need is. Call this once enough profile information has been gathered.",
      parameters: {
        type: "object",
        properties: {
          score: { type: "number", description: "Qualification score from 0 to 100" },
          reasoning: { type: "string", description: "Short explanation of why this score was given" },
          tier: { type: "string", description: "cold, warm, or hot" },
        },
        required: ["score", "tier"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "recommend_product",
      description:
        "Recommend 1-2 specific products from the catalog once the lead's need is clear. Call this when you have enough signal to make a confident recommendation.",
      parameters: {
        type: "object",
        properties: {
          productIds: {
            type: "array",
            items: { type: "string" },
            description: "1-2 product IDs from the catalog",
          },
          justification: {
            type: "string",
            description: "Plain-language reason this fits the user's stated needs",
          },
        },
        required: ["productIds", "justification"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "trigger_handoff",
      description:
        "Flag this conversation for human RM handoff. Call this if the user asks for a human, the case is complex, or the user seems stuck.",
      parameters: {
        type: "object",
        properties: {
          reason: { type: "string", description: "Why this conversation needs human handoff" },
        },
        required: ["reason"],
      },
    },
  },
];

// Execute a tool call against the lead store
function executeTool(leadId, name, args) {
  switch (name) {
    case "lookup_existing_customer": {
      const customer = findCustomerById(args.customerId);
      setExistingCustomer(leadId, customer);
      return customer
        ? { status: "ok", found: true, customer }
        : { status: "ok", found: false, message: "No matching customer found." };
    }
    case "update_lead_profile": {
      const lead = updateLeadProfile(leadId, args);
      return { status: "ok", profile: lead?.profile };
    }
    case "score_lead": {
      const lead = setLeadScore(leadId, args.score, args.tier, args.reasoning);
      return { status: "ok", score: lead?.score, tier: lead?.tier };
    }
    case "recommend_product": {
      const validIds = (args.productIds || []).filter((id) =>
        products.some((p) => p.id === id)
      );
      const lead = setLeadRecommendation(leadId, validIds, args.justification);
      return {
        status: "ok",
        recommendedProducts: lead?.recommendedProducts,
        productDetails: products.filter((p) => validIds.includes(p.id)),
      };
    }
    case "trigger_handoff": {
      const lead = setLeadHandoff(leadId, args.reason);
      return { status: "ok", handoff: lead?.handoff };
    }
    default:
      return { status: "error", message: `Unknown tool: ${name}` };
  }
}

// Convert stored messages to Groq/OpenAI message format
function toGroqHistory(messages) {
  return messages.map((m) => ({
    role: m.role === "user" ? "user" : "assistant",
    content: m.text,
  }));
}

/**
 * Runs one turn of the agent using Groq's chat completions API with tool calling.
 * Loops until the model produces a final text response (no more tool calls).
 */
export async function runAgentTurn(leadId, priorMessages, userMessage) {
  const history = toGroqHistory(priorMessages);

  // Build the full message list for this turn
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    { role: "user", content: userMessage },
  ];

  const toolCallsMade = [];
  let safetyCounter = 0;

  while (safetyCounter < 6) {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages,
      tools,
      tool_choice: "auto",
      temperature: 0.7,
      max_tokens: 1024,
    });

    const choice = response.choices[0];
    const assistantMessage = choice.message;

    // Always push the assistant message into the running history
    messages.push(assistantMessage);

    // If no tool calls — we have a final text reply
    if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
      return { reply: assistantMessage.content || "", toolCallsMade };
    }

    // Execute each tool call and feed results back as tool messages
    for (const toolCall of assistantMessage.tool_calls) {
      let args = {};
      try {
        args = JSON.parse(toolCall.function.arguments || "{}");
      } catch {
        args = {};
      }

      const result = executeTool(leadId, toolCall.function.name, args);
      toolCallsMade.push({ name: toolCall.function.name, args, result });

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      });
    }

    safetyCounter++;
  }

  return { reply: "I'm having trouble processing that right now. Please try again.", toolCallsMade };
}

export function getLeadSnapshot(leadId) {
  return getLead(leadId);
}