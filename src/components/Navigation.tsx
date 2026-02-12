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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-xl border-t border-white/10 pb-safe">
      <div className="flex justify-around items-center h-[60px] pb-2 pt-2">
        {items.map((item) => {
          const active = pathname === item.path;
          return (
            <Link key={item.path} href={item.path} className="flex flex-col items-center justify-center w-full h-full active:scale-90 transition-all">
              <div className={`p-1 rounded-xl ${active ? 'bg-white/10' : 'bg-transparent'}`}>
                <item.icon 
                  size={20} 
                  className={active ? "text-white" : "text-zinc-500"} 
                  strokeWidth={active ? 2.5 : 2}
                />
              </div>
              <span className={`text-[9px] mt-1 ${active ? "text-white font-bold" : "text-zinc-500 font-medium"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}