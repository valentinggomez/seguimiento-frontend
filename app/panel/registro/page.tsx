'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { motion } from 'framer-motion'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function RegistroPaciente() {
  const [form, setForm] = useState({
    nombre: '',
    dni: '',
    telefono: '',
    cirugia: '',
    fecha_cirugia: '',
    nombre_medico: '',
    edad: '',
    sexo: '',
    peso: '',
    altura: '',
    imc: '',
    bloqueo: '',
    dosis_ketorolac: '',
    dosis_dexametasona: '',
    dosis_dexmedetomidina: '',
    dosis_ketamina: '',
    esquema_analgesico: '',
    paracetamol_previo: ''
  })

  const [enviado, setEnviado] = useState(false)
  const [link, setLink] = useState('')
  const [copiado, setCopiado] = useState(false)
  const [errores, setErrores] = useState<Partial<Record<string, string>>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const campos = Object.entries(form)
    const vacios = campos.filter(([_, val]) => val.trim() === '')
    if (vacios.length > 0) {
      alert('⚠️ Por favor, completá todos los campos obligatorios.')
      return
    }

    const [d, m, y] = form.fecha_cirugia.split('/')
    const dia = parseInt(d, 10)
    const mes = parseInt(m, 10)
    const anio = parseInt(y, 10)

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const fechaIngresada = new Date(`${anio}-${mes}-${dia}`)

    if (
      isNaN(dia) || isNaN(mes) || isNaN(anio) ||
      dia < 1 || dia > 31 ||
      mes < 1 || mes > 12 ||
      fechaIngresada > hoy
    ) {
      alert('⚠️ La fecha de cirugía no es válida. Verificá día, mes y que no sea futura.')
      return
    }

    const paciente = {
      ...form,
      fecha_cirugia: `${y}-${m}-${d}`
    }
    // Convertir dosis a float, aceptando coma o punto
    const camposDosis = ['dosis_ketorolac', 'dosis_dexametasona', 'dosis_dexmedetomidina', 'dosis_ketamina']

    camposDosis.forEach((campo) => {
      const valor = form[campo as keyof typeof form]
      paciente[campo] = parseFloat((valor as string).replace(',', '.'))
    })

    // Validar que las dosis sean números válidos
    for (const campo of camposDosis) {
      if (isNaN(paciente[campo])) {
        alert(`⚠️ El campo ${campo.replace('dosis_', '').toUpperCase()} debe ser un número válido.`)
        return
      }
    }

    const { data, error } = await supabase.from('pacientes').insert([paciente]).select()
    if (error || !data || !data[0]) {
      alert('❌ Error al guardar el paciente')
      console.error(error)
      return
    }

    const nuevoId = data[0].id
    setLink(`${window.location.origin}/seguimiento/${nuevoId}`)
    setEnviado(true)
  }

  const copiarLink = () => {
    navigator.clipboard.writeText(link)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const resetForm = () => {
    setForm({
      nombre: '',
      dni: '',
      telefono: '',
      cirugia: '',
      fecha_cirugia: '',
      nombre_medico: '',
      edad: '',
      sexo: '',
      peso: '',
      altura: '',
      imc: '',
      bloqueo: '',
      dosis_ketorolac: '',
      dosis_dexametasona: '',
      dosis_dexmedetomidina: '',
      dosis_ketamina: '',
      esquema_analgesico: '', 
      paracetamol_previo: ''
    })
    setEnviado(false)
    setLink('')
    setCopiado(false)
  }

  return (
    <main className="min-h-screen bg-[#f9fafb] px-4 py-14 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl bg-white/90 border border-gray-200 backdrop-blur-md shadow-xl rounded-3xl p-10"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#003466] tracking-tight">Registro de Paciente</h1>
          <p className="text-sm text-gray-500 mt-1">Unidad de Dolor Agudo Postoperatorio (UDAP)</p>
        </div>
        <div className="mb-6">
          <a
            href="/"
            className="inline-block bg-white border border-gray-300 text-[#004080] px-4 py-2 rounded-lg shadow hover:bg-gray-50 transition"
          >
            ← Volver al inicio
          </a>
        </div>


        {!enviado ? (
          <form onSubmit={handleSubmit} className="space-y-7">

            {/* CAMPOS INICIALES */}
            {[
              { name: 'nombre', label: 'Nombre completo', type: 'text' },
              { name: 'dni', label: 'DNI', type: 'text' },
              { name: 'edad', label: 'Edad', type: 'number' }
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
                  className={`peer w-full px-3 pt-6 pb-2 border ${
                    errores[name]
                      ? 'border-red-500 shadow-sm shadow-red-100 animate-shake'
                      : (form as any)[name].trim() === ''
                      ? 'border-gray-300'
                      : 'border-[#004080]'
                  } rounded-xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#004080] transition-all`}
                />
                <label
                  htmlFor={name}
                  className="absolute left-3 top-2.5 text-sm text-gray-500 peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#004080] peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 transition-all"
                >
                  {label}
                </label>
              </div>
            ))}

            {/* CAMPOS NUEVOS DE BLOQUE 2 */}
            {/* SEXO */}
            <div className="relative">
              <select
                name="sexo"
                value={form.sexo}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#004080] transition"
              >
                <option value="" disabled hidden>Seleccionar sexo</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            {/* PESO */}
            <div className="relative">
              <input
                type="number"
                step="any"
                name="peso"
                value={form.peso}
                onChange={(e) => {
                  const peso = e.target.value
                  const altura = form.altura.replace(',', '.')
                  const imcCalc = peso && altura ? (parseFloat(peso.replace(',', '.')) / Math.pow(parseFloat(altura), 2)).toFixed(2) : ''
                  setForm({ ...form, peso, imc: imcCalc })
                }}
                required
                placeholder=" "
                autoComplete="off"
                className="peer w-full px-3 pt-6 pb-2 border border-gray-300 rounded-xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#004080] transition-all"
              />
              <label className="absolute left-3 top-2.5 text-sm text-gray-500 peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#004080] peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 transition-all">
                Peso (kg)
              </label>
            </div>

            {/* ALTURA */}
            <div className="relative">
              <input
                type="number"
                step="any"
                name="altura"
                value={form.altura}
                onChange={(e) => {
                  const altura = e.target.value
                  const peso = form.peso.replace(',', '.')
                  const imcCalc = peso && altura ? (parseFloat(peso) / Math.pow(parseFloat(altura.replace(',', '.')), 2)).toFixed(2) : ''
                  setForm({ ...form, altura, imc: imcCalc })
                }}
                required
                placeholder=" "
                autoComplete="off"
                className="peer w-full px-3 pt-6 pb-2 border border-gray-300 rounded-xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#004080] transition-all"
              />
              <label className="absolute left-3 top-2.5 text-sm text-gray-500 peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#004080] peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 transition-all">
                Altura (m)
              </label>
            </div>

            {/* IMC (solo lectura) */}
            <div className="relative">
              <input
                type="text"
                name="imc"
                value={form.imc}
                readOnly
                placeholder=" "
                className="w-full px-3 pt-6 pb-2 border border-gray-300 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              <label className="absolute left-3 top-2.5 text-sm text-gray-500">
                IMC (calculado)
              </label>
            </div>

            {/* SIGUE CON TELEFONO Y CIRUGÍA */}
            {[
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
                  className={`peer w-full px-3 pt-6 pb-2 border ${
                    errores[name]
                      ? 'border-red-500 shadow-sm shadow-red-100 animate-shake'
                      : (form as any)[name].trim() === ''
                      ? 'border-gray-300'
                      : 'border-[#004080]'
                  } rounded-xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#004080] transition-all`}
                />
                <label
                  htmlFor={name}
                  className="absolute left-3 top-2.5 text-sm text-gray-500 peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#004080] peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 transition-all"
                >
                  {label}
                </label>
              </div>
            ))}

            {/* FECHA DE CIRUGÍA CON FORMATO dd/mm/aaaa */}
            <div className="relative">
              <input
                type="text"
                name="fecha_cirugia"
                value={form.fecha_cirugia}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, '')
                  if (val.length >= 3 && val.length <= 4)
                    val = val.replace(/(\d{2})(\d+)/, '$1/$2')
                  else if (val.length >= 5)
                    val = val.replace(/(\d{2})(\d{2})(\d+)/, '$1/$2/$3')

                  const fecha = val.slice(0, 10)
                  setForm({ ...form, fecha_cirugia: fecha })

                  // Validación progresiva
                  const [d, m, y] = fecha.split('/')
                  const dia = parseInt(d, 10)
                  const mes = parseInt(m, 10)
                  const anio = parseInt(y, 10)
                  const fechaIngresada = new Date(`${anio}-${mes}-${dia}`)
                  const hoy = new Date()
                  hoy.setHours(0, 0, 0, 0)

                  let esInvalida = false
                  if (fecha.length >= 2 && (dia < 1 || dia > 31)) esInvalida = true
                  if (fecha.length >= 5 && (mes < 1 || mes > 12)) esInvalida = true
                  if (fecha.length === 10 && fechaIngresada > hoy) esInvalida = true

                  setErrores((prev) => ({
                    ...prev,
                    fecha_cirugia: esInvalida ? 'Fecha inválida' : ''
                  }))
                }}
                placeholder=" "
                maxLength={10}
                required
                autoComplete="off"
                className={`peer w-full px-3 pt-6 pb-2 border ${
                  errores.fecha_cirugia
                    ? 'border-red-500 shadow-sm shadow-red-100 animate-shake'
                    : form.fecha_cirugia.trim() === ''
                    ? 'border-gray-300'
                    : 'border-[#004080]'
                } rounded-xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#004080] transition-all`}
              />
              <label
                htmlFor="fecha_cirugia"
                className="absolute left-3 top-2.5 text-sm text-gray-500 peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#004080] peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 transition-all"
              >
                Fecha de cirugía (dd/mm/aaaa)
              </label>
              {errores.fecha_cirugia && (
                <p className="text-red-600 text-sm mt-1">{errores.fecha_cirugia}</p>
              )}
            </div>

            {/* CAJA DE DATOS CLÍNICOS AVANZADOS */}
            <div className="border border-gray-200 rounded-xl px-4 py-6 shadow-sm bg-blue-50 mt-6 space-y-5">
              <h3 className="text-[#004080] font-semibold mb-3 text-sm">Datos clínicos avanzados</h3>

              {[
                { name: 'bloqueo', label: 'Tipo de bloqueo' },
                { name: 'dosis_ketorolac', label: 'Ketorolac (mg)' },
                { name: 'dosis_dexametasona', label: 'Dexametasona (mg/kg)' },
                { name: 'dosis_dexmedetomidina', label: 'Dexmedetomidina (mcg/kg)' },
                { name: 'dosis_ketamina', label: 'Ketamina (mg/kg)' }
              ].map(({ name, label }) => (
                <div key={name} className="relative mb-5">
                  <input
                    type="text"
                    name={name}
                    value={(form as any)[name]}
                    onChange={handleChange}
                    required
                    placeholder=" "
                    autoComplete="off"
                    className={`peer w-full px-3 pt-6 pb-2 border ${
                      errores[name]
                        ? 'border-red-500 shadow-sm shadow-red-100 animate-shake'
                        : (form as any)[name].trim() === ''
                        ? 'border-gray-300'
                        : 'border-[#004080]'
                    } rounded-xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#004080] transition-all`}
                  />
                  <label
                    htmlFor={name}
                    className="absolute left-3 top-2.5 text-sm text-gray-500 peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#004080] peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 transition-all"
                  >
                    {label}
                  </label>
                </div>
              ))}

              {/* Esquema analgésico reglado */}
              <div className="relative mb-5">
                <textarea
                  name="esquema_analgesico"
                  value={form.esquema_analgesico}
                  onChange={handleChange}
                  required
                  placeholder="Esquema analgésico reglado"
                  className="w-full px-3 pt-4 pb-3 border border-gray-300 rounded-xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#004080] transition-all"
                />
              </div>

              {/* Paracetamol 1g 3 horas previas */}
              <div className="space-y-2 text-sm">
                <p className="font-medium text-gray-700">Paracetamol 1g 3 horas previas:</p>
                <div className="flex gap-4">
                  {['Sí', 'No'].map((valor) => (
                    <button
                      key={valor}
                      type="button"
                      onClick={() => setForm({ ...form, paracetamol_previo: valor })}
                      className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                        form.paracetamol_previo === valor
                          ? 'bg-[#004080] text-white border-[#004080]'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {valor}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* CAJA DE DATOS DEL MÉDICO */}
            <div className="border border-gray-200 rounded-xl p-4 shadow-sm bg-blue-50 mt-6">
              <h3 className="text-[#004080] font-semibold mb-3 text-sm">Datos del médico responsable</h3>

              {[
                { name: 'nombre_medico', label: 'Nombre del médico', type: 'text' }
              ].map(({ name, label, type }) => (
                <div key={name} className="relative mb-5">
                  <input
                    type={type}
                    name={name}
                    value={(form as any)[name]}
                    onChange={handleChange}
                    required
                    placeholder=" "
                    autoComplete="off"
                    className={`peer w-full px-3 pt-6 pb-2 border ${
                      errores[name]
                        ? 'border-red-500 shadow-sm shadow-red-100 animate-shake'
                        : (form as any)[name].trim() === ''
                        ? 'border-gray-300'
                        : 'border-[#004080]'
                    } rounded-xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#004080] transition-all`}
                  />
                  <label
                    htmlFor={name}
                    className="absolute left-3 top-2.5 text-sm text-gray-500 peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#004080] peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 transition-all"
                  >
                    {label}
                  </label>
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="w-full bg-[#004080] text-white py-3 rounded-lg hover:bg-[#002e5c] transition font-semibold shadow"
            >
              Guardar paciente y generar link
            </button>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-8 text-center"
          >
            <div className="border border-green-300 bg-green-50 rounded-2xl shadow-md px-6 py-8">
              <div className="flex items-center justify-center gap-3 mb-3 text-green-700">
                <span className="text-4xl">✅</span>
                <h2 className="text-2xl font-bold tracking-tight">
                  Paciente registrado correctamente
                </h2>
              </div>

              <p className="text-gray-700 mb-4 text-sm max-w-md mx-auto">
                Compartí este enlace con el paciente para que complete su formulario postoperatorio:
              </p>

              <div className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-800 font-mono break-words">
                {link}
              </div>

              <motion.button
                onClick={copiarLink}
                animate={copiado ? { scale: [1, 1.05, 1], backgroundColor: "#16a34a" } : {}}
                transition={{ duration: 0.3 }}
                className={`w-full mt-5 px-6 py-2.5 rounded-lg text-white font-semibold transition-all shadow-md inline-flex items-center justify-center gap-2 ${
                  copiado
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-[#004080] hover:bg-[#003466]'
                }`}
              >
                {copiado ? '✅ Link copiado' : '📋 Copiar link'}
              </motion.button>

              <button
                onClick={resetForm}
                className="w-full mt-4 px-5 py-2 rounded-lg bg-white border border-gray-300 text-[#004080] hover:bg-gray-50 hover:shadow transition font-medium"
              >
                + Cargar otro paciente
              </button>
            </div>
          </motion.div>
        )}

      </motion.div>
    </main>
  )
}
