import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: User | null
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ user: null, loading: true })

  useEffect(() => {
    if (!supabase) {
      setState({ user: null, loading: false })
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({ user: session?.user ?? null, loading: false })
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ user: session?.user ?? null, loading: false })
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signInWithEmail(email: string): Promise<{ error: string | null }> {
    if (!supabase) return { error: 'Supabase not configured' }
    const redirectTo = `${window.location.origin}${window.location.pathname}`
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    })
    return { error: error?.message ?? null }
  }

  async function signOut(): Promise<void> {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  return {
    user: state.user,
    loading: state.loading,
    isOwner: state.user !== null,
    signInWithEmail,
    signOut,
  }
}
