-- Add Pine Script fields to Playbook model.
-- pineScript: the AI-generated indicator code for this playbook version.
-- pineScriptNotes: AI clarifications or ambiguity warnings about the generated code.

ALTER TABLE "Playbook" ADD COLUMN "pineScript"      TEXT;
ALTER TABLE "Playbook" ADD COLUMN "pineScriptNotes" TEXT;
