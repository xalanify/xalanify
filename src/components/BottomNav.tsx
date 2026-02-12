"use client";
import { Home, Library, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Início", icon: Home, path: "/" },
    { name: "Biblioteca", icon: Library, path: "/library" },
    { name: "Definições", icon: Settings, path: "/settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-white/5 px-6 py-3 flex justify-between items-center z-40">
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link key={item.path} href={item.path} className="relative flex flex-col items-center gap-1">
            <item.icon size={24} className={isActive ? "text-primary" : "text-gray-500"} />
            <span className={`text-[10px] ${isActive ? "text-white" : "text-gray-500"}`}>{item.name}</span>
            {isActive && (
              <motion.div layoutId="nav-indicator" className="absolute -top-1 w-8 h-1 bg-primary rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}