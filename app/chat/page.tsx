"use client"

import * as React from "react"
import { MenuIcon } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { type ChatItem, MessageBubble, ChatComposer, ConversationList, ChatHeader, type Attachment, DateSeparator } from "@/components/chat"

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
        avatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=32&h=32&fit=crop&crop=face"
    },
    {
        id: "g-2",
        name: "Marketing Sprint",
        lastMessage: "Scheduled next campaign.",
        unread: 0,
        isGroup: true,
        avatar: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=32&h=32&fit=crop&crop=face"
    }
]

const directChats: ChatItem[] = [
    {
        id: "u-1",
        name: "Alice Johnson",
        lastMessage: "I'll push the changes.",
        unread: 1,
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face"
    },
    {
        id: "u-2",
        name: "David Park",
        lastMessage: "Thanks!",
        unread: 0,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face"
    },
    {
        id: "u-3",
        name: "Sarah Kim",
        lastMessage: "Can we sync at 3?",
        unread: 4,
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face"
    },
]

export default function ChatPage() {
    const isMobile = useIsMobile()
    const [activeTab, setActiveTab] = React.useState("groups")
    const [selectedChat, setSelectedChat] = React.useState<ChatItem | null>(groupChats[0] ?? null)
    const [sheetOpen, setSheetOpen] = React.useState(false)
    const [messages, setMessages] = React.useState<Array<{
        id: string
        author: string
        text: string
        time: string
        date?: string
        me: boolean
        attachments?: Attachment[]
        avatar?: string
    }>>([
        {
            id: "1",
            author: "You",
            text: "Here's the project document I mentioned",
            time: "09:15",
            date: "Today",
            me: true,
            attachments: [{
                id: "att-1",
                type: "document",
                url: "#",
                name: "project-requirements.pdf",
                size: 2048576
            }]
        },
        {
            id: "2",
            author: selectedChat?.name || "Team",
            text: "Thanks! I'll review it.",
            time: "09:16",
            date: "Today",
            me: false,
            avatar: selectedChat?.avatar
        },
        {
            id: "3",
            author: "You",
            text: "Also sharing the design mockup",
            time: "09:17",
            date: "Today",
            me: true,
            attachments: [{
                id: "att-2",
                type: "image",
                url: "https://picsum.photos/400/300?random=1",
                name: "design-mockup.png"
            }]
        }
    ])

    // Ref for messages container to auto-scroll
    const messagesContainerRef = React.useRef<HTMLDivElement>(null)

    // Helper function to format date
    const formatDate = (date: Date) => {
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (date.toDateString() === today.toDateString()) {
            return "Today"
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday"
        } else {
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        }
    }

    // Auto-scroll to bottom when messages change
    React.useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
        }
    }, [messages])

    React.useEffect(() => {
        if (selectedChat) {
            const stillExists = [...groupChats, ...directChats].some(
                (c) => c.id === selectedChat.id
            )
            if (!stillExists) setSelectedChat(null)
        }
    }, [activeTab, selectedChat])

    const ConversationListComponent = (
        <ConversationList
            groupChats={groupChats}
            directChats={directChats}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            selectedChat={selectedChat}
            onChatSelect={(chat) => {
                setSelectedChat(chat)
                if (isMobile) setSheetOpen(false)
            }}
            onSearchChange={() => { }}
        />
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
                                    {ConversationListComponent}
                                </aside>

                                {/* Mobile trigger */}
                                {isMobile && (
                                    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                                        {/* Mobile header with details dialog trigger */}
                                        <div className="flex items-center justify-between border-b px-4 py-3 gap-2 md:hidden sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                                            <SidebarTrigger className="-ml-1" />
                                            <ChatHeader
                                                selectedChat={selectedChat}
                                                activeTab={activeTab}
                                                isMobile={true}
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
                                            {ConversationListComponent}
                                        </SheetContent>
                                    </Sheet>
                                )}

                                {/* Conversation area */}
                                <div className="flex flex-1 flex-col min-w-0 min-h-0">
                                    {/* Desktop header */}
                                    {!isMobile && (
                                        <ChatHeader
                                            selectedChat={selectedChat}
                                            activeTab={activeTab}
                                        />
                                    )}
                                    {/* Messages */}
                                    <div
                                        ref={messagesContainerRef}
                                        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-muted/10"
                                    >
                                        {!selectedChat && (
                                            <p className="text-muted-foreground text-sm">
                                                Select a chat to start messaging.
                                            </p>
                                        )}
                                        {selectedChat && (
                                            <div className="space-y-4">
                                                {messages.length === 0 && (
                                                    <p className="text-muted-foreground text-sm text-center py-8">
                                                        No messages yet. Start the conversation!
                                                    </p>
                                                )}
                                                {messages.length > 0 && (() => {
                                                    // Group messages by date
                                                    const groupedMessages = messages.reduce((groups, message) => {
                                                        const date = message.date || "Today"
                                                        if (!groups[date]) {
                                                            groups[date] = []
                                                        }
                                                        groups[date].push(message)
                                                        return groups
                                                    }, {} as Record<string, typeof messages>)

                                                    return Object.entries(groupedMessages).map(([date, dateMessages]) => (
                                                        <div key={date}>
                                                            <DateSeparator date={date} />
                                                            <div className="space-y-4">
                                                                {dateMessages.map((message) => (
                                                                    <MessageBubble
                                                                        key={message.id}
                                                                        author={message.author}
                                                                        text={message.text}
                                                                        time={message.time}
                                                                        date={message.date}
                                                                        me={message.me}
                                                                        attachments={message.attachments}
                                                                        avatar={message.avatar}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                    {/* Composer */}
                                    {selectedChat && (
                                        <ChatComposer
                                            placeholder={`Message ${selectedChat.name}`}
                                            onSend={(message, attachments) => {
                                                const now = new Date()
                                                const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                const date = formatDate(now)
                                                const newMessage = {
                                                    id: `${now.getTime()}-${Math.random()}`,
                                                    author: "You",
                                                    text: message,
                                                    time,
                                                    date,
                                                    me: true,
                                                    attachments
                                                }
                                                setMessages(prev => [...prev, newMessage])
                                            }}
                                        />
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