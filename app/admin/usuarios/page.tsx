import { unstable_noStore as noStore } from 'next/cache'
import { getSupabase } from '@/lib/supabase'
import { Restaurante } from '@/types/restaurante'
import UsuariosManager from '@/components/UsuariosManager'

export const dynamic = 'force-dynamic'

async function getRestaurantes(): Promise<{ slug: string; nombre: string; color: string }[]> {
  const supabase = getSupabase()
  if (!supabase) return []
  const { data } = await supabase.from('restaurantes').select('slug, data').order('slug')
  return (data ?? []).map(r => ({
    slug: r.slug,
    nombre: (r.data as Restaurante).nombre,
    color: (r.data as Restaurante).color_primario,
  }))
}

async function getUsuarios() {
  noStore()
  const supabase = getSupabase()
  if (!supabase) return []
  const { data, error } = await supabase.from('usuarios').select('id, usuario, restaurantes, created_at').order('created_at')
  if (error) console.error('[usuarios] query error:', error)
  return data ?? []
}

export default async function UsuariosPage() {
  noStore()
  const [restaurantes, usuarios] = await Promise.all([getRestaurantes(), getUsuarios()])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <a href="/admin" className="text-gray-400 hover:text-gray-700 text-lg">←</a>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de usuarios</h1>
            <p className="text-sm text-gray-500 mt-0.5">Añade usuarios y asígnalos a restaurantes</p>
          </div>
        </div>
        <UsuariosManager restaurantes={restaurantes} usuariosIniciales={usuarios} />
      </div>
    </div>
  )
}
