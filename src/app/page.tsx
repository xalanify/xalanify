"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.push("/search"), 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="h-screen bg-black flex flex-col items-center justify-center overflow-hidden">
      <div className="relative w-40 h-40 mb-8 animate-[spin_10s_linear_infinite]">
         <div className="absolute inset-0 bg-red-600/20 blur-[60px] rounded-full" />
         <Image src="/XALANIFY.png" alt="Xalanify" fill className="object-contain relative z-10" />
      </div>
      <div className="text-center space-y-2 relative z-10">
        <h1 className="text-5xl font-black tracking-tighter">Xalanify</h1>
        <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Versão Beta - Em Desenvolvimento</p>
      </div>
      <div className="mt-12 w-48 h-1 bg-white/5 rounded-full relative overflow-hidden">
         <div className="absolute inset-y-0 left-0 bg-white animate-[progress_2.5s_ease-in-out]" />
      </div>
      <style jsx>{`
        @keyframes progress { 0% { width: 0%; } 100% { width: 100%; } }
      `}</style>
    </div>
  );
}