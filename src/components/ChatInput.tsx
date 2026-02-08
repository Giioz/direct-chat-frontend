import { useState, useRef } from "react";

export default function ChatInput({ onSend, onTyping }: { onSend: (m: string) => void, onTyping: (status: boolean) => void }) {
  const [message, setMessage] = useState("");
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    onTyping(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => onTyping(false), 1500);
  };

  const handleSend = () => {
    if (message.trim() === "") return;
    onSend(message);
    setMessage("");
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    onTyping(false);
  };

  return (
    <div className="flex items-center gap-4 bg-slate-50 p-2 border border-slate-200 rounded-2xl focus-within:bg-white focus-within:shadow-md focus-within:border-slate-300 transition-all duration-300">
      <textarea
        value={message}
        onChange={handleChange}
        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
        placeholder="Enter secure transmission..."
        rows={1}
        className="flex-1 py-2.5 px-3 bg-transparent outline-none resize-none text-sm font-medium text-slate-800 placeholder:text-slate-400"
      />
      <button 
        onClick={handleSend} 
        disabled={!message.trim()}
        className="h-11 w-11 bg-slate-900 hover:bg-black disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl flex items-center justify-center transition-all active:scale-90 shrink-0"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}