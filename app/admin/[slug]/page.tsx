import { notFound } from 'next/navigation'
import { unstable_noStore as noStore } from 'next/cache'
import { getRestauranteAsync } from '@/lib/restaurante'
import AdminEditor from '@/components/AdminEditor'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface Props { params: { slug: string } }

export default async function AdminPage({ params }: Props) {
  noStore()
  const data = await getRestauranteAsync(params.slug)
  if (!data) notFound()
  return <AdminEditor restaurante={data} slug={params.slug} />
}
