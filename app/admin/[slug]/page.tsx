import { notFound } from 'next/navigation'
import { getRestaurante } from '@/lib/restaurante'
import AdminEditor from '@/components/AdminEditor'

interface Props { params: { slug: string } }

export default function AdminPage({ params }: Props) {
  const data = getRestaurante(params.slug)
  if (!data) notFound()
  return <AdminEditor restaurante={data} slug={params.slug} />
}
