import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/client'

const HealthContext = createContext(null)

export function HealthProvider({ children }) {
  const [health, setHealth] = useState({ backend: false, database: false, realtime: false, checking: true })

  useEffect(() => {
    let mounted = true
    const check = async () => {
      try {
        const data = await api.health()
        if (mounted) setHealth({ ...data, checking: false })
      } catch {
        if (mounted) setHealth({ backend: false, database: false, realtime: false, checking: false })
      }
    }
    check()
    const interval = setInterval(check, 10000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  return <HealthContext.Provider value={health}>{children}</HealthContext.Provider>
}

export { HealthContext }