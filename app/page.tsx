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

    // Convertir fecha de dd/mm/yyyy → yyyy-mm-dd
    const [dia, mes, anio] = form.fecha_cirugia.split('/')
    const fechaFormateada = `${anio}-${mes}-${dia}`

    const nuevoPaciente = {
        ...form,
        fecha_cirugia: fechaFormateada
    }

    const { data, error } = await supabase.from('pacientes').insert([nuevoPaciente]).select()

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
    <main className="min-h-screen bg-[#f9fbfc] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-10 border border-gray-100">
        {/* ENCABEZADO */}
        <div className="flex flex-col items-center mb-10 text-center">
          <Image
            src="/logo-reina.png"
            alt="Logo Clínica Reina Fabiola"
            width={90}
            height={90}
            className="mb-4"
          />
          <h1 className="text-3xl font-bold text-[#1a2c45]">Clínica Reina Fabiola</h1>
          <p className="text-sm text-gray-500">Panel Médico · Seguimiento Postoperatorio</p>
        </div>

        {!enviado ? (
          <form onSubmit={handleSubmit} className="space-y-7">
            {[
                { name: 'nombre', label: 'Nombre completo', type: 'text' },
                { name: 'dni', label: 'DNI', type: 'text' },
                { name: 'telefono', label: 'Teléfono de contacto', type: 'tel' },
                { name: 'cirugia', label: 'Tipo de cirugía', type: 'text' }
                ].map(({ name, label, type }) => (
                <div key={name} className="relative">
                    <input
                    type={type}
                    name={name}
                    value={(form as any)[name]}
                    onChange={handleChange}
                    required
                    placeholder=" "
                    autoComplete="off"
                    className="peer w-full px-3 pt-6 pb-2 border-b-2 border-gray-300 text-gray-800 bg-transparent focus:outline-none focus:border-[#004080] transition-all"
                    />
                    <label
                    htmlFor={name}
                    className="absolute left-3 top-2.5 text-sm text-gray-500 peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#004080] peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 transition-all"
                    >
                    {label}
                    </label>
                </div>
                ))}

                {/* CAMPO DE FECHA CON FORMATEO AUTOMÁTICO */}
                <div className="relative">
                <input
                    type="text"
                    name="fecha_cirugia"
                    value={form.fecha_cirugia}
                    onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '')
                    if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2)
                    if (val.length > 5) val = val.slice(0, 5) + '/' + val.slice(5, 9)
                    setForm({ ...form, fecha_cirugia: val })
                    }}
                    maxLength={10}
                    required
                    placeholder=" "
                    autoComplete="off"
                    className="peer w-full px-3 pt-6 pb-2 border-b-2 border-gray-300 text-gray-800 bg-transparent focus:outline-none focus:border-[#004080] transition-all"
                />
                <label
                    htmlFor="fecha_cirugia"
                    className="absolute left-3 top-2.5 text-sm text-gray-500 peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#004080] peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 transition-all"
                >
                    Fecha de cirugía (dd/mm/aaaa)
                </label>
                </div>

            <button
              type="submit"
              className="w-full bg-[#004080] text-white py-3 rounded-lg hover:bg-[#002e5c] transition font-semibold shadow"
            >
              Guardar paciente y generar link
            </button>
          </form>
        ) : (
          <div className="space-y-8 text-center">
            <div className="border border-[#cfe9dc] bg-[#f6fef9] rounded-2xl shadow-sm px-6 py-8">
                <div className="flex items-center justify-center gap-2 mb-3 text-green-700">
                <span className="text-xl">✅</span>
                <h2 className="text-xl font-semibold tracking-tight">Paciente registrado correctamente</h2>
                </div>

                <p className="text-gray-700 mb-4 text-sm">
                Compartí el siguiente enlace con el paciente para que complete el formulario postoperatorio:
                </p>

                <div className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-800 font-mono break-words">
                {link}
                </div>

                <button
                onClick={copiarLink}
                className="mt-5 px-6 py-2.5 text-white bg-[#004080] hover:bg-[#003466] transition rounded-lg shadow-md text-sm font-medium inline-flex items-center gap-2"
                >
                📎 {copiado ? 'Link copiado' : 'Copiar link'}
                </button>
            </div>

            <button
                onClick={resetForm}
                className="inline-flex items-center justify-center gap-2 mt-4 px-5 py-2 rounded-lg bg-white border border-gray-300 text-[#004080] hover:bg-gray-50 hover:shadow transition font-medium"
                >
                <span className="text-lg"></span> Cargar otro paciente
                </button>
            </div>
        )}
      </div>
    </main>
  )
}
