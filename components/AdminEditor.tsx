'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Restaurante, Plato } from '@/types/restaurante'
import { ALERGENOS } from '@/lib/alergenos'

const TODOS_ALERGENOS = Object.keys(ALERGENOS)

interface EditState {
  categoriaId: string
  platoId: string
}

export default function AdminEditor({ restaurante: inicial, slug }: { restaurante: Restaurante; slug: string }) {
  const [data, setData] = useState<Restaurante>(inicial)
  const [editando, setEditando] = useState<EditState | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [guardadoOk, setGuardadoOk] = useState(false)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const platoActual = editando
    ? data.categorias.find(c => c.id === editando.categoriaId)?.platos.find(p => p.id === editando.platoId) ?? null
    : null

  const actualizarPlato = (categoriaId: string, platoId: string, cambios: Partial<Plato>) => {
    setData(prev => ({
      ...prev,
      categorias: prev.categorias.map(cat =>
        cat.id !== categoriaId ? cat : {
          ...cat,
          platos: cat.platos.map(p => p.id !== platoId ? p : { ...p, ...cambios })
        }
      )
    }))
  }

  const guardar = async () => {
    setGuardando(true)
    try {
      await fetch(`/api/admin/${slug}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      setGuardadoOk(true)
      setTimeout(() => setGuardadoOk(false), 2500)
    } finally {
      setGuardando(false)
    }
  }

  const subirImagen = useCallback(async (file: File, categoriaId: string, platoId: string) => {
    setUploadingId(platoId)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`/api/admin/${slug}/upload`, { method: 'POST', body: fd })
      const json = await res.json()
      if (json.url) {
        actualizarPlato(categoriaId, platoId, { imagen_url: json.url })
      }
    } finally {
      setUploadingId(null)
    }
  }, [slug])

  const subirLogo = async (file: File) => {
    setLogoUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`/api/admin/${slug}/upload`, { method: 'POST', body: fd })
      const json = await res.json()
      if (json.url) setData(prev => ({ ...prev, logo_url: json.url }))
    } finally {
      setLogoUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* TOPBAR */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-gray-400 hover:text-gray-700 transition-colors text-lg leading-none">←</Link>
          <div
            className="w-7 h-7 rounded-md"
            style={{ backgroundColor: data.color_primario }}
          />
          <div>
            <p className="font-semibold text-sm text-gray-900 leading-tight">{data.nombre}</p>
            <p className="text-xs text-gray-400 leading-tight">{data.categorias.length} categorías</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/${slug}`}
            target="_blank"
            className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors"
          >
            Ver carta ↗
          </Link>
          <button
            onClick={guardar}
            disabled={guardando}
            className="text-xs font-semibold px-4 py-1.5 rounded-full transition-all"
            style={guardadoOk
              ? { backgroundColor: '#16a34a', color: 'white' }
              : { backgroundColor: data.color_primario, color: 'white' }
            }
          >
            {guardando ? 'Guardando…' : guardadoOk ? '✓ Guardado' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* LISTA DE PLATOS */}
        <div className="flex-1 overflow-y-auto p-4 max-w-xl">
          {/* Logo del restaurante */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100"
              style={{ backgroundColor: data.color_primario }}
            >
              {data.logo_url
                ? <img src={data.logo_url} alt="logo" className="w-full h-full object-contain p-1" />
                : <span className="text-white text-xs opacity-50">Logo</span>
              }
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 mb-1">Logo del restaurante</p>
              <p className="text-xs text-gray-400 mb-2">PNG o SVG con fondo transparente recomendado</p>
              <div className="flex gap-2">
                <button
                  onClick={() => logoInputRef.current?.click()}
                  disabled={logoUploading}
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {logoUploading ? 'Subiendo…' : data.logo_url ? 'Cambiar logo' : 'Subir logo'}
                </button>
                {data.logo_url && (
                  <button
                    onClick={() => setData(prev => ({ ...prev, logo_url: null }))}
                    className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Quitar
                  </button>
                )}
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) subirLogo(f); e.target.value = '' }}
              />
            </div>
          </div>

          {/* Categorías y platos */}
          {data.categorias.map(cat => (
            <div key={cat.id} className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 px-1">
                {cat.nombre[data.idiomas[0]] ?? cat.nombre[Object.keys(cat.nombre)[0]]}
              </h2>
              <div className="space-y-2">
                {cat.platos.map(plato => {
                  const isEdit = editando?.platoId === plato.id && editando?.categoriaId === cat.id
                  const idioma = data.idiomas[0]
                  return (
                    <button
                      key={plato.id}
                      onClick={() => setEditando(isEdit ? null : { categoriaId: cat.id, platoId: plato.id })}
                      className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        isEdit
                          ? 'border-blue-400 bg-blue-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      } ${!plato.disponible ? 'opacity-50' : ''}`}
                    >
                      {/* Miniatura */}
                      <div
                        className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden"
                        style={{ backgroundColor: plato.imagen_url ? undefined : '#f0ece4' }}
                      >
                        {uploadingId === plato.id ? (
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        ) : plato.imagen_url ? (
                          <img src={plato.imagen_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl">{plato.emoji}</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {plato.nombre[idioma] ?? plato.nombre[Object.keys(plato.nombre)[0]]}
                        </p>
                        <p className="text-xs text-gray-400">
                          {plato.precio.toFixed(2)} € · {plato.alergenos.length > 0 ? plato.alergenos.length + ' alérg.' : 'Sin alérgenos'}
                        </p>
                      </div>

                      <div className="flex-shrink-0 flex flex-col items-end gap-1">
                        {!plato.disponible && (
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">No disp.</span>
                        )}
                        <span className={`text-xs ${isEdit ? 'text-blue-500' : 'text-gray-300'}`}>
                          {isEdit ? '✕' : '✎'}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* PANEL DE EDICIÓN */}
        {editando && platoActual && (
          <EditorPlato
            plato={platoActual}
            idiomas={data.idiomas}
            categoriaId={editando.categoriaId}
            uploadingId={uploadingId}
            onUpload={subirImagen}
            onChange={(cambios) => actualizarPlato(editando.categoriaId, editando.platoId, cambios)}
            onClose={() => setEditando(null)}
            colorPrimario={data.color_primario}
          />
        )}

        {/* Placeholder cuando no hay plato seleccionado */}
        {!editando && (
          <div className="hidden lg:flex flex-1 items-center justify-center text-gray-300 text-sm">
            ← Selecciona un plato para editarlo
          </div>
        )}
      </div>

      {/* Input de archivo oculto para platos (lo dispara EditorPlato via ref en parent) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
      />
    </div>
  )
}

function EditorPlato({
  plato, idiomas, categoriaId, uploadingId, onUpload, onChange, onClose, colorPrimario
}: {
  plato: Plato
  idiomas: string[]
  categoriaId: string
  uploadingId: string | null
  onUpload: (file: File, catId: string, platoId: string) => void
  onChange: (cambios: Partial<Plato>) => void
  onClose: () => void
  colorPrimario: string
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const isUploading = uploadingId === plato.id

  const setNombre = (lang: string, val: string) =>
    onChange({ nombre: { ...plato.nombre, [lang]: val } })

  const setDesc = (lang: string, val: string) =>
    onChange({ descripcion: { ...plato.descripcion, [lang]: val } })

  const toggleAlergeno = (a: string) => {
    const set = new Set(plato.alergenos)
    if (set.has(a)) { set.delete(a) } else { set.add(a) }
    onChange({ alergenos: Array.from(set) })
  }

  return (
    <div className="w-80 xl:w-96 border-l border-gray-200 bg-white flex flex-col h-[calc(100vh-57px)] sticky top-[57px] overflow-y-auto">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <p className="font-semibold text-sm text-gray-800">Editar plato</p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">×</button>
      </div>

      <div className="p-4 space-y-5 pb-8">
        {/* FOTO */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Foto</label>
          <div
            className="relative w-full h-40 rounded-xl overflow-hidden cursor-pointer group border-2 border-dashed border-gray-200 hover:border-gray-400 transition-colors"
            style={{ backgroundColor: plato.imagen_url ? undefined : '#f0ece4' }}
            onClick={() => fileRef.current?.click()}
          >
            {isUploading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            ) : plato.imagen_url ? (
              <>
                <img src={plato.imagen_url} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm font-medium">Cambiar foto</span>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <span className="text-5xl">{plato.emoji}</span>
                <span className="text-xs text-gray-400">Clic para subir foto</span>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) onUpload(f, categoriaId, plato.id)
              e.target.value = ''
            }}
          />
          {plato.imagen_url && (
            <button
              onClick={() => onChange({ imagen_url: null })}
              className="mt-1 text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              Quitar foto (usar emoji)
            </button>
          )}
        </div>

        {/* EMOJI */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Emoji (si no hay foto)
          </label>
          <input
            type="text"
            value={plato.emoji}
            onChange={e => onChange({ emoji: e.target.value })}
            className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-2xl text-center focus:outline-none focus:border-blue-400"
            maxLength={4}
          />
        </div>

        {/* NOMBRES */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nombre</label>
          <div className="space-y-2">
            {idiomas.map(lang => (
              <div key={lang} className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase text-gray-400 w-6">{lang}</span>
                <input
                  type="text"
                  value={plato.nombre[lang] ?? ''}
                  onChange={e => setNombre(lang, e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                />
              </div>
            ))}
          </div>
        </div>

        {/* DESCRIPCIÓN */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Descripción</label>
          <div className="space-y-2">
            {idiomas.map(lang => (
              <div key={lang} className="flex gap-2">
                <span className="text-xs font-bold uppercase text-gray-400 w-6 pt-2.5">{lang}</span>
                <textarea
                  value={plato.descripcion[lang] ?? ''}
                  onChange={e => setDesc(lang, e.target.value)}
                  rows={3}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-blue-400"
                />
              </div>
            ))}
          </div>
        </div>

        {/* PRECIO */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Precio (€)</label>
          <div className="relative w-36">
            <input
              type="number"
              step="0.50"
              min="0"
              value={plato.precio}
              onChange={e => onChange({ precio: parseFloat(e.target.value) || 0 })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            />
            <span className="absolute right-3 top-2.5 text-sm text-gray-400">€</span>
          </div>
        </div>

        {/* DISPONIBILIDAD */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Disponibilidad</label>
          <button
            onClick={() => onChange({ disponible: !plato.disponible })}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
              plato.disponible
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-gray-100 border-gray-200 text-gray-500'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${plato.disponible ? 'bg-green-500' : 'bg-gray-400'}`} />
            {plato.disponible ? 'Disponible' : 'No disponible'}
          </button>
        </div>

        {/* ALÉRGENOS */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Alérgenos</label>
          <div className="flex flex-wrap gap-1.5">
            {TODOS_ALERGENOS.map(a => {
              const activo = plato.alergenos.includes(a)
              const info = ALERGENOS[a]
              return (
                <button
                  key={a}
                  onClick={() => toggleAlergeno(a)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    activo
                      ? 'border-transparent text-white'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-400'
                  }`}
                  style={activo ? { backgroundColor: colorPrimario } : {}}
                >
                  {info.emoji} {info.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
