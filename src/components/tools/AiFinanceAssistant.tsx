import React, { useState, useEffect, useRef } from "react";
import { ChatMessage } from "../../types";
import { useCurrency } from "../../context/CurrencyContext";
import { Sparkles, Send, Bot, User, ShieldAlert, CornerDownLeft, Loader2, ArrowRight } from "lucide-react";
import { trackEvent } from "../../utils/analytics";

interface AiFinanceAssistantProps {
  initialContextTag?: string;
}

export const AiFinanceAssistant: React.FC<AiFinanceAssistantProps> = ({ initialContextTag }) => {
  const { config } = useCurrency();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "assistant",
      text: `Hello! I am the **FinanceHub AI Assistant**. I can help you evaluate personal finance decisions, explain the mechanics of compound growth, mortgage amortization, 2026 tax brackets, or debt payoff strategies.\n\n*Note: I provide educational analysis based on sound financial math, not certified individual investment or tax advice.* What would you like to explore?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedContext, setSelectedContext] = useState<string>(initialContextTag || "");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const starterPrompts = [
    {
      label: "Mortgage vs. Investing",
      prompt: "Should I prioritize paying extra on a 6.5% mortgage or investing extra cash into an S&P 500 index fund?",
    },
    {
      label: "Snowball vs. Avalanche",
      prompt: "Explain how Debt Avalanche saves more money than Debt Snowball, and when Snowball might still be better.",
    },
    {
      label: "401(k) Pre-Tax Math",
      prompt: "How does putting $500/month into a traditional 401(k) reduce my current taxable paycheck?",
    },
    {
      label: "4% Safe Withdrawal Rule",
      prompt: "Is the 4% retirement rule safe if I want to retire early at age 45 for 40+ years?",
    },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputPrompt;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: "user",
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      calculatorContextTag: selectedContext,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt("");
    setLoading(true);

    trackEvent({
      action: "send_ai_query",
      category: "calculator",
      label: selectedContext || "general",
    });

    try {
      const res = await fetch("/api/ai-finance-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query.trim(),
          context: selectedContext ? `Active user tool context: ${selectedContext}. Currency: ${config.code} (${config.symbol})` : undefined,
          conversationHistory: messages.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate AI response");
      }

      const assistantMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: "assistant",
        text: data.reply || "I couldn't complete that calculation. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: "assistant",
          text: `⚠️ **Unable to connect to AI engine:** ${err.message || "Please verify server configuration."}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ai-finance-assistant-tool" className="max-w-4xl mx-auto space-y-6">
      {/* Context Ingestion Bar */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-teal-700" />
          <span className="text-xs font-bold text-slate-800">Calculator Context Tag:</span>
          <select
            value={selectedContext}
            onChange={(e) => setSelectedContext(e.target.value)}
            className="text-xs font-semibold py-1 px-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 focus:outline-none"
          >
            <option value="">None (General Finance)</option>
            <option value="mortgage-calculator">Mortgage / Home Loan</option>
            <option value="salary-calculator">Salary & Take-Home</option>
            <option value="retirement-calculator">Retirement Savings</option>
            <option value="debt-payoff-planner">Debt Payoff Plan</option>
            <option value="budget-calculator">50/30/20 Budget</option>
            <option value="tax-calculator">2026 Taxes</option>
            <option value="fire-calculator">FIRE Milestone</option>
          </select>
        </div>

        <span className="text-[11px] text-slate-400 font-medium">
          Contextual guidance grounded in 2026 standards
        </span>
      </div>

      {/* Starter Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {starterPrompts.map((sp, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(sp.prompt)}
            className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-700 hover:border-teal-700 hover:text-teal-800 transition-colors shadow-xs"
          >
            {sp.label}
          </button>
        ))}
      </div>

      {/* Chat Window */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[520px] overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 max-w-2xl ${
                m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                  m.sender === "user"
                    ? "bg-teal-800 text-white"
                    : "bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                {m.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-teal-700" />}
              </div>

              <div className="space-y-1">
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                    m.sender === "user"
                      ? "bg-teal-800 text-white rounded-tr-none"
                      : "bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-none"
                  }`}
                >
                  {m.text}
                </div>
                <span
                  className={`text-[10px] text-slate-400 block px-1 ${
                    m.sender === "user" ? "text-right" : "text-left"
                  }`}
                >
                  {m.timestamp}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 mr-auto max-w-xl">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 border border-slate-200 shrink-0">
                <Bot className="w-4 h-4 text-teal-700" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 text-slate-600 border border-slate-200/80 rounded-tl-none flex items-center gap-2 text-xs font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-700" />
                Analyzing financial math & principles...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask a question (e.g., 'How much house can I afford with $90k salary?')..."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              disabled={loading}
              className="flex-1 text-xs sm:text-sm py-2.5 px-4 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 placeholder-slate-400 font-medium"
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || loading}
              className="p-2.5 rounded-xl bg-teal-800 text-white hover:bg-teal-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
            <span>Serverless AI Intelligence • Gemini Engine</span>
            <span>Always consult a certified CFP or CPA for formal advisory</span>
          </div>
        </div>
      </div>
    </div>
  );
};
