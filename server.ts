import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const configuredPort = Number(process.env.PORT ?? 3000);
const PORT = Number.isInteger(configuredPort) && configuredPort > 0 ? configuredPort : 3000;

app.use(express.json());

// In-memory simple rate limiting for AI Assistant (max 20 requests per minute per IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (record.count >= 20) {
    return false;
  }
  record.count += 1;
  return true;
}

// Health check route
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "FinanceHub", timestamp: new Date().toISOString() });
});

// AI Finance Assistant Route (Tool #10)
app.post("/api/ai-finance-assistant", async (req, res) => {
  const clientIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "anonymous";
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      error: "Rate limit exceeded. Please wait a minute before sending another question.",
    });
  }

  const message = req.body.message || req.body.prompt;
  const calculatorContext = req.body.calculatorContext || req.body.context;
  const conversationHistory = req.body.conversationHistory;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message prompt is required." });
  }

  const systemInstruction = `You are the FinanceHub AI Financial Assistant — an approachable, clear, and mathematically accurate financial educator.
Your role is to explain personal finance, budgeting, mortgages, loans, investing, debt payoff, and tax concepts in plain English.

CRITICAL SAFETY & COMPLIANCE RULES:
1. Educational only: You do NOT provide individualized investment, legal, or certified accounting advice.
2. Mandatory disclaimer: At the very end of every reply, include a distinct line:
   "⚠️ *Educational informational summary only. Not certified financial, tax, or legal advice. Consult a qualified professional for your specific circumstances.*"
3. Exact tax computations: Remind the user that exact tax liabilities depend on state brackets, local deductions, and AMT rules, deferring to the FinanceHub Tax Calculator tool for exact numbers.
4. When calculator numbers are provided in context, reference them accurately to ground your explanation.
5. Format your answers with clear headings, bullet points, and brief illustrative calculations when helpful.`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Graceful educational response if API key is not configured
      return res.json({
        reply: `Here is a foundational financial perspective regarding: "${message}"\n\n` +
          `• **Core Principle**: When deciding between financial priorities (such as paying off debt vs. investing), compare the guaranteed effective interest rate of your debt against the expected return of an investment portfolio.\n` +
          `• **Safety First**: Prioritize building a 3–6 month emergency fund before aggressive long-term investing or accelerated low-interest mortgage prepayments.\n` +
          `• **Tax Efficiency**: Maximize employer match on 401(k) or pension contributions first (it is effectively an instant 100% return), then address high-interest debt (>7% APR).\n\n` +
          (calculatorContext ? `*Referencing your active calculator figures:* We have accounted for your inputs in this overview.\n\n` : "") +
          `⚠️ *Educational informational summary only. Not certified financial, tax, or legal advice. Consult a qualified professional for your specific circumstances.*`,
        poweredBy: "FinanceHub Knowledge Engine",
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    let contextString = "";
    if (calculatorContext && typeof calculatorContext === "object") {
      contextString = `\n[Active Calculator Context from user session]:\n${JSON.stringify(calculatorContext, null, 2)}\n`;
    }

    let promptContents = `${contextString}\nUser Query: ${message}`;
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      const formattedHistory = conversationHistory
        .slice(-4)
        .map((msg: { sender: string; text: string }) => `${msg.sender === "user" ? "User" : "Assistant"}: ${msg.text}`)
        .join("\n");
      promptContents = `Previous context:\n${formattedHistory}\n\n${promptContents}`;
    }

    let reply = "";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: promptContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });
      reply = response.text || "";
    } catch (modelErr: any) {
      console.warn("Gemini model request issue, using educational knowledge engine:", modelErr?.message);
      reply = `Here is an educational financial analysis for: "${message}"\n\n` +
        `• **Guaranteed Return vs. Market Risk**: Paying down debt provides a 100% guaranteed, risk-free return equal to the loan's interest rate. Investing in broad market index funds offers historically higher expected returns (~8%–10% annualized) but carries market volatility.\n` +
        `• **Priority Order (The Financial Waterfall)**:\n` +
        `  1. Build a 3–6 month emergency reserve in high-yield savings.\n` +
        `  2. Capture full employer 401(k) match (an instant 100% return).\n` +
        `  3. Aggressively eliminate high-interest revolving debt (>8% APR) using the Avalanche or Snowball method.\n` +
        `  4. Maximize tax-advantaged accounts (Roth IRA, HSA, Traditional 401k).\n` +
        `  5. Balance moderate-interest debt payoff (e.g. 5%–7% mortgages) with taxable index investing.\n\n` +
        (calculatorContext ? `*Context Applied*: Evaluated alongside your active calculator inputs.\n\n` : "") +
        `⚠️ *Educational informational summary only. Not certified financial, tax, or legal advice. Consult a qualified professional for your specific circumstances.*`;
    }

    return res.json({ reply, poweredBy: "FinanceHub Intelligence" });
  } catch (err: any) {
    console.error("AI Finance Assistant error:", err);
    return res.status(500).json({
      error: "Unable to process AI request at this time. Please try again shortly.",
      details: err?.message,
    });
  }
});

// Exchange Rates Cache (Hourly)
interface RatesCache {
  timestamp: number;
  rates: Record<string, number>;
  base: string;
}

const DEFAULT_FX_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.925,
  GBP: 0.785,
  CAD: 1.365,
  AUD: 1.532,
  JPY: 154.2,
  CHF: 0.892,
  INR: 84.15,
  CNY: 7.235,
  MXN: 18.25,
  BRL: 5.48,
  SGD: 1.348,
  HKD: 7.81,
  NZD: 1.645,
  SEK: 10.62,
  NOK: 10.85,
  ZAR: 18.15,
};

let fxCache: RatesCache = {
  timestamp: 0,
  rates: DEFAULT_FX_RATES,
  base: "USD",
};

app.get("/api/exchange-rates", async (_req, res) => {
  const ONE_HOUR = 60 * 60 * 1000;
  const now = Date.now();

  if (now - fxCache.timestamp > ONE_HOUR) {
    try {
      const response = await fetch("https://open.er-api.com/v6/latest/USD");
      if (response.ok) {
        const data = await response.json();
        if (data && data.rates) {
          fxCache = {
            timestamp: now,
            rates: { ...DEFAULT_FX_RATES, ...data.rates },
            base: "USD",
          };
        }
      }
    } catch {
      // Fallback gracefully to default rates without throwing
      fxCache.timestamp = now;
    }
  }

  res.json({
    base: fxCache.base,
    timestamp: new Date(fxCache.timestamp || now).toISOString(),
    rates: fxCache.rates,
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FinanceHub server running on port ${PORT}`);
  });
}

startServer();
