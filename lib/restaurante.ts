import { Restaurante } from '@/types/restaurante'
import fs from 'fs'
import path from 'path'

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
