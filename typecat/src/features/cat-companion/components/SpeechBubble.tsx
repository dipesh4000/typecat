import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

interface SpeechBubbleProps {
  message: string
}

export function SpeechBubble({ message }: SpeechBubbleProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setVisible(true)
    const timer = setTimeout(() => setVisible(false), 2000)
    return () => clearTimeout(timer)
  }, [message])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.9 }}
          className="relative bg-white rounded-2xl px-4 py-2 shadow-lg"
        >
          <span className="text-on-surface font-medium">{message}</span>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-white" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}