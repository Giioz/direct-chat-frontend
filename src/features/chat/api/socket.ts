import { io, Socket } from "socket.io-client";


export interface Reaction {
  user: string;
  emoji: string;
}

export interface ChatMessageType {
  _id: string;
  msg: string;
  sender: string;
  roomId: string;
  timestamp: number;
  seen?: boolean;
  reactions?: Reaction[];
}

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
});

// 1. Username არგუმენტი აღარ გვჭირდება, ტოკენი თავის საქმეს აკეთებს
export const connectSocket = () => {
  const token = sessionStorage.getItem("chat-token");

  if (token) {
    // 1. ვანახლებთ აუთენტიფიკაციის ობიექტს
    socket.auth = { token };

    // 2. ⚠️ მთავარი ცვლილება: 
    // თუ სოკეტი უკვე "connected" არის (მაგალითად წინა სესიიდან),
    // იძულებით ვთიშავთ, რომ ახალი ჰენდშეიკი (Handshake) მოხდეს ახალი ტოკენით.
    if (socket.connected) {
      socket.disconnect();
    }

    // 3. ახლიდან ვაკავშირებთ
    socket.connect();
    console.log("🔌 Connecting with token...");
  } else {
    console.error("⛔ No token found! Connection refused.");
  }
};

export const subscribeToMessages = (callback: (message: ChatMessageType) => void) => {
  socket.on("chat message", callback);
  return () => {
    socket.off("chat message", callback);
  };
};

export const subscribeToOnlineUsers = (callback: (users: string[]) => void) => {
  socket.on("online users", callback);
  return () => {
    socket.off("online users");
  };
};

// --- EMITTERS ---

export const sendMessage = (roomId: string, msg: string, to?: string) => {
  socket.emit("chat message", { roomId, msg, to });
};

export const joinRoom = (roomId: string) => {
  socket.emit("join room", roomId);
};

export const sendTypingEvent = (data: { roomId: string; isTyping: boolean; sender: string; to?: string }) => {
  socket.emit("typing", data);
};

export const sendReadSignal = (roomId: string, reader: string) => {
  socket.emit("messages_read", { roomId, reader });
};

export const sendReaction = (messageId: string, roomId: string, emoji: string, user: string) => {
  socket.emit("message_reaction", { messageId, roomId, emoji, user });
};
// --- FETCHERS ---

export const fetchMessageHistory = async (roomId: string): Promise<ChatMessageType[]> => {
  try {
    const token = sessionStorage.getItem("chat-token"); // <--- ვიღებთ ტოკენს

    const response = await fetch(`${SOCKET_URL}/api/messages/${roomId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token || "" // <--- ვაგზავნით ჰედერში (მომავლისთვის საჭიროა)
      }
    });

    const data = await response.json();
    if (data.success) {
      return data.messages;
    }
    return [];
  } catch (error) {
    console.error("Error fetching message history:", error);
    return [];
  }
};

export const fetchFriends = async () => {
  try {
    const token = sessionStorage.getItem("chat-token");
    const response = await fetch(`${SOCKET_URL}/api/friends`, {
      headers: { "Authorization": token || "" }
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching friends:", error);
    return { friends: [], pendingRequests: [] };
  }
};

export const sendFriendRequest = async (toUsername: string) => {
  const token = sessionStorage.getItem("chat-token");
  const response = await fetch(`${SOCKET_URL}/api/friends/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": token || "" },
    body: JSON.stringify({ toUsername })
  });
  return await response.json();
};

export const acceptFriendRequest = async (fromUserId: string) => {
  const token = sessionStorage.getItem("chat-token");
  const response = await fetch(`${SOCKET_URL}/api/friends/accept`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": token || "" },
    body: JSON.stringify({ fromUserId })
  });
  return await response.json();
};

export const declineFriendRequest = async (fromUserId: string) => {
  const token = sessionStorage.getItem("chat-token");
  const response = await fetch(`${SOCKET_URL}/api/friends/decline`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": token || "" },
    body: JSON.stringify({ fromUserId })
  });
  return await response.json();
};

export default socket;