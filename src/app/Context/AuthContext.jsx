'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function carregarUsuario() {
      setLoading(true)

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      console.log('user:', user)
      console.log('authError:', authError)

      if (!user) {
        setUsuario(null)
        setLoading(false)
        return
      }

      const { data, error: dbError } = await supabase
        .from('usuarios').select('nome, cargo, status').eq('id', user.id).single()

      console.log('data:', data)
      console.log('dbError:', dbError)

      if (dbError) {
        setUsuario(null)
      } else {
        setUsuario({
          id: user.id,
          email: user.email,
          ...data,
          start : data.nome.split('').slice(0 , 2 ).map(n => n[0]).join('').toUpperCase()
        })
      }

      setLoading(false)
    }

    carregarUsuario()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      carregarUsuario()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ usuario, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook para usar em qualquer componente
export function useAuth() {
  return useContext(AuthContext)
}