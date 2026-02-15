"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Library, Settings, Shield } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";

export default function Navigation() {
  const pathname = usePathname();
  const { themeColor, isAdmin } = useXalanify();
  
  const items = [
    { name: "Início", path: "/", icon: Home },
    { name: "Pesquisa", path: "/search", icon: Search },
    { name: "Biblioteca", path: "/library", icon: Library },
    { name: "Definições", path: "/settings", icon: Settings },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-[100] border-t border-white/5 backdrop-blur-2xl transition-all duration-500"
      style={{ background: `linear-gradient(to top, ${themeColor}15, black 90%)` }}
    >
      <div className="flex justify-around items-center h-[75px] px-2 relative">
        {items.map((item) => {
          const active = pathname === item.path;
          return (
            <Link key={item.path} href={item.path} className="flex flex-col items-center justify-center w-full group">
              <div 
                className={`p-2 rounded-2xl transition-all duration-300 ${active ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}
                style={{ color: active ? themeColor : 'white' }}
              >
                <item.icon size={24} strokeWidth={active ? 2.5 : 2} />
              </div>
              {active && (
                <div className="absolute bottom-2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor, boxShadow: `0 0 10px ${themeColor}` }} />
              )}
            </Link>
          );
        })}
        {isAdmin && (
          <div className="absolute -top-3 right-6 bg-zinc-900 border border-white/10 px-3 py-1 rounded-full flex items-center gap-2 shadow-xl border-red-500/50">
            <Shield size={10} className="text-red-500" />
            <span className="text-[8px] font-black uppercase tracking-tighter text-red-500">Admin Mode</span>
          </div>
        )}
      </div>
    </nav>
  );
}