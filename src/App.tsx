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
    typingStatus,
    setCurrentRoom
  } = useChat(username);

  const handleLogin = (name: string, authToken: string) => {
    sessionStorage.setItem("chat-user", name);
    sessionStorage.setItem("chat-token", authToken);
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

  const handleBackToUsers = () => {
    setCurrentRoom(null);
  };

  if (!username || !token) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="h-full w-full"
        >
          <LoginScreen onLogin={handleLogin} />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    // 1. FIX: p-0 მობაილზე (რომ ადგილი არ დაკარგოს), h-[100dvh] (რომ ბრაუზერის ბარმა არ დაფაროს)
    <div className="h-[100dvh] flex flex-col p-0 md:p-8 overflow-hidden bg-[#f8fafc]">
      <AnimatePresence mode="wait">
        <motion.div key="chat-main" className="max-w-7xl w-full mx-auto h-full flex flex-col md:gap-6">
          
          {/* Header-ს მხოლოდ დესკტოპზე ან იუზერების სიაში ვაჩენთ */}
          <div className={`${currentRoom ? 'hidden md:block' : 'block'}`}>
             <Header username={username!} onLogout={handleLogout} />
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-12 gap-0 md:gap-6 relative h-full">
            
            {/* LEFT COLUMN (User List) */}
            <div className={`col-span-12 md:col-span-3 h-full overflow-hidden md:rounded-[24px] ${currentRoom ? 'hidden md:block' : 'block'}`}>
              <OnlineUsersList 
                users={onlineUsers} onUserClick={startPrivateChat} 
                currentRoom={currentRoom || ""} unreadCounts={unreadCounts} 
                myUsername={username!} 
              />
            </div>

            {/* RIGHT COLUMN (Chat Area) */}
            {/* 2. FIX: rounded-none და border-0 მობაილზე, რომ მთლიანი ეკრანი დაიკავოს */}
            <div className={`col-span-12 md:col-span-9 h-full bg-white border-0 md:border border-slate-200 md:rounded-[24px] overflow-hidden shadow-none md:shadow-sm flex flex-col ${!currentRoom ? 'hidden md:flex' : 'flex'}`}>
              {currentRoom ? (
                <>
                  <div className="h-16 border-b border-slate-100 flex items-center justify-between px-4 md:px-8 bg-white/60 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handleBackToUsers}
                        className="md:hidden p-2 -ml-2 mr-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer active:scale-95"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                      </button>

                      <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.4)]"></div>
                      <h2 className="text-xs font-[900] uppercase tracking-[0.2em] text-slate-800 truncate max-w-[150px] md:max-w-none">
                        {getChatPartner(currentRoom)}
                      </h2>
                    </div>

                    <AnimatePresence>
                      {typingStatus[currentRoom] && (
                        <motion.div 
                          initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                          className="flex items-center gap-2"
                        >
                          <span className="hidden md:inline text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-widest">
                            Signal
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

                  {/* 3. FIX: pb-safe არის iOS-ის Home bar-ისთვის (თუ დაამატებ CSS-ში env(safe-area-inset-bottom)) */}
                  <div className="p-3 md:p-6 bg-white border-t border-slate-100">
                    <ChatInput onSend={sendChatMessage} onTyping={sendTypingStatus} />
                  </div>
                </>
              ) : (
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