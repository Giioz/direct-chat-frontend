import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface UserItemProps {
  username: string;
  isSelected: boolean;
  unreadCount: number;
  onClick: () => void;
}

const UserItem = memo(({ username, isSelected, unreadCount, onClick }: UserItemProps) => {
  return (
    <button
      onClick={onClick}
      className={`w-full group flex items-center p-3 rounded-xl transition-all duration-300 border ${
        isSelected 
          ? "bg-slate-900 border-slate-900 shadow-lg shadow-slate-200" 
          : "hover:bg-slate-50 border-transparent text-slate-600"
      }`}
    >
      {/* Avatar / Icon */}
      <div className={`w-10 h-10 rounded-lg border flex items-center justify-center font-mono text-xs shrink-0 mr-4 ${
        isSelected 
          ? "bg-white border-white text-slate-900" 
          : "bg-slate-100 border-slate-200 text-slate-400"
      }`}>
        {username.charAt(0).toUpperCase()}
      </div>

      {/* User Info */}
      <div className="flex-1 text-left overflow-hidden">
        <p className={`font-bold text-sm truncate ${isSelected ? "text-white" : "text-slate-900"}`}>
          {username}
        </p>
        <p className="text-[9px] font-mono uppercase tracking-tighter text-slate-400">
          Node_Active
        </p>
      </div>

      {/* 🔴 UNREAD INDICATOR (Animated) */}
      <AnimatePresence>
        {unreadCount > 0 && !isSelected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="ml-2 min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-indigo-600 text-white text-[10px] font-black font-mono rounded-md shadow-[0_0_10px_rgba(79,70,229,0.4)]"
          >
            {unreadCount}
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
});

export default UserItem;