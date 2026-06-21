import { useState, useEffect, useCallback } from 'react'
import { TextDisplay } from '../../features/typing-engine/components/TextDisplay'
import { SimpleKeyboard } from '../../features/typing-engine/components/SimpleKeyboard'
import { useTypingStore } from '../../stores/typingStore'
import { useCatStore } from '../../stores/catStore'
import { onSessionComplete } from '../../stores'
import { passageProvider } from '../../services/content'
import { useSettingsStore } from '../../stores/settingsStore'
import { useSound } from '../../shared/hooks/useSound'
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
  const lastResult = useTypingStore((s) => s.lastResult)
  const startSession = useTypingStore((s) => s.startSession)
  const endSession = useTypingStore((s) => s.endSession)
  const reset = useTypingStore((s) => s.reset)
  const handleKeystroke = useTypingStore((s) => s.handleKeystroke)
  const handleBackspace = useTypingStore((s) => s.handleBackspace)
  const pauseSession = useTypingStore((s) => s.pauseSession)
  const resumeSession = useTypingStore((s) => s.resumeSession)

  const setAnimationState = useCatStore((s) => s.setAnimationState)
  const setActiveKey = useCatStore((s) => s.setActiveKey)
  const registerActivity = useCatStore((s) => s.registerActivity)

  const category = useSettingsStore((s) => s.category)
  const difficulty = useSettingsStore((s) => s.difficulty)
  const setCategory = useSettingsStore((s) => s.setCategory)
  const setDifficulty = useSettingsStore((s) => s.setDifficulty)

  const { playKeySound, playErrorSound, playCompleteSound } = useSound()

  const [previewPassage, setPreviewPassage] = useState<Passage | null>(null)
  const [browseOpen, setBrowseOpen] = useState(false)
  const [sessionXP, setSessionXP] = useState<number | null>(null)

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
      if (e.key === 'Escape') {
        if (status === 'active') {
          pauseSession()
        } else if (status === 'paused') {
          resumeSession()
        }
        return
      }

      if (status !== 'active' || !passage) return

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
        playKeySound()
      } else {
        setAnimationState('error')
        playErrorSound()
        setTimeout(() => setAnimationState('typing'), 500)
      }
    },
    [status, passage, input, handleKeystroke, handleBackspace, registerActivity, setAnimationState, setActiveKey, pauseSession, resumeSession, playKeySound, playErrorSound]
  )

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onKeyDown])

  useEffect(() => {
    if (passage && status === 'active' && input.length >= passage.text.length) {
      const result = endSession()
      const xp = onSessionComplete(result)
      setSessionXP(xp.xpEarned)
      playCompleteSound()
    }
  }, [passage, status, input, endSession, playCompleteSound])

  const handleStart = (passageToUse?: Passage) => {
    const p = passageToUse || previewPassage
    if (!p) return
    setSessionXP(null)
    reset()
    startSession(p)
    setAnimationState('typing')
  }

  const handleRestart = () => {
    if (!passage) return
    setSessionXP(null)
    reset()
    startSession(passage)
    setAnimationState('typing')
  }

  const handleNext = () => {
    setSessionXP(null)
    reset()
    loadPassage()
    setAnimationState('idle')
  }

  const handleCategoryChange = (newCategory: typeof category) => {
    setCategory(newCategory)
    loadPassage(newCategory, difficulty)
  }

  const handleDifficultyChange = (newDifficulty: typeof difficulty) => {
    setDifficulty(newDifficulty)
    loadPassage(category, newDifficulty)
  }

  const handleNewPassage = () => {
    loadPassage()
  }

  const handleResume = () => {
    resumeSession()
  }

  const handleQuit = () => {
    reset()
    setSessionXP(null)
    setAnimationState('idle')
  }

  const displayPassage = passage || previewPassage
  const progress = passage ? (input.length / passage.text.length) * 100 : 0
  const isActive = status === 'active' || status === 'paused'

  // Live WPM and accuracy calculation with continuous update
  const [liveStats, setLiveStats] = useState({ wpm: 0, accuracy: 100, correctChars: 0, totalChars: 0 })

  useEffect(() => {
    if (!isActive || !passage) return

    const updateStats = () => {
      const keystrokes = useTypingStore.getState().keystrokes
      const startedAt = useTypingStore.getState().startedAt
      const totalPausedTime = useTypingStore.getState().totalPausedTime
      const currentStatus = useTypingStore.getState().status

      if (keystrokes.length === 0 || !startedAt || currentStatus !== 'active') {
        setLiveStats({ wpm: 0, accuracy: 100, correctChars: 0, totalChars: 0 })
        return
      }

      const elapsed = Date.now() - startedAt - totalPausedTime
      const elapsedMinutes = elapsed / 60000
      const correctChars = keystrokes.filter(k => k.correct).length
      const totalChars = keystrokes.length
      const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100
      const wpm = elapsedMinutes > 0.05 ? Math.round((correctChars / 5) / elapsedMinutes) : 0

      setLiveStats({ wpm, accuracy, correctChars, totalChars })
    }

    updateStats()
    const interval = setInterval(updateStats, 500)
    return () => clearInterval(interval)
  }, [isActive, passage, input])

  const allPassages = passageProvider.getPassages(
    category === 'all' ? undefined : category,
    { difficulty }
  )

  return (
    <div className="w-full h-full flex flex-col">
      {/* Mode Selector */}
      {(status === 'idle' || status === 'complete') && (
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
            {status === 'idle' ? 'PRACTICE' : status === 'paused' ? 'PAUSED' : category.toUpperCase()}
          </h3>
          {isActive && (
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold text-primary">
                {liveStats.wpm} WPM
              </span>
              <span className="text-[10px] font-bold text-success">
                {liveStats.accuracy}%
              </span>
              <span className="text-[10px] font-semibold text-on-surface-variant">
                {Math.round(progress)}%
              </span>
            </div>
          )}
          {!isActive && (
            <span className="text-[10px] font-semibold text-primary">
              {Math.round(progress)}%
            </span>
          )}
        </div>
        <div className="h-1.5 bg-surface-container-highest w-full rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 flex flex-col">
        {/* Typing Area */}
        <section className="flex-1 min-h-0 bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm overflow-hidden relative">
          {/* Idle - Passage Preview */}
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
                <button
                  onClick={() => setBrowseOpen(true)}
                  className="px-4 py-2 border border-outline-variant rounded-lg text-sm hover:bg-surface-container transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">menu</span>
                  Browse
                </button>
              </div>
            </div>
          )}

          {/* Active / Paused - Typing */}
          {(status === 'active' || status === 'paused') && passage && (
            <div className="h-full flex flex-col">
              <div className="flex-1 min-h-0 overflow-y-auto">
                <TextDisplay passage={passage.text} input={input} showErrors={true} />
              </div>
            </div>
          )}

          {/* Complete - Results */}
          {status === 'complete' && lastResult && (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="bg-surface-container rounded-xl p-6 max-w-sm w-full border border-outline-variant">
                <h2 className="text-lg font-bold text-on-surface text-center mb-4">Session Complete!</h2>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-surface-container-low rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-primary">{lastResult.wpm}</p>
                    <p className="text-[10px] text-on-surface-variant uppercase">WPM</p>
                  </div>
                  <div className="bg-surface-container-low rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-primary">{lastResult.accuracy}%</p>
                    <p className="text-[10px] text-on-surface-variant uppercase">Accuracy</p>
                  </div>
                  <div className="bg-surface-container-low rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-secondary">{sessionXP ?? 0}</p>
                    <p className="text-[10px] text-on-surface-variant uppercase">XP Earned</p>
                  </div>
                  <div className="bg-surface-container-low rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-on-surface">{Math.round(lastResult.duration / 1000)}s</p>
                    <p className="text-[10px] text-on-surface-variant uppercase">Time</p>
                  </div>
                </div>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => handleStart()}
                    className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold hover:bg-on-surface-variant transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">replay</span>
                    Try Again
                  </button>
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 border border-outline-variant rounded-lg text-sm font-bold hover:bg-surface-container transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">skip_next</span>
                    New Passage
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pause Overlay */}
          {status === 'paused' && (
            <div className="absolute inset-0 bg-surface-container-lowest/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-10">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-3">pause_circle</span>
              <p className="text-lg font-bold text-on-surface mb-4">Paused</p>
              <div className="flex gap-3">
                <button
                  onClick={handleResume}
                  className="px-6 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold hover:bg-on-surface-variant transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                  Resume
                </button>
                <button
                  onClick={handleQuit}
                  className="px-4 py-2 border border-outline-variant rounded-lg text-sm font-bold hover:bg-surface-container transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                  Quit
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Simple Keyboard */}
        <div className="flex-shrink-0 mt-3">
          <SimpleKeyboard />
        </div>

        {/* Bottom Bar */}
        {isActive && (
          <div className="flex-shrink-0 mt-2 flex justify-between items-center text-on-surface-variant text-[10px]">
            <span>ESC {status === 'paused' ? 'resume' : 'pause'} • Backspace correct</span>
            <div className="flex gap-2">
              <button
                onClick={handleRestart}
                className="px-2 py-1 border border-outline-variant rounded hover:bg-surface-container transition-all active:scale-95"
              >
                Restart
              </button>
              <button
                onClick={handleNext}
                className="px-2 py-1 bg-primary text-on-primary rounded hover:opacity-90 transition-all active:scale-95"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Browse Passages Modal */}
      {browseOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 max-w-lg w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-bold text-on-surface">Browse Passages</h2>
              <button
                onClick={() => setBrowseOpen(false)}
                className="p-1 rounded hover:bg-surface-container transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {allPassages.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setBrowseOpen(false)
                    handleStart(p)
                  }}
                  className="w-full text-left p-3 rounded-lg bg-surface-container hover:bg-surface-container-high transition-all border border-outline-variant/50"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-semibold text-primary">{p.category}</span>
                    <span className="text-[10px] text-on-surface-variant">•</span>
                    <span className="text-[10px] uppercase font-semibold text-secondary">{p.difficulty}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant/70 line-clamp-2">
                    {p.text.slice(0, 100)}...
                  </p>
                </button>
              ))}
              {allPassages.length === 0 && (
                <p className="text-xs text-on-surface-variant text-center py-4">No passages found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
