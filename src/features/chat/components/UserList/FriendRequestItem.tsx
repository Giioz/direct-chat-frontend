
interface FriendRequestItemProps {
  username: string;
  onAccept: () => void;
  onDecline: () => void;
}

export default function FriendRequestItem({ username, onAccept, onDecline }: FriendRequestItemProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 mb-2">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
          {username.substring(0, 2).toUpperCase()}
        </div>
        <span className="text-xs font-semibold text-slate-700">{username}</span>
      </div>
      <div className="flex gap-1">
        <button 
          onClick={(e) => { e.stopPropagation(); onAccept(); }}
          className="p-1.5 rounded-md bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
          title="Accept"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDecline(); }}
          className="p-1.5 rounded-md bg-rose-100 text-rose-600 hover:bg-rose-200 transition-colors"
          title="Decline"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
