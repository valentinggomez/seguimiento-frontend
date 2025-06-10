import './globals.css'
import { Inter } from 'next/font/google'
import AnimatedLayout from './components/AnimatedLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Seguimiento Postoperatorio',
  description: 'Sistema digital para seguimiento de pacientes post cirugía',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen antialiased`}>
        <AnimatedLayout>{children}</AnimatedLayout>
      </body>
    </html>
  )
}
