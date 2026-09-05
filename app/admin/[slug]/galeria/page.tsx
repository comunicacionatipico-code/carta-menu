import { unstable_noStore as noStore } from 'next/cache'
import { notFound } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import { Restaurante } from '@/types/restaurante'
import GaleriaEditor from '@/components/GaleriaEditor'

export const dynamic = 'force-dynamic'

export default async function GaleriaPage({ params }: { params: { slug: string } }) {
  noStore()
  const supabase = getSupabase()
  if (!supabase) notFound()

  const { data: row } = await supabase.from('restaurantes').select('data').eq('slug', params.slug).single()
  if (!row) notFound()

  const restaurante = row.data as Restaurante

  // List storage files
  const { data: files } = await supabase.storage.from('imagenes').list(params.slug, { limit: 500, sortBy: { column: 'created_at', order: 'asc' } })
  const BASE = `https://xactqoyrqamcrezwomut.supabase.co/storage/v1/object/public/imagenes/${params.slug}/`
  const imagenes = (files ?? []).map(f => BASE + f.name)

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <a href={`/admin/${params.slug}`} className="text-sm text-gray-500 hover:text-gray-800">← Volver al editor</a>
          <h1 className="text-xl font-bold text-gray-800">Asignar fotos — {restaurante.nombre}</h1>
        </div>
        <GaleriaEditor slug={params.slug} restaurante={restaurante} imagenes={imagenes} />
      </div>
    </div>
  )
}
