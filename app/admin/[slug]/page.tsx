import { notFound } from 'next/navigation'
import { getRestauranteAsync } from '@/lib/restaurante'
import AdminEditor from '@/components/AdminEditor'

export const dynamic = 'force-dynamic'

interface Props { params: { slug: string } }

export default async function AdminPage({ params }: Props) {
  const data = await getRestauranteAsync(params.slug)
  if (!data) notFound()
  return <AdminEditor restaurante={data} slug={params.slug} />
}
