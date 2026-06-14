import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getRestaurante, getAllSlugs } from '@/lib/restaurante'
import RestauranteSplash from '@/components/RestauranteSplash'

interface Props {
  params: { restaurante: string }
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ restaurante: slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = getRestaurante(params.restaurante)
  if (!data) return { title: 'Carta no encontrada' }
  return {
    title: `${data.nombre} — Carta digital`,
    description: data.subtitulo,
  }
}

export default function CartaPage({ params }: Props) {
  const data = getRestaurante(params.restaurante)
  if (!data) notFound()

  return (
    <div className="flex justify-center min-h-screen bg-gray-200">
      <div className="w-full max-w-[480px] shadow-2xl min-h-screen">
        <RestauranteSplash restaurante={data} slug={params.restaurante} />
      </div>
    </div>
  )
}
