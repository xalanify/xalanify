"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Library, Settings } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();
  
  const navItems = [
    { label: "Home", icon: Home, path: "/" },
    { label: "Search", icon: Search, path: "/search" },
    { label: "Library", icon: Library, path: "/library" },
    { label: "Settings", icon: Settings, path: "/settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-white/5 p-3 flex justify-around items-center z-50">
      {navItems.map((item) => (
        <Link key={item.path} href={item.path} className="flex flex-col items-center gap-1">
          <item.icon 
            size={22} 
            className={pathname === item.path ? "text-[var(--primary)]" : "text-gray-500"} 
            fill={pathname === item.path ? "currentColor" : "none"}
          />
          <span className={`text-[10px] ${pathname === item.path ? "text-[var(--primary)] font-bold" : "text-gray-500"}`}>
            {item.label}
          </span>
        </Link>
      ))}
    </nav>
  );
}