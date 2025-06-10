'use client'
import { useRouter } from 'next/navigation'
import { FaUserPlus, FaHeartbeat } from 'react-icons/fa'
import { motion } from 'framer-motion'

export default function Inicio() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-white-100 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-xl w-full bg-white border border-gray-200 rounded-3xl shadow-2xl p-10 space-y-10"
      >
        <div className="flex justify-center">
          <img
            src="/udap-logo.jpg"
            alt="UDAP - Unidad de Dolor Agudo Postoperatorio"
            className="w-48 sm:w-64 md:w-72 h-auto object-contain" 
          />
        </div>

        <div className="space-y-6">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/panel/registro')}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-[#004080] text-white font-semibold hover:bg-[#002e5c] shadow-lg transition-all"
          >
            <FaUserPlus className="text-xl" />
            Registrar nuevo paciente
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/panel/respuestas')}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-red-100 text-red-800 font-semibold hover:bg-red-200 shadow-md transition-all"
          >
            <FaHeartbeat className="text-xl" />
            Ver respuestas y alertas clínicas
          </motion.button>
        </div>
      </motion.div>
    </main>
  )
}
