import Link from 'next/link'
import { getAllSlugs, getRestaurante } from '@/lib/restaurante'
import LogoutButton from '@/components/LogoutButton'

export default function AdminIndex() {
  const slugs = getAllSlugs()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel de administración</h1>
            <p className="text-sm text-gray-500 mt-1">Selecciona un restaurante para editar su carta</p>
          </div>
          <LogoutButton />
        </div>

        <div className="space-y-3">
          {slugs.map((slug) => {
            const r = getRestaurante(slug)
            if (!r) return null
            const totalPlatos = r.categorias.reduce((acc, c) => acc + c.platos.length, 0)
            return (
              <Link
                key={slug}
                href={`/admin/${slug}`}
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-400 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: r.color_primario }}
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{r.nombre}</p>
                    <p className="text-xs text-gray-400">{r.subtitulo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400">{r.categorias.length} categorías · {totalPlatos} platos</span>
                  <span className="text-gray-300 group-hover:text-gray-600 transition-colors">→</span>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
