"use client"

import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export default function LogoutButton({ 
  variant = 'ghost', 
  size = 'default',
  className = '' 
}: LogoutButtonProps) {
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={handleLogout}
      className={className}
    >
      <LogOut className="h-4 w-4 mr-2" />
      Logout
    </Button>
  )
}