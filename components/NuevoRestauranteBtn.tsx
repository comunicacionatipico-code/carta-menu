'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NuevoRestauranteBtn() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    nombre: '', subtitulo: '', slug: '', color_primario: '#1a1a1a', color_acento: '#c9a96e', wifi: '',
  })

  function autoSlug(nombre: string) {
    return nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  function handleNombre(v: string) {
    setForm(f => ({ ...f, nombre: v, slug: autoSlug(v) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/crear-restaurante', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error || 'Error'); setLoading(false); return }
    router.push(`/admin/${json.slug}`)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
      >
        <span className="text-lg leading-none">+</span> Nuevo restaurante
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Nuevo restaurante</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nombre *</label>
                <input required value={form.nombre} onChange={e => handleNombre(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="El Socarrat" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Subtítulo</label>
                <input value={form.subtitulo} onChange={e => setForm(f => ({ ...f, subtitulo: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Paellas y Tapas · Valencia" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Slug (URL) *</label>
                <input required value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="el-socarrat" />
                <p className="text-xs text-gray-400 mt-1">carta-menu-topaz.vercel.app/<span className="font-mono">{form.slug || '...'}</span></p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Color primario</label>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
                    <input type="color" value={form.color_primario} onChange={e => setForm(f => ({ ...f, color_primario: e.target.value }))} className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0" />
                    <span className="text-xs font-mono text-gray-600">{form.color_primario}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Color acento</label>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
                    <input type="color" value={form.color_acento} onChange={e => setForm(f => ({ ...f, color_acento: e.target.value }))} className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0" />
                    <span className="text-xs font-mono text-gray-600">{form.color_acento}</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">WiFi (opcional)</label>
                <input value={form.wifi} onChange={e => setForm(f => ({ ...f, wifi: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="nombre-de-la-red" />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-sm text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors">
                  {loading ? 'Creando...' : 'Crear restaurante'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
