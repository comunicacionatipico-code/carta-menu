import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const IDIOMAS: Record<string, string> = {
  es: 'Spanish',
  en: 'English',
  it: 'Italian',
  fr: 'French',
  de: 'German',
  ru: 'Russian',
}

export async function POST(req: NextRequest) {
  try {
    const { nombre, descripcion, idiomas } = await req.json() as {
      nombre: string
      descripcion: string
      idiomas: string[]
    }

    const targetLangs = idiomas.filter(l => l !== 'es')
    const langList = targetLangs.map(l => `${l} (${IDIOMAS[l] ?? l})`).join(', ')

    const prompt = `You are a professional restaurant menu translator. Translate the following Spanish dish name and description into these languages: ${langList}.

Dish name (ES): ${nombre}
Description (ES): ${descripcion}

Respond ONLY with a valid JSON object in this exact format, no extra text:
{
  "nombre": { ${targetLangs.map(l => `"${l}": "translation"`).join(', ')} },
  "descripcion": { ${targetLangs.map(l => `"${l}": "translation"`).join(', ')} }
}`

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const json = JSON.parse(text.trim())

    return NextResponse.json(json)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
