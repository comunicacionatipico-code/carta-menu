import { Restaurante } from '@/types/restaurante'
import fs from 'fs'
import path from 'path'
import { supabase } from './supabase'

export async function getRestauranteAsync(slug: string): Promise<Restaurante | null> {
  if (process.env.SUPABASE_URL) {
    try {
      const { data } = await supabase
        .from('restaurantes')
        .select('data')
        .eq('slug', slug)
        .single()
      if (data?.data) return data.data as Restaurante
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
