"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Music } from "lucide-react"

export default function LoginScreen() {
  const { signIn, signUp } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password)

    if (result.error) {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6"
      style={{ background: "linear-gradient(180deg, #2a0e0e 0%, #0a0404 100%)" }}
    >
      <div className="mb-10 flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: "linear-gradient(135deg, #e63946 0%, #c1121f 100%)" }}
        >
          <Music className="h-8 w-8 text-[#fff]" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#f0e0d0]">Xalanify</h1>
        <p className="text-sm text-[#a08070]">A tua música, em todo o lado.</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="glass-card w-full rounded-xl px-4 py-3.5 text-sm text-[#f0e0d0] placeholder-[#706050] focus:outline-none focus:ring-1 focus:ring-[#e63946]/50"
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="glass-card w-full rounded-xl px-4 py-3.5 text-sm text-[#f0e0d0] placeholder-[#706050] focus:outline-none focus:ring-1 focus:ring-[#e63946]/50"
          />
        </div>

        {error && (
          <p className="text-center text-xs text-[#e63946]">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl py-3.5 text-sm font-semibold text-[#fff] transition-opacity disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #e63946 0%, #c1121f 100%)" }}
        >
          {loading ? "..." : isSignUp ? "Criar Conta" : "Entrar"}
        </button>

        <button
          type="button"
          onClick={() => { setIsSignUp(!isSignUp); setError("") }}
          className="w-full text-center text-xs text-[#a08070] transition-colors hover:text-[#e0c0a0]"
        >
          {isSignUp ? "Ja tens conta? Entrar" : "Nao tens conta? Criar conta"}
        </button>
      </form>
    </div>
  )
}
