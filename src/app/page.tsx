"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.push("/search"), 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="h-screen bg-black flex flex-col items-center justify-center overflow-hidden font-jakarta">
      <div className="text-center space-y-4 relative z-10 animate-in fade-in zoom-in duration-1000">
        <h1 className="text-6xl font-black tracking-tighter bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
          Xalanify
        </h1>
        <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.6em] animate-pulse">
          Beta - Em Desenvolvimento
        </p>
      </div>
      
      <div className="mt-16 w-64 h-[2px] bg-white/5 rounded-full relative overflow-hidden">
         <div className="absolute inset-y-0 left-0 bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)] animate-[progress_2.5s_ease-in-out]" />
      </div>

      <style jsx>{`
        @keyframes progress { 0% { width: 0%; } 100% { width: 100%; } }
      `}</style>
    </div>
  );
}