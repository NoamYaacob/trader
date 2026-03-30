# DESIGN.md — UX and Visual System

Visual and UX reference for the AI Strategy Training Platform. Sections will be added in approved batches. All implementation must conform to the approved sections of this document.

---

## Part 1 — Visual Direction, Design Principles, UX Principles, Style Directions

---

## Visual Direction

The product is a **professional instrument for serious traders**. The visual language must communicate that immediately — not through decoration, but through restraint, precision, and confidence.

The reference point is not a consumer app. It is closer to a Bloomberg terminal reimagined with modern typography and interaction design, or a Figma-caliber tool built for a specific professional audience. The trader should feel, on first load, that this was designed for someone with high standards — not for a general audience.

**The product must look like it was built by people who trade, not people who sell trading products.**

Key visual characteristics:
- Dark, near-black backgrounds with subtle surface layering
- A single, deliberate accent color used sparingly — never decorative
- Low border radius throughout — sharp corners signal precision and seriousness
- Typography-first — information is communicated through text hierarchy, not icons or illustrations
- Monospace numerics — every score, count, percentage, and stat renders in a fixed-width font
- Borders define structure, not shadows — this keeps the palette coherent and avoids the "floating card" look of generic dashboards
- High density is acceptable where it adds clarity — but only where it adds clarity

**What this is not:** It is not a trading platform with live charts. It is not a crypto product (no neon, no gradients-as-identity, no glow effects). It is not a productivity SaaS (no blue primary buttons, no rounded-everything, no confetti). It is not a trading journal (no calendar grids, no P&L charts). It is a training environment, and it should feel serious and focused.

---

## Design Principles

**1. Precision over decoration**
Every visual element must earn its place. If something can be removed without losing meaning, remove it. Borders, spacing, and type hierarchy do more work than color or illustration.

**2. The trader is the authority**
The interface defers to the trader's content. Playbook rules, setup names, and strategy text should dominate visually — not platform chrome, branding, or UI furniture. The product's job is to present the trader's own strategy back to them with clarity.

**3. Information has a rank**
Every screen has one primary piece of information. Everything else is subordinate. The visual hierarchy must make the primary element immediately obvious — the score on a results screen, the rule on a training prompt, the action on the dashboard.

**4. Contrast is intentional**
Use contrast — size, weight, color — to signal importance. Do not apply high-contrast styling to secondary information. The accent color appears only on interactive elements and single highlights per screen. It is never used for decoration.

**5. Sharp edges signal precision**
Border radius stays low (2–4px). Rounded corners are soft, approachable, casual. This product is none of those things. The slight sharpness throughout should feel deliberate, not harsh.

**6. Numbers are special**
Every number — score, count, percentage, adherence score — is rendered in a monospace or tabular-figures typeface. Numbers that live in a context of text get this treatment automatically. Stats that stand alone get larger, heavier treatment. Numerics are a design element here, not just data.

**7. Density is earned**
A screen can be dense when the user is ready for it (playbook rules list, training prompt with checklist). A screen should be open and focused when the user is performing (training session, strategy intake). Density is a function of context, not a stylistic choice.

**8. Never surprise the user**
Transitions should be fast and purposeful. State changes should be clear. Nothing should appear or disappear unexpectedly. The product should feel stable and trustworthy, not clever.

---

## UX Principles

**1. One primary action per screen**
Every screen has a single most-important next action. It is visually distinct from secondary actions. Secondary actions are always available but never compete for attention.

**2. The user's work is never at risk**
Strategy input is auto-saved incrementally. No form should ever result in lost data on page refresh or session expiry. If a destructive action is possible, it requires explicit confirmation.

**3. Onboarding is the first product experience — treat it accordingly**
The strategy intake and initial playbook review are the first real interactions. They must be polished, unhurried, and respectful of what the trader is trying to accomplish. No skipping, no vague prompts, no wall-of-text forms.

**4. Progress is always visible**
Multi-step flows (onboarding, training session) always show the user where they are. A progress indicator is never a percentage — it is a position ("Step 2 of 4", "Prompt 3 of 8").

**5. Feedback is immediate and honest**
After a training response is submitted, the feedback appears immediately. It is direct: the correct answer is shown, the reasoning is stated, the rule is referenced. No softening language.

**6. Empty states are prompts, not apologies**
An empty setup library does not say "Looks like you haven't added any setups yet!" It says "No setups yet." followed by what to do. The platform never apologizes for being empty — it directs.

**7. Complexity is hidden until needed**
Advanced options, version history, rule editing — these are accessible but not prominent. The main flow (train, review, view playbook) stays clean. Power features are one level deep.

**8. Mobile is not a priority — but nothing should break**
V1 is a desktop-first product. Traders use this on a screen at a desk. The layout is designed for 1280px+. Responsiveness at tablet and mobile is handled defensively (nothing breaks, content is readable) but not optimized.

**9. The product never makes the trader feel bad**
No red-dominant failure screens. No streak anxiety ("You haven't trained in 3 days!"). No percentage scores displayed as grades. Scores are data, not judgments. The product is a tool, not a coach with an agenda.

**10. Navigation is always predictable**
The sidebar nav is always visible (in the app shell). Active state is always clear. The user can navigate anywhere from anywhere within the app. No dead ends, no forced flows after onboarding is complete.

---

## Three Visual Style Directions

Three distinct interpretations of "premium dark, serious trader" — each coherent but different in character.

---

### Direction A — Terminal Precision

**Character:** The trading terminal reimagined. Inspired by the Bloomberg Terminal, Pine Script editor, and professional financial software. Monospace-heavy. Amber accent. Extremely grid-like and structured.

**Palette:**
- Background: `#0a0a0a` (near-true black)
- Surface: `#111111`
- Elevated: `#191919`
- Accent: `#e8a838` (amber — terminal glow)
- Text primary: `#e8e8e0` (slightly warm white)
- Text secondary: `#666660`
- Border: `#1e1e1e`

**Typography:** Primary: `JetBrains Mono` or similar monospace for all UI text — headings, labels, everything. The monospace is the identity.

**Border radius:** 0–2px. Nearly square everywhere.

**Mood:** Utilitarian, nostalgic-professional, hacker-respectable. Feels like a tool built by quants.

**Risk:** Can read as retro or overly developer-aesthetic. Monospace everywhere is fatiguing for long reading. May not feel premium to traders who equate premium with polish.

---

### Direction B — Dark Professional

**Character:** The modern fintech design system. Inspired by Linear, Vercel, and high-end B2B SaaS. Slate/navy undertones. Sharp blue accent. Clean geometric sans-serif. Highly legible and systematic.

**Palette:**
- Background: `#0f1117` (dark navy-black)
- Surface: `#161b27`
- Elevated: `#1d2333`
- Accent: `#4d7cfe` (sharp blue)
- Text primary: `#e8eaf0`
- Text secondary: `#7882a0`
- Border: `#222840`

**Typography:** Primary: `Inter`. Monospace: `IBM Plex Mono` for numbers.

**Border radius:** 4–6px. Clean but not soft.

**Mood:** Confident, modern, professional. Feels like a serious B2B tool.

**Risk:** A saturated aesthetic. Many dark SaaS products look like this. Without aggressive customization, it risks being indistinguishable from a dozen other tools. The blue accent is very common.

---

### Direction C — Obsidian Edge ✦ Recommended

**Character:** A premium private instrument. Not a terminal, not a SaaS product — something between a high-end research tool and a serious professional environment. True near-black with neutral undertones. A single gold/amber accent used with extreme restraint. Sans-serif primary with monospace reserved for numerics and rule text.

**Palette:**
- Background: `#0d0d0f` (true near-black, no blue or green tint)
- Surface: `#131316` (2% lighter — cards, panels)
- Elevated: `#1a1a1e` (4% lighter — dropdowns, hover states)
- Overlay: `#222228` (modals, drawers)
- Accent: `#c9a84c` (muted gold — warm, not flashy)
- Accent dim: `rgba(201, 168, 76, 0.10)` (accent tints for backgrounds)
- Text primary: `#f0f0f2` (near-white, neutral)
- Text secondary: `#8a8a96` (mid-gray, legible at small sizes)
- Text muted: `#46464f` (labels, placeholders, disabled)
- Border default: `#1e1e24` (structural, barely visible)
- Border strong: `#2c2c35` (interactive elements, focused cards)
- Status valid: `#3da882` (green — followed, valid)
- Status invalid: `#d95f5f` (red — broken, invalid)
- Status warning: `#c97a3d` (amber — partial, n/a)

**Typography:**
- Primary: `Inter` (display, body, labels)
- Numeric/rule: `JetBrains Mono` (scores, counts, rule text, checklist items)

**Border radius:** 3px standard, 4px for modals/drawers, 2px for tags/badges.

**Mood:** Controlled, precise, expensive-feeling. Like a tool built for someone serious, by people who are serious. Not designed to impress at a glance — designed to earn trust over time.

**Why recommended:**
1. The neutral-black base (no blue, no green tint) is genuinely rare and immediately distinctive.
2. The muted gold accent reads as deliberate wealth and quality, not as crypto-hype (which uses bright yellow or neon).
3. The combination of Inter (readable, modern) + JetBrains Mono (numeric precision) covers both readability and the "numbers feel important" requirement.
4. It avoids all three failure modes: not retro (no full monospace identity), not generic-SaaS (no blue accent, no navy background), not crypto (no neon, no gradients-as-identity).
5. It has room to breathe — the palette is flexible enough to support dense information screens and focused training screens without feeling inconsistent.

---

*Sections 5–9 (Design System, Screen Guidance, Motion/Empty State/Trust Principles) pending approval of this section.*
