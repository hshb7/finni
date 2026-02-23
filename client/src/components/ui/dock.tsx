import React, { useRef, createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { cn } from '@/lib/utils'

const MAGNIFICATION = 1.4
const DISTANCE = 140

const MouseContext = createContext<MotionValue<number> | null>(null)

function DockIcon({ children }: { children: ReactNode }) {
  const mouseX = useContext(MouseContext)!
  const ref = useRef<HTMLDivElement>(null)

  const distance = useTransform(mouseX, (val: number) => {
    const el = ref.current
    if (!el) return DISTANCE
    const rect = el.getBoundingClientRect()
    return val - rect.left - rect.width / 2
  })

  const scaleTransform = useTransform(
    distance,
    [-DISTANCE, 0, DISTANCE],
    [1, MAGNIFICATION, 1]
  )

  const scale = useSpring(scaleTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  })

  return (
    <motion.div
      ref={ref}
      style={{ scale }}
      className='flex items-center justify-center'
    >
      {children}
    </motion.div>
  )
}

function Dock({ children, className }: { children: ReactNode; className?: string }) {
  const mouseX = useMotionValue(Infinity)

  return (
    <MouseContext.Provider value={mouseX}>
      <motion.div
        className={cn('flex items-center', className)}
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
      >
        {React.Children.map(children, (child) => (
          <DockIcon>{child}</DockIcon>
        ))}
      </motion.div>
    </MouseContext.Provider>
  )
}

export { Dock }
