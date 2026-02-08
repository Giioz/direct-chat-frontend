import { motion, AnimatePresence } from "framer-motion";

interface OnlineUsersListProps {
  users: string[];
  onUserClick: (username: string) => void;
  currentRoom: string;
  unreadCounts: Record<string, number>; 
  myUsername: string; 
}

export default function OnlineUsersList({ users, onUserClick, currentRoom, unreadCounts, myUsername }: OnlineUsersListProps) {
  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      <div className="p-6 pb-4 shrink-0">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Peer_Discovery</h3>
      </div>
      
      <div className="flex-1 px-3 space-y-1.5 overflow-y-auto">
        {users.map((user) => {
          // ვადგენთ Room ID-ს ამ იუზერისთვის
          const roomId = [myUsername, user].sort().join("_");
          const unreadCount = unreadCounts[roomId] || 0;
          const isSelected = currentRoom === roomId;

          return (
            <button
              key={user}
              onClick={() => onUserClick(user)}
              className={`w-full group flex items-center p-3 rounded-xl transition-all duration-300 border ${
                isSelected ? "bg-slate-900 border-slate-900 shadow-lg shadow-slate-200" : "hover:bg-slate-50 border-transparent text-slate-600"
              }`}
            >
              <div className={`w-10 h-10 rounded-lg border flex items-center justify-center font-mono text-xs shrink-0 mr-4 ${
                isSelected ? "bg-white border-white text-slate-900" : "bg-slate-100 border-slate-200 text-slate-400"
              }`}>
                {user.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 text-left overflow-hidden">
                <p className={`font-bold text-sm truncate ${isSelected ? "text-white" : "text-slate-900"}`}>
                  {user}
                </p>
                <p className="text-[9px] font-mono uppercase tracking-tighter text-slate-400">
                  Node_Active
                </p>
              </div>

              {/* 🔴 UNREAD INDICATOR */}
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
        })}
      </div>
    </div>
  );
}