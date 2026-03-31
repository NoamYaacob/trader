import { z } from "zod";

export const setupSchema = z.object({
  name:                  z.string().trim().min(1, "Setup name is required.").max(120),
  description:           z.string().trim().max(2000).optional(),
  entryCondition:        z.string().trim().max(2000).optional(),
  exitCondition:         z.string().trim().max(2000).optional(),
  invalidationCondition: z.string().trim().max(2000).optional(),
  // Raw comma-separated string; caller converts to array after validation.
  tags:                  z.string().trim().max(500).optional(),
});

export type SetupInput = z.infer<typeof setupSchema>;

export function parseTags(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0 && t.length <= 40)
    .slice(0, 10); // max 10 tags
}
