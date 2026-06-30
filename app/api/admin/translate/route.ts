import { NextRequest, NextResponse } from 'next/server'

const LANG_CODES: Record<string, string> = {
  es: 'es', en: 'en', it: 'it', fr: 'fr', de: 'de', ru: 'ru',
}

async function translateText(text: string, from: string, to: string): Promise<string> {
  if (!text.trim()) return ''
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}&de=comunicacionatipico@gmail.com`
  const res = await fetch(url)
  const json = await res.json()
  return json.responseData?.translatedText ?? text
}

export async function POST(req: NextRequest) {
  try {
    const { nombre, descripcion, idiomas } = await req.json() as {
      nombre: string
      descripcion: string
      idiomas: string[]
    }

    const targetLangs = idiomas.filter(l => l !== 'es')

    const nombreResult: Record<string, string> = {}
    const descripcionResult: Record<string, string> = {}

    await Promise.all(targetLangs.map(async (lang) => {
      const code = LANG_CODES[lang] ?? lang
      nombreResult[lang] = await translateText(nombre, 'es', code)
      if (descripcion) {
        descripcionResult[lang] = await translateText(descripcion, 'es', code)
      }
    }))

    return NextResponse.json({ nombre: nombreResult, descripcion: descripcionResult })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
