"use client";
import { useXalanify } from "@/context/XalanifyContext";
import { User, Palette, Info, LogOut, RefreshCw, History, ChevronRight, ShieldCheck, Terminal, Search, AlertTriangle } from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const { user, themeColor, setThemeColor, login, isAdmin, clearAdminCache } = useXalanify();
  const [view, setView] = useState("menu");
  
  // Estados para o Teste de API
  const [testQuery, setTestQuery] = useState("");
  const [testResult, setTestResult] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);

  const runApiTest = async () => {
    if (!testQuery) return;
    setTestLoading(true);
    setTestResult("A contactar Google API...");
    
    try {
      const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(testQuery)}&type=video&maxResults=1&key=${apiKey}`;
      
      const res = await fetch(url);
      const data = await res.json();
      setTestResult(data);
    } catch (error: any) {
      setTestResult({ erro_sistema: error.message });
    } finally {
      setTestLoading(false);
    }
  };

  const changelog = [
    { 
      version: "0.32.0 (Atual)", 
      status: "latest", 
      logs: [
        "Admin: Adicionado 'Laboratório de API' para testar conexão YouTube em tempo real.",
        "Fix: Restauração da barra de reprodução (Z-Index e Posicionamento).",
        "Diagnóstico: Visualização crua da resposta JSON do Google."
      ] 
    },
    { version: "0.31.0", logs: ["Correção de Build e Meta Tags."] }
  ];

  // VISTA DO LABORATÓRIO DE TESTES
  if (view === "admin_lab" && isAdmin) return (
    <div className="space-y-6 pb-40 animate-in slide-in-from-right">
       <button onClick={() => setView("menu")} className="text-[10px] font-black text-zinc-500 uppercase">← Voltar ao Menu</button>
       <div className="p-5 bg-zinc-900 border border-yellow-500/20 rounded-[2rem]">
         <div className="flex items-center gap-3 mb-4 text-yellow-500">
           <Terminal size={24} />
           <h2 className="text-xl font-bold">Laboratório API</h2>
         </div>
         
         <p className="text-xs text-zinc-400 mb-4">Teste diretamente a chave do YouTube para ver se retorna áudio ou erro (403/Quota).</p>
         
         <div className="flex gap-2 mb-4">
           <input 
             type="text" 
             value={testQuery}
             onChange={(e) => setTestQuery(e.target.value)}
             placeholder="Ex: Drake God's Plan Audio"
             className="w-full bg-black p-3 rounded-xl text-sm border border-white/10"
           />
           <button onClick={runApiTest} disabled={testLoading} className="bg-white text-black p-3 rounded-xl font-bold">
             {testLoading ? "..." : <Search size={18} />}
           </button>
         </div>

         <div className="bg-black p-4 rounded-xl border border-white/5 font-mono text-[10px] text-green-400 overflow-x-auto min-h-[150px] whitespace-pre-wrap">
           {testResult ? JSON.stringify(testResult, null, 2) : "// O resultado JSON aparecerá aqui..."}
         </div>

         {testResult?.error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-2 items-start">
              <AlertTriangle className="text-red-500 shrink-0" size={16} />
              <p className="text-red-400 text-xs">
                <strong>Erro Detetado:</strong> {testResult.error.message}
                <br />Código: {testResult.error.code}
              </p>
            </div>
         )}
       </div>
    </div>
  );

  if (view === "history") return (
    <div className="space-y-4 pb-20 animate-in slide-in-from-right duration-300">
      <button onClick={() => setView("menu")} className="text-[10px] font-black text-zinc-500 uppercase">← Voltar</button>
      <h2 className="text-2xl font-black mb-4 px-2">Histórico</h2>
      {changelog.map(v => (
        <div key={v.version} className={`p-5 rounded-[2rem] border ${v.status === 'latest' ? 'bg-zinc-900 border-white/10' : 'bg-transparent border-white/5 opacity-50'}`}>
          <p className="text-xs font-black mb-2" style={{ color: v.status === 'latest' ? themeColor : 'white' }}>v{v.version}</p>
          {v.logs.map((log, i) => <p key={i} className="text-[10px] text-zinc-400 mb-1">• {log}</p>)}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 pb-40">
      <h1 className="text-3xl font-black px-2">Definições</h1>
      
      <button onClick={() => { const n = prompt("Nome:"); if(n) login(n); }} className="w-full flex items-center justify-between p-5 bg-zinc-900/50 border border-white/5 rounded-[2rem] text-left">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-white/5" style={{ color: themeColor }}>{isAdmin ? <ShieldCheck size={20} /> : <User size={20} />}</div>
          <div><p className="text-sm font-bold text-white">Perfil {isAdmin && "(Dev Mode)"}</p><p className="text-[10px] text-zinc-500 uppercase">{user || "Utilizador"}</p></div>
        </div>
        <ChevronRight size={18} />
      </button>

      {isAdmin && (
        <>
          <button onClick={() => setView("admin_lab")} className="w-full flex items-center justify-between p-5 bg-yellow-500/10 border border-yellow-500/20 rounded-[2rem] text-left">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-yellow-500/20 text-yellow-500"><Terminal size={20} /></div>
              <div><p className="text-sm font-bold text-yellow-500">Laboratório API</p><p className="text-[10px] text-yellow-200/70 uppercase">Testar Conexão YouTube</p></div>
            </div>
            <ChevronRight size={18} className="text-yellow-500" />
          </button>

          <button onClick={clearAdminCache} className="w-full flex items-center justify-between p-5 bg-red-500/5 border border-red-500/20 rounded-[2rem] text-left mt-3">
             <div className="flex items-center gap-4">
               <div className="p-3 rounded-2xl bg-red-500/10 text-red-500"><LogOut size={20} /></div>
               <div><p className="text-sm font-bold text-red-500">Reset Total</p><p className="text-[10px] text-red-400 uppercase">Limpar Cache</p></div>
             </div>
          </button>
        </>
      )}

      <button onClick={() => setView("history")} className="w-full flex items-center justify-between p-5 bg-zinc-900/50 border border-white/5 rounded-[2rem] text-left mt-3">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-white/5" style={{ color: themeColor }}><History size={20} /></div>
          <div><p className="text-sm font-bold text-white">Versões</p><p className="text-[10px] text-zinc-500 uppercase">v0.12.0 - v0.32.0</p></div>
        </div>
        <ChevronRight size={18} />
      </button>
    </div>
  );
}