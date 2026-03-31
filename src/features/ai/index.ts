// AI provider singleton.
// Swap mockAIProvider for a real implementation when wiring up a live model.
// The rest of the codebase always imports `aiAdapter` — never the concrete class.

export type { AIAdapter, AIPlaybookInput, AIPlaybookDraft, AIRuleDraft } from "./types";

import { mockAIProvider } from "./providers/mock";
import type { AIAdapter } from "./types";

export const aiAdapter: AIAdapter = mockAIProvider;
