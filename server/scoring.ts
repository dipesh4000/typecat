export function score(text: string, strokes: { char: string; timestamp: number }[], duration: number) {
  if (!Number.isInteger(duration) || duration < 5000 || duration > 1800000) throw new Error('Ranked sessions must last 5 seconds to 30 minutes')
  if (!Array.isArray(strokes) || strokes.length !== text.length || text.length < 25) throw new Error('Complete a supported passage of at least 25 characters')
  let previous = -Infinity
  let correct = 0
  const first = strokes[0]?.timestamp
  for (let i = 0; i < strokes.length; i++) {
    const stroke = strokes[i]
    if (typeof stroke.char !== 'string' || stroke.char.length !== 1 || !Number.isFinite(stroke.timestamp) || stroke.timestamp < previous) throw new Error('Invalid keystroke log')
    previous = stroke.timestamp
    if (stroke.char === text[i]) correct++
  }
  if (previous - first > duration + 1000) throw new Error('Keystroke timing exceeds session duration; paused sessions are practice only')
  const wpm = Math.round(correct * 12000 / duration)
  if (wpm > 350) throw new Error('Speed exceeds ranked limit')
  return { wpm, accuracy: Math.round(correct * 100 / text.length), duration }
}
