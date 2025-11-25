import * as React from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { UsersIcon, MegaphoneIcon } from "lucide-react"
import { ChatDetails, type ChatItem } from "@/components/chat/chat-details"

interface ChatHeaderProps {
  selectedChat: ChatItem | null
  activeTab: string
  isMobile?: boolean
}

export function ChatHeader({ selectedChat, activeTab, isMobile }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b px-4 py-3">
      <ChatDetails
        chat={selectedChat}
        trigger={
          <button
            className="flex items-center gap-3 min-w-0 cursor-pointer select-none text-left focus-visible:outline-none focus-visible:ring-2 ring-ring/40 rounded-md px-1 -mx-1"
            aria-label="Open conversation details"
            type="button"
          >
            <Avatar className={isMobile ? "size-8" : "size-9"}>
              <AvatarImage src={selectedChat?.avatar} alt={selectedChat?.name || "Chat"} />
              <AvatarFallback className="text-xs">
                {activeTab === "groups" || selectedChat?.isGroup ? (
                  <UsersIcon className="size-4" />
                ) : activeTab === "channels" ? (
                  <MegaphoneIcon className="size-4" />
                ) : (
                  (selectedChat?.name || "").split(" ").map(n => n[0]).join("").slice(0, 2)
                )}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              {isMobile ? (
                <>
                  <h1 className="font-semibold text-base truncate">
                    {selectedChat?.name ?? "Chat"}
                  </h1>
                  <span className="text-muted-foreground text-xs truncate hidden sm:inline">
                    {activeTab === "groups" ? "Group" : activeTab === "channels" ? "Channel" : "Direct"}
                  </span>
                </>
              ) : (
                <>
                  <h2 className="font-semibold leading-tight truncate">
                    {selectedChat?.name}
                  </h2>
                  <p className="text-muted-foreground text-xs">
                    {activeTab === "groups" ? "Group chat" : activeTab === "channels" ? "Channel" : "Direct message"}
                  </p>
                </>
              )}
            </div>
          </button>
        }
      />
    </div>
  )
}
