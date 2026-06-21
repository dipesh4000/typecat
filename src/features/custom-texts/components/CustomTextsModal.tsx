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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-50" onClick={onClose}>
      <div className="bg-surface-container-lowest border border-outline-variant rounded-t-xl md:rounded-xl p-4 max-w-lg w-full max-h-[85vh] md:max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-bold text-on-surface">
            {creating ? (editing ? 'Edit Text' : 'New Custom Text') : 'My Custom Texts'}
          </h2>
          <button
            onClick={() => creating ? (setCreating(false), setEditing(null)) : onClose()}
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
                    <button onClick={() => {
                      if (window.confirm(`Delete "${p.subcategory ?? 'Untitled'}"? This cannot be undone.`)) {
                        handleDelete(p.id)
                      }
                    }} className="p-1 rounded hover:bg-surface-container-high transition-all" title="Delete">
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
