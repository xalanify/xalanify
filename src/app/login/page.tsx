"use client";
import { useState } from "react";
import { useXalanify } from "@/context/XalanifyContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [name, setName] = useState("");
  const { login } = useXalanify();
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      login(name);
      router.push("/");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-black text-primary italic">XALANIFY</h1>
        <p className="text-gray-500 text-sm">Entra com o teu username</p>
      </div>

      <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
        <input 
          type="text" 
          placeholder="Como te chamas?"
          className="w-full bg-surface border border-white/10 p-4 rounded-2xl outline-none focus:border-primary transition-all"
          onChange={(e) => setName(e.target.value)}
        />
        <button className="w-full bg-primary font-bold p-4 rounded-2xl hover:scale-95 transition-transform">
          Começar a Ouvir
        </button>
      </form>
    </div>
  );
}