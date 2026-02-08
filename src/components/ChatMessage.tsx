import { useEffect, useRef } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion"; // 1. შემოგვაქვს motion
import type { ChatMessageType } from "../services/socket";

interface ChatMessageProps {
  messages: ChatMessageType[];
  currentUsername: string;
  isLoading?: boolean;
  
}


const messageAnimation: Variants = {
  initial: { 
    opacity: 0, 
    y: 10, // უფრო მცირე მანძილიდან შემოდის, რაც უფრო ეფექტურს ხდის
    scale: 0.99 // თითქმის შეუმჩნეველი სკეილი, მხოლოდ სიღრმისთვის
  },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      // ვიყენებთ SPRING ფიზიკას
      type: "spring",
      stiffness: 500, // მაღალი სიხისტე - ძალიან სწრაფია
      damping: 35,    // მაღალი დემპფირება - არ აქვს "ბანცი" (bounce), უცებ ჩერდება
      mass: 0.8       // მსუბუქია
    }
  }
};

export default function ChatMessage({ messages, currentUsername, isLoading }: ChatMessageProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Skeleton Loader (იგივე რჩება)
  if (isLoading) {
    return (
      <div className="flex-1 p-8 space-y-6 overflow-hidden">
         {[...Array(5)].map((_, i) => (
            <div key={i} className={`flex flex-col ${i % 2 === 0 ? 'items-start' : 'items-end'}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-16 bg-slate-200 rounded animate-pulse"></div>
              </div>
              <div className={`h-10 w-[60%] rounded-[20px] animate-pulse ${i % 2 === 0 ? 'bg-slate-100 rounded-tl-none' : 'bg-slate-200 rounded-tr-none'}`}></div>
            </div>
         ))}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 overflow-x-hidden">
      {messages.map((m, index) => {
        const isOwn = m.sender === currentUsername;
        
        return (
  <motion.div 
    key={index} 
    variants={messageAnimation}
    initial="initial"
    animate="animate"
    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
    style={{ willChange: 'transform, opacity' }} 
  >
    <div className={`max-w-[70%] flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
      {/* 1. Header: Username & Status */}
      <div className="flex items-center gap-2 mb-2 px-1">
        <span className="text-[10px] font-[900] text-slate-400 uppercase tracking-[0.2em]">
          {isOwn ? "Local_Node" : m.sender}
        </span>
        <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
        <span className="text-[9px] font-mono text-slate-300 italic uppercase">Secure_Link</span>
      </div>

      {/* 2. Message Bubble */}
      <div className={`px-5 py-3.5 border transition-all duration-300 ${
        isOwn 
          ? "bg-indigo-600 border-indigo-500 text-white rounded-[22px] rounded-tr-none shadow-lg shadow-indigo-100" 
          : "bg-white border-slate-200 text-slate-800 rounded-[22px] rounded-tl-none shadow-sm"
      }`}>
        <p className="text-[14px] leading-relaxed font-medium tracking-tight">
          {m.msg}
        </p>
      </div>

      {/* 3. Message Metadata (Time & Seen Status) */}
      <div className="flex items-center gap-2 mt-2 px-1 h-3">
        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-tighter">
          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
        </span>

        {/* SEEN INDICATOR (მხოლოდ შენს გაგზავნილებზე) */}
        {isOwn && (
          <div className="flex items-center gap-0.5 ml-1">
            {/* პირველი წერტილი: Sent (თუ წაიკითხა მწვანდება) */}
            <div className={`w-1 h-1 rounded-full transition-colors duration-500 ${
              m.seen ? 'bg-emerald-500' : 'bg-indigo-400'
            }`}></div>
            
            {/* მეორე წერტილი: Seen (მხოლოდ მაშინ ჩნდება როცა წაიკითხა) */}
            <AnimatePresence>
              {m.seen && (
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="w-1 h-1 rounded-full bg-emerald-500"
                ></motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  </motion.div>
);
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}