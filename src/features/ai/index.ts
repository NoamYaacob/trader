// AI provider singleton.
// The rest of the codebase always imports `aiAdapter` — never the concrete provider.
//
// Provider selection (evaluated once at module load):
//   AI_PROVIDER=anthropic + ANTHROPIC_API_KEY set → AnthropicAIProvider
//   Anything else (missing key, unknown value, dev without config) → MockAIProvider
//
// Override the model used by the Anthropic provider with:
//   ANTHROPIC_MODEL=claude-sonnet-4-6   (default: claude-haiku-4-5-20251001)

export type { AIAdapter, AIPlaybookInput, AIPlaybookDraft, AIRuleDraft } from "./types";

import { mockAIProvider } from "./providers/mock";
import { createAnthropicProvider } from "./providers/anthropic";
import type { AIAdapter } from "./types";

function resolveProvider(): AIAdapter {
  const requested = process.env.AI_PROVIDER;

  if (requested === "anthropic") {
    const provider = createAnthropicProvider();
    if (provider) {
      console.info("[AI] Using Anthropic provider.");
      return provider;
    }
    // createAnthropicProvider already logged a warning — fall through to mock.
  } else if (requested) {
    console.warn(`[AI] Unknown AI_PROVIDER="${requested}". Falling back to mock provider.`);
  }

  return mockAIProvider;
}

export const aiAdapter: AIAdapter = resolveProvider();
