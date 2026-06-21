import { useSettingsStore } from '../../stores/settingsStore'
import { useProgressionStore } from '../../stores/progressionStore'
import { useStatsStore } from '../../stores/statsStore'
import { characters, getCharacter } from '../../features/cat-companion/characters'

export default function SettingsPage() {
  const {
    theme,
    soundEnabled,
    reducedMotion,
    difficulty,
    category,
    characterId,
    setTheme,
    toggleSound,
    toggleReducedMotion,
    setDifficulty,
    setCategory,
    setCharacter,
  } = useSettingsStore()

  const { level, xp, getXPForNextLevel } = useProgressionStore()
  const { totalSessionsCompleted } = useStatsStore()

  const currentCharacter = getCharacter(characterId)

  return (
    <div className="w-full">
      {/* Profile Section */}
      <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-lg mb-gutter">
        <h2 className="text-xl font-bold text-on-surface mb-6">Profile</h2>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden flex-shrink-0">
            <img
              src={currentCharacter.cover}
              alt={currentCharacter.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg font-bold text-on-surface">{currentCharacter.name}</h3>
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-2">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{level}</p>
                <p className="text-xs text-on-surface-variant">Level</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{xp}/{getXPForNextLevel()}</p>
                <p className="text-xs text-on-surface-variant">XP</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{totalSessionsCompleted}</p>
                <p className="text-xs text-on-surface-variant">Sessions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Character Selector */}
      <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-lg mb-gutter">
        <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined">pets</span>
          Typing Companion
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {characters.map((char) => (
            <button
              key={char.id}
              onClick={() => setCharacter(char.id)}
              className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                characterId === char.id
                  ? 'border-primary bg-secondary-container'
                  : 'border-outline-variant hover:border-outline bg-surface-container-lowest'
              }`}
            >
              <div className="w-16 h-16 rounded-full overflow-hidden mb-2">
                <img src={char.cover} alt={char.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-xs font-semibold text-on-surface">{char.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-lg mb-gutter">
        <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined">palette</span>
          Appearance
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-xs text-on-surface-variant">Choose your preferred theme</p>
            </div>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as typeof theme)}
              className="bg-surface-container-high text-on-surface rounded-lg px-4 py-2 border border-outline-variant focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>
      </div>

      {/* Typing */}
      <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-lg mb-gutter">
        <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined">keyboard</span>
          Typing
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Difficulty</p>
              <p className="text-xs text-on-surface-variant">Select passage difficulty</p>
            </div>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
              className="bg-surface-container-high text-on-surface rounded-lg px-4 py-2 border border-outline-variant focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Category</p>
              <p className="text-xs text-on-surface-variant">Choose passage category</p>
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as typeof category)}
              className="bg-surface-container-high text-on-surface rounded-lg px-4 py-2 border border-outline-variant focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="all">All</option>
              <option value="english">English</option>
              <option value="anime">Anime</option>
              <option value="programming">Programming</option>
            </select>
          </div>
        </div>
      </div>

      {/* Accessibility */}
      <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-lg mb-gutter">
        <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined">accessibility_new</span>
          Accessibility
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Sound Effects</p>
              <p className="text-xs text-on-surface-variant">Enable typing sounds</p>
            </div>
            <button
              onClick={toggleSound}
              className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                soundEnabled ? 'bg-primary' : 'bg-surface-container-high'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Reduced Motion</p>
              <p className="text-xs text-on-surface-variant">Minimize animations</p>
            </div>
            <button
              onClick={toggleReducedMotion}
              className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                reducedMotion ? 'bg-primary' : 'bg-surface-container-high'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                reducedMotion ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Data */}
      <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-lg">
        <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined">storage</span>
          Data
        </h3>
        <button
          onClick={() => {
            if (confirm('Are you sure? This will delete all your progress.')) {
              localStorage.clear()
              window.location.reload()
            }
          }}
          className="px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-container transition-all active:scale-95"
        >
          Reset All Data
        </button>
      </div>
    </div>
  )
}