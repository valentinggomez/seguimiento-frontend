'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import { motion } from 'framer-motion'

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

    if (error) {
      alert('❌ Error al guardar el paciente')
      console.error(error)
    } else if (data && data[0]) {
      const nuevoId = data[0].id
      const url = `${window.location.origin}/seguimiento/${nuevoId}`
      setLink(url)
      setEnviado(true)
      setCopiado(false)
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
    <main className="min-h-screen bg-gradient-to-br from-sky-100 to-white flex items-center justify-center px-4 py-8">
      <motion.div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-8 border border-gray-200"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logo-reina.png"
            alt="Logo Reina Fabiola"
            width={90}
            height={90}
            className="mb-4"
          />
          <h1 className="text-3xl font-bold text-center text-sky-900">
            Panel Médico · Carga de Pacientes
          </h1>
          <p className="text-sm text-sky-600 mt-1 text-center">
            Sistema Digital de Seguimiento Postoperatorio
          </p>
        </div>

        {!enviado ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {[
              { label: 'Nombre completo', name: 'nombre', type: 'text' },
              { label: 'DNI', name: 'dni', type: 'text' },
              { label: 'Teléfono', name: 'telefono', type: 'tel' },
              { label: 'Tipo de cirugía', name: 'cirugia', type: 'text' },
              { label: 'Fecha de cirugía', name: 'fecha_cirugia', type: 'date' }
            ].map(({ label, name, type }) => (
              <div key={name} className="relative group">
                <input
                  type={type}
                  name={name}
                  value={(form as any)[name]}
                  onChange={handleChange}
                  required
                  placeholder=" "
                  className="peer w-full px-3 pt-6 pb-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <label
                  htmlFor={name}
                  className="absolute left-3 top-2 text-gray-500 text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 transition-all"
                >
                  {label}
                </label>
              </div>
            ))}

            <button
              type="submit"
              className="w-full bg-sky-700 text-white py-3 rounded-lg hover:bg-sky-800 transition font-semibold shadow-md"
            >
              Guardar y generar link
            </button>
          </form>
        ) : (
          <div className="space-y-4 text-center">
            <div className="bg-green-50 p-6 rounded-xl shadow-inner border border-green-200">
              <h2 className="text-xl font-semibold text-green-700 mb-2">✅ Paciente registrado</h2>
              <p className="text-gray-700 mb-2">
                Compartí este link con el paciente para que complete el formulario:
              </p>
              <div className="bg-gray-100 p-3 rounded-lg break-all text-sm border border-gray-300">
                {link}
              </div>

              <button
                onClick={copiarLink}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                {copiado ? '📋 Copiado' : '📎 Copiar link'}
              </button>
            </div>

            <button
              onClick={resetForm}
              className="mt-4 text-sm text-sky-600 underline hover:text-sky-800 transition"
            >
              + Cargar otro paciente
            </button>
          </div>
        )}
      </motion.div>
    </main>
  )
}
