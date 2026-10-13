import { useCallback } from 'react'
import { useSettingsStore } from '../../stores/settingsStore'

const audioContext = typeof AudioContext !== 'undefined' ? new AudioContext() : null

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.1) {
  if (!audioContext) return

  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.value = frequency
  oscillator.type = type

  gainNode.gain.setValueAtTime(volume, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + duration)
  oscillator.onended = () => { oscillator.disconnect(); gainNode.disconnect() }
}

export function useSound() {
  const soundEnabled = useSettingsStore((s) => s.soundEnabled)

  const playKeySound = useCallback(() => {
    if (!soundEnabled) return
    playTone(800 + Math.random() * 200, 0.05, 'sine', 0.08)
  }, [soundEnabled])

  const playErrorSound = useCallback(() => {
    if (!soundEnabled) return
    playTone(200, 0.15, 'square', 0.1)
  }, [soundEnabled])

  const playCompleteSound = useCallback(() => {
    if (!soundEnabled) return
    playTone(523, 0.1, 'sine', 0.15)
    setTimeout(() => playTone(659, 0.1, 'sine', 0.15), 100)
    setTimeout(() => playTone(784, 0.15, 'sine', 0.15), 200)
  }, [soundEnabled])

  const playStartSound = useCallback(() => {
    if (!soundEnabled) return
    playTone(440, 0.08, 'sine', 0.1)
  }, [soundEnabled])

  return { playKeySound, playErrorSound, playCompleteSound, playStartSound }
}
