import { create } from "zustand";
import type { ChatMessageType } from "../api/socket";

interface ChatState {
    // auth
    username: string | null;
    token: string | null;

    // chat data
    messagesByRoom: Record<string, ChatMessageType[]>;
    unreadCounts: Record<string, number>;
    onlineUsers: string[];

    // ui
    currentRoom: string | null;
    loadingHistory: Record<string, boolean>;
    typingStatus: Record<string, boolean>;

    // Actions
    setAuth: (username: string | null, token: string | null) => void;
    setCurrentRoom: (roomId: string | null) => void;
    setOnlineUsers: (users: string[]) => void;

    // messages
    addMessage: (message: ChatMessageType) => void;
    setMessages: (roomId: string, messages: ChatMessageType[]) => void;
    updateMessageReaction: (messageId: string, reactions: any[]) => void;
    markMessagesAsSeen: (roomId: string) => void;

    // typing
    setTyping: (roomId: string, isTyping: boolean) => void;

    // unread
    incrementUnread: (roomId: string) => void;
    clearUnread: (roomId: string) => void;

    // loading
    setLoading: (roomId: string, isLoading: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    // initial state
    username: sessionStorage.getItem("chat-user"),
    token: sessionStorage.getItem("chat-token"),
    messagesByRoom: {},
    unreadCounts: {},
    onlineUsers: [],
    currentRoom: null,
    loadingHistory: {},
    typingStatus: {},

    // Actions
    setAuth: (username, token) => {
        if (username && token) {
            sessionStorage.setItem("chat-user", username);
            sessionStorage.setItem("chat-token", token);
        } else {
            sessionStorage.clear();
        }
        set({ username, token });
    },

    setCurrentRoom: (roomId) => set({ currentRoom: roomId }),

    setOnlineUsers: (users) => set({ onlineUsers: users }),

    addMessage: (message) => set((state) => ({
        messagesByRoom: {
            ...state.messagesByRoom,
            [message.roomId]: [...(state.messagesByRoom[message.roomId] || []), message]
        }
    })),

    setMessages: (roomId, messages) => set((state) => ({
        messagesByRoom: { ...state.messagesByRoom, [roomId]: messages }
    })),

    updateMessageReaction: (messageId, reactions) => set((state) => {
        const newMap = { ...state.messagesByRoom };
        Object.keys(newMap).forEach((roomId) => {
            newMap[roomId] = newMap[roomId].map((msg) => {
                if (msg._id === messageId) {
                    return { ...msg, reactions };
                }
                return msg;
            });
        });
        return { messagesByRoom: newMap };
    }),

    markMessagesAsSeen: (roomId) => set((state) => ({
        messagesByRoom: {
            ...state.messagesByRoom,
            [roomId]: state.messagesByRoom[roomId]?.map(m => ({ ...m, seen: true })) || []
        }
    })),

    setTyping: (roomId, isTyping) => set((state) => ({
        typingStatus: { ...state.typingStatus, [roomId]: isTyping }
    })),

    incrementUnread: (roomId) => set((state) => ({
        unreadCounts: { ...state.unreadCounts, [roomId]: (state.unreadCounts[roomId] || 0) + 1 }
    })),

    clearUnread: (roomId) => set((state) => {
        const newCounts = { ...state.unreadCounts };
        delete newCounts[roomId];
        return { unreadCounts: newCounts };
    }),

    setLoading: (roomId, isLoading) => set((state) => ({
        loadingHistory: { ...state.loadingHistory, [roomId]: isLoading }
    }))
}));
