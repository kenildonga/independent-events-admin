"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { setAuthCookies, clearAuthCookies } from '@/utils/axios'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  token: string | null
  adminId: string | null
  login: (token: string, adminId: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const [adminId, setAdminId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check authentication status on mount
    const initAuth = () => {
      if (typeof window === 'undefined') return

      const storedToken = localStorage.getItem('token')
      const storedAdminId = localStorage.getItem('adminId')
      
      if (storedToken && storedAdminId) {
        setToken(storedToken)
        setAdminId(storedAdminId)
        setIsAuthenticated(true)
        
        // Ensure cookies are set
        setAuthCookies(storedToken, storedAdminId)
      }
      
      setIsLoading(false)
    }

    initAuth()

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'adminId') {
        initAuth()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const login = (newToken: string, newAdminId: string) => {
    // Set localStorage
    localStorage.setItem('token', newToken)
    localStorage.setItem('adminId', newAdminId)
    
    // Set cookies
    setAuthCookies(newToken, newAdminId)
    
    // Update state
    setToken(newToken)
    setAdminId(newAdminId)
    setIsAuthenticated(true)
  }

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('adminId')
    
    // Clear cookies
    clearAuthCookies()
    
    // Update state
    setToken(null)
    setAdminId(null)
    setIsAuthenticated(false)
    
    // Redirect to login
    router.push('/login')
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        token,
        adminId,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}