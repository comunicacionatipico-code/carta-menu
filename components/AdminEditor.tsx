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

  const añadirPlato = (categoriaId: string) => {
    const id = `plato-${Date.now()}`
    const nuevoPlato: Plato = {
      id,
      nombre: Object.fromEntries(data.idiomas.map(l => [l, 'Nuevo plato'])),
      descripcion: Object.fromEntries(data.idiomas.map(l => [l, ''])),
      precio: 0,
      emoji: '🍽️',
      imagen_url: null,
      alergenos: [],
      disponible: true,
    }
    setData(prev => ({
      ...prev,
      categorias: prev.categorias.map(cat =>
        cat.id !== categoriaId ? cat : { ...cat, platos: [...cat.platos, nuevoPlato] }
      )
    }))
    setEditando({ categoriaId, platoId: id })
  }

  const eliminarPlato = (categoriaId: string, platoId: string) => {
    if (!confirm('¿Eliminar este plato?')) return
    setData(prev => ({
      ...prev,
      categorias: prev.categorias.map(cat =>
        cat.id !== categoriaId ? cat : { ...cat, platos: cat.platos.filter(p => p.id !== platoId) }
      )
    }))
    if (editando?.platoId === platoId) setEditando(null)
  }

  const guardar = async () => {
    setGuardando(true)
    try {
      const res = await fetch(`/api/admin/${slug}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data, (_, v) => v === undefined ? null : v),
      })
      const json = await res.json()
      if (!res.ok) {
        alert('Error guardando: ' + (json.error ?? res.status))
        return
      }
      setGuardadoOk(true)
      setTimeout(() => setGuardadoOk(false), 2500)
    } catch (e) {
      alert('Error guardando: ' + String(e))
    } finally {
      setGuardando(false)
    }
  }

  const comprimirParaSubir = (file: File, mantenerTransparencia = false): Promise<Blob> =>
    new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const MAX = 1400
        let w = img.width, h = img.height
        if (w > MAX) { h = Math.round(h * MAX / w); w = MAX }
        const canvas = document.createElement('canvas')
        canvas.width = w; canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) { resolve(file); return }
        if (!mantenerTransparencia) {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, w, h)
        }
        ctx.drawImage(img, 0, 0, w, h)
        const mime = mantenerTransparencia ? 'image/png' : 'image/jpeg'
        canvas.toBlob(b => resolve(b ?? file), mime, mantenerTransparencia ? undefined : 0.8)
      }
      img.onerror = () => resolve(file)
      img.src = URL.createObjectURL(file)
    })

  const subirACloudinary = async (file: File, esLogo = false): Promise<string> => {
    const blob = await comprimirParaSubir(file, esLogo)
    const ext = esLogo ? 'png' : 'jpg'
    const fd = new FormData()
    fd.append('file', blob, `foto.${ext}`)
    fd.append('upload_preset', 'ml_default')
    fd.append('folder', `carta-menu/${slug}`)
    const res = await fetch('https://api.cloudinary.com/v1_1/dxlfyx8tq/image/upload', {
      method: 'POST',
      body: fd,
    })
    const json = await res.json()
    if (!json.secure_url) throw new Error(json.error?.message ?? 'Error Cloudinary')
    return json.secure_url as string
  }

  const subirImagen = useCallback(async (file: File, categoriaId: string, platoId: string) => {
    setUploadingId(platoId)
    try {
      const url = await subirACloudinary(file)
      actualizarPlato(categoriaId, platoId, { imagen_url: url })
    } catch (e) {
      alert('Error subiendo imagen: ' + String(e))
    } finally {
      setUploadingId(null)
    }
  }, [slug])

  const subirLogo = async (file: File) => {
    setLogoUploading(true)
    try {
      const url = await subirACloudinary(file, true)
      setData(prev => ({ ...prev, logo_url: url }))
    } catch (e) {
      alert('Error subiendo logo: ' + String(e))
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

          {/* MENÚS VISIBLES EN PANTALLA DE INICIO */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Botones en pantalla de inicio</p>
            <p className="text-xs text-gray-400 mb-3">Activa los menús que quieres mostrar al cliente</p>
            <div className="flex flex-col gap-2">
              {[
                { id: 'carta', label: 'Carta' },
                { id: 'vinos', label: 'Carta de Vinos' },
                { id: 'cocktails', label: 'Cocktails' },
                { id: 'bebidas', label: 'Bebidas' },
              ].map(m => {
                const oculto = (data.menus_ocultos ?? []).includes(m.id)
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      const ocultos = data.menus_ocultos ?? []
                      setData(prev => ({
                        ...prev,
                        menus_ocultos: oculto
                          ? ocultos.filter(x => x !== m.id)
                          : [...ocultos, m.id],
                      }))
                    }}
                    className={`flex items-center justify-between px-4 py-2 rounded-lg border text-sm transition-all ${
                      oculto
                        ? 'border-gray-200 text-gray-400 bg-gray-50'
                        : 'border-green-200 text-green-700 bg-green-50'
                    }`}
                  >
                    <span>{m.label}</span>
                    <span className="text-xs font-medium">{oculto ? 'Oculto' : 'Visible'}</span>
                  </button>
                )
              })}
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
                    <div key={plato.id} className="flex items-center gap-2">
                      <button
                        onClick={() => setEditando(isEdit ? null : { categoriaId: cat.id, platoId: plato.id })}
                        className={`flex-1 text-left flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          isEdit
                            ? 'border-blue-400 bg-blue-50 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                        } ${!plato.disponible ? 'opacity-50' : ''}`}
                      >
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
                          {plato.oculto && (
                            <span className="text-[10px] bg-gray-800 text-white px-1.5 py-0.5 rounded-full">Oculto</span>
                          )}
                          {!plato.disponible && !plato.oculto && (
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">No disp.</span>
                          )}
                          <span className={`text-xs ${isEdit ? 'text-blue-500' : 'text-gray-300'}`}>
                            {isEdit ? '✕' : '✎'}
                          </span>
                        </div>
                      </button>
                      <button
                        onClick={() => eliminarPlato(cat.id, plato.id)}
                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                        title="Eliminar plato"
                      >
                        ✕
                      </button>
                    </div>
                  )
                })}
              </div>
              <button
                onClick={() => añadirPlato(cat.id)}
                className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-gray-300 text-gray-400 text-sm hover:border-gray-400 hover:text-gray-600 transition-all"
              >
                + Añadir plato
              </button>
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
  const [traduciendo, setTraduciendo] = useState(false)

  const setNombre = (lang: string, val: string) =>
    onChange({ nombre: { ...plato.nombre, [lang]: val } })

  const setDesc = (lang: string, val: string) =>
    onChange({ descripcion: { ...plato.descripcion, [lang]: val } })

  const toggleAlergeno = (a: string) => {
    const set = new Set(plato.alergenos)
    if (set.has(a)) { set.delete(a) } else { set.add(a) }
    onChange({ alergenos: Array.from(set) })
  }

  const traducir = async () => {
    const nombreES = plato.nombre['es'] ?? plato.nombre[Object.keys(plato.nombre)[0]]
    const descES = plato.descripcion['es'] ?? plato.descripcion[Object.keys(plato.descripcion)[0]]
    if (!nombreES) { alert('Escribe primero el nombre en español'); return }
    setTraduciendo(true)
    try {
      const res = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombreES, descripcion: descES, idiomas }),
      })
      const json = await res.json()
      if (json.error) { alert('Error traduciendo: ' + json.error); return }
      onChange({
        nombre: { ...plato.nombre, ...json.nombre },
        descripcion: { ...plato.descripcion, ...json.descripcion },
      })
    } catch (e) {
      alert('Error: ' + String(e))
    } finally {
      setTraduciendo(false)
    }
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

        {/* TRADUCIR */}
        <button
          onClick={traducir}
          disabled={traduciendo}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-blue-300 text-blue-500 text-sm hover:bg-blue-50 transition-all disabled:opacity-50"
        >
          {traduciendo ? (
            <><div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" /> Traduciendo…</>
          ) : (
            '🌐 Traducir a todos los idiomas'
          )}
        </button>

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
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Precio</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ej: Ración"
              value={plato.precio_label ?? ''}
              onChange={e => onChange({ precio_label: e.target.value || undefined })}
              className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            />
            <div className="relative w-28">
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

          {/* SEGUNDO PRECIO */}
          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              placeholder="Ej: Media ración"
              value={plato.precio2_label ?? ''}
              onChange={e => onChange({ precio2_label: e.target.value || undefined })}
              className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            />
            <div className="relative w-28">
              <input
                type="number"
                step="0.50"
                min="0"
                value={plato.precio2 ?? ''}
                placeholder="0.00"
                onChange={e => onChange({ precio2: parseFloat(e.target.value) || undefined })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
              <span className="absolute right-3 top-2.5 text-sm text-gray-400">€</span>
            </div>
            {plato.precio2 && (
              <button
                onClick={() => onChange({ precio2: undefined, precio2_label: undefined })}
                className="text-xs text-red-400 hover:text-red-600"
              >✕</button>
            )}
          </div>
        </div>

        {/* DISPONIBILIDAD + VISIBILIDAD */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Disponibilidad y visibilidad</label>
          <div className="flex flex-col gap-2">
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
            <button
              onClick={() => onChange({ oculto: !plato.oculto })}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                plato.oculto
                  ? 'bg-gray-800 border-gray-800 text-white'
                  : 'bg-white border-gray-200 text-gray-500'
              }`}
            >
              <span className="text-base leading-none">{plato.oculto ? '👁️‍🗨️' : '👁️'}</span>
              {plato.oculto ? 'Oculto en carta' : 'Visible en carta'}
            </button>
          </div>
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
