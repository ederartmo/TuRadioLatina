import { Link } from 'react-router-dom'
import logoRadio from '../../logoradio1.png'

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 lg:px-8 lg:py-10">
      <main className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-[0_20px_50px_rgba(2,6,23,0.45)] lg:p-8">
        <header className="mb-6 flex items-center justify-between">
          <img src={logoRadio} alt="Tu Radio Latina" className="h-10 w-auto object-contain" />
          <Link to="/" className="rounded-full bg-[#635BFF] px-4 py-2 text-sm font-semibold text-white">
            Volver al inicio
          </Link>
        </header>

        <h1 className="text-2xl font-bold">Política de privacidad</h1>
        <p className="mt-2 text-sm text-slate-300">Última actualización: 23 de febrero de 2026</p>

        <section className="mt-6 space-y-4 text-sm leading-6 text-slate-300">
          <p>
            Tu Radio Latina recopila únicamente la información necesaria para operar el servicio, como datos técnicos básicos de
            navegación y mensajes enviados voluntariamente en el chat.
          </p>
          <p>
            No vendemos datos personales a terceros. La información se usa para mejorar la experiencia, mantener seguridad y
            atender consultas de contacto.
          </p>
          <p>
            Si utilizas WhatsApp para comunicarte con nosotros, el tratamiento de esos datos también está sujeto a las políticas
            de WhatsApp/Meta.
          </p>
          <p>
            Puedes solicitar revisión o eliminación de información de contacto enviando un mensaje al canal oficial de WhatsApp.
          </p>
        </section>
      </main>
    </div>
  )
}

export default PrivacyPage
