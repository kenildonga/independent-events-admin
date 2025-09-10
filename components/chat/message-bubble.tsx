"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type MessageBubbleProps = {
  author: string
  text: string
  time: string
  me?: boolean
}

export function MessageBubble({ author, text, time, me }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "max-w-[75%] flex flex-col gap-1 text-sm",
        me ? "ml-auto items-end" : "items-start"
      )}
    >
      <div
        className={cn(
          "rounded-md px-3 py-2 shadow-sm",
          me
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-accent text-foreground rounded-bl-sm"
        )}
      >
        {!me && (
          <p className="font-medium text-xs mb-0.5 opacity-90">{author}</p>
        )}
        <p className="whitespace-pre-wrap leading-snug">{text}</p>
      </div>
      <span className="text-muted-foreground text-[10px] tracking-wide">
        {time}
      </span>
    </div>
  )
}
