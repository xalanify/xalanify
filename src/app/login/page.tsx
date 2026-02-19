"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, Loader2, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    });
    if (error) alert(error.message);
    else setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050a18] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full" />
      
      <div className="w-full max-w-sm space-y-10 text-center relative z-10">
        <div className="space-y-2">
          <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-2xl">
            <Sparkles className="text-blue-500" size={40} />
          </div>
          <h1 className="text-6xl font-black italic tracking-tighter">Xalanify</h1>
          <p className="text-white/40 font-medium">O teu ecossistema musical premium.</p>
        </div>

        {sent ? (
          <div className="glass p-8 rounded-[3rem] border-white/10 animate-in zoom-in">
            <p className="text-blue-400 font-black text-xl mb-2">Email Enviado!</p>
            <p className="text-zinc-400 text-sm">Verifica a tua caixa de entrada para acederes à tua conta.</p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative group">
              <input 
                type="email" placeholder="Introduz o teu email..." 
                className="w-full bg-white/5 border border-white/10 p-6 rounded-[2rem] outline-none focus:bg-white/10 focus:border-blue-500/50 transition-all text-center font-bold"
                value={email} onChange={e => setEmail(e.target.value)} required
              />
              <Mail className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <button 
              disabled={loading}
              className="w-full py-6 bg-white text-black rounded-[2rem] font-black uppercase tracking-[0.2em] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-2xl"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Entrar Agora"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}