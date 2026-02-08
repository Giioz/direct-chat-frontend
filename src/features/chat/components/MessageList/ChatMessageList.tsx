import { useEffect, useRef } from "react";
import { type ChatMessageType } from "../../api/socket";
import { useMessageActions } from "../../hooks/useMessageActions";
import SingleMessage from "./SignleMessage";

interface ChatMessageListProps {
  messages: ChatMessageType[];
  currentUsername: string;
  isLoading?: boolean;
}

export default function ChatMessageList({ messages, currentUsername, isLoading }: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { onReaction } = useMessageActions(currentUsername);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]); 

  // --- SKELETON LOADER ---
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

  // --- MAIN RENDER ---
  return (
    <div className="flex-1 overflow-y-auto p-8 overflow-x-hidden scrollbar-hide">
      {messages.map((m, index) => (
        <SingleMessage 
          key={m._id || index} 
          message={m} 
          currentUsername={currentUsername}
          onReaction={onReaction} 
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}