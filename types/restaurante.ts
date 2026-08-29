export type Idioma = string

export interface TextoMultiidioma {
  [idioma: string]: string
}

export interface Plato {
  id: string
  nombre: TextoMultiidioma
  descripcion: TextoMultiidioma
  precio: number
  precio_label?: string
  precio2?: number
  precio2_label?: string
  emoji: string
  imagen_url: string | null
  alergenos: string[]
  disponible: boolean
  oculto?: boolean
}

export type TipoCarta = 'carta' | 'bebidas' | 'vinos' | 'cocktails'

export interface Categoria {
  id: string
  nombre: TextoMultiidioma
  platos: Plato[]
  tipo?: TipoCarta
}

export interface Restaurante {
  nombre: string
  subtitulo: string
  color_primario: string
  color_acento: string
  logo_url?: string | null
  wifi?: string
  menus_ocultos?: string[]
  idiomas: string[]
  categorias: Categoria[]
  dominio_personalizado?: string
}
