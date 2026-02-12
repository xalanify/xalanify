"use client";
import Search from "@/components/Search";
import { useXalanify } from "@/context/XalanifyContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user } = useXalanify();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h2 className="text-gray-400 text-sm">Bem-vindo,</h2>
        <h1 className="text-3xl font-bold text-white">{user} 👋</h1>
      </header>

      <section>
        <h3 className="text-lg font-semibold mb-4 text-primary">Descobrir</h3>
        <Search />
      </section>

      {/* Sugestões baseadas no "JUL" ou Rap Francês podem ser injetadas aqui futuramente */}
    </div>
  );
}