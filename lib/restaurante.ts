import { Restaurante } from '@/types/restaurante'
import fs from 'fs'
import path from 'path'

const BLOB_BASE_URL = 'https://public.blob.vercel-storage.com'

export async function getRestauranteAsync(slug: string): Promise<Restaurante | null> {
  // Try Vercel Blob first (production overrides)
  try {
    const res = await fetch(`${BLOB_BASE_URL}/restaurantes/${slug}.json`, { next: { revalidate: 60 } })
    if (res.ok) return await res.json() as Restaurante
  } catch {}

  // Fallback to local JSON
  return getRestaurante(slug)
}

export function getRestaurante(slug: string): Restaurante | null {
  try {
    const filePath = path.join(process.cwd(), 'data', 'restaurantes', `${slug}.json`)
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw) as Restaurante
  } catch {
    return null
  }
}

export function getAllSlugs(): string[] {
  const dir = path.join(process.cwd(), 'data', 'restaurantes')
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''))
}
