"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Music, Mail, Lock } from "lucide-react"

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
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 bg-[#000000]">
      {/* Logo Section */}
      <div className="mb-10 flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#3B82F6]">
          <Music className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#D2B48C]">Xalanify</h1>
        <p className="text-sm text-[#8E8E93]">A tua música, em todo o lado.</p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        {/* Email Input - Glass Card Style */}
        <div className="relative">
          <div className="glass-card rounded-xl flex items-center px-4 py-3.5">
            <Mail className="h-5 w-5 text-[#8E8E93] mr-3 flex-shrink-0" />
            <input
              id="auth-email"
              name="email"
              type="email"
              autoComplete="username"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent text-sm text-[#D2B48C] placeholder-[#8E8E93]/50 focus:outline-none"
            />
          </div>
        </div>

        {/* Password Input - Glass Card Style */}
        <div className="relative">
          <div className="glass-card rounded-xl flex items-center px-4 py-3.5">
            <Lock className="h-5 w-5 text-[#8E8E93] mr-3 flex-shrink-0" />
            <input
              id="auth-password"
              name="password"
              type="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-transparent text-sm text-[#D2B48C] placeholder-[#8E8E93]/50 focus:outline-none"
            />
          </div>
        </div>

        {error && (
          <p className="text-center text-xs text-red-400">{error}</p>
        )}

        {/* Submit Button - Solid Style */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50 bg-[#3B82F6]"
        >
          {loading ? "A entrar..." : isSignUp ? "Criar Conta" : "Entrar"}
        </button>

        {/* Toggle Sign Up / Sign In */}
        <button
          type="button"
          onClick={() => { setIsSignUp(!isSignUp); setError("") }}
          className="w-full text-center text-xs text-[#8E8E93] transition-colors hover:text-[#D2B48C]"
        >
          {isSignUp ? "Já tens conta? Entrar" : "Não tens conta? Criar conta"}
        </button>
      </form>
    </div>
  )
}
