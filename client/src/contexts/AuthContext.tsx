import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { applyTheme } from '@/lib/theme'

export type UserProfile = {
  id: string
  auth_user_id: string
  display_name: string
  role: string
  phone: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type UserSettings = {
  id: string
  auth_user_id: string
  theme: 'light' | 'dark' | 'system'
  notifications_enabled: boolean
  page_size: number
  date_format: string
  updated_at: string
}

type AuthContextValue = {
  user: User | null
  profile: UserProfile | null
  settings: UserSettings | null
  isLoading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  refreshSettings: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('auth_user_id', userId)
      .single()
    setProfile(data)
  }, [])

  const fetchSettings = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('user_settings')
      .select('*')
      .eq('auth_user_id', userId)
      .single()
    if (data) {
      setSettings(data)
      applyTheme(data.theme)
      localStorage.setItem('theme', data.theme)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id)
  }, [user, fetchProfile])

  const refreshSettings = useCallback(async () => {
    if (user) await fetchSettings(user.id)
  }, [user, fetchSettings])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSettings(null)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        Promise.all([
          fetchProfile(currentUser.id),
          fetchSettings(currentUser.id),
        ]).finally(() => setIsLoading(false))
      } else {
        setIsLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        fetchProfile(currentUser.id)
        fetchSettings(currentUser.id)
      } else {
        setProfile(null)
        setSettings(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile, fetchSettings])

  return (
    <AuthContext.Provider value={{ user, profile, settings, isLoading, signOut, refreshProfile, refreshSettings }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
