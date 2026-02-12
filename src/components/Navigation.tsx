"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Library, Settings } from "lucide-react";
import { useXalanify } from "@/context/XalanifyContext";

export default function Navigation() {
  const pathname = usePathname();
  const { themeColor } = useXalanify(); // Usa a cor que escolheste nas settings
  
  const items = [
    { name: "Home", path: "/", icon: Home },
    { name: "Search", path: "/search", icon: Search },
    { name: "Library", path: "/library", icon: Library },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#09080b] border-t border-white/5 px-8 py-3 flex justify-between items-center z-[100]">
      {items.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link 
            key={item.path} 
            href={item.path} 
            className="flex flex-col items-center gap-1.5 transition-all active:scale-90"
          >
            <item.icon 
              size={24} 
              strokeWidth={isActive ? 2.5 : 2}
              style={{ color: isActive ? themeColor : "#71717a" }}
              fill={isActive ? themeColor : "none"}
            />
            <span 
              className="text-[10px] tracking-wide font-medium"
              style={{ color: isActive ? themeColor : "#71717a" }}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}