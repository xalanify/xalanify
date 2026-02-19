"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Library, Settings, Home } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";

export default function Navigation() {
  const pathname = usePathname();
  const { themeColor } = useXalanify();

  const items = [
    { icon: Home, label: "Início", path: "/" },
    { icon: Search, label: "Procurar", path: "/search" },
    { icon: Library, label: "Biblioteca", path: "/library" },
    { icon: Settings, label: "Ajustes", path: "/settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-28 bg-black/40 backdrop-blur-[40px] border-t border-white/5 px-8 flex justify-between items-center z-[150] pb-8 pt-2">
      {items.map((item) => {
        const active = pathname === item.path;
        return (
          <Link key={item.path} href={item.path} className="flex flex-col items-center gap-1.5 group relative px-4">
            {active && (
              <div 
                className="absolute -top-4 w-10 h-1 rounded-full animate-pulse blur-[2px]" 
                style={{ backgroundColor: themeColor, boxShadow: `0 0 15px ${themeColor}` }}
              />
            )}
            <item.icon 
              size={26} 
              strokeWidth={active ? 2.5 : 1.5}
              style={{ color: active ? "white" : "rgba(255,255,255,0.2)" }} 
              className={`transition-all duration-500 ${active ? 'scale-110' : 'group-hover:scale-105 group-hover:text-white/60'}`}
            />
            <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}