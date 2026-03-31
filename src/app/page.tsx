"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const PROBLEMS = [
  {
    heading: "You know your rules. You break them anyway.",
    body: "Execution fails under pressure — not from ignorance. The gap is between knowing and doing.",
  },
  {
    heading: "Your setups live in your memory.",
    body: "Without a structured visual library, pattern recognition degrades every time you sit down.",
  },
  {
    heading: "Reviews measure P&L. Not discipline.",
    body: "A winning trade can be poor execution. A loss can be perfect. The wrong metric hides the problem.",
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
    body: "We formalize it into a versioned set of rules and a visual library of examples you own.",
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
    body: "A versioned, structured set of rules extracted from your own words. Organized by entry, exit, invalidation, and risk. Editable. Always current.",
  },
  {
    label: "Setup Library",
    title: "See your strategy. Don't just remember it.",
    body: "A visual library of named setups with annotated screenshots. Valid and invalid examples. What to take. What to skip.",
  },
  {
    label: "Training",
    title: "Be tested against your own playbook.",
    body: "Short sessions that challenge your setup recognition and rule recall. Scored honestly. Feedback references the exact rule you missed.",
  },
] as const;

function fadeIn(delay = 0) {
  return {
    initial:    { opacity: 0, y: 10 },
    animate:    { opacity: 1, y: 0 },
    transition: { duration: 0.25, delay, ease: "easeOut" as const },
  };
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-base text-primary">

      {/* ── Nav ── */}
      <header className="sticky top-0 z-10 border-b border-border bg-base/95 backdrop-blur-sm">
        <div className="max-w-[1060px] mx-auto px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-sm bg-[var(--accent-dim)] border border-[rgba(201,168,76,0.25)] flex items-center justify-center">
              <span className="rule-text text-accent" style={{ fontSize: 10, fontWeight: 700 }}>T</span>
            </div>
            <span className="text-[14px] font-semibold tracking-tight">Trader</span>
          </div>
          <div className="flex items-center gap-2">
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
      <section className="max-w-[1060px] mx-auto px-8 pt-24 pb-24">
        <motion.div {...fadeIn()} className="max-w-[620px]">

          {/* Product label */}
          <div className="product-badge mb-7">
            <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
            <span className="label-section" style={{ color: "var(--text-secondary)" }}>
              AI Strategy Training Platform
            </span>
          </div>

          <h1
            className="font-bold text-primary mb-5 leading-[1.08]"
            style={{ fontSize: 48, letterSpacing: "-0.035em" }}
          >
            Your strategy lives
            <br />
            in your head.{" "}
            <span className="text-secondary">It shouldn&apos;t.</span>
          </h1>

          <p className="text-[15px] text-secondary leading-relaxed mb-8 max-w-[480px]">
            Teach the platform your strategy. Get a structured playbook, a visual setup
            library, and training that makes following your own rules automatic.
          </p>

          <div className="flex items-center gap-3">
            <Link href="/sign-up">
              <Button variant="primary" size="lg">
                Start building your playbook
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" size="lg">View demo</Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Divider ── */}
      <div className="border-t border-border" />

      {/* ── Problems ── */}
      <section className="max-w-[1060px] mx-auto px-8 py-20">
        <motion.p {...fadeIn()} className="label-section mb-8">The problem</motion.p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PROBLEMS.map((p, i) => (
            <motion.div
              key={p.heading}
              {...fadeIn(i * 0.06)}
              className="card-surface p-5 flex flex-col gap-2.5"
            >
              <p className="text-[13px] font-semibold text-primary tracking-tight leading-snug">{p.heading}</p>
              <p className="text-[12px] text-secondary leading-relaxed">{p.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="border-t border-border" />

      {/* ── How it works ── */}
      <section className="max-w-[1060px] mx-auto px-8 py-20">
        <motion.p {...fadeIn()} className="label-section mb-8">How it works</motion.p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {STEPS.map((step, i) => (
            <motion.div key={step.number} {...fadeIn(i * 0.06)} className="flex flex-col gap-3">
              <span
                className="font-mono font-bold text-accent leading-none"
                style={{ fontSize: 13, letterSpacing: "0.04em" }}
              >
                {step.number}
              </span>
              <p className="text-[14px] font-semibold text-primary tracking-tight leading-snug">{step.title}</p>
              <p className="text-[12px] text-secondary leading-relaxed">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="border-t border-border" />

      {/* ── Features ── */}
      <section className="max-w-[1060px] mx-auto px-8 py-20">
        <motion.p {...fadeIn()} className="label-section mb-8">What you get</motion.p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.label}
              {...fadeIn(i * 0.06)}
              className="card-surface p-5 flex flex-col gap-3"
            >
              <p className="label-section">{f.label}</p>
              <p className="text-[14px] font-semibold text-primary tracking-tight leading-snug">{f.title}</p>
              <p className="text-[12px] text-secondary leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="border-t border-border" />

      {/* ── Final CTA ── */}
      <section className="max-w-[1060px] mx-auto px-8 py-20">
        <motion.div {...fadeIn()} className="max-w-[540px] flex flex-col gap-5">
          <h2
            className="font-bold text-primary leading-tight"
            style={{ fontSize: 26, letterSpacing: "-0.025em" }}
          >
            Stop trading against your own rules.
          </h2>
          <p className="text-[14px] text-secondary leading-relaxed">
            Build the system that trains you to follow them.
            Takes 15 minutes to set up. Works against your strategy, not a generic one.
          </p>
          <Link href="/sign-up">
            <Button variant="primary" size="lg">Start building your playbook</Button>
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border">
        <div className="max-w-[1060px] mx-auto px-8 h-14 flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-tight text-muted">Trader</span>
          <span className="text-[11px] text-muted">Strategy training platform · Not financial advice.</span>
        </div>
      </footer>

    </div>
  );
}
