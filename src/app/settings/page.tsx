"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { UserCircle2, ChevronRight, Check } from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const { user, login, themeColor } = useXalanify();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user || "");

  const handleUpdateName = () => {
    login(newName);
    setIsEditing(false);
  };

  return (
    <div className="p-6 space-y-6 pb-40">
      <h1 className="text-4xl font-black italic mb-10">Definições</h1>

      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-4">Conta e Perfil</p>
        <div className="bg-zinc-900/60 border border-white/5 rounded-[2.5rem] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500"><UserCircle2 size={24}/></div>
              {isEditing ? (
                <input 
                  autoFocus value={newName} onChange={(e) => setNewName(e.target.value)}
                  className="bg-transparent border-b border-white/20 outline-none font-black text-xl w-32"
                />
              ) : (
                <div>
                  <p className="text-xs text-zinc-500 font-bold">Nome de Perfil</p>
                  <p className="text-xl font-black">{user}</p>
                </div>
              )}
            </div>
            <button 
              onClick={() => isEditing ? handleUpdateName() : setIsEditing(true)}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10"
            >
              {isEditing ? <Check size={20} style={{color: themeColor}}/> : <ChevronRight size={20}/>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}