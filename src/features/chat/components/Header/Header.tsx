interface HeaderProps {
  username: string;
  onLogout: () => void;
}

export default function Header({ username, onLogout }: HeaderProps) {
  return (
    <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        
        {/* Branding Section */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center shadow-lg shadow-slate-200 group transition-transform hover:scale-105">
              <div className="w-4 h-4 border-2 border-white rounded-sm rotate-45 group-hover:rotate-90 transition-transform duration-500"></div>
            </div>
            <div>
              <h1 className="text-sm font-[900] tracking-[0.4em] text-slate-900 uppercase leading-none">
                Direct
              </h1>
              <span className="text-[9px] font-mono text-indigo-500 font-bold uppercase tracking-widest mt-1 inline-block">
                p2p_encrypted
              </span>
            </div>
          </div>

          {/* Technical Metadata Divider & Info */}
          <div className="hidden lg:flex items-center gap-6 border-l border-slate-100 pl-8">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Protocol</span>
              <span className="text-[10px] font-mono text-slate-600">v2.4.0_SECURE</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Cipher</span>
              <span className="text-[10px] font-mono text-slate-600">AES_256_GCM</span>
            </div>
          </div>
        </div>

        {/* User Actions Section */}
        <div className="flex items-center gap-4">
          {/* Status Pill */}
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200/60 rounded-full">
            <div className="relative flex items-center justify-center">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping opacity-40"></div>
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-700 uppercase tracking-tight">
              {username}@local
            </span>
          </div>

          {/* Logout Button */}
          <button 
            onClick={onLogout}
            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
            title="Disconnect Session"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
}