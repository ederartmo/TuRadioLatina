import { Link } from 'react-router-dom'
import logoRadio from '../../logoradio1.png'

function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 lg:px-8 lg:py-10">
      <main className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-[0_20px_50px_rgba(2,6,23,0.45)] lg:p-8">
        <header className="mb-6 flex items-center justify-between">
          <img src={logoRadio} alt="Tu Radio Latina" className="h-10 w-auto object-contain" />
          <Link to="/" className="rounded-full bg-[#635BFF] px-4 py-2 text-sm font-semibold text-white">
            Volver al inicio
          </Link>
        </header>

        <h1 className="text-2xl font-bold">Términos y condiciones</h1>
        <p className="mt-2 text-sm text-slate-300">Última actualización: 23 de febrero de 2026</p>

        <section className="mt-6 space-y-4 text-sm leading-6 text-slate-300">
          <p>
            Al usar Tu Radio Latina aceptas hacer un uso responsable de la plataforma, respetando las leyes aplicables y evitando
            cualquier actividad que afecte el servicio o a otros usuarios.
          </p>
          <p>
            El contenido emitido puede cambiar sin previo aviso. La disponibilidad del stream depende de la conexión y del estado
            técnico de los servicios de transmisión.
          </p>
          <p>
            El chat en vivo está sujeto a moderación. Mensajes ofensivos, spam o contenido inapropiado pueden ser eliminados y el
            acceso podrá ser restringido.
          </p>
          <p>
            Para temas comerciales, publicidad o colaboraciones, utiliza el canal de WhatsApp indicado en la sección de contacto.
          </p>
        </section>
      </main>
    </div>
  )
}

export default TermsPage
