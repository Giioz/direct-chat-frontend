import { useState, memo } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { type ChatMessageType } from "../../api/socket";

// ანიმაციის კონფიგურაცია
const messageAnimation: Variants = {
  initial: { opacity: 0, y: 10, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 500, damping: 35, mass: 0.8 } }
};

const AVAILABLE_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

interface SingleMessageProps {
  message: ChatMessageType;
  currentUsername: string;
  onReaction: (message: ChatMessageType, emoji: string) => void; 
}

const SingleMessage = memo(({ message, currentUsername, onReaction }: SingleMessageProps) => {
  const isOwn = message.sender === currentUsername;
  const [showMenu, setShowMenu] = useState(false);

  // რეაქციის დათვლა
  const reactionCounts = message.reactions?.reduce((acc: any, curr) => {
    acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
    return acc;
  }, {});

  const handleEmojiClick = (emoji: string) => {
    onReaction(message, emoji);
    setShowMenu(false);
  };

  return (
    <motion.div
      layout
      variants={messageAnimation}
      initial="initial"
      animate="animate"
      className={`flex ${isOwn ? "justify-end" : "justify-start"} group relative mb-8`}
      onMouseLeave={() => setShowMenu(false)}
    >
      <div className={`max-w-[70%] flex flex-col ${isOwn ? "items-end" : "items-start"} relative`}>
        
        {/* Header */}
        <div className="flex items-center gap-2 mb-2 px-1">
          <span className="text-[10px] font-[900] text-slate-400 uppercase tracking-[0.2em]">
            {isOwn ? "Local_Node" : message.sender}
          </span>
          <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
          <span className="text-[9px] font-mono text-slate-300 italic uppercase">Secure_Link</span>
        </div>

        {/* Reaction Trigger Button */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`absolute top-8 p-1.5 rounded-full text-slate-300 hover:text-indigo-500 transition-all opacity-0 group-hover:opacity-100 z-10 ${
            isOwn ? "-left-8" : "-right-8"
          } ${showMenu ? "opacity-100" : ""}`}
        >
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm6.75 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75z" />
            </svg>
        </button>

        {/* Reaction Menu */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className={`absolute -top-10 bg-white rounded-full shadow-xl border border-slate-100 p-1 flex gap-1 z-20 ${
                isOwn ? "right-0" : "left-0"
              }`}
            >
              {AVAILABLE_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiClick(emoji)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 rounded-full text-lg transition-transform hover:scale-125 active:scale-95 cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message Bubble */}
        <div className="relative">
          <div className={`px-5 py-3.5 border transition-all duration-300 relative z-10 ${
            isOwn 
              ? "bg-indigo-600 border-indigo-500 text-white rounded-[22px] rounded-tr-none shadow-lg shadow-indigo-100" 
              : "bg-white border-slate-200 text-slate-800 rounded-[22px] rounded-tl-none shadow-sm"
          }`}>
             <p className="text-[14px] leading-relaxed font-medium tracking-tight">
                {message.msg}
              </p>
          </div>

          {/* Reaction Pills */}
          {message.reactions && message.reactions.length > 0 && (
            <div className={`absolute -bottom-3 z-20 ${isOwn ? "left-0" : "right-0"}`}>
              <div className="bg-white border border-slate-200 rounded-full px-1.5 py-0.5 shadow-sm flex items-center gap-1">
                {Object.entries(reactionCounts || {}).map(([emoji, count]) => (
                  <span key={emoji} className="text-[10px] font-bold flex items-center gap-0.5 text-slate-600">
                    <span>{emoji}</span>
                    {(count as number) > 1 && <span className="text-slate-400 text-[9px]">{count as number}</span>}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-2 mt-2 px-1 h-3">
          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-tighter">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
          </span>
          {isOwn && (
            <div className="flex items-center gap-0.5 ml-1">
              <div className={`w-1 h-1 rounded-full transition-colors duration-500 ${message.seen ? 'bg-emerald-500' : 'bg-indigo-400'}`}></div>
              <AnimatePresence>
                {message.seen && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-1 h-1 rounded-full bg-emerald-500"></motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

export default SingleMessage;