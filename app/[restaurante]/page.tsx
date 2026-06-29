import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { unstable_noStore as noStore } from 'next/cache'
import { getRestauranteAsync, getRestaurante } from '@/lib/restaurante'
import RestauranteSplash from '@/components/RestauranteSplash'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface Props {
  params: { restaurante: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getRestauranteAsync(params.restaurante)
  if (!data) return { title: 'Carta no encontrada' }
  return {
    title: `${data.nombre} — Carta digital`,
    description: data.subtitulo,
  }
}

export default async function CartaPage({ params }: Props) {
  noStore()
  const data = await getRestauranteAsync(params.restaurante)
  if (!data) notFound()

  return (
    <div className="flex justify-center min-h-screen bg-gray-200">
      <div className="w-full max-w-[480px] shadow-2xl min-h-screen">
        <RestauranteSplash restaurante={data} slug={params.restaurante} />
      </div>
    </div>
  )
}
