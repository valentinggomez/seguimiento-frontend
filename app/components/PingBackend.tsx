'use client'

import { useEffect } from 'react'

export default function PingBackend() {
  useEffect(() => {
    fetch('https://seguimiento-backend-dev.onrender.com/ping').catch(() => {})
  }, [])

  return null
}
