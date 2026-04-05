-- Add normalized strategy spec JSON column to Playbook.
-- Null for rows created before the spec layer was introduced.

ALTER TABLE "Playbook" ADD COLUMN "spec" JSONB;
