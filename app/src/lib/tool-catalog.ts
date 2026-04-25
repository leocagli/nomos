/**
 * Maps subtask `skill_hint` (and a fallback keyword scan of the description) to
 * a paid AIsa `/apis/v2/` endpoint. Selected tools are invoked from the executor
 * before the LLM step so the model has fresh data — and so every routed
 * subtask is backed by a real Arc-settled USDC nanopayment.
 *
 * Source of prices: `nanopayment-x402/references/endpoint-catalog.md` (per-call
 * USD, charged in USDC via Circle Gateway on Arc testnet 5042002).
 */
import type { ToolCallSpec } from "./types";

export const AISA_BASE = "https://api.aisa.one/apis/v2";

interface CatalogEntry {
  /** Match list — checked against skill_hint AND tokenised description */
  match: string[];
  endpoint: string;
  endpoint_label: string;
  method: "GET" | "POST";
  price_usdc: number;
  reason: string;
  /** Build the URL or POST body from the subtask description. */
  build: (description: string) => { url: string; body?: string };
}

function extractTicker(description: string): string {
  const upper = description.toUpperCase();
  const m = upper.match(/\b([A-Z]{1,5})\b/g);
  if (!m) return "AAPL";
  const blacklist = new Set([
    "A", "I", "AN", "OR", "AND", "FOR", "THE", "TO", "OF", "WE", "US",
    "API", "AI", "LLM", "FAQ", "CEO", "USA", "CEO", "GPT", "USD", "USDC",
    "UI", "UX", "B2B", "B2C", "SAAS", "ROI", "OKR", "KPI", "MVP", "PR",
    "VC", "QA", "QR",
  ]);
  for (const candidate of m) {
    if (!blacklist.has(candidate) && candidate.length >= 2) return candidate;
  }
  return "AAPL";
}

function extractQuery(description: string): string {
  return description.replace(/\s+/g, " ").trim().slice(0, 200);
}

function extractTwitterHandle(description: string): string {
  const m = description.match(/@([A-Za-z0-9_]{2,15})/);
  if (m) return m[1];
  const lower = description.toLowerCase();
  if (lower.includes("elon")) return "elonmusk";
  if (lower.includes("naval")) return "naval";
  if (lower.includes("paul graham") || lower.includes("pg")) return "paulg";
  return "jack";
}

const CATALOG: CatalogEntry[] = [
  {
    match: ["research", "analysis", "analyze", "investigate", "deep_research", "perplexity"],
    endpoint: "perplexity/sonar",
    endpoint_label: "Perplexity Sonar",
    method: "POST",
    price_usdc: 0.005,
    reason: "Subtask needs general research → routed to Perplexity Sonar via x402",
    build: (description) => ({
      url: `${AISA_BASE}/perplexity/sonar`,
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "user",
            content: `Provide a tight, factual brief (max 5 bullets) on: ${extractQuery(description)}`,
          },
        ],
      }),
    }),
  },
  {
    match: ["scholar", "academic", "paper", "papers", "citation"],
    endpoint: "scholar/search/scholar",
    endpoint_label: "Scholar Search",
    method: "POST",
    price_usdc: 0.0096,
    reason: "Subtask references academic content → Scholar search via x402",
    build: (description) => ({
      url: `${AISA_BASE}/scholar/search/scholar?query=${encodeURIComponent(extractQuery(description))}`,
      body: "{}",
    }),
  },
  {
    match: ["search", "web", "tavily", "browse", "lookup"],
    endpoint: "tavily/search",
    endpoint_label: "Tavily Web Search",
    method: "POST",
    price_usdc: 0.0096,
    reason: "Subtask needs live web evidence → Tavily search via x402",
    build: (description) => ({
      url: `${AISA_BASE}/tavily/search`,
      body: JSON.stringify({ query: extractQuery(description) }),
    }),
  },
  {
    match: ["financial", "finance", "stock", "10-k", "10k", "earnings", "income"],
    endpoint: "financial/financials/income-statements",
    endpoint_label: "Income Statements",
    method: "GET",
    price_usdc: 0.048,
    reason: "Subtask references financial data → SEC income statements via x402",
    build: (description) => ({
      url: `${AISA_BASE}/financial/financials/income-statements?ticker=${extractTicker(description)}`,
    }),
  },
  {
    match: ["price", "ticker", "quote", "stock_price", "market_price"],
    endpoint: "financial/prices/snapshot",
    endpoint_label: "Stock Price Snapshot",
    method: "GET",
    price_usdc: 0.024,
    reason: "Subtask asks for current price → snapshot prices via x402",
    build: (description) => ({
      url: `${AISA_BASE}/financial/prices/snapshot?ticker=${extractTicker(description)}`,
    }),
  },
  {
    match: ["twitter", "tweet", "x.com", "social", "sentiment"],
    endpoint: "twitter/user/last_tweets",
    endpoint_label: "Twitter Recent Tweets",
    method: "GET",
    price_usdc: 0.0036,
    reason: "Subtask references social signals → recent tweets via x402",
    build: (description) => ({
      url: `${AISA_BASE}/twitter/user/last_tweets?userName=${extractTwitterHandle(description)}`,
    }),
  },
  {
    match: ["news", "press", "headline", "story"],
    endpoint: "financial/news",
    endpoint_label: "Company News",
    method: "GET",
    price_usdc: 0.048,
    reason: "Subtask asks for company news → curated news feed via x402",
    build: (description) => ({
      url: `${AISA_BASE}/financial/news?ticker=${extractTicker(description)}`,
    }),
  },
];

/**
 * Pick the highest-priority paid tool that matches the skill_hint or task
 * description. Returns null if no tool is needed (most subtasks: drafting,
 * formatting, summarization, classification of given content).
 */
export function pickToolForSubtask(
  description: string,
  skillHint: string,
): { spec: ToolCallSpec; build: () => { url: string; body?: string } } | null {
  const hint = skillHint.toLowerCase();
  const desc = description.toLowerCase();
  const haystack = `${hint} ${desc}`;

  for (const entry of CATALOG) {
    if (entry.match.some((m) => haystack.includes(m))) {
      return {
        spec: {
          endpoint: entry.endpoint,
          endpoint_label: entry.endpoint_label,
          method: entry.method,
          price_usdc: entry.price_usdc,
          reason: entry.reason,
        },
        build: () => entry.build(description),
      };
    }
  }
  return null;
}

export const TOOL_CATALOG_FOR_DISPLAY = CATALOG.map((c) => ({
  endpoint: c.endpoint,
  endpoint_label: c.endpoint_label,
  price_usdc: c.price_usdc,
  matches: c.match,
}));
