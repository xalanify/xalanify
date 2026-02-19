"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, Lock, Loader2, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const action = isRegistering ? supabase.auth.signUp : supabase.auth.signInWithPassword;
    
    const { data, error } = await action({ email, password });
    
    if (error) {
      alert(error.message);
    } else {
       if (isRegistering) alert("Conta criada! Podes entrar.");
       else window.location.reload();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050a18] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-sm space-y-10 text-center relative z-10 animate-in zoom-in duration-500">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto border border-white/10 shadow-2xl">
            <Sparkles className="text-blue-500" size={40} />
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter text-white">Xalanify</h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px]">Music Ecosystem</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
            <div className="relative group">
              <input 
                type="email" placeholder="Email" 
                className="w-full bg-[#1e293b]/50 border border-white/5 p-5 rounded-[2rem] outline-none focus:border-blue-500/50 transition-all text-center font-bold text-white placeholder:text-gray-600"
                value={email} onChange={e => setEmail(e.target.value)} required
              />
              <Mail className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={18} />
            </div>
            
            <div className="relative group">
              <input 
                type="password" placeholder="Password" 
                className="w-full bg-[#1e293b]/50 border border-white/5 p-5 rounded-[2rem] outline-none focus:border-blue-500/50 transition-all text-center font-bold text-white placeholder:text-gray-600"
                value={password} onChange={e => setPassword(e.target.value)} required
              />
              <Lock className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={18} />
            </div>

            <button 
              disabled={loading}
              className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-bold uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (isRegistering ? "Criar Conta" : "Entrar")}
            </button>
        </form>

        <button 
          onClick={() => setIsRegistering(!isRegistering)}
          className="text-gray-500 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors"
        >
          {isRegistering ? "Já tenho conta" : "Criar nova conta"}
        </button>
      </div>
    </div>
  );
}