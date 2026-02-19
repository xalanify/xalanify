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
    
    const { error } = isRegistering 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) alert(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050a18] flex items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[120px] rounded-full" />
      
      <div className="w-full max-w-sm space-y-12 relative z-10 animate-in fade-in zoom-in duration-500 text-center">
        <div className="space-y-4">
          <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto border border-white/10 shadow-2xl">
            <Sparkles className="text-blue-500" size={48} />
          </div>
          <h1 className="text-7xl font-black-italic tracking-tighter text-white">Xalanify</h1>
          <p className="text-white/30 font-bold uppercase tracking-[0.2em] text-[10px]">Acesso ao Sistema</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div className="space-y-3">
            <div className="relative group">
              <input 
                type="email" placeholder="Email" 
                className="w-full bg-white/5 border border-white/5 p-6 rounded-[2.5rem] outline-none focus:bg-white/10 focus:border-blue-500/30 transition-all font-bold text-center"
                value={email} onChange={e => setEmail(e.target.value)} required
              />
              <Mail className="absolute right-8 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-blue-500 transition-colors" />
            </div>
            
            <div className="relative group">
              <input 
                type="password" placeholder="Password" 
                className="w-full bg-white/5 border border-white/5 p-6 rounded-[2.5rem] outline-none focus:bg-white/10 focus:border-blue-500/30 transition-all font-bold text-center"
                value={password} onChange={e => setPassword(e.target.value)} required
              />
              <Lock className="absolute right-8 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-blue-500 transition-colors" />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full py-7 bg-white text-black rounded-[2.5rem] font-black uppercase tracking-[0.2em] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-2xl"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : (isRegistering ? "Criar Conta" : "Entrar")}
          </button>
        </form>

        <button 
          onClick={() => setIsRegistering(!isRegistering)}
          className="text-white/40 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors"
        >
          {isRegistering ? "Já tenho conta? Fazer Login" : "Não tens conta? Regista-te aqui"}
        </button>
      </div>
    </div>
  );
}