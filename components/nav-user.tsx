"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

import {
  SidebarMenuButton,
} from "@/components/ui/sidebar"

import { LogOut } from 'lucide-react'
import { Button } from "./ui/button"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  return (
    <div className="flex w-full items-center">
      <SidebarMenuButton
        size="lg"
        className="flex-1"  
      >
        <Avatar className="h-8 w-8 rounded-lg grayscale">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="rounded-lg">A</AvatarFallback>
        </Avatar>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">{user.name}</span>
          <span className="text-muted-foreground truncate text-xs">
            {user.email}
          </span>
        </div>
      </SidebarMenuButton>
      <Button variant="outline" size="sm" className="ml-2 p-1">
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  )
}
