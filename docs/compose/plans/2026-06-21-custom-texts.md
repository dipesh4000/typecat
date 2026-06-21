# Custom Texts Library Implementation Plan

> [!NOTE]
> This document may not reflect the current implementation.
> See the final report for up-to-date state:
> [Final Report](../reports/custom-texts.md)

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Custom" category tab that lets users create, save, browse, and practice their own typed texts stored in localStorage.

**Architecture:** A new `CustomPassageProvider` reads/writes user texts from localStorage. The `PassageProvider` interface is extended with `addPassage`, `removePassage`, and `updatePassage` methods. PracticePage gains a "Custom" tab that shows saved texts with CRUD actions and a creation modal.

**Tech Stack:** React, Zustand, TypeScript, localStorage via existing `StorageAdapter`

---

### Task 1: Extend PassageProvider interface with CRUD methods

**Covers:** Data model, storage

**Files:**
- Modify: `src/services/content/PassageProvider.ts`

- [ ] **Step 1: Add mutation methods to the interface**

```typescript
import type { Passage } from '../../shared/types'

export interface PassageProvider {
  getPassages(category?: Passage['category'], filters?: { difficulty?: Passage['difficulty']; subcategory?: string }): Passage[]
  getPassageById(id: string): Passage | null
  addPassage(passage: Omit<Passage, 'id'>): Passage
  updatePassage(id: string, updates: Partial<Pick<Passage, 'text' | 'difficulty' | 'subcategory'>>): void
  removePassage(id: string): void
}
```

- [ ] **Step 2: Verify StaticPassageProvider still compiles (stub the new methods)**

Add stubs to `StaticPassageProvider.ts` so TypeScript is happy — these will throw since static passages are immutable:

```typescript
addPassage() { throw new Error('Cannot add to static passages') },
updatePassage() { throw new Error('Cannot update static passages') },
removePassage() { throw new Error('Cannot remove static passages') },
```

- [ ] **Step 3: Run typecheck**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/services/content/PassageProvider.ts src/services/content/StaticPassageProvider.ts
git commit -m "feat: extend PassageProvider interface with CRUD methods"
```

---

### Task 2: Create CustomPassageProvider with localStorage persistence

**Covers:** Storage, CRUD operations

**Files:**
- Create: `src/services/content/CustomPassageProvider.ts`
- Create: `src/services/content/CustomPassageProvider.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { CustomPassageProvider } from './CustomPassageProvider'

describe('CustomPassageProvider', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts with empty passages', () => {
    expect(CustomPassageProvider.getPassages()).toEqual([])
  })

  it('adds a passage and retrieves it', () => {
    const added = CustomPassageProvider.addPassage({
      category: 'custom',
      difficulty: 'easy',
      text: 'Hello world',
      subcategory: 'My Text',
    })
    expect(added.id).toMatch(/^custom-/)
    expect(CustomPassageProvider.getPassages()).toHaveLength(1)
    expect(CustomPassageProvider.getPassageById(added.id)?.text).toBe('Hello world')
  })

  it('updates a passage', () => {
    const added = CustomPassageProvider.addPassage({
      category: 'custom',
      difficulty: 'easy',
      text: 'Old text',
    })
    CustomPassageProvider.updatePassage(added.id, { text: 'New text', difficulty: 'hard' })
    const updated = CustomPassageProvider.getPassageById(added.id)
    expect(updated?.text).toBe('New text')
    expect(updated?.difficulty).toBe('hard')
  })

  it('removes a passage', () => {
    const added = CustomPassageProvider.addPassage({
      category: 'custom',
      difficulty: 'easy',
      text: 'Delete me',
    })
    CustomPassageProvider.removePassage(added.id)
    expect(CustomPassageProvider.getPassages()).toHaveLength(0)
  })

  it('filters by difficulty', () => {
    CustomPassageProvider.addPassage({ category: 'custom', difficulty: 'easy', text: 'A' })
    CustomPassageProvider.addPassage({ category: 'custom', difficulty: 'hard', text: 'B' })
    expect(CustomPassageProvider.getPassages(undefined, { difficulty: 'easy' })).toHaveLength(1)
  })

  it('persists across provider instances', () => {
    CustomPassageProvider.addPassage({ category: 'custom', difficulty: 'easy', text: 'Persist' })
    // Re-import to simulate fresh instance
    const { CustomPassageProvider: Fresh } = require('./CustomPassageProvider')
    expect(Fresh.getPassages()).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/services/content/CustomPassageProvider.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement CustomPassageProvider**

```typescript
import type { Passage } from '../../shared/types'
import type { PassageProvider } from './PassageProvider'
import { storage } from '../storage'

const STORAGE_KEY = 'typecat-custom-passages'

function load(): Passage[] {
  return storage.get<Passage[]>(STORAGE_KEY) ?? []
}

function save(passages: Passage[]): void {
  storage.set(STORAGE_KEY, passages)
}

export const CustomPassageProvider: PassageProvider = {
  getPassages(_category?, filters?) {
    let passages = load()

    if (filters?.difficulty) {
      passages = passages.filter((p) => p.difficulty === filters.difficulty)
    }

    if (filters?.subcategory) {
      passages = passages.filter((p) => p.subcategory === filters.subcategory)
    }

    return passages
  },

  getPassageById(id: string): Passage | null {
    return load().find((p) => p.id === id) ?? null
  },

  addPassage(passage: Omit<Passage, 'id'>): Passage {
    const passages = load()
    const newPassage: Passage = {
      ...passage,
      id: `custom-${Date.now()}`,
      category: 'custom',
    }
    passages.push(newPassage)
    save(passages)
    return newPassage
  },

  updatePassage(id: string, updates: Partial<Pick<Passage, 'text' | 'difficulty' | 'subcategory'>>): void {
    const passages = load()
    const index = passages.findIndex((p) => p.id === id)
    if (index === -1) return
    passages[index] = { ...passages[index], ...updates }
    save(passages)
  },

  removePassage(id: string): void {
    save(load().filter((p) => p.id !== id))
  },
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/services/content/CustomPassageProvider.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/services/content/CustomPassageProvider.ts src/services/content/CustomPassageProvider.test.ts
git commit -m "feat: add CustomPassageProvider with localStorage persistence"
```

---

### Task 3: Add 'custom' to Passage category type

**Covers:** Type system

**Files:**
- Modify: `src/shared/types/index.ts`

- [ ] **Step 1: Extend the category union**

```typescript
export interface Passage {
  id: string
  category: 'english' | 'anime' | 'programming' | 'custom'
  subcategory?: string
  difficulty: 'easy' | 'medium' | 'hard'
  text: string
  source?: string
  tags?: string[]
}
```

- [ ] **Step 2: Run typecheck**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/shared/types/index.ts
git commit -m "feat: add 'custom' to Passage category type"
```

---

### Task 4: Create a composite PassageProvider that merges static + custom

**Covers:** Architecture integration

**Files:**
- Modify: `src/services/content/index.ts`

- [ ] **Step 1: Update the exported provider to support custom texts**

```typescript
export { StaticPassageProvider } from './StaticPassageProvider'
export { CustomPassageProvider } from './CustomPassageProvider'
import { StaticPassageProvider } from './StaticPassageProvider'
import { CustomPassageProvider } from './CustomPassageProvider'
import type { PassageProvider } from './PassageProvider'
import type { Passage } from '../../shared/types'

export const passageProvider: PassageProvider = {
  getPassages(category?, filters?) {
    if (category === 'custom') {
      return CustomPassageProvider.getPassages(undefined, filters)
    }
    return StaticPassageProvider.getPassages(category, filters)
  },

  getPassageById(id: string): Passage | null {
    if (id.startsWith('custom-')) {
      return CustomPassageProvider.getPassageById(id)
    }
    return StaticPassageProvider.getPassageById(id)
  },

  addPassage(passage) {
    return CustomPassageProvider.addPassage(passage)
  },

  updatePassage(id, updates) {
    CustomPassageProvider.updatePassage(id, updates)
  },

  removePassage(id) {
    CustomPassageProvider.removePassage(id)
  },
}
```

- [ ] **Step 2: Run typecheck**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/services/content/index.ts
git commit -m "feat: composite PassageProvider merges static and custom texts"
```

---

### Task 5: Add "Custom" tab to PracticePage category bar

**Covers:** UI, category tab

**Files:**
- Modify: `src/pages/PracticePage/PracticePage.tsx`

- [ ] **Step 1: Add custom category to the categories array**

In `PracticePage.tsx`, update the `categories` constant:

```typescript
const categories = [
  { id: 'all' as const, label: 'All', icon: 'apps' },
  { id: 'english' as const, label: 'English', icon: 'translate' },
  { id: 'anime' as const, label: 'Anime', icon: 'movie' },
  { id: 'programming' as const, label: 'Code', icon: 'code' },
  { id: 'custom' as const, label: 'Custom', icon: 'edit_note' },
]
```

- [ ] **Step 2: Run typecheck**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/pages/PracticePage/PracticePage.tsx
git commit -m "feat: add Custom tab to category bar"
```

---

### Task 6: Create CustomTextsModal component

**Covers:** UI, CRUD modal, creation/editing

**Files:**
- Create: `src/features/custom-texts/components/CustomTextsModal.tsx`

- [ ] **Step 1: Create the modal component**

```tsx
import { useState, useEffect } from 'react'
import { CustomPassageProvider } from '../../../services/content/CustomPassageProvider'
import type { Passage } from '../../../shared/types'

interface CustomTextsModalProps {
  open: boolean
  onClose: () => void
  onStart: (passage: Passage) => void
}

export function CustomTextsModal({ open, onClose, onStart }: CustomTextsModalProps) {
  const [passages, setPassages] = useState<Passage[]>([])
  const [editing, setEditing] = useState<Passage | null>(null)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [difficulty, setDifficulty] = useState<Passage['difficulty']>('medium')

  useEffect(() => {
    if (open) {
      setPassages(CustomPassageProvider.getPassages())
      setEditing(null)
      setCreating(false)
      setName('')
      setText('')
      setDifficulty('medium')
    }
  }, [open])

  const handleSave = () => {
    if (!text.trim()) return
    if (editing) {
      CustomPassageProvider.updatePassage(editing.id, { text: text.trim(), difficulty, subcategory: name.trim() || undefined })
    } else {
      CustomPassageProvider.addPassage({ category: 'custom', difficulty, text: text.trim(), subcategory: name.trim() || undefined })
    }
    setPassages(CustomPassageProvider.getPassages())
    setEditing(null)
    setCreating(false)
    setName('')
    setText('')
    setDifficulty('medium')
  }

  const handleDelete = (id: string) => {
    CustomPassageProvider.removePassage(id)
    setPassages(CustomPassageProvider.getPassages())
  }

  const handleEdit = (p: Passage) => {
    setEditing(p)
    setCreating(true)
    setName(p.subcategory ?? '')
    setText(p.text)
    setDifficulty(p.difficulty)
  }

  const handleStart = (p: Passage) => {
    onStart(p)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-50">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-t-xl md:rounded-xl p-4 max-w-lg w-full max-h-[85vh] md:max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-bold text-on-surface">
            {creating ? (editing ? 'Edit Text' : 'New Custom Text') : 'My Custom Texts'}
          </h2>
          <button
            onClick={() => { setCreating(false); setEditing(null) }}
            className="p-1 rounded hover:bg-surface-container transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">
              {creating ? 'arrow_back' : 'close'}
            </span>
          </button>
        </div>

        {creating ? (
          <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
            <input
              type="text"
              placeholder="Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-sm text-on-surface outline-none focus:border-primary"
            />
            <textarea
              placeholder="Paste or type your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 min-h-[120px] px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-sm text-on-surface outline-none focus:border-primary resize-none"
            />
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-3 py-1 rounded-full text-[10px] font-semibold transition-all ${
                    difficulty === d
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <div className="text-[10px] text-on-surface-variant">{text.length} characters</div>
            <button
              onClick={handleSave}
              disabled={!text.trim()}
              className="w-full py-2 bg-primary text-on-primary rounded-lg text-xs font-bold hover:opacity-90 transition-all disabled:opacity-50"
            >
              {editing ? 'Update' : 'Save'}
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2">
            <button
              onClick={() => { setCreating(true); setEditing(null); setName(''); setText(''); setDifficulty('medium') }}
              className="w-full p-3 rounded-lg border-2 border-dashed border-outline-variant hover:border-primary text-on-surface-variant hover:text-primary transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span className="text-xs font-semibold">New Custom Text</span>
            </button>
            {passages.map((p) => (
              <div key={p.id} className="w-full p-3 rounded-lg bg-surface-container border border-outline-variant/50">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-on-surface truncate">{p.subcategory ?? 'Untitled'}</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">{p.text.length} chars · {p.difficulty}</p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button onClick={() => handleStart(p)} className="p-1 rounded hover:bg-surface-container-high transition-all" title="Practice">
                      <span className="material-symbols-outlined text-[14px] text-primary">play_arrow</span>
                    </button>
                    <button onClick={() => handleEdit(p)} className="p-1 rounded hover:bg-surface-container-high transition-all" title="Edit">
                      <span className="material-symbols-outlined text-[14px] text-on-surface-variant">edit</span>
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-1 rounded hover:bg-surface-container-high transition-all" title="Delete">
                      <span className="material-symbols-outlined text-[14px] text-error">delete</span>
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-on-surface-variant/60 line-clamp-2 mt-1">{p.text}</p>
              </div>
            ))}
            {passages.length === 0 && !creating && (
              <p className="text-xs text-on-surface-variant text-center py-8">No custom texts yet. Create one to get started!</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run typecheck**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/features/custom-texts/components/CustomTextsModal.tsx
git commit -m "feat: add CustomTextsModal for managing user texts"
```

---

### Task 7: Integrate CustomTextsModal into PracticePage

**Covers:** UI integration, full flow

**Files:**
- Modify: `src/pages/PracticePage/PracticePage.tsx`

- [ ] **Step 1: Import and wire up the modal**

Add import at top of `PracticePage.tsx`:

```typescript
import { CustomTextsModal } from '../../features/custom-texts/components/CustomTextsModal'
```

Add state after existing state declarations (around line 50):

```typescript
const [customModalOpen, setCustomModalOpen] = useState(false)
```

Add the modal render before the closing `</div>` of the return (before the Browse Passages Modal):

```tsx
<CustomTextsModal
  open={customModalOpen}
  onClose={() => setCustomModalOpen(false)}
  onStart={handleStart}
/>
```

Update the `handleCategoryChange` function to open the modal when 'custom' is selected:

```typescript
const handleCategoryChange = (newCategory: typeof category) => {
  if (newCategory === 'custom') {
    setCustomModalOpen(true)
    return
  }
  setCategory(newCategory)
  loadPassage(newCategory, difficulty)
}
```

- [ ] **Step 2: Run typecheck**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Run dev server and test manually**

Run: `npm run dev`
Test: Click "Custom" tab → modal opens → create a text → it appears in list → click play → typing starts with that text.

- [ ] **Step 4: Commit**

```bash
git add src/pages/PracticePage/PracticePage.tsx
git commit -m "feat: integrate CustomTextsModal into PracticePage"
```

---

### Task 8: Run full test suite and typecheck

**Covers:** Verification

- [ ] **Step 1: Run typecheck**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 2: Run all tests**

Run: `npx vitest run`
Expected: ALL PASS

- [ ] **Step 3: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: resolve typecheck/test issues for custom texts"
```
