'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { motion } from "framer-motion"

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
  '¿Cómo calificaría la atención recibida? (1 a 10)',
  '¿A cuántas horas pudo mover con normalidad la/s extremidades?',
  '¿Desea dejar alguna observación?'
]

export default function SeguimientoPaciente() {
  const { id } = useParams()
  const [paciente, setPaciente] = useState<any>(null)
  const [respuestas, setRespuestas] = useState<string[]>(Array(preguntas.length).fill(''))
  const [enviado, setEnviado] = useState(false)
  const [cargando, setCargando] = useState(false);

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
    e.preventDefault();

    if (cargando) return; // Evita envíos múltiples
    setCargando(true);

    const errores: string[] = [];

    for (let i = 0; i <= 1; i++) {
      const valor = Number(respuestas[i]);
      if (isNaN(valor) || valor < 0 || valor > 10) {
        errores.push(`La respuesta de dolor "${preguntas[i]}" debe ser un número entre 0 y 10.`);
      }
    }

    const satisfaccion = Number(respuestas[8]);
    if (isNaN(satisfaccion) || satisfaccion < 1 || satisfaccion > 10) {
      errores.push('La satisfacción debe ser un número entre 1 y 10.');
    }

    if (respuestas[10] && respuestas[10].length > 500) {
      errores.push('La observación no puede superar los 500 caracteres.');
    }

    const vacios = respuestas.some(r => r.trim() === '');
    if (vacios) {
      errores.push('Por favor completá todas las respuestas antes de enviar el formulario.');
    }

    if (errores.length > 0) {
      alert(errores.join('\n'));
      setCargando(false);
      return;
    }

    const body = { paciente_id: id, respuestas };
    let intentos = 0;
    let exito = false;

    while (intentos < 2 && !exito) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/respuestas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setEnviado(true);
          exito = true;
        } else {
          console.warn('❌ Falló el envío:', data);
          intentos++;
        }

      } catch (error) {
        console.error('❌ Error en fetch:', error);
        intentos++;
      }
    }

    if (!exito) {
      alert('No se pudo guardar la respuesta. Por favor, intentá de nuevo más tarde.');
    }

    setCargando(false);
  };

  if (!paciente) return <p className="text-center py-20">Cargando datos del paciente...</p>

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-2xl border border-blue-200">
        <div className="flex flex-col items-center text-center mb-8 mt-6">

          <h1 className="text-3xl font-bold text-blue-800 tracking-tight">
            Seguimiento postoperatorio - UDAP
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Unidad de Dolor Agudo Postoperatorio
          </p>
        </div>

        <div className="w-full bg-blue-50 border border-blue-200 rounded-xl shadow-sm p-4 mb-8 text-sm sm:text-base">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
            <p><strong>👤 Nombre:</strong> {paciente?.nombre}</p>
            <p><strong>🆔 DNI:</strong> {paciente?.dni}</p>
            <p><strong>🏥 Cirugía:</strong> {paciente?.cirugia}</p>
            <p><strong>📅 Fecha:</strong> {paciente?.fecha}</p>
          </div>
        </div>

        {!enviado ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Inputs numéricos */}
            {[0, 1].map(i => {
              const valor = Number(respuestas[i])
              const invalido = respuestas[i] !== '' && (isNaN(valor) || valor < 0 || valor > 10)

              return (
                <div key={i}>
                  <label className="block text-gray-700 font-medium mb-1">{preguntas[i]}</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={respuestas[i]}
                    onChange={e => handleChange(i, e.target.value)}
                    required
                    className={`w-full p-3 border rounded-lg focus:ring-2 transition-all ${
                      invalido
                        ? 'border-red-500 ring-red-400 focus:ring-red-400'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {invalido && (
                    <p className="text-red-600 text-sm mt-1">Ingresá un número entre 0 y 10</p>
                  )}
                </div>
              )
            })}

            {/* Selects */}
            {[2, 3, 4, 5, 6, 7].map(i => (
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

            {/* Satisfacción (1 a 10) */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">{preguntas[8]}</label>
              <input
                type="number"
                min={1}
                max={10}
                value={respuestas[8]}
                onChange={e => handleChange(8, e.target.value)}
                required
                className={`w-full p-3 border rounded-lg focus:ring-2 transition-all ${
                  respuestas[8] !== '' && (Number(respuestas[8]) < 1 || Number(respuestas[8]) > 10)
                    ? 'border-red-500 ring-red-400 focus:ring-red-400'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {respuestas[8] !== '' && (Number(respuestas[8]) < 1 || Number(respuestas[8]) > 10) && (
                <p className="text-red-600 text-sm mt-1">Debe ingresar un número entre 1 y 10</p>
              )}
            </div>

            {/* Horas para mover extremidades */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">{preguntas[9]}</label>
              <input
                type="number"
                min={0}
                value={respuestas[9]}
                onChange={e => handleChange(9, e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Observaciones (textarea) */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">{preguntas[10]}</label>
              <textarea
                value={respuestas[10]}
                onChange={e => handleChange(10, e.target.value)}
                required
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className={`w-full py-3 font-semibold rounded-xl shadow-md transition-all ${
                cargando ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {cargando ? 'Enviando...' : 'Enviar seguimiento'}
            </button>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center justify-center text-center bg-white border border-green-300 rounded-2xl shadow-2xl p-10 mt-10"
          >
            <span className="text-green-600 text-6xl mb-4">✅</span>

            <h2 className="text-3xl font-bold text-green-700 mb-2 tracking-tight">
              ¡Seguimiento enviado con éxito!
            </h2>

            <p className="text-gray-800 text-base max-w-md">
              Si tenés dudas, síntomas o querés agregar algo más, no dudes en comunicarte con nuestro equipo.
            </p>

            <p className="text-center text-xs text-gray-400 mt-8">
              Sistema desarrollado exclusivamente para UDAP – Unidad de Dolor Agudo Postoperatorio · Córdoba
            </p>
          </motion.div>
        )}
      </div>
    </main>
  )
}
