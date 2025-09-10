"use client"

import * as React from "react"
import { Avatar } from "@/components/ui/avatar"
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
}

type ChatDetailsProps = {
  chat: ChatItem | null
  trigger: React.ReactNode
}

export function ChatDetails({ chat, trigger }: ChatDetailsProps) {
  if (!chat) return trigger as React.ReactElement
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{chat.name}</DialogTitle>
          <DialogDescription>
            {chat.isGroup ? "Group conversation" : "Direct conversation"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="flex gap-2 items-center">
            <Avatar className="size-10" />
            <div>
              <p className="font-medium leading-tight">{chat.name}</p>
              <p className="text-muted-foreground text-xs">
                {chat.isGroup ? "Team / Channel" : "Person"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border p-2">
              <p className="text-xs text-muted-foreground">Unread</p>
              <p className="font-semibold">{chat.unread ?? 0}</p>
            </div>
            <div className="rounded-md border p-2">
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="font-semibold">{chat.isGroup ? "Group" : "Direct"}</p>
            </div>
          </div>
          <div className="rounded-md border p-3 bg-muted/30 text-xs text-muted-foreground">
            This dialog can be extended with member lists, shared files, and settings.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
