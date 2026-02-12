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
    // w-full e bg-black/90 garantem que ocupa a largura toda e tem fundo
    <nav className="w-full bg-[#121212]/95 backdrop-blur-md border-t border-white/10 px-6 py-4 flex justify-between items-center pb-6">
      {items.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link key={item.path} href={item.path} className="flex flex-col items-center gap-1 min-w-[60px]">
            <item.icon 
              size={24} 
              className={isActive ? "text-[#a855f7]" : "text-gray-500"} 
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span className={`text-[10px] ${isActive ? "text-[#a855f7] font-bold" : "text-gray-500"}`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}