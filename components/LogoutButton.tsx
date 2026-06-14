'use client'

import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-gray-400 hover:text-gray-700 transition-colors border border-gray-200 hover:border-gray-400 rounded-lg px-3 py-1.5"
    >
      Cerrar sesión
    </button>
  )
}
