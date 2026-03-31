"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const PROBLEMS = [
  {
    heading: "You know your rules. You break them anyway.",
    body: "Execution fails under pressure — not from ignorance. The problem is the gap between knowing and doing.",
  },
  {
    heading: "Your setups live in your memory.",
    body: "Without a structured visual library, pattern recognition degrades every time you sit down to trade.",
  },
  {
    heading: "Reviews measure P&L. Not discipline.",
    body: "Outcome-based review hides the real problem. A winning trade can be poor execution. A loss can be perfect.",
  },
] as const;

const STEPS = [
  {
    number: "01",
    title: "Describe your strategy in plain language.",
    body: "Walk us through your entry, exit, and invalidation conditions. No format required.",
  },
  {
    number: "02",
    title: "Get a structured playbook and setup library.",
    body: "We formalize your input into a versioned set of rules and a visual library you own.",
  },
  {
    number: "03",
    title: "Train your execution against your own rules.",
    body: "Short daily sessions test your setup recognition and rule recall — scored against your playbook.",
  },
] as const;

const FEATURES = [
  {
    label: "Playbook",
    title: "Your strategy, formalized.",
    body: "A versioned, structured set of rules extracted from your own words. Organized by entry, exit, invalidation, and risk. Always current.",
    stat: "14 rules · v2",
  },
  {
    label: "Setup Library",
    title: "See your strategy, don't just remember it.",
    body: "A visual library of named setups with annotated screenshots. Valid and invalid examples. What to take and what to skip.",
    stat: "8 setups · 24 examples",
  },
  {
    label: "Training",
    title: "Be tested against your own playbook.",
    body: "Short sessions that challenge your setup recognition and rule recall. Scored honestly. Feedback points to the exact rule you missed.",
    stat: "7 / 10 · last session",
  },
] as const;

const fadeUp = {
  initial:    { opacity: 0, y: 12 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.25, ease: "easeOut" as const },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-base text-primary">

      {/* ── Nav ── */}
      <header className="sticky top-0 z-10 border-b border-border bg-base/90 backdrop-blur-sm">
        <div className="max-w-[1100px] mx-auto px-8 h-14 flex items-center justify-between">
          <span className="text-[15px] font-bold tracking-tight">Trader</span>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/sign-up">
              <Button variant="primary" size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-[1100px] mx-auto px-8 pt-24 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" as const }}
          className="max-w-[680px]"
        >
          <h1 className="text-[42px] font-bold tracking-tightest leading-[1.1] text-primary mb-5">
            Your strategy lives in your head.
            <br />
            <span className="text-secondary">It shouldn&apos;t.</span>
          </h1>
          <p className="text-[16px] text-secondary leading-relaxed mb-8 max-w-[520px]">
            Teach the platform your strategy. Get a structured playbook, a visual setup library,
            and training that makes your rules automatic.
          </p>
          <div className="flex items-center gap-3">
            <Link href="/sign-up">
              <Button variant="primary" size="lg">
                Start building your playbook
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" size="lg">
                View demo
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <Separator />

      {/* ── Problems ── */}
      <section className="max-w-[1100px] mx-auto px-8 py-20">
        <motion.div {...fadeUp} className="mb-10">
          <p className="label-section">The problem</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PROBLEMS.map((p, i) => (
            <motion.div
              key={p.heading}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.07, ease: "easeOut" as const }}
              className="flex flex-col gap-2"
            >
              <p className="text-[14px] font-semibold text-primary tracking-tight">{p.heading}</p>
              <p className="text-[13px] text-secondary leading-relaxed">{p.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <Separator />

      {/* ── How it works ── */}
      <section className="max-w-[1100px] mx-auto px-8 py-20">
        <motion.div {...fadeUp} className="mb-10">
          <p className="label-section">How it works</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.07, ease: "easeOut" as const }}
              className="flex flex-col gap-3"
            >
              <span className="stat-md text-muted">{step.number}</span>
              <p className="text-[14px] font-semibold text-primary tracking-tight">{step.title}</p>
              <p className="text-[13px] text-secondary leading-relaxed">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <Separator />

      {/* ── Features ── */}
      <section className="max-w-[1100px] mx-auto px-8 py-20">
        <motion.div {...fadeUp} className="mb-10">
          <p className="label-section">What you get</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.07, ease: "easeOut" as const }}
              className="card-surface p-6 flex flex-col gap-3"
            >
              <p className="label-section">{f.label}</p>
              <p className="text-[15px] font-semibold text-primary tracking-tight">{f.title}</p>
              <p className="text-[13px] text-secondary leading-relaxed flex-1">{f.body}</p>
              <p className="rule-text text-muted pt-2 border-t border-border">{f.stat}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <Separator />

      {/* ── Final CTA ── */}
      <section className="max-w-[1100px] mx-auto px-8 py-20">
        <motion.div
          {...fadeUp}
          className="flex flex-col items-start gap-5"
        >
          <p className="text-[16px] text-secondary leading-relaxed max-w-[480px]">
            Stop trading against your own rules. Build the system that trains you to follow them.
          </p>
          <Link href="/sign-up">
            <Button variant="primary" size="lg">
              Start building your playbook
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border">
        <div className="max-w-[1100px] mx-auto px-8 h-14 flex items-center justify-between">
          <span className="text-[12px] font-bold tracking-tight text-muted">Trader</span>
          <span className="text-[11px] text-muted">Strategy training platform. Not financial advice.</span>
        </div>
      </footer>
    </div>
  );
}
