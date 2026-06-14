import Link from 'next/link'

export default function RestauranteNoEncontrado() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#111] text-white px-6 text-center">
      <div className="text-6xl mb-6">🍽️</div>
      <h1 className="text-3xl font-bold mb-2">Carta no encontrada</h1>
      <p className="text-gray-400 text-sm mb-8 max-w-xs">
        Este restaurante no existe o la carta no está disponible en este momento.
      </p>
      <Link
        href="/"
        className="text-sm font-medium px-5 py-2.5 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
