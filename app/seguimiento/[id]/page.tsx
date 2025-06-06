'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const preguntas = [
  '¿Cuánto dolor tuvo a las 6 horas? (0-10)',
  '¿Cuánto dolor tuvo a las 24 horas? (0-10)',
  '¿Tuvo dolor mayor a 7 puntos?',
  '¿Tuvo náuseas?',
  '¿Tuvo vómitos?',
  '¿Tuvo somnolencia?',
  '¿Requirió medicación adicional?',
  '¿Despertó por dolor?',
  '¿Desea continuar el seguimiento?',
  '¿Cómo calificaría la atención recibida?',
  '¿Desea dejar alguna observación?'
]

export default function SeguimientoPaciente() {
  const { id } = useParams()
  const [paciente, setPaciente] = useState<any>(null)
  const [respuestas, setRespuestas] = useState<string[]>(Array(preguntas.length).fill(''))
  const [enviado, setEnviado] = useState(false)

  useEffect(() => {
    const fetchPaciente = async () => {
      const { data } = await supabase.from('pacientes').select('*').eq('id', id).single()
      setPaciente(data)
    }
    fetchPaciente()
  }, [id])

  const handleChange = (i: number, valor: string) => {
    const nuevas = [...respuestas]
    nuevas[i] = valor
    setRespuestas(nuevas)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const body = {
      paciente_id: Number(id),
      respuestas
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/respuestas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (res.ok) setEnviado(true)
    else alert('Error al enviar la respuesta.')
  }

  if (!paciente) return <p className="text-center py-20">Cargando datos del paciente...</p>

  return (
    <main className="min-h-screen bg-white px-4 py-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Seguimiento postoperatorio</h1>
        <p className="text-sm text-gray-500">Paciente: <strong>{paciente.nombre}</strong></p>
      </div>

      {!enviado ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {preguntas.map((texto, i) => (
            <div key={i}>
              <label className="block text-gray-700 mb-1">{texto}</label>
              <input
                type="text"
                value={respuestas[i]}
                onChange={e => handleChange(i, e.target.value)}
                required={i < 9}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all"
          >
            Enviar seguimiento
          </button>
        </form>
      ) : (
        <div className="bg-green-100 p-6 rounded-lg text-center shadow mt-10">
          <h2 className="text-xl font-semibold text-green-800 mb-2">✅ ¡Gracias por completar el seguimiento!</h2>
          <p className="text-gray-700">Tus respuestas fueron enviadas correctamente.</p>
        </div>
      )}
    </main>
  )
}
