"use client"

import * as React from "react"
import { UsersIcon, MenuIcon, SearchIcon, MegaphoneIcon } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { ChatDetails, type ChatItem } from "@/components/chat/chat-details"
import { MessageBubble } from "@/components/chat/message-bubble"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

// Broadcast channels only
const channels: ChatItem[] = [
    {
        id: "ch-1",
        name: "Announcements",
        lastMessage: "Downtime Sunday 2AM UTC",
        unread: 3,
        isGroup: true,
    },
    {
        id: "ch-2",
        name: "Release Notes",
        lastMessage: "v1.4.2 deployed",
        unread: 0,
        isGroup: true,
    },
]

export default function ChannelsPage() {
    const isMobile = useIsMobile()
    const [selectedChannel, setSelectedChannel] = React.useState<ChatItem | null>(channels[0] ?? null)
    const [sheetOpen, setSheetOpen] = React.useState(false)

    React.useEffect(() => {
        if (selectedChannel) {
            const exists = channels.some(c => c.id === selectedChannel.id)
            if (!exists) setSelectedChannel(null)
        }
    }, [selectedChannel])

    const ChannelList = (
        <div className="flex h-full flex-col overflow-hidden">
            <div className="p-3 pt-4 mt-6">
                <div className="relative">
                    <SearchIcon className="text-muted-foreground absolute left-2 top-1/2 size-4 -translate-y-1/2" />
                    <Input placeholder="Search channels…" className="pl-8 h-9 text-sm" onChange={() => { }} />
                </div>
            </div>
            <div className="border-b px-3 pb-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    <UsersIcon className="size-4" /> Channels
                </div>
            </div>
            <ul className="flex-1 overflow-y-auto px-2 pb-3 space-y-1 mt-2">
                {channels.map(channel => (
                    <li key={channel.id}>
                        <button
                            onClick={() => {
                                setSelectedChannel(channel)
                                if (isMobile) setSheetOpen(false)
                            }}
                            className={cn(
                                "w-full flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                                "hover:bg-accent/50 focus-visible:bg-accent/70 outline-none focus-visible:ring-2 ring-ring/40",
                                selectedChannel?.id === channel.id && "bg-accent/60 ring-1 ring-ring/30"
                            )}
                        >
                            <Avatar className="size-8" />
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-medium">{channel.name}</p>
                                <p className="text-muted-foreground truncate text-xs">{channel.lastMessage}</p>
                            </div>
                            {channel.unread ? (
                                <span className="bg-primary text-primary-foreground ml-auto inline-flex min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold">
                                    {channel.unread}
                                </span>
                            ) : null}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )

    return (
        <SidebarProvider
            style={{
                "--sidebar-width": "calc(var(--spacing) * 72)",
                "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties}
        >
            <AppSidebar variant="inset" />
            <SidebarInset style={{ margin: "0" }}>
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col">
                        <div className="flex flex-col">
                            <div className="flex h-dvh flex-col md:flex-row overflow-hidden">
                                {/* Desktop list */}
                                <aside className="hidden w-72 shrink-0 border-r md:flex md:flex-col bg-background/50">
                                    {ChannelList}
                                </aside>

                                {/* Mobile trigger */}
                                {isMobile && (
                                    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                                        <div className="flex items-center justify-between border-b px-4 py-3 gap-2 md:hidden sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                                            <SidebarTrigger className="-ml-1" />
                                            <ChatDetails
                                                chat={selectedChannel}
                                                trigger={
                                                    <button
                                                        className="flex items-center gap-3 min-w-0 cursor-pointer select-none text-left focus-visible:outline-none focus-visible:ring-2 ring-ring/40 rounded-md -mx-1 px-1"
                                                        aria-label="Open channel details"
                                                        type="button"
                                                    >
                                                        {selectedChannel && <Avatar className="size-8" />}
                                                        <div className="min-w-0">
                                                            <h1 className="font-semibold text-base truncate">{selectedChannel?.name ?? "Channel"}</h1>
                                                            <span className="text-muted-foreground text-xs truncate hidden sm:inline">Broadcast</span>
                                                        </div>
                                                    </button>
                                                }
                                            />
                                            <SheetTrigger asChild>
                                                <Button size="icon" variant="ghost" aria-label="Open channel list" className="shrink-0">
                                                    <MenuIcon className="size-5" />
                                                </Button>
                                            </SheetTrigger>
                                        </div>
                                        <SheetContent side="right" className="p-0 flex flex-col">
                                            <SheetHeader className="sr-only">
                                                <SheetTitle>Channels</SheetTitle>
                                            </SheetHeader>
                                            {ChannelList}
                                        </SheetContent>
                                    </Sheet>
                                )}

                                {/* Channel content */}
                                <div className="flex flex-1 flex-col min-w-0 min-h-0">
                                    {/* Desktop header */}
                                    {!isMobile && (
                                        <div className="flex items-center justify-between border-b px-4 py-3">
                                            <ChatDetails
                                                chat={selectedChannel}
                                                trigger={
                                                    <button
                                                        className="flex items-center gap-3 min-w-0 cursor-pointer select-none text-left focus-visible:outline-none focus-visible:ring-2 ring-ring/40 rounded-md px-1 -mx-1"
                                                        aria-label="Open channel details"
                                                        type="button"
                                                    >
                                                        <Avatar className="size-9" />
                                                        <div className="min-w-0">
                                                            <h2 className="font-semibold leading-tight truncate">{selectedChannel?.name}</h2>
                                                            <p className="text-muted-foreground text-xs">Broadcast channel</p>
                                                        </div>
                                                    </button>
                                                }
                                            />
                                        </div>
                                    )}
                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-muted/10">
                                        {!selectedChannel && (
                                            <p className="text-muted-foreground text-sm">Select a channel to view broadcasts.</p>
                                        )}
                                        {selectedChannel && (
                                            <div className="space-y-4">
                                                <MessageBubble author="System" text={`Welcome to ${selectedChannel.name}.`} time="09:00" me={true} />
                                                <MessageBubble author={selectedChannel.name} text="This is a broadcast channel. Only announcers can post." time="09:05" me={true}/>
                                                <MessageBubble author="System" text="Real-time delivery integration coming soon." time="09:10" me={true} />
                                            </div>
                                        )}
                                    </div>
                                    {/* Composer (could be permission-gated later) */}
                                    {selectedChannel && (
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault()
                                                // broadcast submit placeholder
                                            }}
                                            className="border-t p-3 flex items-end gap-2 bg-background sticky bottom-0 md:static md:pb-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
                                        >
                                            <Input placeholder={`Broadcast to ${selectedChannel.name}`} className="flex-1" required />
                                            <Button type="submit" size="sm">
                                                <MegaphoneIcon className="size-4 mr-1" /> Send
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