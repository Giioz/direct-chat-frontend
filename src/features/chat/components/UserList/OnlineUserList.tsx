import { useState } from "react";
import UserItem from "./UserItem";
import FriendRequestItem from "./FriendRequestItem";

interface OnlineUsersListProps {
  onlineUsers: string[];
  onUserClick: (username: string) => void;
  currentRoom: string | null;
  unreadCounts: Record<string, number>; 
  myUsername: string; 
  // Friend Props
  friends: any[];
  pendingRequests: any[];
  onSendRequest: (username: string) => Promise<any>;
  onAcceptRequest: (id: string) => void;
  onDeclineRequest: (id: string) => void;
}

export default function OnlineUsersList({ 
  onlineUsers, 
  onUserClick, 
  currentRoom, 
  unreadCounts, 
  myUsername,
  friends,
  pendingRequests,
  onSendRequest,
  onAcceptRequest,
  onDeclineRequest
}: OnlineUsersListProps) {
  
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [addUsername, setAddUsername] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addUsername.trim()) return;
    
    try {
      setIsAdding(true);
      const res = await onSendRequest(addUsername);
      if (res.success) {
        setAddUsername("");
        alert("Request sent!");
      } else {
        alert(res.error || "Failed to send request");
      }
    } catch (err) {
      alert("Error sending request");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Header & Tabs */}
      <div className="p-4 pb-2 shrink-0 bg-slate-50 border-b border-slate-100">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">
          Social_Network
        </h3>
        
        {/* Tabs */}
        <div className="flex p-1 bg-slate-200/50 rounded-lg mb-4">
            <button 
                onClick={() => setActiveTab('friends')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                    activeTab === 'friends' 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-600'
                }`}
            >
                Friends
            </button>
            <button 
                onClick={() => setActiveTab('requests')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'requests' 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-600'
                }`}
            >
                Requests
                {pendingRequests.length > 0 && (
                    <span className="bg-indigo-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                        {pendingRequests.length}
                    </span>
                )}
            </button>
        </div>

        {/* Add Friend Input */}
        <form onSubmit={handleAddFriend} className="relative">
            <input 
                type="text" 
                placeholder="Add friend by username..." 
                value={addUsername}
                onChange={(e) => setAddUsername(e.target.value)}
                className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-400"
            />
            <button 
                type="submit"
                disabled={!addUsername || isAdding}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-50 transition-colors"
            >
                {isAdding ? (
                    <div className="w-3 h-3 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin"></div>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                )}
            </button>
        </form>
      </div>
      
      {/* List Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 p-2">
        
        {activeTab === 'friends' ? (
            <div className="space-y-1">
                {friends.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs italic">
                        No friends yet. <br/> Add someone to chat!
                    </div>
                ) : (
                    friends.map((friend) => {
                        const roomId = [myUsername, friend.username].sort().join("_");
                        const unreadCount = unreadCounts[roomId] || 0;
                        const isSelected = currentRoom === roomId;
                        const isOnline = onlineUsers.includes(friend.username);

                        return (
                            <UserItem
                                key={friend._id}
                                username={friend.username}
                                isSelected={isSelected}
                                unreadCount={unreadCount}
                                isOnline={isOnline}
                                onClick={() => onUserClick(friend.username)}
                                // We might need to pass isOnline status to UserItem if it supports it
                                // For now, assuming UserItem handles display based on something else or we need to update it.
                                // Let's check UserItem briefly or assume standard display. 
                                // Actually, I should probably update UserItem to show online status explicitly if it doesn't already 
                                // (it likely inferred it from list presence before).
                            />
                        );
                    })
                )}
            </div>
        ) : (
            <div className="space-y-1">
                {pendingRequests.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs italic">
                        No pending requests.
                    </div>
                ) : (
                    pendingRequests.map((req: any) => (
                        <FriendRequestItem 
                            key={req._id} 
                            username={req.username} 
                            onAccept={() => onAcceptRequest(req._id)}
                            onDecline={() => onDeclineRequest(req._id)}
                        />
                    ))
                )}
            </div>
        )}
      </div>
    </div>
  );
}