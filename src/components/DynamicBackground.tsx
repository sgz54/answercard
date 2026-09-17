import { useEffect, useState } from 'react'
import { currentShichen } from '@/data/shichen'

/** Full-viewport gradient that shifts with the active 时辰. */
export default function DynamicBackground() {
  const [shichen, setShichen] = useState(() => currentShichen())

  useEffect(() => {
    const t = setInterval(() => setShichen(currentShichen()), 10_000)
    return () => clearInterval(t)
  }, [])

  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 transition-[background] duration-[3000ms] ease-in-out"
      style={{
        background: `linear-gradient(180deg, ${shichen.gradient[0]} 0%, ${shichen.gradient[1]} 100%)`,
      }}
    />
  )
}
