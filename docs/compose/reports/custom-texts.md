---
feature: custom-texts
status: delivered
specs: []
plans:
  - docs/compose/plans/2026-06-21-custom-texts.md
branch: main
commits: pending
---

# Custom Texts Library — Final Report

## What Was Built

A "Custom" category tab that lets users create, save, browse, edit, and practice their own typed texts. Users can paste or type any text, name it, assign a difficulty level, and save it to localStorage. Saved texts appear in a modal with play/edit/delete actions, and clicking play starts a typing session with that custom text.

## Architecture

### Components

- **CustomTextsModal** (`src/features/custom-texts/components/CustomTextsModal.tsx`) — Full CRUD modal with list view and create/edit form
- **CustomPassageProvider** (`src/services/content/CustomPassageProvider.ts`) — localStorage-backed PassageProvider implementation
- **Composite PassageProvider** (`src/services/content/index.ts`) — Routes `category: 'custom'` to CustomPassageProvider, everything else to StaticPassageProvider

### Data Flow

1. User clicks "Custom" tab → `handleCategoryChange` opens `CustomTextsModal`
2. Modal loads passages from `CustomPassageProvider.getPassages()` (reads from localStorage)
3. User creates/edits text → saved via `addPassage`/`updatePassage` → localStorage
4. User clicks play → `onStart(passage)` → `handleStart(passage)` → `startSession(passage)` → typing begins
5. User deletes text → `removePassage(id)` → removed from localStorage

### Storage

- Key: `typecat-custom-passages`
- Format: `Passage[]` JSON array
- IDs: `custom-{timestamp}` format

### Type Changes

- `Passage.category` extended: `'english' | 'anime' | 'programming' | 'custom'`
- `PassageProvider` interface extended with `addPassage`, `updatePassage`, `removePassage`

## Usage

1. Click the **Custom** tab in the category bar
2. Click **"+ New Custom Text"** to create
3. Enter a name (optional), paste/type your text, select difficulty
4. Click **Save**
5. Click the **play** icon on any saved text to practice it
6. Use **edit** (pencil) or **delete** (trash) icons to manage texts

## Verification

- **Typecheck:** `npx tsc --noEmit` — PASS
- **Tests:** `npx vitest run` — 87/87 PASS (including 6 new CustomPassageProvider tests)
- **Manual:** Dev server running at http://localhost:5174 — Custom tab opens modal, CRUD operations work, typing sessions start with custom texts

## Journey Log

- [lesson] `require()` doesn't work in ESM/Vite test context — switched persistence test to verify localStorage directly
