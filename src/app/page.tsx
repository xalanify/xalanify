"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useXalanify } from "@/context/XalanifyContext";

export default function SplashPage() {
  const router = useRouter();
  const { themeColor } = useXalanify();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/search");
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-black font-jakarta">
      <div className="relative">
        <div 
          className="w-24 h-24 rounded-full border-t-2 animate-spin mb-8" 
          style={{ borderColor: themeColor }}
        />
        <div className="absolute inset-0 flex items-center justify-center font-black text-xs uppercase tracking-widest opacity-20">
          XLN
        </div>
      </div>
      <h1 className="text-2xl font-black tracking-tighter animate-pulse italic">
        Em desenvolvimento...
      </h1>
      <p className="text-[10px] font-black uppercase opacity-20 mt-4 tracking-[0.5em]">
        Xalanify v0.53.9
      </p>
    </div>
  );
}