import { useState, useEffect, useCallback, useRef } from "react";
import socket, { 
  subscribeToMessages, 
  sendMessage, 
  fetchMessageHistory, 
  connectSocket, 
  subscribeToOnlineUsers, 
  joinRoom,
  sendTypingEvent,
  sendReadSignal,
  type ChatMessageType
} from "../services/socket";

export function useChat(username: string | null) {
  const [messagesByRoom, setMessagesByRoom] = useState<Record<string, ChatMessageType[]>>({});
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState<Record<string, boolean>>({});
  const [typingStatus, setTypingStatus] = useState<Record<string, boolean>>({});

  const currentRoomRef = useRef<string | null>(null);

  useEffect(() => {
    currentRoomRef.current = currentRoom;
  }, [currentRoom]);

  const markAsRead = useCallback((roomId: string) => {
    if (username) {
      sendReadSignal(roomId, username);
    }
  }, [username]);

  const loadHistory = useCallback(async (roomId: string) => {
    if (messagesByRoom[roomId]) return;

    setLoadingHistory(prev => ({ ...prev, [roomId]: true }));
    try {
      const history = await fetchMessageHistory(roomId);
      setMessagesByRoom(prev => ({ ...prev, [roomId]: history }));
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoadingHistory(prev => ({ ...prev, [roomId]: false }));
    }
  }, [messagesByRoom]);

  // მთავარი სოკეტის ლოგიკა
  useEffect(() => {
    if (!username) return;
    connectSocket(); // <--- აღარ სჭირდება username, ტოკენს თვითონ იღებს

    socket.on("connect", () => {
  });

    const handleTyping = ({ roomId, isTyping, sender }: { roomId: string, isTyping: boolean, sender: string }) => {
      if (sender !== username) {
        setTypingStatus(prev => ({ ...prev, [roomId]: isTyping }));
      }
    };
    socket.on("user_typing", handleTyping);

    const unsubMessages = subscribeToMessages((message: ChatMessageType) => {
      setMessagesByRoom(prev => ({
        ...prev,
        [message.roomId]: [...(prev[message.roomId] || []), message],
      }));

      const isChatOpen = message.roomId === currentRoomRef.current;
      const isOtherUser = message.sender !== username;

      if (!isChatOpen && isOtherUser) {
        setUnreadCounts(prev => ({
          ...prev,
          [message.roomId]: (prev[message.roomId] || 0) + 1
        }));
      }
      
      // ✅ Real-time Read Receipt
      if (isChatOpen && isOtherUser) {
        socket.emit("messages_read", { roomId: message.roomId, reader: username });
      }
    });

    const unsubUsers = subscribeToOnlineUsers((users) => {
      // console.log("📡 Users from server:", users); // დებაგინგისთვის კარგია, მაგრამ სუფთა კოდში არ გვინდა
      setOnlineUsers(users.filter(u => u !== username));
    });

    const handleSeenUpdate = ({ roomId }: { roomId: string }) => {
      setMessagesByRoom(prev => {
        if (!prev[roomId]) return prev;
        return {
          ...prev,
          [roomId]: prev[roomId].map(m => ({ ...m, seen: true }))
        };
      });
    };
    socket.on("messages_seen_update", handleSeenUpdate);

    return () => {
      socket.off("user_typing", handleTyping);
      socket.off("messages_seen_update", handleSeenUpdate);
      unsubMessages();
      unsubUsers();
    };
  }, [username]);

  // Actions
  const sendChatMessage = (msg: string) => {
    if (currentRoom && username) {
      const to = currentRoom.split("_").find(u => u !== username);
      sendMessage(currentRoom, msg, to);
    }
  };

  const sendTypingStatus = (isTyping: boolean) => {
    if (currentRoom && username) {
      const to = currentRoom.split("_").find(u => u !== username);
      
      sendTypingEvent({
        roomId: currentRoom,
        isTyping,
        sender: username,
        to
      });
    }
  };

  const startPrivateChat = (targetUser: string) => {
    const roomId = [username, targetUser].sort().join("_");
    setCurrentRoom(roomId);
    
    joinRoom(roomId);
    markAsRead(roomId);

    setUnreadCounts(prev => {
      const newCounts = { ...prev };
      delete newCounts[roomId];
      return newCounts;
    });

    if (!messagesByRoom[roomId]) {
      loadHistory(roomId);
    }
  };

  return {
    messagesByRoom,
    onlineUsers,
    currentRoom,
    loadingHistory,
    unreadCounts,
    typingStatus,
    setCurrentRoom,
    sendChatMessage,
    startPrivateChat,
    sendTypingStatus
  };
}