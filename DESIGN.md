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

---

## Part 2 — Layout System, Typography, Component Patterns, Motion, Empty States, Trust, shadcn Customization

---

## Layout System

### Base unit
All spacing is derived from an **8px base unit**. Values in use: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80. No arbitrary values.

### App shell
```
┌──────────────────────────────────────────────────────┐
│ Sidebar (240px fixed) │ Content area (fills remaining) │
│                       │                                │
│  Logo / wordmark      │  Page header (optional, 52px) │
│  ─────────────────    │  ──────────────────────────── │
│  Nav section label    │                                │
│  Nav item             │  Page content                  │
│  Nav item (active)    │                                │
│  Nav item             │                                │
│                       │                                │
└──────────────────────────────────────────────────────┘
```

- **Sidebar:** 240px, fixed, never collapsible in V1
- **Content area:** fills remaining viewport width
- **Max content width:** depends on screen type (see below)
- **Page padding:** 32px horizontal, 32px top

### Content width by screen type

| Screen type | Max content width | Rationale |
|---|---|---|
| Focused single-column (intake, trade review) | 640px centered | Keeps forms readable and unhurried |
| Standard content (playbook, training session) | 800px centered | Comfortable reading width |
| Grid views (setup library, dashboard) | 1100px | Allows 3-column grid without compression |
| Full-width reference (playbook with checklist panel) | unconstrained, 2-column split | Sidebar panel needs room |

### Grid
- **Grid columns:** 12, gap 24px
- Used explicitly only in dashboard and setup library
- All other screens use single-column or named two-column layouts, not a generic grid

### Z-index scale
```
base content:   0
sticky headers: 10
dropdowns:      20
drawers:        30
modals:         40
toasts:         50
```

---

## Typography Hierarchy

### Typefaces
- **UI:** `Inter` — all body text, headings, labels, nav
- **Numeric / rule text:** `JetBrains Mono` — scores, counts, percentages, rule items, checklist items, any stat that stands alone

Both loaded via `next/font`. No CDN, no Flash of Unstyled Text.

### Scale

| Role | Size | Weight | Tracking | Typeface | Usage |
|---|---|---|---|---|---|
| Display | 36px | 700 | −0.03em | Inter | Landing page hero only |
| Heading 1 | 28px | 600 | −0.025em | Inter | Page titles |
| Heading 2 | 22px | 600 | −0.02em | Inter | Section headings, modal titles |
| Heading 3 | 17px | 600 | −0.015em | Inter | Card headings, panel titles |
| Body | 14px | 400 | −0.01em | Inter | Primary content, paragraph text |
| Small | 13px | 400 | −0.005em | Inter | Secondary content, form labels, nav items |
| Caption | 11px | 400 | +0.02em | Inter | Timestamps, metadata |
| Label | 11px | 500 | +0.08em | Inter | Uppercase section labels, category tags |
| Stat — large | 32px | 700 | 0 | JetBrains Mono | Session scores, primary dashboard numbers |
| Stat — medium | 22px | 600 | 0 | JetBrains Mono | Counts, secondary stats |
| Stat — small | 14px | 500 | 0 | JetBrains Mono | Inline numbers, percentages in text |
| Rule text | 13px | 400 | 0 | JetBrains Mono | Playbook rules, checklist items |

### Line height
- Headings: 1.2
- Body: 1.6
- Rule/mono text: 1.5
- Captions and labels: 1.4

### What never changes
- Text is never bold inside body copy for emphasis — use a separate semantic element with `text-secondary` coloring instead
- Rule text is always `JetBrains Mono`, even when it appears in a small context
- Scores and stats are never in Inter — not even at small sizes

---

## Surface System

Five distinct surface levels. Never skip a level or add a sixth.

| Level | Token | Hex | Used for |
|---|---|---|---|
| Base | `--bg-base` | `#0d0d0f` | Page background, sidebar background |
| Surface | `--bg-surface` | `#131316` | Cards, panels, section containers |
| Elevated | `--bg-elevated` | `#1a1a1e` | Dropdowns, hover fills, active nav items |
| Overlay | `--bg-overlay` | `#222228` | Modals, drawers, popovers |
| Inset | `--bg-inset` | `#0a0a0c` | Input backgrounds, code blocks, read-only fields |

### Borders

| Token | Hex | Used for |
|---|---|---|
| `--border-default` | `#1e1e24` | Structural borders — cards, sidebar, dividers |
| `--border-strong` | `#2c2c35` | Interactive element borders — inputs, buttons (secondary), focused cards |
| `--border-focus` | `#c9a84c` | Focus state — inputs, interactive elements |

Borders define surfaces. Shadows do not. No `box-shadow` on cards or panels. The dark-on-dark palette makes border-based definition cleaner and more precise than shadow-based.

---

## Card Pattern

```
Background:  --bg-surface (#131316)
Border:      1px solid --border-default (#1e1e24)
Radius:      3px
Padding:     20px (compact) | 24px (standard)
Shadow:      none
```

### Interactive card (clickable)
Same as above, plus:
```
Hover border:     --border-strong (#2c2c35)
Hover transform:  translateY(-1px)
Transition:       border-color 150ms, transform 150ms
Cursor:           pointer
```

### Highlighted card (active / selected)
```
Border:           1px solid rgba(201, 168, 76, 0.35)
Background tint:  rgba(201, 168, 76, 0.04)
```

### Stat card (dashboard blocks)
```
Same base as card
Internal layout: label (caption, text-secondary) above stat (large mono)
No interactive state
```

---

## Button Pattern

### Sizes

| Size | Height | H-padding | Font size |
|---|---|---|---|
| sm | 28px | 12px | 12px |
| default | 34px | 16px | 13px |
| lg | 40px | 20px | 14px |

All buttons: `border-radius: 3px`, `font-weight: 600`, `letter-spacing: -0.01em`, `transition: 150ms`.

### Variants

**Primary**
```
Background:       --accent (#c9a84c)
Text:             #0d0d0f (near-black — high contrast on gold)
Border:           none
Hover background: #d4b45c
Active:           #bfa045
Focus:            outline: 2px solid rgba(201, 168, 76, 0.4), offset 2px
```

**Secondary**
```
Background:       transparent
Border:           1px solid --border-strong (#2c2c35)
Text:             --text-primary (#f0f0f2)
Hover background: --bg-elevated (#1a1a1e)
Hover border:     --border-focus (#c9a84c) — very intentional: hovering a secondary approaches commitment
```

**Ghost**
```
Background:       transparent
Border:           none
Text:             --text-secondary (#8a8a96)
Hover text:       --text-primary
Hover background: --bg-elevated (#1a1a1e)
```

**Destructive**
```
Background:       transparent
Border:           1px solid rgba(217, 95, 95, 0.30)
Text:             --status-invalid (#d95f5f)
Hover background: rgba(217, 95, 95, 0.08)
```

### Icon button
```
Size:    32×32px
Style:   ghost variant
Radius:  3px
```

### Rules
- One primary button per screen section. Never two primary buttons adjacent to each other.
- Destructive actions are always ghost or destructive variant — never primary.
- Loading state: replace label with a subtle spinner (12px), disable button — never change button size.

---

## Input Pattern

**Text input and select**
```
Background:    --bg-inset (#0a0a0c)
Border:        1px solid --border-default (#1e1e24)
Height:        34px
Radius:        3px
Font:          13px Inter, --text-primary
Placeholder:   --text-muted (#46464f)
Padding:       0 12px

Focus:
  border-color: --border-focus (#c9a84c)
  NO box-shadow ring — border color change only
  outline: none

Error:
  border-color: --status-invalid (#d95f5f)
```

**Textarea**
```
Same as input
Min-height:    120px
Resize:        vertical only
Line-height:   1.6
Padding:       10px 12px
```

**Label**
```
Font:          12px Inter, weight 500
Color:         --text-secondary
Margin-bottom: 6px
Letter-spacing: 0
(NOT uppercase — uppercase labels are for nav/category sections, not form labels)
```

**Helper text / error message**
```
Font:    12px Inter
Color:   --text-muted (helper) | --status-invalid (error)
Margin:  6px top
```

**Checkbox and toggle**
- Checkbox: 14×14px, radius 2px, unchecked border `--border-strong`, checked fill `--accent`
- Toggle: standard shadcn but recolored — track uses `--bg-elevated` unchecked, `--accent` checked. No rounded pill on the handle.

---

## Drawer Pattern

Right-side drawer. Used for: setup detail, example viewer, rule editing, session configuration.

```
Width:          480px (compact) | 560px (standard)
Background:     --bg-overlay (#222228)
Left border:    1px solid --border-default
Left radius:    0 (flush against viewport right edge)
Right radius:   0
Overlay:        rgba(0, 0, 0, 0.55)
```

**Internal structure**
```
Header (56px):
  padding: 0 24px
  border-bottom: 1px solid --border-default
  title: Heading 3
  close button: ghost icon button, right-aligned

Content:
  padding: 24px
  overflow-y: auto

Footer (if actions, 64px):
  padding: 0 24px
  border-top: 1px solid --border-default
  sticky bottom
  layout: secondary action left, primary action right
```

---

## Navigation Pattern

### Sidebar
```
Width:     240px, fixed left
BG:        --bg-base (#0d0d0f) — same as page, no visual separation
Border:    1px solid --border-default on the right edge only
```

**Logo area**
```
Height:    56px
Padding:   0 16px
Content:   wordmark text only — no icon, no logo graphic in V1
Font:      15px Inter, weight 700, --text-primary
```

**Section label**
```
Font:      11px Inter, weight 500, uppercase, letter-spacing 0.10em
Color:     --text-muted (#46464f)
Padding:   16px 16px 6px
```

**Nav item**
```
Height:    34px
Padding:   0 12px
Font:      13px Inter, weight 400
Color:     --text-secondary (#8a8a96)
Radius:    3px (on the item itself, inset 4px from edges)

Hover:
  color:      --text-primary
  background: --bg-elevated (#1a1a1e)

Active:
  color:      --text-primary
  background: rgba(201, 168, 76, 0.08)  ← accent-dim
  left border: 2px solid --accent (#c9a84c)
  padding-left: 10px  ← compensate for border
```

No icons in V1. Text only. This forces the nav to be meaningful through words, not glyphs.

### Top bar (contextual, within content area)
Used in pages that need a title and page-level actions:
```
Height:        52px
Border-bottom: 1px solid --border-default
Layout:        page title (Heading 1 size, weight 600) left | actions right
Background:    --bg-base (transparent over page bg)
```

---

## Motion Principles

All animation via **Framer Motion**. No CSS keyframes on UI elements.

### Timings

| Interaction type | Duration | Easing |
|---|---|---|
| Micro (hover, toggle, focus) | 120–150ms | ease-out |
| Element enter/exit | 180–220ms | ease-out |
| Page transition | 200ms | ease-out |
| Drawer open | 220ms | ease-out |
| Drawer close | 180ms | ease-in |
| Score count-up | 600ms | cubic-bezier(0.16, 1, 0.3, 1) — fast-start, slow-finish |
| Progress bar fill | 300ms | ease-out |

### Standard patterns

**Page enter** (apply to the page content wrapper)
```
initial:  { opacity: 0, y: 6 }
animate:  { opacity: 1, y: 0 }
duration: 200ms, ease-out
```

**Card hover lift** (interactive cards only)
```
whileHover: { y: -1 }
transition: { duration: 0.15 }
```

**Training prompt advance** (one prompt to the next)
```
Exiting prompt:  x: 0 → -24px, opacity: 1 → 0
Entering prompt: x: 24px → 0, opacity: 0 → 1
Duration: 180ms, ease-out
```

**Correct / incorrect reveal**
```
Answer container background: pulse to status color then settle
Duration: 400ms, ease-in-out
```

### What does NOT animate
- Sidebar navigation (instant)
- Table row updates or list reorders
- Tooltips (short delay, then instant appear)
- Any element that updates more than once per second
- Loading skeletons (they pulse, but that is a CSS animation, not Framer)

### Spring physics
Only used on direct user gestures (dragging annotation regions on setup examples). Never on data-driven UI state changes.

---

## Empty State Principles

No illustrations. No mascots. No large centered icons. No apologetic language.

### Structure
```
Title:       Declarative, ends with a period. "No setups yet."
Description: Optional. One sentence: what this section does when full.
Action:      One primary CTA button.
Ghost:       Optional: a dim, desaturated preview of what the filled state looks like.
             Never interactive. Only present when it genuinely helps.
```

### Tone
Direct and expectant. Not apologetic, not encouraging, not playful.

| Screen | Empty state title | Description | CTA |
|---|---|---|---|
| Setup library | No setups yet. | Build your library by naming and documenting your trade setups. | Add first setup |
| Training hub | Nothing to train on yet. | Add at least one setup with an annotated example to begin training. | Go to setup library |
| Trade review history | No reviews logged. | After your next trade, log it here to measure rule adherence. | Log trade review |
| Playbook | No confirmed playbook. | Complete your strategy intake to generate your playbook. | Complete intake |
| Dashboard (no session) | No sessions yet. | — | Start training |

### Sizing
Empty states live within the natural content flow — not full-screen centered. They occupy the space where content would be. Max-width matches the section they live in.

---

## Trust-Building UI Principles

The trader is trusting this product with their strategy and their professional self-assessment. The UI must reflect that.

**1. Label the source of every rule**
Every rule in the playbook shows its source: `AI-generated` or `Trader-added`. Never collapse this into a uniform list. The trader must know what the AI produced versus what they wrote.

**2. Show playbook version and confirmation date**
The playbook header always shows: `Version 2 · Confirmed March 28, 2026`. This signals that the document has history and is the result of deliberate action, not just a snapshot.

**3. Adherence score is always explained**
Never show a score as a percentage without context. Show: `8 of 10 rules followed`. The number is auditable against the rule list below it.

**4. Training sessions record the playbook version they ran against**
If the trader later views an old session, they can see it was scored against Version 1 of the playbook. This creates an honest audit trail.

**5. AI-generated content is visually distinguishable**
AI-generated text (playbook summary, feedback in training, generated rules) carries a subtle label — not a banner, just a quiet `AI` badge in `text-muted` at the element level. The trader always knows what came from the system and what came from them.

**6. Destructive actions require typed confirmation**
Deleting a setup, archiving a playbook, or clearing training history requires the trader to type a confirmation string. Not a checkbox, not just a modal button. The friction is the point.

**7. Nothing disappears silently**
Archived playbooks are accessible in version history. Deleted setups show a brief "Undo" toast (5 seconds). The product never silently removes the trader's work.

**8. No manufactured urgency**
No streak counters with flame emojis. No "You haven't trained in 3 days" push notifications. No progress bars designed to induce anxiety. Metrics are data, not pressure.

---

## shadcn Customization

The goal is that nothing in the final product looks like stock shadcn. These changes achieve that.

### 1. CSS variables in `globals.css`
Replace the entire shadcn default palette with Obsidian Edge tokens. shadcn reads from `--background`, `--foreground`, `--primary`, `--muted`, `--border`, etc. Map each to the design system:

```css
:root {
  --background:        13 13 15;     /* #0d0d0f */
  --foreground:        240 240 242;  /* #f0f0f2 */
  --card:              19 19 22;     /* #131316 */
  --card-foreground:   240 240 242;
  --popover:           34 34 40;     /* #222228 */
  --popover-foreground: 240 240 242;
  --primary:           201 168 76;   /* #c9a84c */
  --primary-foreground: 13 13 15;
  --secondary:         26 26 30;     /* #1a1a1e */
  --secondary-foreground: 240 240 242;
  --muted:             26 26 30;
  --muted-foreground:  138 138 150;  /* #8a8a96 */
  --accent:            26 26 30;
  --accent-foreground: 240 240 242;
  --destructive:       217 95 95;    /* #d95f5f */
  --destructive-foreground: 240 240 242;
  --border:            30 30 36;     /* #1e1e24 */
  --input:             10 10 12;     /* #0a0a0c */
  --ring:              201 168 76;   /* accent — focus ring color */
  --radius:            0.1875rem;    /* 3px */
}
```

### 2. Border radius — the single highest-impact change
Setting `--radius: 0.1875rem` (3px) propagates through all shadcn components. This alone eliminates the default rounded-12px softness that makes shadcn feel like a consumer product.

### 3. Button — remove box-shadow, fix focus ring
shadcn's default Button adds a `ring-offset` focus that looks out of place in a dark theme. Override it:
- Remove `ring-offset-background` from focus styles
- Replace with `outline: 2px solid rgba(201, 168, 76, 0.5)` at 2px offset
- Remove all shadow utilities from Button variants

### 4. Input — remove the default ring, use border-color only
shadcn's input focus adds a `ring` glow. Replace with border-color transition only:
```
focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-[--border-focus]
```

### 5. Card — remove shadow, keep border
shadcn Card has a default `shadow-sm`. Remove it. The border is the definition.

### 6. Badge — tighten and sharpen
Default Badge is too rounded and too large. Override:
```
px-1.5 py-0.5 text-[10px] font-medium tracking-[0.06em] uppercase rounded-[2px]
```

### 7. Dialog and Sheet
- Dialog: use `--bg-overlay` for background, remove default white/light theme assumption
- Sheet (used as drawer): remove all rounded corners. Set `rounded-none` on the sheet content. Add `border-l border-[--border-default]`.

### 8. Select and DropdownMenu
The popover backgrounds must use `--bg-overlay` (#222228), not `--bg-surface`. This maintains depth hierarchy — dropdowns float above cards, so they must feel lighter/higher.

### 9. Separator
Ensure the Separator component uses `--border-default`. Remove any margin overrides. Use it consistently for section dividers, never as decoration.

### 10. Tooltip
- Dark theme tooltips should use `--bg-elevated` (not black — that is too harsh against the dark background)
- Font: 12px, `--text-primary`
- Delay: 400ms — never instant
- No animation (instant appear after delay)

### 11. Never use
These shadcn components should not appear in V1 without full custom replacement:
- `Calendar` — not needed, and very hard to desaturate from stock look
- `Avatar` — no profile photos in V1
- `Progress` (the default one) — replace with a custom progress bar component

---

*Part 2 complete. Part 3 (Screen Guidance — all 7 screens) pending approval.*
