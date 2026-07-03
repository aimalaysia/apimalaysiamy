import { Routes, Route } from 'react-router-dom'
import { MeshBackground } from '../components/layout/MeshBackground.tsx'
import { Navbar } from '../components/layout/Navbar.tsx'
import { Footer } from '../components/layout/Footer.tsx'
import { DirectoryPage } from './pages/DirectoryPage.tsx'
import { PlaygroundPage } from './pages/PlaygroundPage.tsx'
import { SubmitPage } from './pages/SubmitPage.tsx'

export default function App() {
  return (
    <div className="min-h-screen bg-[#0a0e27] text-zinc-100 relative">
      <MeshBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<DirectoryPage />} />
            <Route path="/playground" element={<PlaygroundPage />} />
            <Route path="/submit" element={<SubmitPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  )
}
