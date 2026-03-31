"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { recordAttempt, completeSession } from "@/server/actions/training";
import type { ExampleForTraining, AttemptResult } from "@/features/training/types";
import type { PlaybookRule } from "@/features/playbook/types";

interface Props {
  sessionId:        string;
  examples:         ExampleForTraining[];
  // Pre-filled answers from a prior partial session (resume support).
  initialAttempts:  Record<string, { userAnswer: "VALID" | "INVALID"; isCorrect: boolean }>;
  checklistRules:   PlaybookRule[];
}

type Phase = "question" | "feedback";

interface FeedbackState {
  isCorrect:            boolean;
  actualClassification: "VALID" | "INVALID";
  exampleNotes:         string | null;
  userAnswer:           "VALID" | "INVALID";
}

export function TrainingSessionView({
  sessionId,
  examples,
  initialAttempts,
  checklistRules,
}: Props) {
  // Start at the first unanswered example (resume support).
  const firstUnanswered = examples.findIndex((e) => !(e.id in initialAttempts));
  const [currentIdx, setCurrentIdx] = useState(
    firstUnanswered === -1 ? examples.length - 1 : firstUnanswered
  );
  const [phase, setPhase]     = useState<Phase>("question");
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const current  = examples[currentIdx];
  const answered = currentIdx; // number of questions shown so far (0-indexed)
  const total    = examples.length;
  const isLast   = currentIdx === total - 1;

  const entryRules = checklistRules.filter((r) => r.category === "ENTRY");

  function handleAnswer(answer: "VALID" | "INVALID") {
    if (phase !== "question" || isPending) return;
    setError(null);

    startTransition(async () => {
      const result = await recordAttempt(sessionId, current.id, answer);
      if ("success" in result && !result.success) {
        if (result.error === "Already answered.") {
          // Resume edge case: advance past this one.
          advance();
          return;
        }
        setError(result.error);
        return;
      }
      const r = result as AttemptResult;
      setFeedback({
        isCorrect:            r.isCorrect,
        actualClassification: r.actualClassification,
        exampleNotes:         r.exampleNotes,
        userAnswer:           answer,
      });
      setPhase("feedback");
    });
  }

  function advance() {
    setFeedback(null);
    setPhase("question");
    setCurrentIdx((i) => i + 1);
  }

  function handleNext() {
    if (isPending) return;
    if (isLast) {
      startTransition(async () => {
        const result = await completeSession(sessionId);
        // completeSession redirects on success — only reaches here on error.
        if (result && !result.success) setError(result.error);
      });
    } else {
      advance();
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Minimal training header */}
      <div className="flex items-center justify-between px-6 h-12 border-b border-border shrink-0">
        <a
          href="/training"
          className="text-[11px] text-muted hover:text-secondary transition-colors font-mono"
        >
          ← Exit
        </a>
        <span className="text-[13px] font-semibold text-primary tracking-tight">
          {current.setupName}
        </span>
        <span className="text-[11px] text-muted font-mono">
          {currentIdx + 1} / {total}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-[var(--bg-inset)]">
        <div
          className="h-full bg-accent transition-all duration-300"
          style={{ width: `${((currentIdx + (phase === "feedback" ? 1 : 0)) / total) * 100}%` }}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentIdx}-${phase}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" as const }}
            className="flex flex-col flex-1"
          >
            {phase === "question" ? (
              <QuestionView
                example={current}
                onAnswer={handleAnswer}
                isPending={isPending}
                error={error}
              />
            ) : feedback ? (
              <FeedbackView
                example={current}
                feedback={feedback}
                checklistRules={entryRules}
                isLast={isLast}
                isPending={isPending}
                onNext={handleNext}
                error={error}
              />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Question view ──────────────────────────────────────────────────────────

function QuestionView({
  example,
  onAnswer,
  isPending,
  error,
}: {
  example:   ExampleForTraining;
  onAnswer:  (answer: "VALID" | "INVALID") => void;
  isPending: boolean;
  error:     string | null;
}) {
  return (
    <div className="flex flex-col gap-0 max-w-[800px] w-full mx-auto px-4 py-6 flex-1">
      {/* Setup context — small, above the image */}
      {(example.entryCondition || example.setupTags.length > 0) && (
        <div className="mb-4 flex flex-col gap-2">
          {example.setupTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {example.setupTags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-mono text-accent/70 border border-accent/20 bg-accent/5 rounded px-1.5 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {example.entryCondition && (
            <p className="text-[11px] text-muted font-mono leading-relaxed">
              Entry: {example.entryCondition}
            </p>
          )}
        </div>
      )}

      {/* Chart image */}
      <div className="relative rounded border border-border overflow-hidden bg-[var(--bg-inset)] mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={example.imageUrl}
          alt="Setup example"
          className="w-full h-auto block"
          draggable={false}
        />
        {/* Annotation markers (read-only) */}
        {example.annotationData.markers.map((marker, i) => (
          <div
            key={i}
            style={{ position: "absolute", left: `${marker.x}%`, top: `${marker.y}%`, transform: "translate(-50%, -50%)" }}
            className="w-6 h-6 rounded-full bg-accent text-[var(--bg-base)] flex items-center justify-center text-[10px] font-bold font-mono pointer-events-none"
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Prompt */}
      <p className="text-[12px] text-muted font-mono text-center mb-5">
        Is this a valid setup?
      </p>

      {/* Decision buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onAnswer("VALID")}
          disabled={isPending}
          className="py-4 rounded border border-valid/30 bg-valid/5 text-valid font-semibold text-[14px] tracking-tight hover:bg-valid/15 hover:border-valid/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Valid
        </button>
        <button
          type="button"
          onClick={() => onAnswer("INVALID")}
          disabled={isPending}
          className="py-4 rounded border border-invalid/30 bg-invalid/5 text-invalid font-semibold text-[14px] tracking-tight hover:bg-invalid/15 hover:border-invalid/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Invalid
        </button>
      </div>

      {error && (
        <p className="text-[11px] text-invalid font-mono text-center mt-3">{error}</p>
      )}
    </div>
  );
}

// ── Feedback view ──────────────────────────────────────────────────────────

function FeedbackView({
  example,
  feedback,
  checklistRules,
  isLast,
  isPending,
  onNext,
  error,
}: {
  example:        ExampleForTraining;
  feedback:       FeedbackState;
  checklistRules: PlaybookRule[];
  isLast:         boolean;
  isPending:      boolean;
  onNext:         () => void;
  error:          string | null;
}) {
  return (
    <div className="flex flex-col gap-0 max-w-[800px] w-full mx-auto px-4 py-6 flex-1">
      {/* Feedback banner */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded border mb-5",
          feedback.isCorrect
            ? "border-valid/30 bg-valid/8"
            : "border-invalid/30 bg-invalid/8"
        )}
      >
        <span className={cn("text-[18px]", feedback.isCorrect ? "text-valid" : "text-invalid")}>
          {feedback.isCorrect ? "✓" : "✗"}
        </span>
        <div className="flex-1">
          <p className={cn("text-[14px] font-semibold", feedback.isCorrect ? "text-valid" : "text-invalid")}>
            {feedback.isCorrect ? "Correct" : "Incorrect"}
          </p>
          <p className="text-[12px] text-secondary">
            This is a{" "}
            <span
              className={cn(
                "font-semibold",
                feedback.actualClassification === "VALID" ? "text-valid" : "text-invalid"
              )}
            >
              {feedback.actualClassification.toLowerCase()}
            </span>{" "}
            setup.
            {!feedback.isCorrect && (
              <span className="text-muted">
                {" "}You answered {feedback.userAnswer.toLowerCase()}.
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Image with annotations */}
      <div className="relative rounded border border-border overflow-hidden bg-[var(--bg-inset)] mb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={example.imageUrl}
          alt="Setup example"
          className="w-full h-auto block"
          draggable={false}
        />
        {example.annotationData.markers.map((marker, i) => (
          <div
            key={i}
            style={{ position: "absolute", left: `${marker.x}%`, top: `${marker.y}%`, transform: "translate(-50%, -50%)" }}
            className="w-6 h-6 rounded-full bg-accent text-[var(--bg-base)] flex items-center justify-center text-[10px] font-bold font-mono pointer-events-none"
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Example notes — the real learning content */}
      {feedback.exampleNotes && (
        <div className="px-3 py-2.5 border-l-2 border-accent/30 bg-accent/5 rounded-r mb-4">
          <p className="text-[12px] text-secondary leading-relaxed">{feedback.exampleNotes}</p>
        </div>
      )}

      {/* Checklist rules as reference */}
      {checklistRules.length > 0 && (
        <div className="mb-5">
          <p className="text-[10px] text-muted font-mono uppercase tracking-wider mb-2">
            Checklist reference
          </p>
          <div className="flex flex-col gap-1.5">
            {checklistRules.slice(0, 4).map((rule) => (
              <div key={rule.id} className="flex items-start gap-2">
                <div className="w-3 h-3 mt-0.5 rounded-sm border border-border-strong shrink-0 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-sm bg-muted" />
                </div>
                <p className="text-[11px] text-muted leading-relaxed font-mono">{rule.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="text-[11px] text-invalid font-mono mb-3">{error}</p>
      )}

      {/* Next button */}
      <button
        type="button"
        onClick={onNext}
        disabled={isPending}
        className="w-full py-3 rounded border border-border-strong bg-[var(--bg-elevated)] text-primary font-semibold text-[13px] hover:border-accent/40 hover:bg-[var(--bg-overlay)] transition-all disabled:opacity-50"
      >
        {isPending
          ? "Loading…"
          : isLast
          ? "Finish session →"
          : "Next →"}
      </button>
    </div>
  );
}
