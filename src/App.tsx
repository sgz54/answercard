import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import DynamicBackground from '@/components/DynamicBackground'
import Layout from '@/components/Layout'
import Welcome, { hasSeenWelcome } from '@/components/Welcome'
import Home from '@/pages/Home'
import Casting from '@/pages/Casting'
import Answer from '@/pages/Answer'
import History from '@/pages/History'
import Profile from '@/pages/Profile'

export default function App() {
  const [entered, setEntered] = useState(() => hasSeenWelcome())

  if (!entered) {
    return (
      <div className="min-h-full bg-gradient-to-b from-bamboo-900 to-ink">
        <Welcome onEnter={() => setEntered(true)} />
      </div>
    )
  }

  return (
    <>
      <DynamicBackground />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/casting" element={<Casting />} />
          <Route path="/answer/:id" element={<Answer />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Layout>
    </>
  )
}
