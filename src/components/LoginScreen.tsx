import { useState } from "react";
import { motion } from "framer-motion";

interface LoginScreenProps {
  onLogin: (username: string, token: string) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
    
    // URL შეცვალე შენი სერვერის მისამართით (მაგ: http://localhost:3000...)
    const API_URL = "http://localhost:3000"; 

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Operation failed");
      }

      if (isRegister) {
        // რეგისტრაციის შემდეგ გადავრთავთ ლოგინზე
        setIsRegister(false);
        setError("Account created. Access granted via Login.");
        setPassword("");
      } else {
        // ლოგინის შემდეგ ვაწვდით ტოკენს მშობელ კომპონენტს
        onLogin(data.username, data.token);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Background Dot Grid */}
      <div className="absolute inset-0 opacity-[0.03]" 
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md p-8 bg-white border border-slate-200 rounded-[32px] shadow-xl shadow-slate-200/50 relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-slate-900/20">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-xl font-[900] text-slate-800 uppercase tracking-widest">
            {isRegister ? "Node_Registration" : "Secure_Login"}
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-2 uppercase tracking-wider">Protocol v2.0</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="IDENTITY (USERNAME)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm font-bold text-slate-700 placeholder:text-slate-400 font-mono"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="ACCESS_KEY (PASSWORD)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm font-bold text-slate-700 placeholder:text-slate-400 font-mono"
            />
          </div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-xs text-red-600 font-bold text-center uppercase tracking-wide">{error}</p>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-slate-900/20"
          >
            {loading ? "Processing..." : (isRegister ? "Initialize_Node" : "Authenticate")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => { setIsRegister(!isRegister); setError(null); }}
            className="text-xs font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-wider transition-colors"
          >
            {isRegister ? "Already have access? Login" : "New Device? Register"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}