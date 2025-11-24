import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ImageIcon, FileIcon, LoaderIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { uploadChatMedia } from "@/utils/chat-upload"

export type Attachment = {
  id: string
  type: 'image' | 'document'
  url: string
  name: string
  size?: number
  file: File
  uploadedFilename?: string
}

interface ChatComposerProps {
  placeholder: string
  onSend: (message: string, attachments?: Attachment[]) => void
  disabled?: boolean
}

export function ChatComposer({ placeholder, onSend, disabled }: ChatComposerProps) {
  const [message, setMessage] = React.useState("")
  const [attachments, setAttachments] = React.useState<Attachment[]>([])
  const [isDragOver, setIsDragOver] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadError, setUploadError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const imageInputRef = React.useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((message.trim() || attachments.length > 0) && !disabled && !isUploading) {
      setIsUploading(true)
      setUploadError(null)

      try {
        // Upload all attachments to S3 first
        const uploadedAttachments = await Promise.all(
          attachments.map(async (attachment) => {
            const uploaded = await uploadChatMedia(attachment.file)
            return {
              ...attachment,
              url: uploaded.publicUrl,
              uploadedFilename: uploaded.filename,
            }
          })
        )

        // Send message with uploaded URLs
        onSend(message.trim(), uploadedAttachments)
        setMessage("")
        setAttachments([])
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Upload failed"
        setUploadError(errorMessage)
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleFileSelect = (files: FileList | null, type: 'image' | 'document') => {
    if (!files) return

    const newAttachments: Attachment[] = Array.from(files).map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      type,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      file
    }))

    setAttachments(prev => [...prev, ...newAttachments])
  }

  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === id)
      if (attachment) {
        URL.revokeObjectURL(attachment.url)
      }
      return prev.filter(a => a.id !== id)
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files, 'document')
    }
  }

  return (
    <div className="border-t bg-background sticky bottom-0 md:static md:pb-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="px-3 py-2 border-b bg-muted/30">
          {uploadError && (
            <p className="text-destructive text-xs mb-2">{uploadError}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 bg-background rounded-md px-2 py-1 border text-xs"
              >
                {attachment.type === 'image' ? (
                  <ImageIcon className="w-3 h-3" />
                ) : (
                  <FileIcon className="w-3 h-3" />
                )}
                <span className="truncate max-w-32">{attachment.name}</span>
                <button
                  onClick={() => removeAttachment(attachment.id)}
                  className="text-muted-foreground hover:text-foreground ml-1"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt,.xlsx,.pptx"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files, 'document')}
      />
      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files, 'image')}
      />

      {/* Composer form */}
      <form
        onSubmit={handleSubmit}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "p-3 flex items-end gap-2 transition-colors",
          isDragOver && "bg-primary/5"
        )}
      >
        <div className="flex gap-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => imageInputRef.current?.click()}
            disabled={disabled}
            className="shrink-0"
          >
            <ImageIcon className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="shrink-0"
          >
            <FileIcon className="w-4 h-4" />
          </Button>
        </div>

        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
          disabled={disabled}
        />

        <Button
          type="submit"
          size="sm"
          disabled={disabled || isUploading || (!message.trim() && attachments.length === 0)}
        >
          {isUploading ? (
            <>
              <LoaderIcon className="w-4 h-4 mr-1 animate-spin" />
              Uploading...
            </>
          ) : (
            "Send"
          )}
        </Button>
      </form>
    </div>
  )
}
