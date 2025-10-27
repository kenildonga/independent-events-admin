"use client"

import * as React from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import Image from "next/image"
import { FileIcon, DownloadIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type Attachment = {
  id: string
  type: 'image' | 'document'
  url: string
  name: string
  size?: number
}

export type MessageBubbleProps = {
  author: string
  text: string
  time: string
  date?: string
  me?: boolean
  attachments?: Attachment[]
  avatar?: string
}

export function MessageBubble({ author, text, time, date, me, attachments, avatar }: MessageBubbleProps) {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  // Cleanup object URLs on unmount
  React.useEffect(() => {
    return () => {
      if (attachments) {
        attachments.forEach(attachment => {
          if (attachment.url.startsWith('blob:')) {
            URL.revokeObjectURL(attachment.url)
          }
        })
      }
    }
  }, [attachments])

  return (
    <div
      className={cn(
        "max-w-[75%] flex items-start gap-3 text-sm",
        me ? "ml-auto flex-row-reverse" : "items-start"
      )}
    >
      {!me && (
        <Avatar className="size-8 mt-1">
          <AvatarImage src={avatar} alt={author} />
          <AvatarFallback className="text-xs">
            {author.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </AvatarFallback>
        </Avatar>
      )}
  <div className="flex flex-col gap-1 max-w-full">
        <div
          className={cn(
    "w-fit max-w-full rounded-md px-3 py-2 shadow-sm break-words",
            me
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-accent text-foreground rounded-bl-sm"
          )}
        >
          {!me && (
            <p className="font-medium text-xs mb-0.5 opacity-90">{author}</p>
          )}        {/* Attachments */}
        {attachments && attachments.length > 0 && (
          <div className="space-y-2 mb-2">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center gap-2">
                {attachment.type === 'image' ? (
                  <div className="relative group">
                    <Image
                      src={attachment.url}
                      alt={attachment.name}
                      width={200}
                      height={150}
                      className="rounded-md object-cover max-w-full h-auto"
                      onError={(e) => {
                        // Fallback to a placeholder if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+PC9zdmc+';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => window.open(attachment.url, '_blank')}
                        className="text-xs"
                      >
                        <DownloadIcon className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-background/10 rounded-md border">
                    <FileIcon className="w-4 h-4" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{attachment.name}</p>
                      {attachment.size && (
                        <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(attachment.url, '_blank')}
                      className="h-6 w-6 p-0"
                    >
                      <DownloadIcon className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Text content */}
        {text && <p className="whitespace-pre-wrap leading-snug">{text}</p>}

        {/* Show attachments even if no text */}
        {!text && attachments && attachments.length > 0 && (
          <p className="text-xs text-muted-foreground italic">Shared {attachments.length} file{attachments.length > 1 ? 's' : ''}</p>
        )}
      </div>
      <span className="text-muted-foreground text-[10px] tracking-wide">
        {date && `${date} • `}{time}
      </span>
      </div>
    </div>
  )
}
