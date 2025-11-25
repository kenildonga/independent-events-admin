"use client"

import * as React from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { UsersIcon, Trash2Icon } from "lucide-react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

export type ChatItem = {
  id: string
  name: string
  lastMessage?: string
  unread?: number
  isGroup?: boolean
  avatar?: string
  type?: 'group' | 'direct' | 'channel'
  members?: {
    id: string
    name: string
    avatar?: string
    role?: string
  }[]
}

type ChatDetailsProps = {
  chat: ChatItem | null
  trigger: React.ReactNode
}

export function ChatDetails({ chat, trigger }: ChatDetailsProps) {
  if (!chat) return trigger as React.ReactElement

  // Mock members for design demonstration if none provided
  const displayMembers = chat.members || [
    { id: "1", name: "Alice Johnson", role: "admin" },
    { id: "2", name: "Bob Smith", role: "member" },
    { id: "3", name: "Charlie Brown", role: "member" },
    { id: "4", name: "David Wilson", role: "member" },
    { id: "5", name: "Eve Davis", role: "member" },
  ]

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{chat.name}</DialogTitle>
          <DialogDescription>
            {chat.type === 'channel' ? "Channel broadcast" : chat.isGroup ? "Group conversation" : "Direct conversation"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex gap-3 items-center">
            <Avatar className="size-12">
              <AvatarImage src={chat.avatar} alt={chat.name} />
              <AvatarFallback>
                {chat.isGroup ? (
                  <UsersIcon className="size-6" />
                ) : (
                  chat.name.split(' ').map(n => n[0]).join('').slice(0, 2)
                )}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg leading-none">{chat.name}</h3>
              <p className="text-muted-foreground text-sm mt-1">
                {chat.type === 'channel' ? "Channel" : chat.isGroup ? "Team / Group" : "Person"}
              </p>
            </div>
          </div>

          {chat.type === 'group' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Joined Users</h4>
                <span className="text-xs text-muted-foreground">{displayMembers.length} members</span>
              </div>
              <div className="rounded-lg border divide-y max-h-[240px] overflow-y-auto">
                {displayMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="text-xs">{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">{member.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 capitalize">{member.role || 'member'}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Remove user"
                    >
                      <Trash2Icon className="size-4" />
                      <span className="sr-only">Remove {member.name}</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {!chat.isGroup && chat.type !== 'channel' && (
             <div className="rounded-md border p-3 bg-muted/30 text-xs text-muted-foreground">
                This is a direct conversation between you and {chat.name}.
             </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
