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
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-2xl border border-blue-200">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo-reina.png" alt="Logo Clínica" className="h-20 mb-3" />
          <h1 className="text-2xl font-bold text-blue-800">Seguimiento postoperatorio</h1>
          <p className="text-sm text-gray-600">Clínica Reina Fabiola</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg text-sm text-gray-800 mb-6 border border-blue-100 grid grid-cols-2 gap-4">
          <div><strong>👤 Nombre:</strong> {paciente.nombre}</div>
          <div><strong>🆔 DNI:</strong> {paciente.dni}</div>
          <div><strong>🏥 Cirugía:</strong> {paciente.cirugia}</div>
          <div><strong>📅 Fecha:</strong> {paciente.fecha_cirugia}</div>
        </div>

        {!enviado ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Inputs numéricos */}
            {[0, 1].map(i => (
              <div key={i}>
                <label className="block text-gray-700 font-medium mb-1">{preguntas[i]}</label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={respuestas[i]}
                  onChange={e => handleChange(i, e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}

            {/* Selects */}
            {[2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i}>
                <label className="block text-gray-700 font-medium mb-1">{preguntas[i]}</label>
                <select
                  value={respuestas[i]}
                  onChange={e => handleChange(i, e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar</option>
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                </select>
              </div>
            ))}

            {/* Satisfacción (1 a 5) */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">{preguntas[9]}</label>
              <select
                value={respuestas[9]}
                onChange={e => handleChange(9, e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar</option>
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={String(n)}>{n}</option>)}
              </select>
            </div>

            {/* Observaciones (textarea) */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">{preguntas[10]}</label>
              <textarea
                value={respuestas[10]}
                onChange={e => handleChange(10, e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 font-semibold rounded-lg hover:bg-blue-700 transition-all"
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
      </div>
    </main>
  )
}
