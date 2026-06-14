import Link from 'next/link'

export default function Landing() {
  return (
    <main className="min-h-screen bg-[#0d0d0d] text-white flex flex-col">
      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto w-full">
        <span className="text-lg font-bold tracking-tight">
          carta<span className="text-[#c9a96e]">.</span>menu
        </span>
        <a
          href="mailto:hola@carta.menu"
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Contacto
        </a>
      </nav>

      {/* HERO */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c9a96e]" />
          Cartas digitales para restaurantes
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6 max-w-2xl leading-tight">
          Tu carta,<br />
          <span className="text-[#c9a96e]">en el móvil</span> de tu cliente
        </h1>

        <p className="text-gray-400 text-lg max-w-md mb-10 leading-relaxed">
          Sin apps que instalar. Sin impresión. Sin complicaciones.
          Tu menú siempre actualizado, en segundos.
        </p>

        <a
          href="mailto:hola@carta.menu?subject=Quiero%20mi%20carta%20digital"
          className="inline-flex items-center gap-2 bg-[#c9a96e] text-[#0d0d0d] font-semibold px-7 py-3.5 rounded-full hover:bg-[#d4b87d] transition-colors text-sm"
        >
          Empezar gratis
          <span aria-hidden>→</span>
        </a>

        <p className="text-gray-600 text-xs mt-4">Sin tarjeta de crédito · Listo en 24h</p>
      </section>

      {/* DEMOS */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs text-gray-600 uppercase tracking-widest mb-8">
            Restaurantes de ejemplo
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { slug: 'demo', label: 'Restaurante Demo', sub: 'Cocina mediterránea' },
              { slug: 'hommus-falafel', label: 'Hommus Falafel', sub: 'Cocina sirio-libanesa' },
            ].map((r) => (
              <Link
                key={r.slug}
                href={`/${r.slug}`}
                className="flex flex-col items-start gap-0.5 px-5 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all min-w-[200px]"
              >
                <span className="text-sm font-medium">{r.label}</span>
                <span className="text-xs text-gray-500">{r.sub}</span>
                <span className="text-xs text-[#c9a96e] mt-2">Ver carta →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-6">
          {[
            { emoji: '⚡', title: 'Instantáneo', desc: 'Tus clientes acceden con el QR de la mesa. Sin descargas.' },
            { emoji: '🌍', title: 'Multiidioma', desc: 'Español, inglés y más. El cliente elige su idioma.' },
            { emoji: '✏️', title: 'Siempre actualizado', desc: 'Cambia un precio o plato y se actualiza al momento.' },
          ].map((f) => (
            <div key={f.title} className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
              <div className="text-2xl mb-3">{f.emoji}</div>
              <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 px-6 text-center border-t border-white/5">
        <h2 className="text-2xl font-bold mb-4">¿Listo para digitalizar tu carta?</h2>
        <p className="text-gray-400 text-sm mb-8">
          Escríbenos y tendrás tu carta lista en menos de 24 horas.
        </p>
        <a
          href="mailto:hola@carta.menu?subject=Quiero%20mi%20carta%20digital"
          className="inline-flex items-center gap-2 border border-[#c9a96e] text-[#c9a96e] font-medium px-7 py-3 rounded-full hover:bg-[#c9a96e] hover:text-[#0d0d0d] transition-all text-sm"
        >
          hola@carta.menu
        </a>
      </section>

      <footer className="py-6 text-center border-t border-white/5">
        <p className="text-gray-700 text-xs">
          © {new Date().getFullYear()} carta.menu
        </p>
      </footer>
    </main>
  )
}
