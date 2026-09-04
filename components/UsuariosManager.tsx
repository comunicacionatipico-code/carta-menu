'use client'

import { useState } from 'react'

type Restaurante = { slug: string; nombre: string; color: string }
type Usuario = { id: string; usuario: string; restaurantes: string[]; created_at: string }

export default function UsuariosManager({ restaurantes, usuariosIniciales }: { restaurantes: Restaurante[]; usuariosIniciales: Usuario[] }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosIniciales)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ usuario: '', password: '', restaurantes: [] as string[] })
  const [editando, setEditando] = useState<string | null>(null)
  const [editRes, setEditRes] = useState<string[]>([])
  const [editPass, setEditPass] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleRes = (slug: string, arr: string[], set: (v: string[]) => void) =>
    set(arr.includes(slug) ? arr.filter(s => s !== slug) : [...arr, slug])

  const crearUsuario = async () => {
    if (!form.usuario || !form.password) return
    setLoading(true)
    const r = await fetch('/api/admin/usuarios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const j = await r.json()
    setLoading(false)
    if (j.ok) {
      setUsuarios(prev => [...prev, { id: j.usuario.id, usuario: j.usuario.usuario, restaurantes: j.usuario.restaurantes, created_at: new Date().toISOString() }])
      setForm({ usuario: '', password: '', restaurantes: [] })
      setShowForm(false)
      setMsg('✓ Usuario creado')
    } else { setMsg('✗ ' + j.error) }
  }

  const guardarEdicion = async (id: string) => {
    setLoading(true)
    const body: Record<string, unknown> = { restaurantes: editRes }
    if (editPass) body.password = editPass
    const r = await fetch(`/api/admin/usuarios/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const j = await r.json()
    setLoading(false)
    if (j.ok) {
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, restaurantes: editRes } : u))
      setEditando(null)
      setEditPass('')
      setMsg('✓ Guardado')
    } else { setMsg('✗ ' + j.error) }
  }

  const eliminar = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar usuario "${nombre}"?`)) return
    const r = await fetch(`/api/admin/usuarios/${id}`, { method: 'DELETE' })
    const j = await r.json()
    if (j.ok) { setUsuarios(prev => prev.filter(u => u.id !== id)); setMsg('✓ Eliminado') }
    else setMsg('✗ ' + j.error)
  }

  return (
    <div>
      {msg && <div className={`mb-4 px-4 py-2 rounded-lg text-sm font-medium ${msg.startsWith('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msg}</div>}

      {/* Listado de usuarios */}
      <div className="space-y-3 mb-6">
        {usuarios.length === 0 && <div className="text-center py-8 text-gray-400 bg-white rounded-xl border">No hay usuarios aún</div>}
        {usuarios.map(u => (
          <div key={u.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                  {u.usuario[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{u.usuario}</p>
                  <p className="text-xs text-gray-400">
                    {u.restaurantes.length === 0 ? 'Sin restaurantes asignados' : u.restaurantes.map(slug => restaurantes.find(r => r.slug === slug)?.nombre ?? slug).join(', ')}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditando(u.id); setEditRes(u.restaurantes); setEditPass('') }} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Editar</button>
                <button onClick={() => eliminar(u.id, u.usuario)} className="text-xs px-3 py-1.5 rounded-lg border border-red-100 text-red-500 hover:bg-red-50">Eliminar</button>
              </div>
            </div>

            {/* Restaurantes como chips */}
            <div className="flex flex-wrap gap-1.5 px-5 pb-3">
              {restaurantes.map(r => (
                <span key={r.slug} className={`text-xs px-2.5 py-1 rounded-full ${u.restaurantes.includes(r.slug) ? 'text-white' : 'bg-gray-100 text-gray-400'}`}
                  style={u.restaurantes.includes(r.slug) ? { backgroundColor: r.color } : {}}>
                  {r.nombre}
                </span>
              ))}
            </div>

            {/* Panel de edición */}
            {editando === u.id && (
              <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Restaurantes asignados</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {restaurantes.map(r => (
                    <button key={r.slug} onClick={() => toggleRes(r.slug, editRes, setEditRes)}
                      className={`text-sm px-3 py-1.5 rounded-full border transition-all ${editRes.includes(r.slug) ? 'text-white border-transparent' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'}`}
                      style={editRes.includes(r.slug) ? { backgroundColor: r.color, borderColor: r.color } : {}}>
                      {editRes.includes(r.slug) ? '✓ ' : ''}{r.nombre}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <input type="password" value={editPass} onChange={e => setEditPass(e.target.value)} placeholder="Nueva contraseña (opcional)"
                    className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 ring-blue-200" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => guardarEdicion(u.id)} disabled={loading} className="text-sm px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50">
                    {loading ? 'Guardando…' : 'Guardar cambios'}
                  </button>
                  <button onClick={() => setEditando(null)} className="text-sm px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100">Cancelar</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Formulario nuevo usuario */}
      {showForm ? (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="font-semibold text-gray-900 mb-4">Nuevo usuario</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Usuario</label>
              <input value={form.usuario} onChange={e => setForm(f => ({ ...f, usuario: e.target.value }))} placeholder="nombre_usuario"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 ring-blue-200" />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Contraseña</label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="contraseña"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 ring-blue-200" />
            </div>
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Restaurantes asignados</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {restaurantes.map(r => (
              <button key={r.slug} onClick={() => toggleRes(r.slug, form.restaurantes, v => setForm(f => ({ ...f, restaurantes: v })))}
                className={`text-sm px-3 py-1.5 rounded-full border transition-all ${form.restaurantes.includes(r.slug) ? 'text-white border-transparent' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'}`}
                style={form.restaurantes.includes(r.slug) ? { backgroundColor: r.color, borderColor: r.color } : {}}>
                {form.restaurantes.includes(r.slug) ? '✓ ' : ''}{r.nombre}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={crearUsuario} disabled={loading || !form.usuario || !form.password}
              className="text-sm px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-40">
              {loading ? 'Creando…' : 'Crear usuario'}
            </button>
            <button onClick={() => setShowForm(false)} className="text-sm px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100">Cancelar</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 text-sm hover:border-gray-400 hover:text-gray-600 transition-all">
          + Añadir usuario
        </button>
      )}
    </div>
  )
}
