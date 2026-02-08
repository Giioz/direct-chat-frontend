import UserItem from "./UserItem";

interface OnlineUsersListProps {
  users: string[];
  onUserClick: (username: string) => void;
  currentRoom: string | null;
  unreadCounts: Record<string, number>; 
  myUsername: string; 
}

export default function OnlineUsersList({ 
  users, 
  onUserClick, 
  currentRoom, 
  unreadCounts, 
  myUsername 
}: OnlineUsersListProps) {
  
  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Header */}
      <div className="p-6 pb-4 shrink-0">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
          Peer_Discovery
        </h3>
      </div>
      
      {/* Scrollable List */}
      <div className="flex-1 px-3 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 pb-4">
        {users.map((user) => {
          // ლოგიკა: ოთახის ID-ს აწყობა
          const roomId = [myUsername, user].sort().join("_");
          const unreadCount = unreadCounts[roomId] || 0;
          const isSelected = currentRoom === roomId;

          return (
            <UserItem
              key={user}
              username={user}
              isSelected={isSelected}
              unreadCount={unreadCount}
              onClick={() => onUserClick(user)}
            />
          );
        })}
      </div>
    </div>
  );
}