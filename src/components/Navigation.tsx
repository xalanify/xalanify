"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Library, Settings } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();
  
  const items = [
    { name: "Home", path: "/", icon: Home },
    { name: "Search", path: "/search", icon: Search },
    { name: "Library", path: "/library", icon: Library },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <nav className="flex justify-around items-center py-4 px-2 bg-[#121212]/90 backdrop-blur-xl border-t border-white/5">
      {items.map((item) => {
        const active = pathname === item.path;
        return (
          <Link key={item.path} href={item.path} className="flex flex-col items-center gap-1 min-w-[60px] transition-all active:scale-90">
            <item.icon 
              size={22} 
              className={active ? "text-[var(--primary)]" : "text-zinc-500"} 
              strokeWidth={active ? 2.5 : 2}
            />
            <span className={`text-[10px] ${active ? "text-[var(--primary)] font-bold" : "text-zinc-500"}`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}