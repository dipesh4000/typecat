# TypeCat — Project Architecture (v1)

A frontend-only, gamified typing trainer. This document defines the folder structure, state management design, data schema, core system designs, and the extension points that let v2+ features (auth, cloud sync, leaderboards, AI) slot in without a rewrite.

---

## 1. Guiding principles

- **Frontend-first, backend-ready.** Every system that will eventually need a server (stats, progression, passages) sits behind a thin interface today, even though the only implementation is `localStorage`.
- **Domain-separated state.** Typing, cat, progression, and stats are independent stores that communicate through events, not direct mutation — so a multiplayer or AI module can later subscribe without touching existing code.
- **Data-driven content.** Passages are static JSON, not hardcoded strings, so swapping in an AI-generation endpoint later is a data-source change, not a component rewrite.

---

## 2. Tech stack

| Concern | Choice |
|---|---|
| UI framework | React 18 + TypeScript |
| Styling | TailwindCSS |
| Animation | Framer Motion |
| State management | Zustand (one store per domain) |
| Build tool | Vite |
| Data | Static JSON (passages), localStorage (progress) |
| Testing | Vitest + React Testing Library |
| Linting | ESLint + Prettier |

Zustand over Context: typing input fires on every keystroke, and Context re-renders the whole subtree on change. Zustand's selector-based subscriptions let only the WPM counter, cat sprite, etc. re-render — not the entire practice screen.

---

## 3. Folder structure

```
typecat/
├── public/
│   └── cat-sprites/                  # Sprite sheets / Lottie files per cat stage
│
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── routes.tsx                # Route table (Practice, Stats, Achievements, Settings)
│   │   └── providers.tsx             # Top-level providers (theme, toast, etc.)
│   │
│   ├── pages/
│   │   ├── PracticePage/
│   │   ├── StatsPage/
│   │   ├── AchievementsPage/
│   │   └── SettingsPage/
│   │
│   ├── features/
│   │   ├── typing-engine/
│   │   │   ├── components/           # TextDisplay, Caret, KeyHighlight
│   │   │   ├── hooks/                # useTypingSession, useKeystrokeHandler
│   │   │   ├── metrics.ts            # WPM / accuracy / consistency calculations
│   │   │   └── types.ts
│   │   │
│   │   ├── cat-companion/
│   │   │   ├── components/           # CatSprite, CatStage, SpeechBubble
│   │   │   ├── stateMachine.ts       # idle → typing → error → celebrate → sleep
│   │   │   └── animations/           # Framer Motion variants per state
│   │   │
│   │   ├── progression/
│   │   │   ├── xp.ts                 # XP formula, level curve
│   │   │   ├── achievements.ts       # Achievement definitions + unlock checks
│   │   │   ├── streaks.ts            # Daily streak logic
│   │   │   └── components/           # LevelBadge, XPBar, AchievementToast
│   │   │
│   │   └── stats/
│   │       ├── components/           # StatCard, WPMChart, SessionHistory
│   │       └── selectors.ts          # Derived stats from raw session log
│   │
│   ├── stores/
│   │   ├── typingStore.ts
│   │   ├── catStore.ts
│   │   ├── progressionStore.ts
│   │   ├── statsStore.ts
│   │   └── index.ts                  # Barrel export + cross-store event wiring
│   │
│   ├── data/
│   │   ├── passages/
│   │   │   ├── english.json
│   │   │   ├── anime.json
│   │   │   └── programming.json      # JS / Python / SQL / React snippets, tagged
│   │   └── passages.schema.ts        # Zod or TS type validating the JSON shape
│   │
│   ├── services/
│   │   ├── storage/
│   │   │   ├── StorageAdapter.ts     # Interface: get/set/remove/clear
│   │   │   ├── LocalStorageAdapter.ts# v1 implementation
│   │   │   └── index.ts              # Exported singleton, swappable later
│   │   └── content/
│   │       ├── PassageProvider.ts    # Interface: getPassages(category, filters)
│   │       └── StaticPassageProvider.ts # v1: reads from /data/passages
│   │
│   ├── shared/
│   │   ├── components/               # Button, Modal, Tabs, ProgressRing
│   │   ├── hooks/                    # useLocalStorage, useInterval, useIdleTimer
│   │   ├── utils/
│   │   └── types/                    # Shared cross-domain types
│   │
│   └── main.tsx
│
├── tests/
├── index.html
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

**Why `services/` exists even in v1:** `StorageAdapter` and `PassageProvider` are interfaces with exactly one implementation today. When cloud sync or AI-generated passages arrive, you add `ApiStorageAdapter` or `AIPassageProvider` and swap the export in `services/storage/index.ts` — no consuming component changes.

---

## 4. State management — store breakdown

Four independent Zustand stores, each owning one domain. Cross-store reactions (e.g. "session finished → award XP → check achievements") are wired through a small event/subscription layer in `stores/index.ts`, not by stores importing each other directly.

### `typingStore`
Transient, resets every session.
```ts
interface TypingState {
  passage: Passage | null;
  input: string;
  startedAt: number | null;
  keystrokes: Keystroke[];        // for replay / consistency scoring
  errors: number;
  status: 'idle' | 'active' | 'paused' | 'complete';

  startSession: (passage: Passage) => void;
  handleKeystroke: (char: string, timestamp: number) => void;
  endSession: () => SessionResult;
}
```

### `catStore`
Drives the companion's visual state machine (see §6).
```ts
interface CatState {
  animationState: 'idle' | 'typing' | 'error' | 'celebrating' | 'sleeping';
  stage: number;                  // visual unlock tier, derived from level
  lastActivityAt: number;

  setAnimationState: (s: CatState['animationState']) => void;
  registerActivity: () => void;   // resets idle/sleep timer
}
```

### `progressionStore`
Persisted. XP, levels, achievements, streaks.
```ts
interface ProgressionState {
  xp: number;
  level: number;
  unlockedAchievements: string[];
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string | null;

  awardXP: (amount: number) => void;
  checkAchievements: (result: SessionResult) => Achievement[]; // newly unlocked
  recordDailyActivity: () => void;
}
```

### `statsStore`
Persisted. Historical performance.
```ts
interface StatsState {
  bestWPM: number;
  totalWordsTyped: number;
  totalSessionsCompleted: number;
  sessionHistory: SessionResult[];  // capped, e.g. last 200 entries

  recordSession: (result: SessionResult) => void;
}
```

### Cross-store flow on session completion
```
typingStore.endSession()
   → returns SessionResult
   → statsStore.recordSession(result)
   → progressionStore.awardXP(xpFromResult(result))
   → progressionStore.checkAchievements(result)
   → catStore.setAnimationState('celebrating')
```
This sequence lives in a single `onSessionComplete(result)` orchestrator function (e.g. in `features/typing-engine/hooks/useTypingSession.ts`), not scattered across stores — keeps the reward logic in one auditable place.

---

## 5. Data layer — passage schema

All three categories share one shape so the rendering and scoring components stay category-agnostic.

```ts
interface Passage {
  id: string;
  category: 'english' | 'anime' | 'programming';
  subcategory?: string;        // e.g. 'javascript' | 'python' | 'sql' | 'react'
  difficulty: 'easy' | 'medium' | 'hard';
  text: string;                // for programming: includes real syntax, indentation preserved
  source?: string;              // optional attribution
  tags?: string[];
}
```

```json
{
  "id": "prog-js-042",
  "category": "programming",
  "subcategory": "javascript",
  "difficulty": "medium",
  "text": "const debounce = (fn, delay) => {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n};",
  "tags": ["closures", "functions"]
}
```

`StaticPassageProvider.getPassages(category, filters)` reads and filters this JSON at runtime. Replacing it with an API or AI-backed provider later only requires implementing the same `PassageProvider` interface.

---

## 6. Core system designs

### Typing engine
- Keystrokes captured via a controlled `<input>` or hidden-input + custom caret pattern (avoids native autocomplete/spellcheck interference).
- Each keystroke timestamped and diffed against the target passage character.
- Metrics computed in `metrics.ts`, pure functions over the keystroke log:
  - **WPM** = `(correctChars / 5) / (elapsedMinutes)`
  - **Accuracy** = `correctChars / totalChars typed`
  - **Consistency** (optional, feeds achievements) = variance of per-character timing
- Every keystroke dispatches to `catStore` (`registerActivity`) and, on mismatch, triggers the error animation.

### Cat companion — animation state machine
```
        inactivity (e.g. 60s)
   ┌───────────────────────────┐
   ▼                           │
 sleeping ◄───── idle ◄──────────┐
              │      ▲           │
   keystroke  │      │ no input  │ session ends
              ▼      │ (debounced)│
            typing ───┘           │
              │                  │
   mismatch   │     completion   │
              ▼                  │
            error ────────────► celebrating
```
- Implemented as a small finite-state reducer in `stateMachine.ts`, not ad-hoc booleans — makes adding new states (e.g. a "race" state for multiplayer) a single transition addition.
- Each state maps to a Framer Motion variant; visual *stage* (sprite tier) is a separate dimension driven by `progressionStore.level`, independent of the current animation state.

### XP & leveling
- XP per session: weighted function of words typed, accuracy, and speed, e.g. `xp = words * accuracyMultiplier * speedMultiplier`, with multipliers clamped so sloppy-fast typing isn't optimal.
- Level curve: monotonically increasing XP-to-next-level (e.g. `xpForLevel(n) = 100 * n^1.5`), stored as a pure function so the curve can be rebalanced without touching store logic.
- Visual unlocks keyed off `level` thresholds in a small `catStages.ts` config (level → sprite tier), kept separate from the XP math.

### Achievements
- Declarative definitions, not imperative checks scattered through code:
```ts
interface AchievementDef {
  id: string;
  name: string;
  description: string;
  condition: (ctx: { result: SessionResult; stats: StatsState; progression: ProgressionState }) => boolean;
}
```
- `checkAchievements` simply iterates the definition list after each session and unlocks any whose `condition` returns true and isn't already unlocked. Adding an achievement is a one-entry addition to `achievements.ts` — no other file changes.

### Daily streak
- On session completion, compare `lastSessionDate` to today (local timezone date string).
- Same day → no change. Consecutive day → `currentStreak += 1`. Gap → reset to 1.
- Streak check is a pure function of `(lastSessionDate, today)` so it's independently testable without touching the store.

---

## 7. Persistence layer

```ts
interface StorageAdapter {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
}
```

`LocalStorageAdapter` implements this with `JSON.stringify`/`parse` and try/catch guards (private browsing, quota errors). Zustand stores use a `persist` middleware configured against this adapter rather than calling `localStorage` directly — so a future `ApiStorageAdapter` (writing to a backend, with localStorage as offline cache) is a drop-in swap.

**Storage keys (namespaced, versioned):**
```
typecat:v1:progression
typecat:v1:stats
typecat:v1:settings
```
The `v1` segment lets a future migration script detect and transform old shapes when the schema changes, rather than silently corrupting saved progress.

---

## 8. Scalability — how the roadmap plugs in

| Roadmap item | Extension point | What changes |
|---|---|---|
| User accounts | `StorageAdapter` | New `ApiStorageAdapter`; stores' public API is unchanged |
| Cloud sync | `StorageAdapter` + a sync queue | Adapter writes locally first, flushes to API in background |
| Global leaderboards | New `leaderboardStore` + API service | Reads `statsStore` data, posts to a new endpoint; no existing store touched |
| AI-generated passages | `PassageProvider` | New `AIPassageProvider` implementing the same interface as `StaticPassageProvider` |
| AI typing coach | New `features/ai-coach/` module | Subscribes to `statsStore`/`typingStore` read-only; doesn't need write access to existing state |
| Multiplayer races | New `raceStore` + WebSocket service | `typing-engine` hooks are reused as-is; race adds a synchronized passage + opponent progress overlay |

The common thread: every roadmap item is additive (new store, new service implementation) rather than a modification of existing domains. That's the payoff of the interface-first design in §3 and §4.

---

## 9. Suggested build order

1. **Static shell** — routes, layout, Tailwind theme, passage JSON + provider.
2. **Typing engine** — input capture, live WPM/accuracy, passage rendering with character-level highlighting.
3. **Cat companion** — state machine + idle/typing/error/celebrate/sleep animations (can use placeholder sprites first).
4. **Persistence + stats store** — wire `recordSession`, confirm localStorage round-trips.
5. **Progression** — XP formula, leveling, achievement definitions, streaks.
6. **Stats page + achievements page** — surface everything tracked in steps 4–5.
7. **Polish pass** — sprite art per cat stage, sound (optional), settings (theme, sound toggle, reduced motion).

This order front-loads the riskiest real-time system (typing engine) and defers cosmetic work, while keeping every later step additive rather than refactor-heavy.
