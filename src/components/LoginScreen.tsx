import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoginScreenProps {
  onLogin: (username: string, token: string) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // გავყავით ერორი და წარმატება
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null); // გასუფთავება

    // 🛑 VALIDATION
    if (!username.trim()) {
      setError("⚠ PROTOCOL_ERROR: IDENTITY_FIELD_NULL");
      return;
    }

    if (!password.trim()) {
      setError("⚠ PROTOCOL_ERROR: ACCESS_KEY_VOID");
      return;
    }

    if (password.length < 4) {
      setError("⚠ SECURITY_ALERT: KEY_FRAGMENTED (MIN 4 CHARS)");
      return;
    }

    setLoading(true);

    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: username.trim(),
          password 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "User not found") throw new Error("TARGET_IDENTITY_NOT_FOUND");
        if (data.error === "Invalid credentials") throw new Error("ACCESS_DENIED: INVALID_KEY");
        if (data.error === "Username already taken") throw new Error("IDENTITY_ALREADY_OCCUPIED");
        throw new Error(data.error || "SYSTEM_FAILURE");
      }

      if (isRegister) {
        setIsRegister(false);
        // ✅ აქ ვიყენებთ უკვე SUCCESS state-ს!
        setSuccess("NODE_INITIALIZED. PLEASE AUTHENTICATE.");
        setPassword("");
      } else {
        onLogin(data.username, data.token);
      }
    } catch (err: any) {
      setError(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputFocus = () => {
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  return (
    <div className="h-full w-full flex items-center justify-center bg-slate-50 relative overflow-hidden">
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
              onFocus={handleInputFocus}
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:ring-1 transition-all text-sm font-bold text-slate-700 placeholder:text-slate-400 font-mono ${error?.includes("IDENTITY") ? "border-red-500 ring-red-500/20" : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"}`}
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="ACCESS_KEY (PASSWORD)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={handleInputFocus}
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:ring-1 transition-all text-sm font-bold text-slate-700 placeholder:text-slate-400 font-mono ${error?.includes("KEY") || error?.includes("ACCESS") ? "border-red-500 ring-red-500/20" : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"}`}
            />
          </div>

          {/* შეტყობინებების ბლოკი */}
          <AnimatePresence mode="wait">
            {/* 🛑 ERROR MESSAGE (RED) */}
            {error && (
              <motion.div 
                key="error-box"
                initial={{ opacity: 0, y: -10, height: 0 }} 
                animate={{ opacity: 1, y: 0, height: "auto" }} 
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                  <p className="text-[10px] font-bold text-center uppercase tracking-widest font-mono text-red-600">
                    {error}
                  </p>
                </div>
              </motion.div>
            )}

            {/* ✅ SUCCESS MESSAGE (GREEN) */}
            {success && (
              <motion.div 
                key="success-box"
                initial={{ opacity: 0, y: -10, height: 0 }} 
                animate={{ opacity: 1, y: 0, height: "auto" }} 
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                  <p className="text-[10px] font-bold text-center uppercase tracking-widest font-mono text-emerald-600">
                    {success}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
            type="button"
            onClick={() => { 
              setIsRegister(!isRegister); 
              setError(null); 
              setSuccess(null); 
            }}
            className="text-xs font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-wider transition-colors"
          >
            {isRegister ? "Already have access? Login" : "New Device? Register"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}