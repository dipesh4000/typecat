import { useState, useEffect, useCallback } from 'react'
import { TextDisplay } from '../../features/typing-engine/components/TextDisplay'
import { SimpleKeyboard } from '../../features/typing-engine/components/SimpleKeyboard'
import { useTypingStore } from '../../stores/typingStore'
import { useCatStore } from '../../stores/catStore'
import { onSessionComplete } from '../../stores'
import { passageProvider } from '../../services/content'
import { useSettingsStore } from '../../stores/settingsStore'
import type { Passage } from '../../shared/types'

const categories = [
  { id: 'all' as const, label: 'All', icon: 'apps' },
  { id: 'english' as const, label: 'English', icon: 'translate' },
  { id: 'anime' as const, label: 'Anime', icon: 'movie' },
  { id: 'programming' as const, label: 'Code', icon: 'code' },
]

const difficulties = [
  { id: 'easy' as const, label: 'Easy' },
  { id: 'medium' as const, label: 'Medium' },
  { id: 'hard' as const, label: 'Hard' },
]

export default function PracticePage() {
  const passage = useTypingStore((s) => s.passage)
  const input = useTypingStore((s) => s.input)
  const status = useTypingStore((s) => s.status)
  const startSession = useTypingStore((s) => s.startSession)
  const endSession = useTypingStore((s) => s.endSession)
  const reset = useTypingStore((s) => s.reset)
  const handleKeystroke = useTypingStore((s) => s.handleKeystroke)
  const handleBackspace = useTypingStore((s) => s.handleBackspace)

  const setAnimationState = useCatStore((s) => s.setAnimationState)
  const setActiveKey = useCatStore((s) => s.setActiveKey)
  const registerActivity = useCatStore((s) => s.registerActivity)

  const category = useSettingsStore((s) => s.category)
  const difficulty = useSettingsStore((s) => s.difficulty)
  const setCategory = useSettingsStore((s) => s.setCategory)
  const setDifficulty = useSettingsStore((s) => s.setDifficulty)

  const [previewPassage, setPreviewPassage] = useState<Passage | null>(null)

  const loadPassage = useCallback(
    (cat?: typeof category, diff?: typeof difficulty) => {
      const catFilter = cat || category
      const passages = passageProvider.getPassages(
        catFilter === 'all' ? undefined : catFilter,
        { difficulty: diff || difficulty }
      )
      if (passages.length > 0) {
        setPreviewPassage(passages[Math.floor(Math.random() * passages.length)])
      }
    },
    [category, difficulty]
  )

  useEffect(() => {
    if (status === 'idle') {
      loadPassage()
    }
  }, [category, difficulty, status, loadPassage])

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (status !== 'active' || !passage) return
      if (e.key === 'Escape') return

      if (e.key === 'Backspace') {
        e.preventDefault()
        handleBackspace()
        setActiveKey('backspace')
        setTimeout(() => setActiveKey(null), 100)
        return
      }

      if (e.key.length !== 1) return

      e.preventDefault()
      registerActivity()

      const keyForCat = e.key === ' ' ? ' ' : e.key.toLowerCase()
      setActiveKey(keyForCat)
      setTimeout(() => setActiveKey(null), 100)

      const expected = passage.text[input.length]
      const timestamp = performance.now()

      handleKeystroke(e.key, expected, timestamp)

      if (e.key === expected) {
        setAnimationState('typing')
      } else {
        setAnimationState('error')
        setTimeout(() => setAnimationState('typing'), 500)
      }
    },
    [status, passage, input, handleKeystroke, handleBackspace, registerActivity, setAnimationState, setActiveKey]
  )

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onKeyDown])

  useEffect(() => {
    if (passage && status === 'active' && input.length >= passage.text.length) {
      const result = endSession()
      onSessionComplete(result)
    }
  }, [passage, status, input, endSession])

  const handleStart = (passageToUse?: Passage) => {
    const p = passageToUse || previewPassage
    if (!p) return
    reset()
    startSession(p)
    setAnimationState('idle')
  }

  const handleCategoryChange = (newCategory: typeof category) => {
    if (status === 'active') return
    setCategory(newCategory)
    loadPassage(newCategory, difficulty)
  }

  const handleDifficultyChange = (newDifficulty: typeof difficulty) => {
    if (status === 'active') return
    setDifficulty(newDifficulty)
    loadPassage(category, newDifficulty)
  }

  const handleNewPassage = () => {
    loadPassage()
  }

  const displayPassage = passage || previewPassage
  const progress = passage ? (input.length / passage.text.length) * 100 : 0

  return (
    <div className="w-full h-full flex flex-col">
      {/* Mode Selector */}
      {status === 'idle' && (
        <div className="w-full mb-3 flex-shrink-0">
          <div className="flex justify-center gap-2 mb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                  category === cat.id
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex justify-center gap-2">
            {difficulties.map((diff) => (
              <button
                key={diff.id}
                onClick={() => handleDifficultyChange(diff.id)}
                className={`px-3 py-1 rounded-full text-[10px] font-semibold transition-all ${
                  difficulty === diff.id
                    ? 'bg-secondary-container text-on-secondary-container'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full mb-3 flex-shrink-0">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
            {status === 'idle' ? 'PRACTICE' : category.toUpperCase()}
          </h3>
          <span className="text-[10px] font-semibold text-primary">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-1.5 bg-surface-container-highest w-full rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 flex flex-col">
        {/* Typing Area */}
        <section className="flex-1 min-h-0 bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm overflow-hidden">
          {status === 'idle' && displayPassage && (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded-full mb-2">
                <span className="text-[10px] uppercase font-semibold">
                  {displayPassage.category} • {displayPassage.difficulty}
                </span>
              </div>
              <div className="font-typing-font text-base md:text-lg leading-relaxed text-on-surface-variant/50 mb-4 max-w-xl text-center">
                {displayPassage.text}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleStart()}
                  className="px-6 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold hover:bg-on-surface-variant transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                  Start
                </button>
                <button
                  onClick={handleNewPassage}
                  className="px-4 py-2 border border-outline-variant rounded-lg text-sm hover:bg-surface-container transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">shuffle</span>
                  New
                </button>
              </div>
            </div>
          )}

          {(status === 'active' || status === 'complete') && passage && (
            <div className="h-full flex flex-col">
              <div className="flex-1 min-h-0 overflow-y-auto">
                <TextDisplay passage={passage.text} input={input} showErrors={true} />
              </div>

              {status === 'complete' && (
                <div className="mt-3 text-center py-3 border-t border-outline-variant flex-shrink-0">
                  <p className="text-on-surface text-lg font-bold mb-2">Session Complete!</p>
                  <button
                    onClick={() => handleStart()}
                    className="px-6 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold hover:bg-on-surface-variant transition-all active:scale-95 flex items-center gap-1.5 mx-auto"
                  >
                    <span className="material-symbols-outlined text-[16px]">replay</span>
                    Try Again
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Simple Keyboard */}
        <div className="flex-shrink-0 mt-3">
          <SimpleKeyboard />
        </div>

        {/* Bottom Bar */}
        <div className="flex-shrink-0 mt-2 flex justify-between items-center text-on-surface-variant text-[10px]">
          <span>ESC pause • Backspace correct</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleStart()}
              className="px-2 py-1 border border-outline-variant rounded hover:bg-surface-container transition-all active:scale-95"
            >
              Restart
            </button>
            <button
              onClick={handleNewPassage}
              className="px-2 py-1 bg-primary text-on-primary rounded hover:opacity-90 transition-all active:scale-95"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}