import { create } from "zustand";
import type { ChatMessageType } from "../api/socket";
import {
    fetchFriends as apiFetchFriends,
    sendFriendRequest as apiSendRequest,
    acceptFriendRequest as apiAcceptRequest,
    declineFriendRequest as apiDeclineRequest
} from "../api/socket";

interface ChatState {
    // auth
    username: string | null;
    token: string | null;

    // chat data
    messagesByRoom: Record<string, ChatMessageType[]>;
    unreadCounts: Record<string, number>;
    onlineUsers: string[];

    // friends
    friends: any[]; // Using any for now to avoid extensive type duplication
    pendingRequests: any[];

    // ui
    currentRoom: string | null;
    loadingHistory: Record<string, boolean>;
    typingStatus: Record<string, boolean>;

    // Actions
    setAuth: (username: string | null, token: string | null) => void;
    setCurrentRoom: (roomId: string | null) => void;
    setOnlineUsers: (users: string[]) => void;

    // friend actions
    fetchFriends: () => Promise<void>;
    sendFriendRequest: (username: string) => Promise<any>;
    acceptFriendRequest: (userId: string) => Promise<void>;
    declineFriendRequest: (userId: string) => Promise<void>;

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
    friends: [],
    pendingRequests: [],
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

    fetchFriends: async () => {
        const data = await apiFetchFriends();
        if (data.friends) {
            set({ friends: data.friends, pendingRequests: data.pendingRequests || [] });
        }
    },

    sendFriendRequest: async (username) => {
        return await apiSendRequest(username);
    },

    acceptFriendRequest: async (userId) => {
        const res = await apiAcceptRequest(userId);
        if (res.success) {
            // refresh
            const data = await apiFetchFriends();
            set({ friends: data.friends, pendingRequests: data.pendingRequests || [] });
        }
    },

    declineFriendRequest: async (userId) => {
        const res = await apiDeclineRequest(userId);
        if (res.success) {
            set((state) => ({
                pendingRequests: state.pendingRequests.filter((req: any) => req._id !== userId)
            }));
        }
    },

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
