'use client'

import { useState } from 'react'
import { Restaurante } from '@/types/restaurante'
import CartaCliente from './CartaCliente'

const IDIOMAS = [
  { code: 'es', label: 'Español',  flag: '🇪🇸' },
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch',  flag: '🇩🇪' },
  { code: 'ru', label: 'Русский',  flag: '🇷🇺' },
]

const TIPOS_CARTA = [
  { id: 'carta',     labels: { es: 'Carta', en: 'Menu', it: 'Menù', fr: 'Menu', de: 'Speisekarte', ru: 'Меню' } },
  { id: 'vinos',     labels: { es: 'Carta de Vinos', en: 'Wine List', it: 'Carta dei Vini', fr: 'Carte des Vins', de: 'Weinkarte', ru: 'Винная карта' } },
  { id: 'cocktails', labels: { es: 'Cocktails', en: 'Cocktails', it: 'Cocktail', fr: 'Cocktails', de: 'Cocktails', ru: 'Коктейли' } },
  { id: 'bebidas',   labels: { es: 'Bebidas', en: 'Drinks', it: 'Bevande', fr: 'Boissons', de: 'Getränke', ru: 'Напитки' } },
]

type Paso = 'idioma' | 'tipo' | 'carta'

export default function RestauranteSplash({ restaurante, slug }: { restaurante: Restaurante; slug: string }) {
  const [paso, setPaso] = useState<Paso>('idioma')
  const [idioma, setIdioma] = useState('es')
  const [tipoCarta, setTipoCarta] = useState('carta')
  const [saliendo, setSaliendo] = useState(false)

  const elegirIdioma = (code: string) => {
    setSaliendo(true)
    setTimeout(() => {
      setIdioma(code)
      setPaso('tipo')
      setSaliendo(false)
    }, 250)
  }

  const elegirTipo = (id: string) => {
    setTipoCarta(id)
    if (id === 'carta') {
      setSaliendo(true)
      setTimeout(() => {
        setPaso('carta')
        setSaliendo(false)
      }, 250)
    }
  }

  if (paso === 'carta') {
    return <CartaCliente restaurante={restaurante} slug={slug} idiomaInicial={idioma} />
  }

  const labelTipo = (tipo: typeof TIPOS_CARTA[0]) =>
    (tipo.labels as Record<string, string>)[idioma] ?? tipo.labels.es

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between py-12 px-6 transition-opacity duration-250"
      style={{
        backgroundColor: restaurante.color_primario,
        opacity: saliendo ? 0 : 1,
      }}
    >
      {/* LOGO */}
      <div className="flex-1 flex items-center justify-center">
        {restaurante.logo_url ? (
          <img
            src={restaurante.logo_url}
            alt={restaurante.nombre}
            className="w-64 max-h-48 object-contain"
          />
        ) : (
          <h1 className="text-3xl font-bold text-white text-center">{restaurante.nombre}</h1>
        )}
      </div>

      {/* PASO 1: IDIOMA */}
      {paso === 'idioma' && (
        <div className="w-full max-w-xs flex flex-col items-center gap-5">
          <p
            className="text-xs uppercase tracking-widest font-medium mb-1"
            style={{ color: `${restaurante.color_acento}99` }}
          >
            Selecciona tu idioma
          </p>
          <div className="grid grid-cols-2 gap-3 w-full">
            {IDIOMAS.map((lang) => (
              <button
                key={lang.code}
                onClick={() => elegirIdioma(lang.code)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all active:scale-95"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <span className="text-xl">{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PASO 2: TIPO DE CARTA */}
      {paso === 'tipo' && (
        <div className="w-full max-w-xs flex flex-col items-center gap-5">
          <p
            className="text-xs uppercase tracking-widest font-medium mb-1"
            style={{ color: `${restaurante.color_acento}99` }}
          >
            {
              { es: '¿Qué deseas ver?', en: 'What would you like?', it: 'Cosa desideri?',
                fr: 'Que souhaitez-vous?', de: 'Was möchten Sie?', ru: 'Что вы хотите?' }[idioma] ?? '¿Qué deseas ver?'
            }
          </p>
          <div className="flex flex-col gap-3 w-full">
            {TIPOS_CARTA.map((tipo) => {
              const disponible = tipo.id === 'carta'
              return (
                <button
                  key={tipo.id}
                  onClick={() => elegirTipo(tipo.id)}
                  disabled={!disponible}
                  className="flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all active:scale-95"
                  style={{
                    backgroundColor: disponible ? restaurante.color_acento : 'rgba(255,255,255,0.05)',
                    color: disponible ? restaurante.color_primario : 'rgba(255,255,255,0.3)',
                    border: disponible ? 'none' : '1px solid rgba(255,255,255,0.08)',
                    cursor: disponible ? 'pointer' : 'not-allowed',
                  }}
                >
                  <div>
                    <p className="font-semibold text-[15px]">{labelTipo(tipo)}</p>
                    {!disponible && (
                      <p className="text-[11px] mt-0.5 opacity-60">
                        { { es: 'Próximamente', en: 'Coming soon', it: 'Prossimamente',
                            fr: 'Bientôt', de: 'Demnächst', ru: 'Скоро' }[idioma] ?? 'Próximamente' }
                      </p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Volver */}
          <button
            onClick={() => { setSaliendo(true); setTimeout(() => { setPaso('idioma'); setSaliendo(false) }, 250) }}
            className="text-xs mt-2 transition-colors"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            ← {
              { es: 'Cambiar idioma', en: 'Change language', it: 'Cambia lingua',
                fr: 'Changer de langue', de: 'Sprache ändern', ru: 'Сменить язык' }[idioma] ?? 'Cambiar idioma'
            }
          </button>
        </div>
      )}

      {/* FOOTER */}
      <div className="mt-8">
        <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
          carta.menu
        </p>
      </div>
    </div>
  )
}
