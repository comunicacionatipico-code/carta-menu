export type Idioma = string

export interface TextoMultiidioma {
  [idioma: string]: string
}

export interface Plato {
  id: string
  nombre: TextoMultiidioma
  descripcion: TextoMultiidioma
  precio: number
  emoji: string
  imagen_url: string | null
  alergenos: string[]
  disponible: boolean
  oculto?: boolean
}

export interface Categoria {
  id: string
  nombre: TextoMultiidioma
  platos: Plato[]
}

export interface Restaurante {
  nombre: string
  subtitulo: string
  color_primario: string
  color_acento: string
  logo_url?: string | null
  wifi?: string
  idiomas: string[]
  categorias: Categoria[]
}
