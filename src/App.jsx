import { useState, useEffect } from 'react'
import TopBar from './components/TopBar'
import Landing from './components/Landing'
import SeekerFlow from './components/SeekerFlow'
import ProviderFlow from './components/ProviderFlow'
import SponsorFlow from './components/SponsorFlow'
import FoodLibrary from './components/FoodLibrary'

export default function App() {
  const [flow, setFlow] = useState(() => localStorage.getItem('full.flow') || 'landing')
  const [initialQuery, setInitialQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => { localStorage.setItem('full.flow', flow) }, [flow])
  useEffect(() => { setMenuOpen(false) }, [flow])

  const goToSeeker = (q) => { setInitialQuery(q); setFlow('seeker') }

  return (
    <>
      <TopBar current={flow} onFlow={setFlow} menuOpen={menuOpen} onOpenMenu={() => setMenuOpen(o => !o)}/>

      <div>
        {flow === 'landing' && <Landing onFlow={setFlow} onStartSeeker={goToSeeker}/>}
        {flow === 'seeker' && <SeekerFlow initialQuery={initialQuery}/>}
        {flow === 'provider' && <ProviderFlow/>}
        {flow === 'sponsor' && <SponsorFlow/>}
        {flow === 'library' && <FoodLibrary/>}
      </div>
    </>
  )
}
