// Anthropic Claude provider — implements AIAdapter using the Anthropic Messages API.
// Provider details (model, client config) stay here and never leak into product code.
// Activated by setting AI_PROVIDER=anthropic and ANTHROPIC_API_KEY in the environment.

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { PLAYBOOK_SYSTEM_PROMPT, buildPlaybookUserMessage } from "../prompts/playbook";
import type { AIAdapter, AIPlaybookInput, AIPlaybookDraft } from "../types";

// Zod schema mirrors AIPlaybookDraft — validates the model's JSON output.
const RuleDraftSchema = z.object({
  text:        z.string().min(1),
  category:    z.enum(["ENTRY", "EXIT", "INVALIDATION", "RISK", "MINDSET"]),
  inChecklist: z.boolean(),
});

const PlaybookDraftSchema = z.object({
  summary: z.string().min(1),
  rules:   z.array(RuleDraftSchema).min(1),
});

// Default model — fast and cost-effective for structured JSON generation.
// Override with ANTHROPIC_MODEL env var.
const DEFAULT_MODEL = "claude-haiku-4-5-20251001";

class AnthropicAIProvider implements AIAdapter {
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
    this.model  = process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL;
  }

  async generatePlaybook(input: AIPlaybookInput): Promise<AIPlaybookDraft> {
    const message = await this.client.messages.create({
      model:      this.model,
      max_tokens: 2048,
      system:     PLAYBOOK_SYSTEM_PROMPT,
      messages: [
        { role: "user", content: buildPlaybookUserMessage(input) },
      ],
    });

    // Extract text content from the response.
    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("Anthropic response contained no text content.");
    }

    // Strip markdown code fences if the model wraps output despite instructions.
    const raw = textBlock.text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error(
        `Anthropic returned non-JSON output. Raw response (first 200 chars): ${raw.slice(0, 200)}`
      );
    }

    const result = PlaybookDraftSchema.safeParse(parsed);
    if (!result.success) {
      throw new Error(
        `Anthropic response failed schema validation: ${result.error.message}`
      );
    }

    return result.data;
  }
}

// Factory — called once at module load. Returns null if the API key is missing.
export function createAnthropicProvider(): AIAdapter | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn(
      "[AI] AI_PROVIDER=anthropic but ANTHROPIC_API_KEY is not set. Falling back to mock provider."
    );
    return null;
  }
  return new AnthropicAIProvider(apiKey);
}
