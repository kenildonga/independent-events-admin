"use client"

import * as React from "react"
import { UsersIcon, MessageSquareIcon, MenuIcon, SearchIcon } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { ChatDetails, type ChatItem } from "@/components/chat/chat-details"
import { MessageBubble } from "@/components/chat/message-bubble"

import { AppSidebar } from "@/components/app-sidebar"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { SidebarTrigger } from "@/components/ui/sidebar"

const groupChats: ChatItem[] = [
    {
        id: "g-1",
        name: "Product Team",
        lastMessage: "Design handoff ready.",
        unread: 2,
        isGroup: true,
    },
    {
        id: "g-2",
        name: "Marketing Sprint",
        lastMessage: "Scheduled next campaign.",
        unread: 0,
        isGroup: true,
    }
]

const directChats: ChatItem[] = [
    {
        id: "u-1",
        name: "Alice Johnson",
        lastMessage: "I'll push the changes.",
        unread: 1,
    },
    {
        id: "u-2",
        name: "David Park",
        lastMessage: "Thanks!",
        unread: 0,
    },
    {
        id: "u-3",
        name: "Sarah Kim",
        lastMessage: "Can we sync at 3?",
        unread: 4,
    },
]

export default function ChatPage() {
    const isMobile = useIsMobile()
    const [activeTab, setActiveTab] = React.useState("groups")
    const [selectedChat, setSelectedChat] = React.useState<ChatItem | null>(
        groupChats[0] ?? null
    )
    const [sheetOpen, setSheetOpen] = React.useState(false)

    const chats = activeTab === "groups" ? groupChats : directChats

    React.useEffect(() => {
        if (selectedChat) {
            const stillExists = [...groupChats, ...directChats].some(
                (c) => c.id === selectedChat.id
            )
            if (!stillExists) setSelectedChat(null)
        }
    }, [activeTab, selectedChat])

    const ConversationList = (
        <div className="flex h-full flex-col overflow-hidden">
            <div className="p-3 pt-4 mt-6">
                <div className="relative">
                    <SearchIcon className="text-muted-foreground absolute left-2 top-1/2 size-4 -translate-y-1/2" />
                    <Input
                        placeholder="Search…"
                        className="pl-8 h-9 text-sm"
                        onChange={() => { }}
                    />
                </div>
            </div>
            <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v)}
                className="flex-1 flex min-h-0"
            >
                <div className="border-b px-3 pb-2">
                    <TabsList className="h-8">
                        <TabsTrigger value="groups" className="px-3">
                            <UsersIcon className="size-4" />
                            <span className="hidden sm:inline">Groups</span>
                        </TabsTrigger>
                        <TabsTrigger value="direct" className="px-3">
                            <MessageSquareIcon className="size-4" />
                            <span className="hidden sm:inline">Direct</span>
                        </TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="groups" asChild>
                    <ul className="flex-1 overflow-y-auto px-2 pb-3 space-y-1">
                        {groupChats.map((chat) => (
                            <li key={chat.id}>
                                <button
                                    onClick={() => {
                                        setSelectedChat(chat)
                                        if (isMobile) setSheetOpen(false)
                                    }}
                                    className={cn(
                                        "w-full flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                                        "hover:bg-accent/50 focus-visible:bg-accent/70 outline-none focus-visible:ring-2 ring-ring/40",
                                        selectedChat?.id === chat.id &&
                                        "bg-accent/60 ring-1 ring-ring/30"
                                    )}
                                >
                                    <Avatar className="size-8" />
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
                <TabsContent value="direct" asChild>
                    <ul className="flex-1 overflow-y-auto px-2 pb-3 space-y-1">
                        {directChats.map((chat) => (
                            <li key={chat.id}>
                                <button
                                    onClick={() => {
                                        setSelectedChat(chat)
                                        if (isMobile) setSheetOpen(false)
                                    }}
                                    className={cn(
                                        "w-full flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                                        "hover:bg-accent/50 focus-visible:bg-accent/70 outline-none focus-visible:ring-2 ring-ring/40",
                                        selectedChat?.id === chat.id &&
                                        "bg-accent/60 ring-1 ring-ring/30"
                                    )}
                                >
                                    <Avatar className="size-8" />
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

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset style={{ margin: "0" }}>
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col">
                        <div className="flex flex-col">
                            <div className="flex h-dvh flex-col md:flex-row overflow-hidden">
                                {/* Desktop list */}
                                <aside className="hidden w-72 shrink-0 border-r md:flex md:flex-col bg-background/50">
                                    {ConversationList}
                                </aside>

                                {/* Mobile trigger */}
                                {isMobile && (
                                    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                                        {/* Mobile header with details dialog trigger */}
                                        <div className="flex items-center justify-between border-b px-4 py-3 gap-2 md:hidden sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                                            <SidebarTrigger className="-ml-1" />
                                            <ChatDetails
                                                chat={selectedChat}
                                                trigger={
                                                    <button
                                                        className="flex items-center gap-3 min-w-0 cursor-pointer select-none text-left focus-visible:outline-none focus-visible:ring-2 ring-ring/40 rounded-md -mx-1 px-1"
                                                        aria-label="Open conversation details"
                                                        type="button"
                                                    >
                                                        {selectedChat && <Avatar className="size-8" />}
                                                        <div className="min-w-0">
                                                            <h1 className="font-semibold text-base truncate">
                                                                {selectedChat?.name ?? "Chat"}
                                                            </h1>
                                                            <span className="text-muted-foreground text-xs truncate hidden sm:inline">
                                                                {activeTab === "groups" ? "Group" : "Direct"}
                                                            </span>
                                                        </div>
                                                    </button>
                                                }
                                            />
                                            <SheetTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    aria-label="Open chat list"
                                                    className="shrink-0"
                                                >
                                                    <MenuIcon className="size-5" />
                                                </Button>
                                            </SheetTrigger>
                                        </div>
                                        <SheetContent side="right" className="p-0 flex flex-col">
                                            <SheetHeader className="sr-only">
                                                <SheetTitle>Chats</SheetTitle>
                                            </SheetHeader>
                                            {ConversationList}
                                        </SheetContent>
                                    </Sheet>
                                )}

                                {/* Conversation area */}
                                <div className="flex flex-1 flex-col min-w-0 min-h-0">
                                    {/* Desktop header */}
                                    {!isMobile && (
                                        <div className="flex items-center justify-between border-b px-4 py-3">
                                            <ChatDetails
                                                chat={selectedChat}
                                                trigger={
                                                    <button
                                                        className="flex items-center gap-3 min-w-0 cursor-pointer select-none text-left focus-visible:outline-none focus-visible:ring-2 ring-ring/40 rounded-md px-1 -mx-1"
                                                        aria-label="Open conversation details"
                                                        type="button"
                                                    >
                                                        <Avatar className="size-9" />
                                                        <div className="min-w-0">
                                                            <h2 className="font-semibold leading-tight truncate">
                                                                {selectedChat?.name}
                                                            </h2>
                                                            <p className="text-muted-foreground text-xs">
                                                                {activeTab === "groups" ? "Group chat" : "Direct message"}
                                                            </p>
                                                        </div>
                                                    </button>
                                                }
                                            />
                                        </div>
                                    )}
                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-muted/10">
                                        {!selectedChat && (
                                            <p className="text-muted-foreground text-sm">
                                                Select a chat to start messaging.
                                            </p>
                                        )}
                                        {selectedChat && (
                                            <div className="space-y-4">
                                                {/* Placeholder messages */}
                                                <MessageBubble
                                                    author="You"
                                                    me
                                                    text={`Hi everyone in ${selectedChat.name}!`}
                                                    time="09:15"
                                                />
                                                <MessageBubble
                                                    author={selectedChat.name}
                                                    text="This is a placeholder message thread. Replace with real data."
                                                    time="09:16"
                                                />
                                                <MessageBubble
                                                    author="You"
                                                    me
                                                    text="Let's integrate live messages next."
                                                    time="09:17"
                                                />
                                                <MessageBubble
                                                    author="You"
                                                    me
                                                    text={`Hi everyone in ${selectedChat.name}!`}
                                                    time="09:15"
                                                />
                                                <MessageBubble
                                                    author={selectedChat.name}
                                                    text="This is a placeholder message thread. Replace with real data."
                                                    time="09:16"
                                                />
                                                <MessageBubble
                                                    author="You"
                                                    me
                                                    text="Let's integrate live messages next."
                                                    time="09:17"
                                                />
                                                <MessageBubble
                                                    author="You"
                                                    me
                                                    text={`Hi everyone in ${selectedChat.name}!`}
                                                    time="09:15"
                                                />
                                                <MessageBubble
                                                    author={selectedChat.name}
                                                    text="This is a placeholder message thread. Replace with real data."
                                                    time="09:16"
                                                />
                                                <MessageBubble
                                                    author="You"
                                                    me
                                                    text="Let's integrate live messages next."
                                                    time="09:17"
                                                />
                                                <MessageBubble
                                                    author="You"
                                                    me
                                                    text={`Hi everyone in ${selectedChat.name}!`}
                                                    time="09:15"
                                                />
                                                <MessageBubble
                                                    author={selectedChat.name}
                                                    text="This is a placeholder message thread. Replace with real data."
                                                    time="09:16"
                                                />
                                                <MessageBubble
                                                    author="You"
                                                    me
                                                    text="Let's integrate live messages next."
                                                    time="09:17"
                                                />
                                                <MessageBubble
                                                    author="You"
                                                    me
                                                    text={`Hi everyone in ${selectedChat.name}!`}
                                                    time="09:15"
                                                />
                                                <MessageBubble
                                                    author={selectedChat.name}
                                                    text="This is a placeholder message thread. Replace with real data."
                                                    time="09:16"
                                                />
                                                <MessageBubble
                                                    author="You"
                                                    me
                                                    text="Let's integrate live messages next."
                                                    time="09:17"
                                                />
                                                <MessageBubble
                                                    author="You"
                                                    me
                                                    text={`Hi everyone in ${selectedChat.name}!`}
                                                    time="09:15"
                                                />
                                                <MessageBubble
                                                    author={selectedChat.name}
                                                    text="This is a placeholder message thread. Replace with real data."
                                                    time="09:16"
                                                />
                                                <MessageBubble
                                                    author="You"
                                                    me
                                                    text="Let's integrate live messages next."
                                                    time="09:17"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    {/* Composer */}
                                    {selectedChat && (
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault()
                                                // placeholder submit
                                            }}
                                            className="border-t p-3 flex items-end gap-2 bg-background sticky bottom-0 md:static md:pb-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
                                        >
                                            <Input
                                                placeholder={`Message ${selectedChat.name}`}
                                                className="flex-1"
                                                required
                                            />
                                            <Button type="submit" size="sm">
                                                Send
                                            </Button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>

    )
}