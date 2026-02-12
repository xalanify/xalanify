"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Library, Settings } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();
  
  const items = [
    { name: "Início", path: "/", icon: Home },
    { name: "Pesquisa", path: "/search", icon: Search },
    { name: "Biblioteca", path: "/library", icon: Library },
    { name: "Definições", path: "/settings", icon: Settings },
  ];

  return (
    <nav className="w-full bg-[#121212]/95 backdrop-blur-xl border-t border-white/10 px-6 pt-3 pb-6 flex justify-between items-center">
      {items.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link key={item.path} href={item.path} className="flex flex-col items-center gap-1 min-w-[64px] active:scale-90 transition-transform">
            <item.icon 
              size={24} 
              className={isActive ? "text-[#a855f7]" : "text-zinc-500"} 
              strokeWidth={isActive ? 2.5 : 2}
              fill={isActive ? "rgba(168, 85, 247, 0.2)" : "none"}
            />
            <span className={`text-[10px] font-medium ${isActive ? "text-[#a855f7]" : "text-zinc-500"}`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}