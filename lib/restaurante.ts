import { Restaurante } from '@/types/restaurante'
import fs from 'fs'
import path from 'path'
import { list } from '@vercel/blob'

export async function getRestauranteAsync(slug: string): Promise<Restaurante | null> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { blobs } = await list({ prefix: `restaurantes/${slug}.json` })
      if (blobs.length > 0) {
        const res = await fetch(blobs[0].url, { cache: 'no-store' })
        if (res.ok) return await res.json() as Restaurante
      }
    } catch {}
  }

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
