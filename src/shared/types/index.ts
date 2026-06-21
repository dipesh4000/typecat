export interface Passage {
  id: string
  category: 'english' | 'anime' | 'programming'
  subcategory?: string
  difficulty: 'easy' | 'medium' | 'hard'
  text: string
  source?: string
  tags?: string[]
}

export interface Keystroke {
  char: string
  expected: string
  timestamp: number
  correct: boolean
}

export interface SessionResult {
  passageId: string
  wpm: number
  accuracy: number
  consistency: number
  totalChars: number
  correctChars: number
  errorChars: number
  duration: number
  timestamp: number
  keystrokes: Keystroke[]
}