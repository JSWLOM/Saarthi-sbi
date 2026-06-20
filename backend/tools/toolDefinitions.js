// toolDefinitions.js
// These are the "tools" (functions) the Gemini agent can call mid-conversation.
// This is what makes Saarthi *agentic* rather than a plain chatbot:
// the model decides WHEN to call these and WITH WHAT arguments, based on
// reasoning over the conversation so far.
// Format used here is compatible with the @google/genai SDK's functionDeclarations.

export const tools = [
  {
    functionDeclarations: [
      {
        name: "lookup_existing_customer",
        description:
          "Look up an existing SBI customer's profile by their customer ID, if they mention being an existing customer or provide an ID/account reference. Call this as soon as a customer ID is shared so you can personalise the rest of the conversation using their real relationship history (existing products, recent activity, life signals) instead of treating them as a brand-new lead.",
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
      {
        name: "update_lead_profile",
        description:
          "Update the structured profile of the lead/customer based on information revealed in the conversation. Call this whenever the user shares new relevant info (occupation, goal, income signal, urgency, risk appetite).",
        parameters: {
          type: "object",
          properties: {
            occupation: {
              type: "string",
              description:
                "User's occupation category, e.g. salaried, freelancer, self_employed, student, business_owner, unknown",
            },
            primaryGoal: {
              type: "string",
              description:
                "The main financial goal expressed, e.g. savings, investment, loan, insurance, business_banking, unclear",
            },
            urgency: {
              type: "string",
              description: "How urgent the need seems: low, medium, high",
            },
            riskAppetite: {
              type: "string",
              description: "low, medium, high, or unknown",
            },
            notes: {
              type: "string",
              description: "Any other useful free-text context about the lead",
            },
          },
          required: [],
        },
      },
      {
        name: "score_lead",
        description:
          "Compute and record a qualification score (0-100) for the current lead based on how clear, fundable, and actionable their need is. Call this once enough profile information has been gathered, or when re-scoring after new info.",
        parameters: {
          type: "object",
          properties: {
            score: {
              type: "number",
              description: "Qualification score from 0 to 100",
            },
            reasoning: {
              type: "string",
              description: "Short explanation of why this score was given",
            },
            tier: {
              type: "string",
              description: "Lead tier: cold, warm, or hot",
            },
          },
          required: ["score", "tier"],
        },
      },
      {
        name: "recommend_product",
        description:
          "Recommend one or two specific products to the lead from the catalog once their need is clear. Call this when you have enough signal to make a confident, specific recommendation rather than a generic one.",
        parameters: {
          type: "object",
          properties: {
            productIds: {
              type: "array",
              items: { type: "string" },
              description: "1-2 product IDs from the catalog being recommended",
            },
            justification: {
              type: "string",
              description: "Plain-language reason this fits the user's stated needs",
            },
          },
          required: ["productIds", "justification"],
        },
      },
      {
        name: "trigger_handoff",
        description:
          "Flag this conversation for human relationship manager (RM) handoff. Call this if the user explicitly asks for a human, the case is complex/high-value, or the user seems stuck/frustrated with the bot.",
        parameters: {
          type: "object",
          properties: {
            reason: {
              type: "string",
              description: "Why this conversation needs human handoff",
            },
          },
          required: ["reason"],
        },
      },
    ],
  },
];
