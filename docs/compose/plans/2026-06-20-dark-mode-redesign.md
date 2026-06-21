# Dark Mode Full Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the dark mode color palette to match the "Cozy Fluid" aesthetic from DESIGN.md and fix all hardcoded colors in components to use design tokens.

**Architecture:** Replace the existing neutral/grayscale dark mode CSS variables with warm, cozy tones (dark warm browns, muted roses, soft greens). Fix all hardcoded `bg-white`, `text-green-600`, `text-red-600` etc. in components to use CSS custom properties that adapt to dark mode.

**Tech Stack:** TailwindCSS v4 with CSS custom properties, React 19, TypeScript

---

## File Structure

| File | Responsibility |
|------|----------------|
| `src/index.css` | Dark mode CSS variables (`.dark` class), new success/error tokens |
| `src/features/typing-engine/components/TextDisplay.tsx` | Fix hardcoded green/red colors |
| `src/features/typing-engine/components/SimpleKeyboard.tsx` | Fix hardcoded `bg-white` |
| `src/pages/PracticePage/PracticePage.tsx` | Fix hardcoded `bg-white` |
| `src/pages/SettingsPage/SettingsPage.tsx` | Fix hardcoded `bg-white` |

---

### Task 1: Redesign Dark Mode CSS Variables

**Covers:** Full dark mode palette redesign

**Files:**
- Modify: `typecat/src/index.css:57-91`

- [ ] **Step 1: Replace the `.dark` class CSS variables**

Replace the entire `.dark { ... }` block (lines 57-91) with the new Cozy Fluid dark palette:

```css
/* Dark Mode Colors - Cozy Fluid */
.dark {
  /* Surface - warm dark browns */
  --color-surface: #1a1614;
  --color-surface-dim: #141210;
  --color-surface-bright: #242018;
  --color-surface-container-lowest: #0f0d0c;
  --color-surface-container-low: #1e1a18;
  --color-surface-container: #262220;
  --color-surface-container-high: #302c28;
  --color-surface-container-highest: #3a3632;

  /* Text - warm lights */
  --color-on-surface: #e8e0d8;
  --color-on-surface-variant: #b0a89e;
  --color-inverse-surface: #e8e0d8;
  --color-inverse-on-surface: #1a1614;

  /* Outline */
  --color-outline: #6a625a;
  --color-outline-variant: #3a3632;
  --color-surface-tint: #d4a0b0;

  /* Primary - warm rose (lighter for dark bg) */
  --color-primary: #f0b0c0;
  --color-on-primary: #3a1520;
  --color-primary-container: #5a2535;
  --color-on-primary-container: #ffd0e0;
  --color-inverse-primary: #5a2535;

  /* Secondary - soft blue */
  --color-secondary: #a0c0e0;
  --color-on-secondary: #1a2a3a;
  --color-secondary-container: #2a3a4a;
  --color-on-secondary-container: #c0d8f0;

  /* Tertiary - muted green */
  --color-tertiary: #90b8a8;
  --color-on-tertiary: #1a2a24;
  --color-tertiary-container: #2a3a34;
  --color-on-tertiary-container: #b0d8c8;

  /* Error - softer red */
  --color-error: #ff8080;
  --color-on-error: #3a1010;
  --color-error-container: #3a1515;
  --color-on-error-container: #ffb0b0;

  /* Success - warm green */
  --color-success: #80c8a0;
  --color-on-success: #0a2a18;
  --color-success-container: #1a3a28;
  --color-on-success-container: #a0e8c0;
}
```

- [ ] **Step 2: Add success color tokens to light mode**

Add these tokens inside the `@theme { ... }` block (after the error tokens, around line 36):

```css
  /* Success */
  --color-success: #2e7d32;
  --color-on-success: #ffffff;
  --color-success-container: #c8e6c9;
  --color-on-success-container: #1b5e20;
```

- [ ] **Step 3: Verify the CSS compiles**

Run: `npm run build` in the typecat directory
Expected: Build succeeds with no CSS errors

- [ ] **Step 4: Commit**

```bash
git add src/index.css
git commit -m "feat: redesign dark mode palette with Cozy Fluid warm tones"
```

---

### Task 2: Fix TextDisplay Hardcoded Colors

**Covers:** Fix typing feedback colors for dark mode

**Files:**
- Modify: `typecat/src/features/typing-engine/components/TextDisplay.tsx`

- [ ] **Step 1: Replace hardcoded green/red with CSS variable-based classes**

In `TextDisplay.tsx`, replace all hardcoded Tailwind color classes with the new success/error tokens:

**Line 23** - Correct character:
```tsx
// Before:
<span key={index} className="text-green-600 font-semibold">

// After:
<span key={index} className="text-success font-semibold">
```

**Lines 30-38** - Error character:
```tsx
// Before:
<span
  key={index}
  className="relative text-red-600 bg-red-100 border-b-2 border-red-500 font-semibold"
>
  {char}
  <span className="absolute -top-5 left-0 text-xs text-red-500 font-bold">
    {input[index]}
  </span>
</span>

// After:
<span
  key={index}
  className="relative text-error bg-error-container border-b-2 border-error font-semibold"
>
  {char}
  <span className="absolute -top-5 left-0 text-xs text-error font-bold">
    {input[index]}
  </span>
</span>
```

**Line 79** - Input correct:
```tsx
// Before:
isCorrect ? 'text-green-600'

// After:
isCorrect ? 'text-success'
```

**Line 80** - Input error:
```tsx
// Before:
: 'text-red-600 bg-red-50 font-bold'

// After:
: 'text-error bg-error-container font-bold'
```

- [ ] **Step 2: Verify build**

Run: `npm run build` in the typecat directory
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/features/typing-engine/components/TextDisplay.tsx
git commit -m "fix: use design tokens for typing feedback colors"
```

---

### Task 3: Fix SimpleKeyboard Hardcoded Background

**Covers:** Fix keyboard background for dark mode

**Files:**
- Modify: `typecat/src/features/typing-engine/components/SimpleKeyboard.tsx:15`

- [ ] **Step 1: Replace bg-white with design token**

```tsx
// Before (line 15):
<div className="w-full max-w-[500px] mx-auto bg-white border border-outline-variant rounded-lg p-3 shadow-sm">

// After:
<div className="w-full max-w-[500px] mx-auto bg-surface-container-lowest border border-outline-variant rounded-lg p-3 shadow-sm">
```

- [ ] **Step 2: Verify build**

Run: `npm run build` in the typecat directory
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/features/typing-engine/components/SimpleKeyboard.tsx
git commit -m "fix: use design token for keyboard background"
```

---

### Task 4: Fix PracticePage Hardcoded Background

**Covers:** Fix practice area background for dark mode

**Files:**
- Modify: `typecat/src/pages/PracticePage/PracticePage.tsx:202`

- [ ] **Step 1: Replace bg-white with design token**

```tsx
// Before (line 202):
<section className="flex-1 min-h-0 bg-white border border-outline-variant rounded-xl p-4 shadow-sm overflow-hidden">

// After:
<section className="flex-1 min-h-0 bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm overflow-hidden">
```

- [ ] **Step 2: Verify build**

Run: `npm run build` in the typecat directory
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/pages/PracticePage/PracticePage.tsx
git commit -m "fix: use design token for practice area background"
```

---

### Task 5: Fix SettingsPage Hardcoded Background

**Covers:** Fix settings card background for dark mode

**Files:**
- Modify: `typecat/src/pages/SettingsPage/SettingsPage.tsx:36`

- [ ] **Step 1: Replace bg-white with design token**

```tsx
// Before (line 36):
}: 'border-outline-variant hover:border-outline bg-white'

// After:
}: 'border-outline-variant hover:border-outline bg-surface-container-lowest'
```

- [ ] **Step 2: Verify build**

Run: `npm run build` in the typecat directory
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/pages/SettingsPage/SettingsPage.tsx
git commit -m "fix: use design token for settings card background"
```

---

### Task 6: Full Verification

**Covers:** End-to-end dark mode verification

**Files:** None (verification only)

- [ ] **Step 1: Run full build**

Run: `npm run build` in the typecat directory
Expected: Build succeeds with no errors

- [ ] **Step 2: Run lint**

Run: `npm run lint` in the typecat directory
Expected: No lint errors

- [ ] **Step 3: Visual verification checklist**

Start dev server (`npm run dev`) and verify:
- [ ] Toggle theme in Settings → Dark: backgrounds are warm dark brown, not pure black
- [ ] Toggle theme in Settings → Light: backgrounds are warm cream, not pure white
- [ ] Toggle theme in Settings → System: follows OS preference
- [ ] Practice page: typing area has warm dark background in dark mode
- [ ] TextDisplay: correct chars show warm green, errors show warm red
- [ ] SimpleKeyboard: keys have warm dark background in dark mode
- [ ] Sidebar: warm dark background in dark mode
- [ ] All pages: no jarring pure white or pure black elements

- [ ] **Step 4: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: address visual verification findings"
```
