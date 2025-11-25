import * as React from "react"
import { UsersIcon, MessageSquareIcon, SearchIcon, MegaphoneIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { type ChatItem } from "@/components/chat/chat-details"

interface ConversationListProps {
  groupChats: ChatItem[]
  directChats: ChatItem[]
  channelChats: ChatItem[]
  activeTab: string
  onTabChange: (tab: string) => void
  selectedChat: ChatItem | null
  onChatSelect: (chat: ChatItem) => void
  onSearchChange?: (value: string) => void
}

export function ConversationList({
  groupChats,
  directChats,
  channelChats,
  activeTab,
  onTabChange,
  selectedChat,
  onChatSelect,
  onSearchChange
}: ConversationListProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="p-3 pt-4 mt-6">
        <div className="relative">
          <SearchIcon className="text-muted-foreground absolute left-2 top-1/2 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search…"
            className="pl-8 h-9 text-sm"
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>
      </div>
      <Tabs
        value={activeTab}
        onValueChange={onTabChange}
        className="flex-1 flex flex-col min-h-0"
      >
        <div className="border-b px-3 pb-2">
          <TabsList className="h-8 w-full justify-start">
            <TabsTrigger value="groups" className="px-3 flex-1">
              <UsersIcon className="size-4 mr-2" />
            </TabsTrigger>
            <TabsTrigger value="channels" className="px-3 flex-1">
              <MegaphoneIcon className="size-4 mr-2" />
            </TabsTrigger>
            <TabsTrigger value="direct" className="px-3 flex-1">
              <MessageSquareIcon className="size-4 mr-2" />
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="groups" asChild className="flex-1 mt-0">
          <ul className="flex-1 overflow-y-auto px-2 pb-3 space-y-1">
            {groupChats.map((chat) => (
              <li key={`group-${chat.id}`}>
                <button
                  onClick={() => onChatSelect(chat)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                    "hover:bg-accent/50 focus-visible:bg-accent/70 outline-none focus-visible:ring-2 ring-ring/40",
                    selectedChat?.id === chat.id && "bg-accent/60 ring-1 ring-ring/30"
                  )}
                >
                  <Avatar className="size-8">
                    <AvatarImage src={chat.avatar} alt={chat.name} />
                    <AvatarFallback>
                      <UsersIcon className="size-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{chat.name}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {chat.lastMessage}
                    </p>
                  </div>
                  {chat.unread ? (
                    <span className="bg-primary text-primary-foreground ml-auto inline-flex min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold">
                      {chat.unread}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </TabsContent>
        <TabsContent value="channels" asChild className="flex-1 mt-0">
          <ul className="flex-1 overflow-y-auto px-2 pb-3 space-y-1">
            {channelChats.map((chat) => (
              <li key={`channel-${chat.id}`}>
                <button
                  onClick={() => onChatSelect(chat)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                    "hover:bg-accent/50 focus-visible:bg-accent/70 outline-none focus-visible:ring-2 ring-ring/40",
                    selectedChat?.id === chat.id && "bg-accent/60 ring-1 ring-ring/30"
                  )}
                >
                  <Avatar className="size-8">
                    <AvatarImage src={chat.avatar} alt={chat.name} />
                    <AvatarFallback>
                      <MegaphoneIcon className="size-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{chat.name}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {chat.lastMessage}
                    </p>
                  </div>
                  {chat.unread ? (
                    <span className="bg-primary text-primary-foreground ml-auto inline-flex min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold">
                      {chat.unread}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </TabsContent>
        <TabsContent value="direct" asChild className="flex-1 mt-0">
          <ul className="flex-1 overflow-y-auto px-2 pb-3 space-y-1">
            {directChats.map((chat) => (
              <li key={chat.id}>
                <button
                  onClick={() => onChatSelect(chat)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                    "hover:bg-accent/50 focus-visible:bg-accent/70 outline-none focus-visible:ring-2 ring-ring/40",
                    selectedChat?.id === chat.id && "bg-accent/60 ring-1 ring-ring/30"
                  )}
                >
                  <Avatar className="size-8">
                    <AvatarImage src={chat.avatar} alt={chat.name} />
                    <AvatarFallback>
                      {chat.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{chat.name}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {chat.lastMessage}
                    </p>
                  </div>
                  {chat.unread ? (
                    <span className="bg-primary text-primary-foreground ml-auto inline-flex min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold">
                      {chat.unread}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  )
}
