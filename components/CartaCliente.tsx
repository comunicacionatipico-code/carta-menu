'use client'

import { useEffect, useRef, useState } from 'react'
import { Restaurante } from '@/types/restaurante'
import { ALERGENOS } from '@/lib/alergenos'

export default function CartaCliente({ restaurante, slug, idiomaInicial }: { restaurante: Restaurante; slug: string; idiomaInicial?: string }) {
  const [idiomaActivo, setIdiomaActivo] = useState(idiomaInicial ?? restaurante.idiomas[0])
  const [categoriaActiva, setCategoriaActiva] = useState(restaurante.categorias[0]?.id)
  const chipsRef = useRef<HTMLDivElement>(null)
  const categoriasRef = useRef<Record<string, HTMLElement | null>>({})

  useEffect(() => {
    const saved = localStorage.getItem(`carta-idioma-${slug}`)
    if (saved && restaurante.idiomas.includes(saved)) {
      setIdiomaActivo(saved)
    }
  }, [slug, restaurante.idiomas])

  const cambiarIdioma = (lang: string) => {
    setIdiomaActivo(lang)
    localStorage.setItem(`carta-idioma-${slug}`, lang)
  }

  const scrollToCategoria = (id: string) => {
    const el = categoriasRef.current[id]
    if (el) {
      const offset = 120
      const top = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: 'smooth' })
    }
    setCategoriaActiva(id)
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-id')
            if (id) setCategoriaActiva(id)
          }
        })
      },
      { rootMargin: '-100px 0px -60% 0px', threshold: 0 }
    )
    Object.values(categoriasRef.current).forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [restaurante.categorias])

  const txt = (obj: Record<string, string>) => obj[idiomaActivo] ?? obj[restaurante.idiomas[0]] ?? ''

  return (
    <div className="relative min-h-screen bg-[#f5f1ea]">
      {/* HERO */}
      <div
        className="relative flex flex-col items-center justify-center px-5 pt-6 pb-2"
        style={{ backgroundColor: restaurante.color_primario }}
      >
        {restaurante.idiomas.length > 1 && (
          <div className="absolute top-4 right-4 flex gap-1">
            {restaurante.idiomas.map((lang) => (
              <button
                key={lang}
                onClick={() => cambiarIdioma(lang)}
                className="text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider transition-all"
                style={
                  idiomaActivo === lang
                    ? { backgroundColor: restaurante.color_acento, color: restaurante.color_primario }
                    : { backgroundColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }
                }
              >
                {lang}
              </button>
            ))}
          </div>
        )}
        {restaurante.logo_url ? (
          <img
            src={restaurante.logo_url}
            alt={restaurante.nombre}
            className="w-72 max-h-48 object-contain"
          />
        ) : (
          <>
            <h1 className="text-2xl font-bold text-white text-center">{restaurante.nombre}</h1>
            <p className="text-sm mt-1 text-center" style={{ color: restaurante.color_acento }}>
              {restaurante.subtitulo}
            </p>
          </>
        )}
      </div>

      {/* CHIPS sticky */}
      <div
        ref={chipsRef}
        className="sticky top-0 z-30 flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide"
        style={{ backgroundColor: restaurante.color_primario }}
      >
        {restaurante.categorias.map((cat) => (
          <button
            key={cat.id}
            onClick={() => scrollToCategoria(cat.id)}
            className="flex-shrink-0 text-xs font-medium px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap"
            style={
              categoriaActiva === cat.id
                ? { backgroundColor: restaurante.color_acento, color: restaurante.color_primario }
                : { backgroundColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.75)' }
            }
          >
            {txt(cat.nombre)}
          </button>
        ))}
      </div>

      {/* CONTENIDO */}
      <div className="pb-20">
        {restaurante.categorias.map((cat) => (
          <section
            key={cat.id}
            data-id={cat.id}
            ref={(el) => { categoriasRef.current[cat.id] = el }}
          >
            <h2
              className="px-4 pt-8 pb-3 text-xl font-bold uppercase tracking-widest"
              style={{ color: restaurante.color_primario }}
            >
              {txt(cat.nombre)}
            </h2>

            <div>
              {cat.platos.filter(p => !p.oculto).map((plato, idx) => (
                <div key={plato.id}>
                  <div className={`relative ${!plato.disponible ? 'opacity-60' : ''}`}>
                    {/* FOTO 9:16 con overlay de info */}
                    <div className="relative w-full overflow-hidden" style={{ aspectRatio: '9/16' }}>
                      {/* Fondo: imagen o emoji */}
                      {plato.imagen_url ? (
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ backgroundImage: `url(${plato.imagen_url})` }}
                        />
                      ) : (
                        <div
                          className="absolute inset-0 flex items-center justify-center"
                          style={{ backgroundColor: '#f0ece4' }}
                        >
                          <span style={{ fontSize: 80 }}>{plato.emoji}</span>
                        </div>
                      )}

                      {/* Gradiente inferior para legibilidad del texto */}
                      {(plato.imagen_url || true) && (
                        <div
                          className="absolute inset-x-0 bottom-0"
                          style={{
                            height: '55%',
                            background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.4) 55%, transparent 100%)',
                          }}
                        />
                      )}

                      {/* INFO superpuesto */}
                      <div className="absolute inset-x-0 bottom-0 px-5 pb-6">
                        {/* PRECIO sin fondo */}
                        <p className="text-white font-light text-[19px] tracking-widest drop-shadow-lg" style={{ fontStyle: 'italic', letterSpacing: '0.12em' }}>
                          {plato.precio.toFixed(2).replace('.', ',')} €
                        </p>

                        <p className="text-white font-bold text-[22px] leading-tight drop-shadow-lg mt-1">
                          {txt(plato.nombre)}
                        </p>
                        <p className="text-white/75 text-[14px] mt-2 leading-[1.5] drop-shadow">
                          {txt(plato.descripcion)}
                        </p>

                        {/* ALÉRGENOS */}
                        {plato.alergenos.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {plato.alergenos.map((a) => (
                              <span
                                key={a}
                                className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                                style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}
                              >
                                {ALERGENOS[a]?.emoji} {ALERGENOS[a]?.label ?? a}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* No disponible overlay */}
                      {!plato.disponible && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <span
                            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-black/60 text-white"
                          >
                            No disponible
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {idx < cat.platos.length - 1 && (
                    <div className="h-px bg-gray-100 mx-4" />
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* FOOTER fijo */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] flex items-center justify-between px-4 py-3 text-xs z-40 border-t border-gray-100"
        style={{ backgroundColor: 'rgba(245,241,234,0.95)', backdropFilter: 'blur(8px)' }}
      >
        <span className="text-gray-400 font-medium">
          con{' '}
          <span className="text-gray-600 font-semibold">carta.menu</span>
        </span>
        {restaurante.wifi && (
          <span className="text-gray-500">
            <span className="text-gray-400">WiFi </span>
            <span className="font-semibold text-gray-700">{restaurante.wifi}</span>
          </span>
        )}
      </div>
    </div>
  )
}
