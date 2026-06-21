import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

interface AchievementToastProps {
  name: string
  description: string
  onDismiss: () => void
}

export function AchievementToast({ name, description, onDismiss }: AchievementToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onDismiss()
    }, 4000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 50, x: '-50%' }}
          className="fixed bottom-8 left-1/2 bg-surface-container-low border border-outline-variant rounded-2xl px-6 py-4 shadow-lg z-50"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
              <span className="text-2xl">🏆</span>
            </div>
            <div>
              <p className="text-on-surface font-semibold">{name}</p>
              <p className="text-on-surface-variant text-sm">{description}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}