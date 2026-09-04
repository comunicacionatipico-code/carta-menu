'use client'

import { useState } from 'react'
import { Restaurante } from '@/types/restaurante'

type PlatoEntry = { catNombre: string; plato: { id: string; nombre: Record<string, string>; imagen_url?: string | null } }

export default function GaleriaEditor({ slug, restaurante, imagenes }: { slug: string; restaurante: Restaurante; imagenes: string[] }) {
  const [data, setData] = useState<Restaurante>(restaurante)
  const [selectedImg, setSelectedImg] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [msg, setMsg] = useState('')
  const [filtro, setFiltro] = useState<'todos' | 'sin-foto' | 'con-foto'>('sin-foto')

  // Flatten all platos
  const todosPlatos: PlatoEntry[] = data.categorias
    .filter(c => (c.tipo ?? 'carta') === 'carta')
    .flatMap(cat => cat.platos.map(p => ({ catNombre: cat.nombre?.es ?? '', plato: p })))

  const platosFiltrados = todosPlatos.filter(({ plato }) => {
    if (filtro === 'sin-foto') return !plato.imagen_url
    if (filtro === 'con-foto') return !!plato.imagen_url
    return true
  })

  // Images already assigned
  const asignadas = new Set(todosPlatos.map(e => e.plato.imagen_url).filter(Boolean))

  const asignar = (platoId: string) => {
    if (!selectedImg) return
    setData(prev => ({
      ...prev,
      categorias: prev.categorias.map(cat => ({
        ...cat,
        platos: cat.platos.map(p => p.id === platoId ? { ...p, imagen_url: selectedImg } : p),
      })),
    }))
    setSelectedImg(null)
  }

  const quitarFoto = (platoId: string) => {
    setData(prev => ({
      ...prev,
      categorias: prev.categorias.map(cat => ({
        ...cat,
        platos: cat.platos.map(p => p.id === platoId ? { ...p, imagen_url: null } : p),
      })),
    }))
  }

  const guardar = async () => {
    setGuardando(true)
    setMsg('')
    const r = await fetch(`/api/admin/${slug}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const j = await r.json()
    setGuardando(false)
    setMsg(j.ok ? '✓ Guardado correctamente' : '✗ Error: ' + j.error)
  }

  const imgsSinAsignar = imagenes.filter(url => !asignadas.has(url))
  const imgsAsignadas = imagenes.filter(url => asignadas.has(url))

  return (
    <div className="flex gap-4 h-[calc(100vh-120px)]">
      {/* LEFT: Image gallery */}
      <div className="w-72 flex-shrink-0 flex flex-col bg-white rounded-xl shadow overflow-hidden">
        <div className="p-3 border-b bg-gray-50">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Fotos del storage</p>
          <p className="text-xs text-gray-400 mt-1">{imgsSinAsignar.length} sin asignar · {imgsAsignadas.length} asignadas</p>
        </div>
        <div className="overflow-y-auto flex-1 p-2">
          {selectedImg && (
            <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
              Foto seleccionada. Haz clic en un plato para asignarla.
              <button onClick={() => setSelectedImg(null)} className="ml-2 text-blue-500 underline">Cancelar</button>
            </div>
          )}
          {/* Unassigned first */}
          {imgsSinAsignar.length > 0 && (
            <p className="text-[10px] text-gray-400 uppercase tracking-wider px-1 mb-1 mt-1">Sin asignar ({imgsSinAsignar.length})</p>
          )}
          <div className="grid grid-cols-3 gap-1 mb-3">
            {imgsSinAsignar.map(url => (
              <button
                key={url}
                onClick={() => setSelectedImg(url === selectedImg ? null : url)}
                className={`relative aspect-square overflow-hidden rounded transition-all ${selectedImg === url ? 'ring-3 ring-blue-500 scale-105' : 'hover:ring-2 ring-gray-300'}`}
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          {imgsAsignadas.length > 0 && (
            <>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider px-1 mb-1">Asignadas ({imgsAsignadas.length})</p>
              <div className="grid grid-cols-3 gap-1 opacity-50">
                {imgsAsignadas.map(url => (
                  <button
                    key={url}
                    onClick={() => setSelectedImg(url === selectedImg ? null : url)}
                    className={`relative aspect-square overflow-hidden rounded transition-all ${selectedImg === url ? 'ring-3 ring-blue-500 opacity-100 scale-105' : 'hover:ring-2 ring-gray-300'}`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <span className="text-white text-lg">✓</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* RIGHT: Platos */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow overflow-hidden">
        <div className="p-3 border-b bg-gray-50 flex items-center justify-between gap-3">
          <div className="flex gap-2">
            {(['sin-foto', 'con-foto', 'todos'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`text-xs px-3 py-1 rounded-full font-medium ${filtro === f ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-600'}`}
              >
                {f === 'sin-foto' ? 'Sin foto' : f === 'con-foto' ? 'Con foto' : 'Todos'}
                {f === 'sin-foto' && ` (${todosPlatos.filter(e => !e.plato.imagen_url).length})`}
                {f === 'con-foto' && ` (${todosPlatos.filter(e => !!e.plato.imagen_url).length})`}
              </button>
            ))}
          </div>
          <button
            onClick={guardar}
            disabled={guardando}
            className="px-4 py-1.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
        {msg && <div className={`px-4 py-2 text-sm font-medium ${msg.startsWith('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msg}</div>}

        <div className="overflow-y-auto flex-1">
          {platosFiltrados.map(({ catNombre, plato }) => (
            <div
              key={plato.id}
              onClick={() => asignar(plato.id)}
              className={`flex items-center gap-3 px-4 py-3 border-b cursor-pointer transition-colors ${selectedImg ? 'hover:bg-blue-50 active:bg-blue-100' : 'hover:bg-gray-50'} ${selectedImg ? 'cursor-pointer' : ''}`}
            >
              {/* Thumbnail or placeholder */}
              <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border">
                {plato.imagen_url ? (
                  <img src={plato.imagen_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">
                    {selectedImg ? '→' : '📷'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">{catNombre}</p>
                <p className="font-medium text-gray-800 text-sm leading-tight">{plato.nombre?.es}</p>
                {plato.imagen_url && (
                  <p className="text-[11px] text-green-600 mt-0.5">✓ Tiene foto</p>
                )}
                {selectedImg && !plato.imagen_url && (
                  <p className="text-[11px] text-blue-500 mt-0.5">← Clic para asignar foto seleccionada</p>
                )}
              </div>
              {plato.imagen_url && (
                <button
                  onClick={e => { e.stopPropagation(); quitarFoto(plato.id) }}
                  className="flex-shrink-0 text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50"
                >
                  Quitar
                </button>
              )}
            </div>
          ))}
          {platosFiltrados.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <p className="text-4xl mb-2">🎉</p>
              <p className="text-sm">Todos los platos tienen foto</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
