import { useEffect, useCallback, useRef } from "react";
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
} from "../api/socket";
import { useChatStore } from "../stores/useChatStore";

export function useChat(username: string | null) {
  // Select state from store
  const {
    messagesByRoom,
    onlineUsers,
    currentRoom,
    loadingHistory,
    unreadCounts,
    typingStatus,
    setCurrentRoom: setStoreCurrentRoom,
    setOnlineUsers,
    addMessage,
    setMessages,
    updateMessageReaction,
    markMessagesAsSeen,
    setTyping,
    incrementUnread,
    clearUnread,
    setLoading,

    // Friends
    friends,
    pendingRequests,
    fetchFriends,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest
  } = useChatStore();

  const currentRoomRef = useRef<string | null>(null);

  useEffect(() => {
    currentRoomRef.current = currentRoom;
  }, [currentRoom]);

  // Sync username/token if provided (optional, usually handled in App)
  // Sync username/token if provided (optional, usually handled in App)
  useEffect(() => {
    if (username) {
      // Sync auth & fetch friends
      fetchFriends();
    }
  }, [username, fetchFriends]);

  const markAsRead = useCallback((roomId: string) => {
    if (username) {
      sendReadSignal(roomId, username);
      // Optimistic update
      clearUnread(roomId);
    }
  }, [username, clearUnread]);

  const loadHistory = useCallback(async (roomId: string) => {
    if (messagesByRoom[roomId]) return;

    setLoading(roomId, true);
    try {
      const history = await fetchMessageHistory(roomId);
      setMessages(roomId, history);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(roomId, false);
    }
  }, [messagesByRoom, setLoading, setMessages]);

  // Main Socket Logic
  useEffect(() => {
    if (!username) return;
    connectSocket();

    // Reactions
    const handleReactionUpdate = ({ messageId, reactions }: { messageId: string, reactions: any[] }) => {
      updateMessageReaction(messageId, reactions);
    };

    socket.on("message_reaction_update", handleReactionUpdate);

    // Typing
    const handleTyping = ({ roomId, isTyping, sender }: { roomId: string, isTyping: boolean, sender: string }) => {
      if (sender !== username) {
        setTyping(roomId, isTyping);
      }
    };
    socket.on("user_typing", handleTyping);

    // Messages
    const unsubMessages = subscribeToMessages((message: ChatMessageType) => {
      addMessage(message);

      const isChatOpen = message.roomId === currentRoomRef.current;
      const isOtherUser = message.sender !== username;

      if (!isChatOpen && isOtherUser) {
        incrementUnread(message.roomId);
      }

      if (isChatOpen && isOtherUser) {
        socket.emit("messages_read", { roomId: message.roomId, reader: username });
      }
    });

    const unsubUsers = subscribeToOnlineUsers((users) => {
      setOnlineUsers(users.filter(u => u !== username));
    });

    // Seen status
    const handleSeenUpdate = ({ roomId }: { roomId: string }) => {
      markMessagesAsSeen(roomId);
    };
    socket.on("messages_seen_update", handleSeenUpdate);

    // Friend Events
    const handleFriendRequest = () => {
      // Refresh friends to get the new request
      fetchFriends();
      // Optional: Toast notification
    };
    socket.on("friend_request", handleFriendRequest);

    const handleFriendAccepted = () => {
      // Refresh friends to see new friend
      fetchFriends();
    };
    socket.on("friend_accepted", handleFriendAccepted);

    return () => {
      socket.off("user_typing", handleTyping);
      socket.off("messages_seen_update", handleSeenUpdate);
      socket.off("message_reaction_update", handleReactionUpdate);
      socket.off("friend_request", handleFriendRequest);
      socket.off("friend_accepted", handleFriendAccepted);
      unsubMessages();
      unsubUsers();
    };
  }, [username, addMessage, incrementUnread, setOnlineUsers, setTyping, markMessagesAsSeen, updateMessageReaction]);

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
    setStoreCurrentRoom(roomId); // Use store action

    joinRoom(roomId);
    markAsRead(roomId);

    // clearUnread is called in markAsRead

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
    setCurrentRoom: setStoreCurrentRoom,
    sendChatMessage,
    startPrivateChat,
    sendTypingStatus,

    // Friend API
    friends,
    pendingRequests,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest
  };
}