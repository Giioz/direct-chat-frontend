import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "./hooks/useChat";
import ChatMessage from "./components/ChatMessage";
import ChatInput from "./components/ChatInput";
import LoginScreen from "./components/LoginScreen";
import Header from "./components/Header";
import OnlineUsersList from "./components/OnlineUserList";

function App() {
  const [token, setToken] = useState<string | null>(sessionStorage.getItem("chat-token"));
  const [username, setUsernameState] = useState<string | null>(sessionStorage.getItem("chat-user"));
  
 const { 
    messagesByRoom, onlineUsers, currentRoom, 
    loadingHistory, sendChatMessage, startPrivateChat,
    sendTypingStatus, unreadCounts, 
    typingStatus // ← ეს აუცილებელია ვიზუალიზაციისთვის
  } = useChat(username);

  const handleLogin = (name: string, authToken: string) => {
    sessionStorage.setItem("chat-user", name);
    sessionStorage.setItem("chat-token", authToken); // ვინახავთ ტოკენს!
    setUsernameState(name);
    setToken(authToken);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    setToken(null);
    setUsernameState(null);
    window.location.reload();
  };
  const getChatPartner = (roomId: string | null) => {
    if (!roomId) return "";
    return roomId.split("_").find(u => u !== username) || "Direct Message";
  };

  if (!username || !token) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="h-full w-full mt-25"
        >
          {/* აქ ვაწვდით ახალ ფუნქციას */}
          <LoginScreen onLogin={handleLogin} />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="h-screen flex flex-col p-4 md:p-8 overflow-hidden bg-[#f8fafc]">
      <AnimatePresence mode="wait">
        {/* ... Login Screen Logic ... */}
        
        <motion.div key="chat-main" className="max-w-7xl w-full mx-auto h-full flex flex-col gap-6">
          <Header username={username!} onLogout={handleLogout} />

          <div className="flex-1 min-h-0 grid grid-cols-12 gap-6">
            <div className="col-span-3 h-full hidden md:block overflow-hidden rounded-[24px]">
              <OnlineUsersList 
                users={onlineUsers} onUserClick={startPrivateChat} 
                currentRoom={currentRoom || ""} unreadCounts={unreadCounts} 
                myUsername={username!} 
              />
            </div>

            <div className="col-span-12 md:col-span-9 h-full flex flex-col bg-white border border-slate-200 rounded-[24px] overflow-hidden shadow-sm">
              {currentRoom ? (
                <>
                  <div className="h-16 border-b border-slate-100 flex items-center justify-between px-8 bg-white/60 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.4)]"></div>
                      <h2 className="text-xs font-[900] uppercase tracking-[0.2em] text-slate-800">
                        Secure_Session://{getChatPartner(currentRoom)}
                      </h2>
                    </div>

                    {/* 🟢 SIGNAL DETECTED (Typing Indicator) */}
                    <AnimatePresence>
                      {typingStatus[currentRoom] && (
                        <motion.div 
                          initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                          className="flex items-center gap-2"
                        >
                          <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-widest">
                            Signal_Detected
                          </span>
                          <span className="flex gap-1">
                            <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce"></span>
                            <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                            <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <ChatMessage messages={messagesByRoom[currentRoom] || []} currentUsername={username!} isLoading={loadingHistory[currentRoom]} />

                  <div className="p-6 bg-white border-t border-slate-100">
                    <ChatInput onSend={sendChatMessage} onTyping={sendTypingStatus} />
                  </div>
                </>
              ) : (
                /* ... Empty State ... */
                <div className="flex-1 flex items-center justify-center text-slate-300 uppercase font-mono text-[10px] tracking-[0.4em]">
                  Awaiting_Node_Selection
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default App;