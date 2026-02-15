"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Music, Mail, Lock } from "lucide-react";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { emailRedirectTo: window.location.origin } 
        });
        if (error) throw error;
        alert("Verifica o teu email para confirmar o registo!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-black flex flex-col items-center justify-center p-6 text-center">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-purple-600/10 blur-[120px] rounded-full" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 bg-zinc-900 rounded-[2.5rem] flex items-center justify-center border border-white/10 shadow-2xl">
            <Music size={40} className="text-purple-500 animate-pulse" />
          </div>
        </div>

        <h1 className="text-5xl font-black italic mb-2 tracking-tighter">XALANIFY</h1>
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-10">
          {isRegistering ? "Criar nova conta" : "Bem-vindo de volta"}
        </p>

        <form onSubmit={handleAuth} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="email" placeholder="Teu email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-900/50 border border-white/5 p-4 pl-12 rounded-2xl outline-none focus:border-purple-500/50 transition-all text-sm font-bold"
              required
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="password" placeholder="Palavra-passe" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-900/50 border border-white/5 p-4 pl-12 rounded-2xl outline-none focus:border-purple-500/50 transition-all text-sm font-bold"
              required
            />
          </div>

          <button 
            disabled={loading}
            className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : (isRegistering ? "Registar" : "Entrar")}
          </button>
        </form>

        <button 
          onClick={() => setIsRegistering(!isRegistering)}
          className="mt-8 text-[10px] font-black uppercase text-zinc-500 hover:text-white transition-colors tracking-widest"
        >
          {isRegistering ? "Já tens conta? Entrar aqui" : "Ainda não tens conta? Criar conta"}
        </button>
      </div>
    </div>
  );
}