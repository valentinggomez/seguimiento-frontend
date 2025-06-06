'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [form, setForm] = useState({
    nombre: '',
    dni: '',
    telefono: '',
    cirugia: '',
    fecha_cirugia: ''
  })

  const [enviado, setEnviado] = useState(false)
  const [link, setLink] = useState('')
  const [copiado, setCopiado] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data, error } = await supabase.from('pacientes').insert([form]).select()

    if (data && data[0]) {
      const nuevoId = data[0].id
      const url = `${window.location.origin}/seguimiento/${nuevoId}`
      setLink(url)
      setEnviado(true)
      setCopiado(false)
    } else {
      alert('❌ Error al registrar paciente')
      console.error(error)
    }
  }

  const copiarLink = () => {
    navigator.clipboard.writeText(link)
    setCopiado(true)
  }

  const resetForm = () => {
    setForm({
      nombre: '',
      dni: '',
      telefono: '',
      cirugia: '',
      fecha_cirugia: ''
    })
    setEnviado(false)
    setLink('')
    setCopiado(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f1f6fa] to-[#ffffff] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-10 border border-gray-200">
        {/* ENCABEZADO */}
        <div className="flex flex-col items-center mb-8 text-center">
          <Image
            src="/logo-reina.png"
            alt="Logo Clínica Reina Fabiola"
            width={80}
            height={80}
            className="mb-4"
          />
          <h1 className="text-2xl sm:text-3xl font-bold text-[#002E5D] leading-tight">
            Clínica Reina Fabiola
          </h1>
          <p className="text-sm text-gray-500">
            Panel Médico · Seguimiento Postoperatorio
          </p>
        </div>

        {/* FORMULARIO O CONFIRMACIÓN */}
        {!enviado ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {[
              { name: 'nombre', label: 'Nombre completo', type: 'text' },
              { name: 'dni', label: 'DNI', type: 'text' },
              { name: 'telefono', label: 'Teléfono de contacto', type: 'tel' },
              { name: 'cirugia', label: 'Tipo de cirugía', type: 'text' },
              { name: 'fecha_cirugia', label: 'Fecha de cirugía', type: 'date' }
            ].map(({ name, label, type }) => (
              <div key={name} className="relative">
                <input
                  type={type}
                  name={name}
                  value={(form as any)[name]}
                  onChange={handleChange}
                  required
                  placeholder=" "
                  className="peer w-full border-b-2 border-gray-300 focus:border-sky-700 px-2 pt-6 pb-2 bg-transparent text-gray-800 placeholder-transparent focus:outline-none transition-all"
                />
                <label
                  htmlFor={name}
                  className="absolute left-2 top-1 text-sm text-gray-500 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 transition-all"
                >
                  {label}
                </label>
              </div>
            ))}

            <button
              type="submit"
              className="w-full bg-[#002E5D] text-white py-3 rounded-xl hover:bg-[#004088] transition-all font-semibold shadow-md"
            >
              Guardar paciente y generar link
            </button>
          </form>
        ) : (
          <div className="space-y-5 text-center">
            <div className="bg-[#E6F7EC] border border-[#B6E1C2] p-6 rounded-2xl shadow-inner">
              <h2 className="text-green-700 font-bold text-lg mb-2">✅ Paciente registrado</h2>
              <p className="text-gray-700 mb-2">Compartí este link para completar el seguimiento:</p>
              <div className="bg-gray-100 p-3 rounded-md text-sm border border-gray-300 break-all select-all">
                {link}
              </div>
              <button
                onClick={copiarLink}
                className="mt-3 px-4 py-2 bg-[#0051A3] text-white rounded-lg hover:bg-[#003e7c] transition-all"
              >
                {copiado ? '📋 Link copiado' : '📎 Copiar link'}
              </button>
            </div>

            <button
              onClick={resetForm}
              className="text-sm text-sky-700 underline hover:text-sky-900"
            >
              + Cargar otro paciente
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
