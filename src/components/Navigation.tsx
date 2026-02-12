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
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto glass border-t border-white/5 px-6 py-3 flex justify-between items-center z-[100]">
      {items.map((item) => (
        <Link key={item.path} href={item.path} className="flex flex-col items-center gap-1">
          <item.icon 
            size={22} 
            className={pathname === item.path ? "text-[var(--primary)]" : "text-zinc-500"} 
            fill={pathname === item.path ? "currentColor" : "none"}
          />
          <span className={`text-[10px] ${pathname === item.path ? "text-[var(--primary)] font-medium" : "text-zinc-500"}`}>
            {item.name}
          </span>
        </Link>
      ))}
    </nav>
  );
}