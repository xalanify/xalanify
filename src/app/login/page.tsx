"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, Loader2 } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8 text-center">
        <h1 className="text-6xl font-black italic tracking-tighter">Xalanify</h1>
        {sent ? (
          <p className="text-zinc-400 font-bold">Verifica o teu email para entrar!</p>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input 
                type="email" placeholder="Teu email..." 
                className="w-full bg-zinc-900 border border-white/10 p-5 rounded-3xl outline-none"
                value={email} onChange={e => setEmail(e.target.value)} required
              />
              <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600" />
            </div>
            <button 
              disabled={loading}
              className="w-full py-5 bg-white text-black rounded-3xl font-black uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="animate-spin" size={18} />}
              Entrar com Magic Link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}