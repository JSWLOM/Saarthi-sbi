// loadEnv.js
// Loads environment variables from .env BEFORE any other module runs.
//
// Why this file exists: in ES modules, `import` statements are all resolved
// up front, but their top-level code runs in source order. If dotenv.config()
// was called inside server.js AFTER `import "./services/geminiService.js"`,
// geminiService.js's top-level `new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })`
// would run before process.env.GEMINI_API_KEY was ever populated -- causing
// the SDK to silently fall back to Google Cloud's Application Default
// Credentials flow instead of using your API key (the
// "Could not load the default credentials" error).
//
// Importing this file FIRST in server.js guarantees dotenv.config() runs
// before any other local module's top-level code.

import dotenv from "dotenv";
dotenv.config();
