'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)
    setError('')

    const res = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, password }),
    })

    if (res.ok) {
      router.push('/admin')
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error ?? 'Error al iniciar sesión')
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d]">
      <div className="w-full max-w-sm px-8 py-10 rounded-2xl" style={{ backgroundColor: '#1a1a1a' }}>
        <h1 className="text-white text-2xl font-bold text-center mb-1">carta.menu</h1>
        <p className="text-gray-500 text-sm text-center mb-8">Panel de administración</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest mb-1.5 block">
              Usuario
            </label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
              autoComplete="username"
              className="w-full bg-[#2a2a2a] text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/20 border border-white/5"
              placeholder="usuario"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest mb-1.5 block">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-[#2a2a2a] text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/20 border border-white/5"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-white text-black font-semibold py-3 rounded-xl text-sm mt-2 transition-opacity disabled:opacity-50"
          >
            {cargando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
