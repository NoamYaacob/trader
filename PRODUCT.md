# PRODUCT.md — AI Strategy Training Platform

Product definition document. This is the source of truth for what we are building and why. All implementation decisions must trace back to this document.

---

## Product Thesis

Most traders have an edge — a repeatable, logic-based approach they have developed over time — but that edge lives loosely in their head, not in a structured, trainable form. The gap between knowing a strategy and executing it consistently under real market conditions is where most trading careers stall or fail. This platform solves that gap by turning a trader's own strategy into a structured playbook and setup library, then using that material to actively train their execution, setup recognition, and rule discipline — so that following their own strategy becomes a reflex, not a decision made under pressure.

---

## Core Problem

Traders break their own rules. Not because they do not know them — but because:

1. The rules exist informally, in their head or scattered in notes. They are not structured, testable, or reviewable.
2. There is no system that holds a trader accountable to their own defined criteria before, during, or after a trade.
3. Pattern recognition for valid setups degrades under live market conditions. Without deliberate training, the brain fills in gaps with hope or impulse.
4. Post-trade review is passive. Journals record what happened. Nothing trains what should happen next time.

The result: a trader with a good strategy still underperforms because the bottleneck is not knowledge — it is execution fidelity.

---

## Main Promise

**"Teach us your strategy once. We will structure it, build your setup library, and train you to follow it — every session, every trade."**

The product delivers:
- A living, structured playbook built from the trader's own input
- A visual library of valid and invalid setups the trader defines and annotates
- Active training sessions that test setup recognition and rule recall
- Trade review that measures discipline against the playbook, not just P&L

The output the trader feels: fewer impulsive trades, faster valid-setup recognition, and confidence that comes from having a concrete, trained system — not a vague process in their head.

---

## Why This Is Not a Trading Journal

| Trading Journal | This Platform |
|---|---|
| Records what happened | Trains what should happen |
| Passive — you add entries | Active — it challenges you |
| Input is trades | Input is the strategy itself |
| Measures performance (P&L, win rate) | Measures discipline and rule adherence |
| Looks backward | Builds forward — toward internalizing a system |
| Requires data to be useful | Useful from day one, before any trades are logged |
| Makes you a better record-keeper | Makes you a better executor |

A journal tells you that you broke your rules. This platform trains you not to.

---

## V1 MVP Scope

The V1 must prove one thing: **a trader can go from raw strategy description to their first structured training session, and find it genuinely useful.** Everything else is out.

### Included in V1

**1. Strategy Intake**
- A structured onboarding flow where the trader describes their strategy in plain language
- Guided prompts: market/instrument, timeframe, entry conditions, exit conditions, invalidation conditions, risk rules, what makes a setup valid vs invalid
- The input can be free-text, bullet points, or a mix — the system accepts and processes it

**2. AI Playbook Generation**
- The platform processes the strategy input and generates a structured playbook
- Playbook contains: a summary, a list of explicit rules (organized by category), a checklist format for pre-trade validation
- The trader can review, edit, and confirm each rule before the playbook is finalized
- Once approved, the playbook is locked as the source of truth (editable later via explicit revision flow)

**3. Setup Library**
- Trader creates named setups that match their strategy (e.g., "Bull Flag Breakout on 5m", "Opening Range Reclaim")
- Each setup has: name, description, entry/exit/invalidation conditions in plain language
- Trader uploads annotated screenshots as examples — marking what makes the setup valid or invalid
- Setups are tagged as valid or invalid examples
- A clean visual grid/gallery of the setup library

**4. Training Sessions**
- Platform generates training prompts from the setup library and playbook rules
- Session types in V1:
  - **Setup Recognition**: Show a setup image (from their own library), ask the trader to classify it as valid or invalid and explain why
  - **Rule Recall**: Ask the trader to recall a specific rule or checklist item from memory
- Trader answers, platform scores the answer against the playbook and provides feedback
- Session ends with a simple summary: score, rules tested, setups reviewed
- Sessions are short by design: 5–15 prompts

**5. Trade Review (lightweight)**
- After a trade, trader logs: the setup name they took, whether they followed the entry/exit/invalidation rules, a brief note
- Platform scores rule adherence (did they follow their own checklist?)
- No P&L input required. Discipline score is the output, not financial performance.

**6. Core UI**
- Dashboard: playbook status, setup library count, last session score, streak
- Navigation: Playbook, Setup Library, Train, Review
- Dark-mode-first, premium design throughout

---

## Not in V1

These are explicitly excluded from V1. Do not build them, do not stub them, do not design around them.

- Broker integrations or automated trade import
- Live market data, charts, or price feeds
- P&L tracking, financial performance analytics
- Multiple strategies per user (V1 supports one active strategy)
- Social features, leaderboards, sharing
- Mobile app or native experience
- Email or push notifications
- Advanced analytics dashboards (win rate, expectancy, drawdown)
- AI market prediction or signal generation
- Team or coach accounts
- Subscription billing or paywall logic
- Backtesting or replay of historical market data
- Video content or embedded educational material
- Calendar or trade planning tools
- Automated screenshot capture from brokers

---

## Primary User Journey: First Visit to First Training Session

This is the journey V1 must make smooth, fast, and impressive.

```
1. LAND
   Trader arrives at the platform for the first time.
   They see a clear, sharp landing page that communicates the product promise in one sentence.
   They sign up.

2. ONBOARD — STRATEGY INTAKE
   Platform greets them with a focused intake flow.
   Guided prompts ask them to describe their strategy: instrument, timeframe, entry conditions,
   exit conditions, what makes a setup valid, what invalidates it, risk rules.
   This takes 5–15 minutes depending on how developed their strategy is.
   They submit.

3. PLAYBOOK GENERATION
   Platform processes the input and generates a structured playbook.
   Trader sees their strategy reflected back as a clean, organized set of rules and a pre-trade checklist.
   They review each item — they can edit or add rules.
   They confirm and lock the playbook.
   First moment of value: "This is my strategy, formalized."

4. SETUP LIBRARY — FIRST SETUP
   Platform prompts: "Now show me your first setup."
   Trader creates a named setup, describes the conditions, and uploads one or two annotated screenshots.
   They mark what is valid and what is not.
   Setup is saved to their library.

5. FIRST TRAINING SESSION
   Platform invites them to their first training session.
   Session uses the setup they just created and rules from their playbook.
   5–10 prompts. Fast, focused.
   They complete the session and see a score and feedback.
   Second moment of value: "I was tested against my own strategy. I have something to improve."

6. RETURN LOOP
   Dashboard shows streak, last session score, and prompts the next action:
   add more setups, run another session, or review a recent trade.
```

---

## Jobs to Be Done

These are the real reasons a trader opens this product and comes back.

**J1 — Externalize and formalize the strategy**
"When I have a strategy that lives in my head, I want to give it structure and make it concrete, so I can actually follow it consistently."

**J2 — Train setup recognition before going live**
"When I am preparing to trade a new setup, I want to train my eye on real examples so that I can recognize it instantly in the market without second-guessing."

**J3 — Validate a setup before entering a trade**
"When I am about to take a trade, I want a fast way to check it against my rules so that I do not enter setups that do not qualify."

**J4 — Measure discipline separately from performance**
"When I review my trading, I want to know whether I followed my rules — not just whether I made money — so I can separate execution quality from market randomness."

**J5 — Rebuild consistency after a losing streak**
"When I am in a drawdown, I want to reconnect with my strategy and retrain my execution so I stop making impulsive deviations."

**J6 — Build a permanent, evolving strategy system**
"When my strategy improves over time, I want to update my playbook and have the training reflect those updates so the system grows with me."

---

## Key Entities

These are the core domain objects in the system. These terms are authoritative — use them in all code, types, and database schemas.

### User
A registered trader. Has one active Strategy in V1.

### Strategy
The trader's raw description of their trading approach. The unstructured input that feeds the Playbook. Contains: free-text description, guided-field responses (instrument, timeframe, conditions), status (draft / active / archived).

### Playbook
The AI-generated, trader-confirmed structured version of the Strategy. Contains a summary, an ordered list of Rules, and a pre-trade checklist. Has a version number — when edited, a new version is created. Status: draft / confirmed.

### Rule
A single, discrete constraint or condition extracted from the Strategy and formalized in the Playbook. Has: text, category (entry / exit / invalidation / risk / mindset), whether it appears in the pre-trade checklist, and source (AI-generated or trader-added).

### Setup
A specific, named, repeatable trade configuration that is valid according to the Playbook. Has: name, description, entry condition, exit condition, invalidation condition, tags. Belongs to the Playbook.

### SetupExample
An annotated screenshot attached to a Setup. Has: image URL, annotation data (regions, labels), classification (valid or invalid example), and optional notes. Multiple examples per Setup.

### TrainingSession
A single completed training event. Has: type (setup-recognition / rule-recall), date, number of prompts, score, duration. Belongs to a User.

### TrainingPrompt
A single question within a TrainingSession. Has: type, reference to a Setup or Rule being tested, the question presented, expected answer (from the Playbook).

### TrainingResponse
The trader's answer to a TrainingPrompt. Has: response text or classification, correctness (scored by platform), confidence level (optional self-report), feedback generated.

### TradeReview
A post-trade self-assessment. Has: setup name used, list of rules assessed (followed / not followed / not applicable), optional notes, rule adherence score, date. No P&L fields in V1.

---

## Required Data Model Summary

What we must store in V1, by entity:

```
User
  - id, email, name, created_at, updated_at

Strategy
  - id, user_id
  - instrument (text), timeframe (text)
  - description (long text — free form input)
  - entry_conditions (text), exit_conditions (text)
  - invalidation_conditions (text), risk_rules (text)
  - what_makes_valid (text), what_makes_invalid (text)
  - status: draft | submitted | processed
  - created_at, updated_at

Playbook
  - id, user_id, strategy_id
  - version (integer)
  - summary (text)
  - status: draft | confirmed
  - created_at, confirmed_at

Rule
  - id, playbook_id
  - text (string)
  - category: entry | exit | invalidation | risk | mindset
  - in_checklist (boolean)
  - source: ai_generated | trader_added
  - order (integer)
  - created_at

Setup
  - id, playbook_id, user_id
  - name (string)
  - description (text)
  - entry_condition (text)
  - exit_condition (text)
  - invalidation_condition (text)
  - tags (string array)
  - created_at, updated_at

SetupExample
  - id, setup_id
  - image_url (string)
  - annotation_data (JSON — regions, labels, colors)
  - classification: valid | invalid
  - notes (text, optional)
  - created_at

TrainingSession
  - id, user_id
  - type: setup_recognition | rule_recall
  - prompt_count (integer)
  - correct_count (integer)
  - score (float 0–1)
  - duration_seconds (integer)
  - created_at

TrainingPrompt
  - id, session_id
  - type: setup_recognition | rule_recall
  - setup_example_id (nullable FK)
  - rule_id (nullable FK)
  - question_text (text)
  - expected_answer (text)
  - order (integer)

TrainingResponse
  - id, prompt_id, session_id
  - response_text (text)
  - classification (nullable: valid | invalid — for setup recognition)
  - is_correct (boolean)
  - feedback (text — generated)
  - confidence: low | medium | high (optional)
  - created_at

TradeReview
  - id, user_id
  - setup_name (string — free text reference, not FK in V1)
  - notes (text, optional)
  - adherence_score (float 0–1)
  - traded_at (date)
  - created_at

TradeReviewRuleEntry
  - id, trade_review_id, rule_id
  - result: followed | not_followed | not_applicable
  - note (text, optional)
```

---

*End of product definition. Awaiting approval before any implementation begins.*
