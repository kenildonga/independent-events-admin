"use client"

import * as React from "react"

export type DateSeparatorProps = {
  date: string
}

export function DateSeparator({ date }: DateSeparatorProps) {
  return (
    <div className="flex items-center justify-center my-4">
      <div className="flex items-center gap-3">
        <div className="h-px bg-border flex-1" />
        <span className="text-xs text-muted-foreground font-medium px-2 py-1 bg-background rounded-full border">
          {date}
        </span>
        <div className="h-px bg-border flex-1" />
      </div>
    </div>
  )
}
