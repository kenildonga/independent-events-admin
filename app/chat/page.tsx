"use client"

import * as React from "react"
import { MenuIcon } from "lucide-react"
import { io, type Socket } from "socket.io-client"

import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
    type ChatItem,
    MessageBubble,
    ChatComposer,
    ConversationList,
    ChatHeader,
    DateSeparator
} from "@/components/chat"
import type { Attachment as MessageAttachment } from "@/components/chat"
import type { Attachment as ComposerAttachment } from "@/components/chat/chat-composer"

import { AppSidebar } from "@/components/app-sidebar"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import apiClient from "@/utils/axios"

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------

// Updated to match your new JSON structure
type ChatListApiItem = {
    _id: string
    type: "private" | "group" | "channel" // New unified type
    name: string
    lastMessage?: string
    unread?: number
    profile?: string
}

type ChatListResponse = {
    code: number
    message: string
    data: ChatListApiItem[]
}

type ChatMessageApiItem = {
    _id: string
    author?: string
    text?: string
    dateTime: string
    me?: boolean
    attachments?: Array<{
        _id: string
        type?: string
        url?: string
        name?: string
        size?: string
    }>
}

type ChatMessagesResponse = {
    code: number
    message: string
    data: ChatMessageApiItem[]
}

type ChatMessage = {
    id: string
    author: string
    text: string
    time: string
    date?: string
    me: boolean
    attachments?: MessageAttachment[]
    avatar?: string
    clientFingerprint?: string
    isOptimistic?: boolean
    timestamp: number
}

type SocketMessagePayload = {
    _id: string
    chatId: string
    text?: string
    attachments?: Array<{
        _id?: string
        type?: string
        url?: string
        name?: string
        size?: number | string
    }>
    createdAt?: string
    updatedAt?: string
    dateTime?: string
    author?: string
    userId?: string
    adminId?: string
    userType?: "user" | "admin"
}

type SocketErrorPayload = {
    error?: string
}

// ----------------------------------------------------------------------
// Constants & Helpers
// ----------------------------------------------------------------------

const CHAT_LIST_ENDPOINT = process.env.NEXT_PUBLIC_CHAT_LIST_URL ?? "/chat/get-list"
const CHAT_MESSAGES_ENDPOINT = process.env.NEXT_PUBLIC_CHAT_MESSAGES_URL ?? "/chat/get-messages"
const CHAT_MESSAGES_PAGE_SIZE = Number(process.env.NEXT_PUBLIC_CHAT_MESSAGES_LIMIT ?? 20)
const CHAT_SOCKET_URL = "http://localhost:3031"
const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_STORAGE_BASE_URL ?? "https://pub-6a70b23427814de4a2a9a328814f5be7.r2.dev/chat-media/"

const parseAttachmentSizeToBytes = (sizeLabel?: string) => {
    if (!sizeLabel) return undefined
    const match = sizeLabel.trim().match(/([\d.]+)\s*(B|KB|MB|GB|TB)/i)
    if (!match) return undefined
    const value = Number(match[1])
    if (Number.isNaN(value)) return undefined
    const unit = match[2].toUpperCase()
    const multipliers: Record<string, number> = {
        B: 1,
        KB: 1024,
        MB: 1024 * 1024,
        GB: 1024 * 1024 * 1024,
        TB: 1024 * 1024 * 1024 * 1024
    }
    return Math.round(value * (multipliers[unit] ?? 1))
}

const mapMessageFromApi = (
    item: ChatMessageApiItem,
    formatDateLabel: (date: Date) => string,
    avatar?: string
): ChatMessage => {
    const timestamp = new Date(item.dateTime)
    const normalizedDate = Number.isNaN(timestamp.getTime()) ? new Date() : timestamp
    const isSelf = Boolean(item.me)
    return {
        id: item._id,
        author: isSelf ? "You" : item.author ?? "Unknown",
        text: item.text ?? "",
        time: normalizedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        date: formatDateLabel(normalizedDate),
        me: isSelf,
        attachments: (item.attachments ?? []).map((attachment) => ({
            id: attachment._id,
            type: attachment.type === "image" ? "image" : "document",
            url: attachment.url ?? "#",
            name: attachment.name ?? "Attachment",
            size: parseAttachmentSizeToBytes(attachment.size)
        })),
        avatar,
        timestamp: normalizedDate.getTime()
    }
}

const getChatErrorMessage = (error: unknown) => {
    if (typeof error === "object" && error !== null) {
        const maybeAxiosError = error as {
            isAxiosError?: boolean
            message?: string
            response?: { data?: { message?: string } }
        }
        if (maybeAxiosError.isAxiosError) {
            return maybeAxiosError.response?.data?.message ?? maybeAxiosError.message ?? "Unable to load chats"
        }
        if ("message" in maybeAxiosError && typeof maybeAxiosError.message === "string") {
            return maybeAxiosError.message
        }
    }
    return "Unable to load chats"
}

// Updated mapping logic: Uses item.type directly
const mapChatItems = (items: ChatListApiItem[] = []): ChatItem[] =>
    items.map((item) => ({
        id: item._id,
        name: item.name,
        lastMessage: item.lastMessage ?? "",
        unread: item.unread ?? 0,
        isGroup: item.type === 'group',
        avatar: item.profile,
        // Map API "private" to UI "direct", otherwise keep "group" or "channel"
        type: item.type === 'private' ? 'direct' : item.type 
    }))

const buildMessageFingerprint = (text: string, attachments: MessageAttachment[] = []) => {
    const normalizedText = (text ?? "").trim()
    const attachmentKey = attachments
        .map((attachment) => `${attachment.type}:${attachment.name}:${attachment.size ?? 0}:${attachment.url}`)
        .join("|")
    return `${normalizedText}|${attachmentKey}`
}

const mapSocketMessageToChatMessage = (
    payload: SocketMessagePayload,
    formatDateLabel: (date: Date) => string,
    fallbackAuthor: string,
    avatar: string | undefined,
    adminId: string | null
): ChatMessage => {
    const timestamp = payload.createdAt ?? payload.dateTime ?? new Date().toISOString()
    const parsedDate = new Date(timestamp)
    const normalizedDate = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate
    const me = Boolean(
        payload.userType === "admin" && payload.adminId && adminId && payload.adminId === adminId
    )

    const attachments = (payload.attachments ?? []).map((attachment, index) => {
        const parsedSize = typeof attachment.size === "number"
            ? attachment.size
            : parseAttachmentSizeToBytes(typeof attachment.size === "string" ? attachment.size : undefined)
        const attachmentType: MessageAttachment["type"] = attachment.type === "image" ? "image" : "document"

        return {
            id: attachment._id ?? `${payload._id}-socket-${index}`,
            type: attachmentType,
            url: attachment.url?.startsWith("http") ? attachment.url : `${STORAGE_BASE_URL}${attachment.url ?? ""}`,
            name: attachment.name ?? "Attachment",
            size: parsedSize
        }
    })

    return {
        id: payload._id,
        author: me ? "You" : payload.author ?? fallbackAuthor,
        text: payload.text ?? "",
        time: normalizedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        date: formatDateLabel(normalizedDate),
        me,
        attachments,
        avatar,
        timestamp: normalizedDate.getTime()
    }
}

const sortMessagesAscending = (messages: ChatMessage[]) =>
    [...messages].sort((a, b) => a.timestamp - b.timestamp)

const deduplicateMessages = (messages: ChatMessage[]) => {
    const seen = new Set<string>()
    return messages.filter((msg) => {
        if (seen.has(msg.id)) return false
        seen.add(msg.id)
        return true
    })
}

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

export default function ChatPage() {
    const [adminId, setAdminId] = React.useState<string | null>(null)

    React.useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("adminId")
            setAdminId(stored ?? null)
        }
    }, [])

    const isMobile = useIsMobile()
    const [activeTab, setActiveTab] = React.useState("groups")
    const [selectedChat, setSelectedChat] = React.useState<ChatItem | null>(null)
    const [sheetOpen, setSheetOpen] = React.useState(false)
    
    const [groupChats, setGroupChats] = React.useState<ChatItem[]>([])
    const [directChats, setDirectChats] = React.useState<ChatItem[]>([])
    const [channelChats, setChannelChats] = React.useState<ChatItem[]>([])
    
    // Single Ref to track the entire API response state
    const lastApiDataRef = React.useRef<string>("")

    const [chatListLoading, setChatListLoading] = React.useState(false)
    const [chatListError, setChatListError] = React.useState<string | null>(null)
    const [searchTerm, setSearchTerm] = React.useState("")
    const [messages, setMessages] = React.useState<ChatMessage[]>([])
    const [messagesLoading, setMessagesLoading] = React.useState(false)
    const [messagesError, setMessagesError] = React.useState<string | null>(null)
    const [messagePagination, setMessagePagination] = React.useState({
        offset: 0,
        hasMore: true
    })
    const [isLoadingMoreMessages, setIsLoadingMoreMessages] = React.useState(false)
    const [loadMoreError, setLoadMoreError] = React.useState<string | null>(null)
    const [socketError, setSocketError] = React.useState<string | null>(null)
    const [isSocketConnected, setIsSocketConnected] = React.useState(false)

    const messagesContainerRef = React.useRef<HTMLDivElement>(null)
    const socketRef = React.useRef<Socket | null>(null)
    const shouldAutoScrollRef = React.useRef(true)
    const activeChatIdRef = React.useRef<string | null>(null)

    const formatDateLabel = React.useCallback((date: Date) => {
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (date.toDateString() === today.toDateString()) {
            return "Today"
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday"
        }

        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }, [])

    // --- Cleanup on Tab Change ---
    React.useEffect(() => {
        setMessages([])
        activeChatIdRef.current = null
        setMessagesError(null)
        setLoadMoreError(null)
        setMessagePagination({ offset: 0, hasMore: true })
        setIsLoadingMoreMessages(false)
        setMessagesLoading(false)
    }, [activeTab])

    React.useEffect(() => {
        const container = messagesContainerRef.current
        if (!container) return
        if (shouldAutoScrollRef.current) {
            container.scrollTop = container.scrollHeight
        }
    }, [messages])

    // --- NEW: Unified Fetch Logic ---
    React.useEffect(() => {
        let isMounted = true
        let intervalId: NodeJS.Timeout

        const fetchChatLists = async (showLoading = true) => {
            if (showLoading) {
                setChatListLoading(true)
                setChatListError(null)
            }
            
            try {
                // 1. Single API Call
                const response = await apiClient.post<ChatListResponse>(CHAT_LIST_ENDPOINT)

                if (!isMounted) return

                const rawData = response.data?.data || []
                const rawDataStr = JSON.stringify(rawData)

                // 2. Compare with last known string
                if (rawDataStr !== lastApiDataRef.current) {
                    
                    // 3. Client-side filtering based on 'type'
                    const allMapped = mapChatItems(rawData)

                    const groups = allMapped.filter(c => c.type === 'group')
                    const directs = allMapped.filter(c => c.type === 'direct') // Mapped from 'private'
                    const channels = allMapped.filter(c => c.type === 'channel')

                    setGroupChats(groups)
                    setDirectChats(directs)
                    setChannelChats(channels)

                    // Update ref
                    lastApiDataRef.current = rawDataStr
                }
                
            } catch (error) {
                if (!isMounted) return
                if (showLoading) {
                    setChatListError(getChatErrorMessage(error))
                }
            } finally {
                if (isMounted && showLoading) {
                    setChatListLoading(false)
                }
            }
        }

        // Initial Load
        fetchChatLists(true)

        // Poll every 1.5s
        intervalId = setInterval(() => {
            fetchChatLists(false)
        }, 1500)

        return () => {
            isMounted = false
            clearInterval(intervalId)
        }
    }, [])

    // --- Message Fetching (Guarded) ---
    React.useEffect(() => {
        if (!selectedChat) {
            setMessages([])
            activeChatIdRef.current = null
            return
        }

        if (selectedChat.id === activeChatIdRef.current) {
            return
        }

        activeChatIdRef.current = selectedChat.id
        setMessages([])
        setMessagesError(null)
        setMessagePagination({ offset: 0, hasMore: true })
        setLoadMoreError(null)
        setMessagesLoading(true)

        let isMounted = true

        const fetchChatMessages = async () => {
            try {
                const response = await apiClient.post<ChatMessagesResponse>(CHAT_MESSAGES_ENDPOINT, {
                    chatId: selectedChat.id,
                    limit: String(CHAT_MESSAGES_PAGE_SIZE),
                    offset: "0"
                })

                if (!isMounted) return
                if (selectedChat.id !== activeChatIdRef.current) return

                const mappedMessages = (response.data?.data ?? []).map((item) =>
                    mapMessageFromApi(item, formatDateLabel, selectedChat.avatar)
                )

                const normalizedMessages = mappedMessages.map((message) => ({
                    ...message,
                    clientFingerprint: buildMessageFingerprint(message.text, message.attachments),
                    isOptimistic: false
                }))

                shouldAutoScrollRef.current = true
                setMessages(sortMessagesAscending(deduplicateMessages(normalizedMessages)))
                setMessagePagination({
                    offset: normalizedMessages.length,
                    hasMore: normalizedMessages.length === CHAT_MESSAGES_PAGE_SIZE
                })
            } catch (error) {
                if (!isMounted) return
                setMessagesError(getChatErrorMessage(error))
            } finally {
                if (isMounted) {
                    setMessagesLoading(false)
                }
            }
        }

        fetchChatMessages()

        return () => {
            isMounted = false
        }
    }, [selectedChat?.id, formatDateLabel])

    // --- Selection Sync ---
    React.useEffect(() => {
        let chatsInTab: ChatItem[] = []
        if (activeTab === "groups") chatsInTab = groupChats
        else if (activeTab === "channels") chatsInTab = channelChats
        else chatsInTab = directChats

        if (chatsInTab.length === 0) return

        if (selectedChat) {
            const foundChat = chatsInTab.find((chat) => chat.id === selectedChat.id)
            if (foundChat) {
                if (foundChat !== selectedChat) {
                    setSelectedChat(foundChat)
                }
            } else {
                if (!chatListLoading) {
                    setSelectedChat(chatsInTab[0])
                }
            }
        } else {
            setSelectedChat(chatsInTab[0])
        }
    }, [activeTab, groupChats, directChats, channelChats, chatListLoading, selectedChat])

    const loadMoreMessages = React.useCallback(async () => {
        if (!selectedChat || !messagePagination.hasMore || isLoadingMoreMessages) return

        setIsLoadingMoreMessages(true)
        setLoadMoreError(null)

        const container = messagesContainerRef.current
        const previousScrollHeight = container?.scrollHeight ?? 0
        const previousScrollTop = container?.scrollTop ?? 0

        try {
            const response = await apiClient.post<ChatMessagesResponse>(CHAT_MESSAGES_ENDPOINT, {
                chatId: selectedChat.id,
                limit: String(CHAT_MESSAGES_PAGE_SIZE),
                offset: String(messagePagination.offset)
            })

            const mappedMessages = (response.data?.data ?? []).map((item) =>
                mapMessageFromApi(item, formatDateLabel, selectedChat.avatar)
            )

            const normalizedMessages = mappedMessages.map((message) => ({
                ...message,
                clientFingerprint: buildMessageFingerprint(message.text, message.attachments),
                isOptimistic: false
            }))

            shouldAutoScrollRef.current = false

            setMessages((prev) => {
                const combined = [...normalizedMessages, ...prev]
                const unique = deduplicateMessages(combined)
                return sortMessagesAscending(unique)
            })

            setMessagePagination((prev) => ({
                offset: prev.offset + normalizedMessages.length,
                hasMore: normalizedMessages.length === CHAT_MESSAGES_PAGE_SIZE
            }))

            requestAnimationFrame(() => {
                if (messagesContainerRef.current) {
                    const newScrollHeight = messagesContainerRef.current.scrollHeight
                    messagesContainerRef.current.scrollTop = previousScrollTop + (newScrollHeight - previousScrollHeight)
                }
            })

        } catch (error) {
            setLoadMoreError(getChatErrorMessage(error))
        } finally {
            setIsLoadingMoreMessages(false)
        }
    }, [selectedChat, messagePagination.hasMore, messagePagination.offset, isLoadingMoreMessages, formatDateLabel])

    const handleSendMessage = React.useCallback((messageText: string, composerAttachments?: ComposerAttachment[]) => {
        if (!selectedChat || !socketRef.current || !isSocketConnected) {
            setSocketError("Unable to send message. Connecting to chat server...")
            return
        }

        const trimmedMessage = messageText.trim()
        const mappedAttachments: MessageAttachment[] = (composerAttachments ?? []).map((attachment) => ({
            id: attachment.id,
            type: attachment.type,
            url: attachment.url,
            name: attachment.name,
            size: attachment.size
        }))

        if (!trimmedMessage && mappedAttachments.length === 0) return

        const now = new Date()
        const fingerprint = buildMessageFingerprint(trimmedMessage, mappedAttachments)
        const optimisticMessage: ChatMessage = {
            id: `temp-${now.getTime()}-${Math.random()}`,
            author: "You",
            text: trimmedMessage,
            time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            date: formatDateLabel(now),
            me: true,
            attachments: mappedAttachments,
            avatar: selectedChat.avatar,
            clientFingerprint: fingerprint,
            isOptimistic: true,
            timestamp: now.getTime()
        }

        shouldAutoScrollRef.current = true
        setMessages((prev) => sortMessagesAscending([...prev, optimisticMessage]))
        setMessagePagination((prev) => ({
            ...prev,
            offset: prev.offset + 1
        }))

        socketRef.current.emit("sendMessage", {
            chatId: selectedChat.id,
            text: trimmedMessage,
            attachments: (composerAttachments ?? []).length
                ? (composerAttachments ?? []).map((attachment) => ({
                    type: attachment.type,
                    url: attachment.uploadedFilename ?? attachment.url,
                    name: attachment.name,
                    size: attachment.size
                }))
                : undefined
        })
        setSocketError(null)
    }, [selectedChat, isSocketConnected, formatDateLabel])

    const filteredGroupChats = React.useMemo(() => {
        if (!searchTerm) return groupChats
        return groupChats.filter((chat) => chat.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }, [groupChats, searchTerm])

    const filteredDirectChats = React.useMemo(() => {
        if (!searchTerm) return directChats
        return directChats.filter((chat) => chat.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }, [directChats, searchTerm])

    const filteredChannelChats = React.useMemo(() => {
        if (!searchTerm) return channelChats
        return channelChats.filter((chat) => chat.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }, [channelChats, searchTerm])

    const handleIncomingMessage = React.useCallback((payload: SocketMessagePayload) => {
        if (!selectedChat || payload.chatId !== selectedChat.id) return

        const mappedMessage = mapSocketMessageToChatMessage(
            payload,
            formatDateLabel,
            selectedChat.name ?? "Participant",
            selectedChat.avatar,
            adminId ?? null
        )

        const fingerprint = buildMessageFingerprint(mappedMessage.text, mappedMessage.attachments)
        const enrichedMessage: ChatMessage = {
            ...mappedMessage,
            clientFingerprint: fingerprint,
            isOptimistic: false
        }

        let appended = false
        let replacedOptimistic = false

        setMessages((prev) => {
            if (prev.some((message) => message.id === enrichedMessage.id)) return prev

            if (fingerprint) {
                const optimisticIndex = prev.findIndex(
                    (message) => message.isOptimistic && message.clientFingerprint === fingerprint
                )

                if (optimisticIndex !== -1) {
                    replacedOptimistic = true
                    const updated = [...prev]
                    const optimisticMsg = prev[optimisticIndex]
                    const mergedAttachments = enrichedMessage.attachments?.map((att, i) => {
                        const optAtt = optimisticMsg.attachments?.[i]
                        if (optAtt && att.url && !att.url.startsWith("http")) {
                            return { ...att, url: optAtt.url }
                        }
                        return att
                    })

                    updated[optimisticIndex] = {
                        ...enrichedMessage,
                        attachments: mergedAttachments
                    }
                    return sortMessagesAscending(updated)
                }
            }

            appended = true
            return sortMessagesAscending([...prev, enrichedMessage])
        })

        if (appended || replacedOptimistic) {
            shouldAutoScrollRef.current = true
            if (appended) {
                setMessagePagination((prev) => ({
                    ...prev,
                    offset: prev.offset + 1
                }))
            }
        }
    }, [selectedChat, formatDateLabel, adminId])

    const handleMessagesScroll = React.useCallback(() => {
        const container = messagesContainerRef.current
        if (!container || isLoadingMoreMessages || !messagePagination.hasMore) return
        if (container.scrollTop <= 50) loadMoreMessages()
    }, [isLoadingMoreMessages, messagePagination.hasMore, loadMoreMessages])

    React.useEffect(() => {
        if (!adminId || !selectedChat?.id) {
            setIsSocketConnected(false)
            setSocketError(null)
            if (socketRef.current) {
                socketRef.current.disconnect()
                socketRef.current = null
            }
            return
        }

        if (socketRef.current) socketRef.current.disconnect()

        const trimmedBase = CHAT_SOCKET_URL.trim()
        const baseWithoutTrailingSlash = trimmedBase.replace(/\/$/, "")
        const socketUrl = trimmedBase
            ? baseWithoutTrailingSlash.endsWith("/chat")
                ? baseWithoutTrailingSlash
                : `${baseWithoutTrailingSlash}/chat`
            : "/chat"

        const socket = io(socketUrl, {
            query: {
                yourId: adminId,
                chatId: selectedChat.id,
                userType: "admin"
            }
        })

        socketRef.current = socket

        const handleConnect = () => {
            setIsSocketConnected(true)
            setSocketError(null)
        }
        const handleDisconnect = () => setIsSocketConnected(false)
        const handleConnectError = (error: Error) => setSocketError(error.message ?? "Failed to connect to chat server")
        const handleErrorMessage = (payload: SocketErrorPayload) => setSocketError(payload?.error ?? "Chat server error")

        socket.on("connect", handleConnect)
        socket.on("disconnect", handleDisconnect)
        socket.on("connect_error", handleConnectError)
        socket.on("errorMessage", handleErrorMessage)
        socket.on("newMessage", handleIncomingMessage)

        return () => {
            socket.off("connect", handleConnect)
            socket.off("disconnect", handleDisconnect)
            socket.off("connect_error", handleConnectError)
            socket.off("errorMessage", handleErrorMessage)
            socket.off("newMessage", handleIncomingMessage)
            socket.disconnect()
            socketRef.current = null
        }
    }, [adminId, selectedChat?.id, handleIncomingMessage])

    const ConversationListComponent = React.useMemo(() => (
        <div className="flex h-full flex-col">
            {chatListError && (
                <div className="bg-destructive/10 text-destructive text-xs px-3 py-2">
                    {chatListError}
                </div>
            )}
            <div className="flex-1 min-h-0">
                <ConversationList
                    groupChats={filteredGroupChats}
                    directChats={filteredDirectChats}
                    channelChats={filteredChannelChats}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    selectedChat={selectedChat}
                    onChatSelect={(chat) => {
                        if (selectedChat?.id !== chat.id) {
                            setMessages([])
                            setSelectedChat(chat)
                            if (isMobile) setSheetOpen(false)
                        }
                    }}
                    onSearchChange={setSearchTerm}
                />
            </div>
            {chatListLoading && (
                <div className="text-muted-foreground text-xs px-3 py-2 border-t">
                    Refreshing chats...
                </div>
            )}
        </div>
    ), [chatListError, filteredGroupChats, filteredDirectChats, filteredChannelChats, activeTab, selectedChat, isMobile, chatListLoading])

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
                                <aside className="hidden w-72 shrink-0 border-r md:flex md:flex-col bg-background/50">
                                    {ConversationListComponent}
                                </aside>

                                {isMobile && (
                                    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
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

                                <div className="flex flex-1 flex-col min-w-0 min-h-0">
                                    {!isMobile && (
                                        <ChatHeader
                                            selectedChat={selectedChat}
                                            activeTab={activeTab}
                                        />
                                    )}
                                    <div
                                        ref={messagesContainerRef}
                                        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-muted/10"
                                        onScroll={handleMessagesScroll}
                                    >
                                        {!selectedChat && (
                                            <p className="text-muted-foreground text-sm">
                                                Select a chat to start messaging.
                                            </p>
                                        )}
                                        {selectedChat && (
                                            <div className="space-y-4">
                                                {socketError && (
                                                    <p className="text-destructive text-xs text-center">
                                                        {socketError}
                                                    </p>
                                                )}
                                                {!socketError && !isSocketConnected && (
                                                    <p className="text-muted-foreground text-xs text-center">
                                                        Connecting to chat server...
                                                    </p>
                                                )}
                                                {loadMoreError && (
                                                    <p className="text-destructive text-xs text-center">
                                                        {loadMoreError}
                                                    </p>
                                                )}
                                                {messagesLoading && (
                                                    <p className="text-muted-foreground text-sm text-center py-8">
                                                        Loading messages...
                                                    </p>
                                                )}
                                                {!messagesLoading && messagesError && (
                                                    <p className="text-destructive text-sm text-center py-8">
                                                        {messagesError}
                                                    </p>
                                                )}
                                                {!messagesLoading && !messagesError && messages.length === 0 && (
                                                    <p className="text-muted-foreground text-sm text-center py-8">
                                                        No messages yet. Start the conversation!
                                                    </p>
                                                )}
                                                {!messagesLoading && !messagesError && messages.length > 0 && (() => {
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
                                    {selectedChat && (
                                        <ChatComposer
                                            placeholder={`Message ${selectedChat.name}`}
                                            onSend={handleSendMessage}
                                            disabled={!isSocketConnected || messagesLoading}
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