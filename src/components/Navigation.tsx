"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Library, Settings } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";

export default function Navigation() {
  const pathname = usePathname();
  const { themeColor } = useXalanify();

  const items = [
    { icon: Search, label: "Pesquisa", path: "/search" },
    { icon: Library, label: "Biblioteca", path: "/library" },
    { icon: Settings, label: "Definições", path: "/settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-24 bg-black/80 backdrop-blur-xl border-t border-white/5 px-10 flex justify-between items-center z-[100]">
      {items.map((item) => {
        const active = pathname === item.path;
        return (
          <Link key={item.path} href={item.path} className="flex flex-col items-center gap-1 group">
            <item.icon 
              size={24} 
              style={{ color: active ? themeColor : "#444" }} 
              className={`transition-all duration-300 ${active ? 'scale-110' : 'group-hover:text-white'}`}
            />
            <span className={`text-[9px] font-black uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-20'}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}