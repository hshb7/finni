import { useState, useEffect, useRef, useCallback } from 'react'
import type { ReactNode, MouseEvent } from 'react'

import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { applyTheme, getInitialTheme } from '@/lib/theme'

type Props = {
  trigger: ReactNode
}

const ThemeToggle = ({ trigger }: Props) => {
  const [theme, setTheme] = useState(getInitialTheme)
  const { user } = useAuth()
  const btnRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggle = useCallback(
    (e: MouseEvent) => {
      const next = theme === 'dark' ? 'light' : 'dark'

      const rect = btnRef.current?.getBoundingClientRect()
      const x = rect ? rect.left + rect.width / 2 : e.clientX
      const y = rect ? rect.top + rect.height / 2 : e.clientY

      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      )

      // Use View Transitions API if supported
      if (document.startViewTransition) {
        const transition = document.startViewTransition(() => {
          setTheme(next)
        })
        transition.ready.then(() => {
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${endRadius}px at ${x}px ${y}px)`,
              ],
            },
            {
              duration: 700,
              easing: 'ease-out',
              pseudoElement: '::view-transition-new(root)',
            },
          )
        })
      } else {
        setTheme(next)
      }

      if (user) {
        supabase
          .from('user_settings')
          .update({ theme: next, updated_at: new Date().toISOString() })
          .eq('auth_user_id', user.id)
          .then()
      }
    },
    [theme, user],
  )

  return (
    <div ref={btnRef} onClick={toggle}>
      {trigger}
    </div>
  )
}

export default ThemeToggle
