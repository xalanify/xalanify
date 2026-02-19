// src/app/search/page.tsx
"use client";
import { Search as SearchIcon } from "lucide-react";

const CATEGORIES = [
  { name: "Pop", color: "#e91429" },
  { name: "Hip-Hop", color: "#bc59ff" },
  { name: "Dance", color: "#1e3264" },
  { name: "Rock", color: "#e8115b" },
  { name: "Indie", color: "#608108" },
  { name: "Relax", color: "#d84000" },
];

export default function SearchPage() {
  return (
    <div className="p-6 pt-12">
      <h1 className="text-4xl font-black italic tracking-tighter mb-8">Procurar</h1>
      
      <div className="relative mb-10">
        <input 
          type="text" 
          placeholder="O que queres ouvir?" 
          className="w-full bg-white/5 border border-white/10 p-5 pl-14 rounded-[2rem] outline-none focus:border-white/20 transition-all font-bold italic"
        />
        <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 opacity-30" size={20} />
      </div>

      <h2 className="text-xs font-black uppercase tracking-[0.3em] opacity-40 mb-6">Categorias Populares</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {CATEGORIES.map((cat) => (
          <div 
            key={cat.name} 
            style={{ backgroundColor: cat.color }}
            className="h-28 rounded-[2rem] p-5 relative overflow-hidden group cursor-pointer active:scale-95 transition-all shadow-xl"
          >
            <span className="text-xl font-black italic tracking-tighter">{cat.name}</span>
            <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-black/20 blur-2xl group-hover:scale-150 transition-transform" />
          </div>
        ))}
      </div>
    </div>
  );
}