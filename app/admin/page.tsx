import { unstable_noStore as noStore } from 'next/cache'
import { headers } from 'next/headers'
import { getSupabase } from '@/lib/supabase'
import { getAllSlugs, getRestaurante } from '@/lib/restaurante'
import { Restaurante } from '@/types/restaurante'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
import NuevoRestauranteBtn from '@/components/NuevoRestauranteBtn'

export const dynamic = 'force-dynamic'

type Item = { slug: string } & Restaurante

async function getRestaurantes(): Promise<Item[]> {
  const supabase = getSupabase()
  if (supabase) {
    const { data, error } = await supabase.from('restaurantes').select('slug, data').order('slug')
    if (!error && data) return data.map(row => ({ slug: row.slug, ...(row.data as Restaurante) }))
  }
  return getAllSlugs().map(slug => ({ slug, ...getRestaurante(slug)! })).filter(r => r.nombre)
}

export default async function AdminIndex() {
  noStore()
  const hdrs = headers()
  const isSuperAdmin = hdrs.get('x-session-super') === '1'
  const usuario = hdrs.get('x-session-usuario') ?? ''
  const restaurantesAsignados: string[] = JSON.parse(hdrs.get('x-session-restaurantes') ?? '[]')

  const todosLosRestaurantes = await getRestaurantes()
  const lista = isSuperAdmin
    ? todosLosRestaurantes
    : todosLosRestaurantes.filter(r => restaurantesAsignados.includes(r.slug))

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel de administración</h1>
            <p className="text-sm text-gray-500 mt-1">
              {isSuperAdmin ? 'Super administrador' : `Usuario: ${usuario}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isSuperAdmin && <NuevoRestauranteBtn />}
            {isSuperAdmin && (
              <Link
                href="/admin/usuarios"
                className="text-sm px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
              >
                👥 Usuarios
              </Link>
            )}
            <LogoutButton />
          </div>
        </div>

        <div className="space-y-3">
          {lista.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">🍽️</p>
              <p>No tienes restaurantes asignados</p>
            </div>
          )}
          {lista.map((r) => {
            const totalPlatos = r.categorias?.reduce((acc, c) => acc + c.platos.length, 0) ?? 0
            return (
              <Link
                key={r.slug}
                href={`/admin/${r.slug}`}
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-400 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex-shrink-0" style={{ backgroundColor: r.color_primario }} />
                  <div>
                    <p className="font-semibold text-gray-900">{r.nombre}</p>
                    <p className="text-xs text-gray-400">{r.subtitulo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400">{r.categorias?.length ?? 0} categorías · {totalPlatos} platos</span>
                  <span className="text-gray-300 group-hover:text-gray-600 transition-colors">→</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
