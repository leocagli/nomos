/**
 * Runs one subtask on the routed model with a persona system prompt.
 *
 * If the orchestrator picked a paid AIsa tool for this subtask, the executor
 * first invokes it via the x402 client (settling USDC on Arc through Circle
 * Gateway) and feeds the response into the LLM as fresh evidence. Each tool
 * call returns a `NanoPayment` record that gets streamed to the client over
 * SSE and aggregated into the run totals.
 *
 * Token usage is read from the Anthropic API response so pricing uses actual,
 * not estimated, tokens.
 */
import Anthropic from "@anthropic-ai/sdk";
import { getAnthropic } from "./anthropic";
import { MODEL_IDS } from "./config";
import { payAndCall } from "./x402";
import type { Agent, ModelId, NanoPayment, ToolCallSpec } from "./types";

function buildSubagentSystem(agent: Agent, tier: string): string {
  return `You are ${agent.name} (${agent.handle}). ${agent.description}

Your skills: ${agent.skills.join(", ")}.
You are operating at the "${tier}" complexity tier. Be concise, direct, and lead with your core specialty. Produce exactly one deliverable — no preamble, no meta-commentary. Target length: short to medium.`;
}

export interface ExecutionResult {
  output: string;
  input_tokens: number;
  output_tokens: number;
  actual_tokens: number;
  nanopayments: NanoPayment[];
}

const MAX_OUTPUT_TOKENS: Record<ModelId, number> = {
  haiku: 512,
  sonnet: 1024,
  opus: 2048,
};

export interface ToolPlan {
  spec: ToolCallSpec;
  request: { url: string; body?: string };
}

export async function runSubagent(
  agent: Agent,
  model: ModelId,
  tier: string,
  taskDescription: string,
  options: {
    subtaskId?: string;
    tool?: ToolPlan;
    onPayment?: (payment: NanoPayment) => void;
  } = {},
): Promise<ExecutionResult> {
  const nanopayments: NanoPayment[] = [];
  let toolContext = "";

  if (options.tool) {
    const result = await payAndCall(
      options.tool.spec,
      options.tool.request,
      options.subtaskId ?? "unknown",
    );
    nanopayments.push(result.payment);
    options.onPayment?.(result.payment);
    if (result.ok) {
      const trimmed = result.body.length > 4000 ? result.body.slice(0, 4000) + "…" : result.body;
      toolContext = `Tool: ${options.tool.spec.endpoint_label} (${options.tool.spec.endpoint})\nCost: $${options.tool.spec.price_usdc.toFixed(4)} USDC settled on Arc.\nResponse:\n${trimmed}\n\n`;
    } else {
      toolContext = `Tool ${options.tool.spec.endpoint_label} unavailable; proceed using your own judgement.\n\n`;
    }
  }

  const userMessage = toolContext
    ? `${toolContext}Task: ${taskDescription}\n\nUse the tool response above as primary evidence when relevant.`
    : taskDescription;

  const client = getAnthropic();
  const res = await client.messages.create({
    model: MODEL_IDS[model],
    max_tokens: MAX_OUTPUT_TOKENS[model],
    system: buildSubagentSystem(agent, tier),
    messages: [{ role: "user", content: userMessage }],
  });
  const output = res.content
    .filter((c): c is Anthropic.TextBlock => c.type === "text")
    .map((c) => c.text)
    .join("")
    .trim();
  const input_tokens = res.usage.input_tokens;
  const output_tokens = res.usage.output_tokens;
  return {
    output,
    input_tokens,
    output_tokens,
    actual_tokens: input_tokens + output_tokens,
    nanopayments,
  };
}
