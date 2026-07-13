import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET() {
  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: 'No Supabase' }, { status: 500 })

  // Load current Supabase data (preserves all existing images)
  const { data: row, error } = await supabase
    .from('restaurantes').select('data').eq('slug', 'redondo-en-boca').single()

  if (error || !row?.data) return NextResponse.json({ error: 'No se encontró redondo-en-boca', details: error }, { status: 500 })

  const restaurante = row.data as any

  const t = (es: string, en = es, it = es, fr = es, de = es, ru = es) => ({ es, en, it, fr, de, ru })
  const desc = () => ({ es: '', en: '', it: '', fr: '', de: '', ru: '' })
  const p = (id: string, nombre_es: string, precio: number, emoji = '🥃', desc_es = '') => ({
    id, nombre: t(nombre_es), descripcion: { es: desc_es, en: desc_es, it: desc_es, fr: desc_es, de: desc_es, ru: desc_es },
    precio, emoji, imagen_url: null, alergenos: [], disponible: true,
  })

  const nuevasCats = [
    // BEBIDAS
    {
      id: 'rob-cerveza', tipo: 'bebidas',
      nombre: t('Cervezas', 'Beers', 'Birre', 'Bières', 'Biere', 'Пиво'),
      platos: [
        p('rbc-1', 'Doble Estrella', 5.5, '🍺'),
        p('rbc-2', 'Pinta Estrella', 3.5, '🍺'),
        p('rbc-3', 'Doble 1906', 5, '🍺'),
        p('rbc-4', 'Pinta 1906', 3.8, '🍺'),
        p('rbc-5', 'Doble Radler', 6, '🍺'),
        p('rbc-6', 'Pinta Radler', 3.8, '🍺'),
        p('rbc-7', 'Estrella Galicia 0.0', 3.5, '🍺'),
        p('rbc-8', 'Estrella Sin Gluten', 3.5, '🍺'),
        p('rbc-9', 'Alhambra', 4.2, '🍺'),
        p('rbc-10', 'Coronita', 3.8, '🍺'),
      ],
    },
    {
      id: 'rob-vermut', tipo: 'bebidas',
      nombre: t('Vermut', 'Vermouth', 'Vermut', 'Vermouth', 'Wermut', 'Вермут'),
      platos: [
        p('rbv-1', 'Yzaguirre Tinto', 3.5, '🍷'),
        p('rbv-2', 'Yzaguirre Blanco', 3.5, '🥂'),
      ],
    },
    {
      id: 'rob-zumos', tipo: 'bebidas',
      nombre: t('Zumos', 'Juices', 'Succhi', 'Jus', 'Säfte', 'Соки'),
      platos: [
        p('rbz-1', 'Naranja', 3.5, '🍊'),
        p('rbz-2', 'Piña', 3.5, '🍍'),
        p('rbz-3', 'Melocotón', 3.5, '🍑'),
        p('rbz-4', 'Mango', 3.5, '🥭'),
        p('rbz-5', 'Tomate', 3.5, '🍅'),
      ],
    },
    {
      id: 'rob-refrescos', tipo: 'bebidas',
      nombre: t('Refrescos y Agua', 'Soft Drinks & Water', 'Bibite e Acqua', 'Boissons & Eau', 'Erfrischungsgetränke', 'Напитки и вода'),
      platos: [
        p('rbr-1', 'Agua', 3.5, '💧'),
        p('rbr-2', 'Agua con gas', 3.5, '💧'),
        p('rbr-3', 'Coca Cola', 3.5, '🥤'),
        p('rbr-4', 'Coca Cola Zero', 3.5, '🥤'),
        p('rbr-5', 'Red Bull', 3.5, '⚡'),
        p('rbr-6', 'Fanta Limón', 3.5, '🥤'),
        p('rbr-7', 'Fanta Naranja', 3.5, '🥤'),
        p('rbr-8', 'Sprite', 3.5, '🥤'),
        p('rbr-9', 'Fuze Tea Mango', 3.5, '🍵'),
        p('rbr-10', 'Fuze Tea Maracuyá', 3.5, '🍵'),
        p('rbr-11', 'Tónica', 3.5, '🥤'),
        p('rbr-12', 'Bitter Kas', 3.5, '🥤'),
        p('rbr-13', 'Ginger Ale', 3.5, '🥤'),
        p('rbr-14', 'Ginger Beer', 3.5, '🥤'),
      ],
    },
    {
      id: 'rob-licores', tipo: 'bebidas',
      nombre: t('Licores', 'Liqueurs', 'Liquori', 'Liqueurs', 'Liköre', 'Ликёры'),
      platos: [
        p('rbl-1', 'Terry', 5, '🥃'), p('rbl-2', 'Baileys', 7, '🥃'),
        p('rbl-3', 'Frangelico', 7, '🥃'), p('rbl-4', 'Marie Brizard', 7, '🥃'),
        p('rbl-5', 'Licor 43', 7, '🥃'), p('rbl-6', 'Mangaroca', 7, '🥃'),
        p('rbl-7', 'Pacharán', 8, '🥃'), p('rbl-8', 'Campari', 10, '🥃'),
        p('rbl-9', 'Cointreau', 12, '🥃'), p('rbl-10', 'Disaronno', 5, '🥃'),
        p('rbl-11', 'Tía María', 6, '🥃'), p('rbl-12', 'Kahlúa', 6, '🥃'),
        p('rbl-13', 'José Cuervo', 7, '🥃'), p('rbl-14', 'Tequila de Fresa', 8, '🥃'),
        p('rbl-15', 'Limoncello', 8, '🍋'), p('rbl-16', 'Orujo de Hierbas', 10, '🌿'),
        p('rbl-17', 'Mistela', 15, '🍇'), p('rbl-18', 'Jägermeister', 9, '🦌'),
        p('rbl-19', 'Fireball', 13, '🔥'), p('rbl-20', 'Cassalla', 13, '🥃'),
        p('rbl-21', 'Herbero', 5, '🌿'), p('rbl-22', 'Passoa', 6, '🍹'),
      ],
    },
    {
      id: 'rob-destilados', tipo: 'bebidas',
      nombre: t('Destilados', 'Spirits', 'Distillati', 'Spiritueux', 'Spirituosen', 'Крепкие напитки'),
      platos: [
        { id: 'rbd-1', nombre: t('Ron', 'Rum', 'Rum', 'Rhum', 'Rum', 'Ром'), descripcion: t('Negrita · Brugal · Barceló · Bacardí · Malibu · Santa Teresa · Flor de Caña · Havana · Zacapa'), precio: 9, precio_label: 'desde', emoji: '🍹', imagen_url: null, alergenos: [], disponible: true },
        { id: 'rbd-2', nombre: t('Whisky'), descripcion: t('Curry Sark · Red Label · Ballantines · Jameson · Jim Beam · Jack Daniel\'s · Black Label · Macallan'), precio: 9, precio_label: 'desde', emoji: '🥃', imagen_url: null, alergenos: [], disponible: true },
        { id: 'rbd-3', nombre: t('Ginebra', 'Gin', 'Gin', 'Gin', 'Gin', 'Джин'), descripcion: t('Beefeater · Tanqueray · Seagrams · Puerto de Indias · M\'alegra · Martin Miller · Hendrick\'s · Malfy Pomelo · Nordes · Brockmans · Roku · Gvine'), precio: 9, precio_label: 'desde', emoji: '🍸', imagen_url: null, alergenos: [], disponible: true },
        { id: 'rbd-4', nombre: t('Vodka'), descripcion: t('Absolut · Grey Goose · Belvedere'), precio: 9, precio_label: 'desde', emoji: '🍸', imagen_url: null, alergenos: [], disponible: true },
      ],
    },
    // COCKTAILS
    {
      id: 'rob-cocktails', tipo: 'cocktails',
      nombre: t('Cocktails', 'Cocktails', 'Cocktail', 'Cocktails', 'Cocktails', 'Коктейли'),
      platos: [
        p('rck-1', 'Margarita Clásica o Spicy', 11, '🍸', 'Fresa · Maracuyá · Original'),
        p('rck-2', 'Mojito', 9.5, '🌿'),
        p('rck-3', 'Caipiriña / Caipiroska', 9.5, '🍋'),
        p('rck-4', 'Piña Colada', 10, '🍍'),
        p('rck-5', 'Daiquiri', 9.5, '🍓'),
        p('rck-6', 'Espresso Martini', 10, '☕'),
        p('rck-7', 'Negroni', 12, '🍊'),
        p('rck-8', 'Aperol Spritz', 9, '🍊'),
        p('rck-9', 'Moscow Mule', 11, '🫚'),
        p('rck-10', 'Porn Star Martini', 12, '🌟'),
        p('rck-11', 'Old Fashioned', 10.5, '🥃'),
      ],
    },
  ]

  // Append new categories (preserve existing ones with their images)
  const updatedRestaurante = {
    ...restaurante,
    categorias: [...restaurante.categorias, ...nuevasCats],
  }

  const { error: saveError } = await supabase
    .from('restaurantes')
    .update({ data: updatedRestaurante, updated_at: new Date().toISOString() })
    .eq('slug', 'redondo-en-boca')

  if (saveError) return NextResponse.json({ error: saveError.message }, { status: 500 })

  return NextResponse.json({
    ok: true,
    total_categorias: updatedRestaurante.categorias.length,
    nuevas: nuevasCats.map(c => ({ nombre: c.nombre.es, tipo: c.tipo, platos: c.platos.length })),
  })
}
