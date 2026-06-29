import { Restaurante } from '@/types/restaurante'
import fs from 'fs'
import path from 'path'
import { getSupabase } from './supabase'

export async function getRestauranteAsync(slug: string): Promise<Restaurante | null> {
  const supabase = getSupabase()
  if (!supabase) {
    console.log('[restaurante] No Supabase client, using local JSON')
    return getRestaurante(slug)
  }

  const { data, error } = await supabase
    .from('restaurantes')
    .select('data')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('[restaurante] Supabase read error for', slug, ':', error.code, error.message)
    return getRestaurante(slug)
  }

  if (data?.data) {
    console.log('[restaurante] Loaded from Supabase:', slug)
    return data.data as Restaurante
  }

  console.log('[restaurante] No data in Supabase for', slug, ', using local JSON')
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
