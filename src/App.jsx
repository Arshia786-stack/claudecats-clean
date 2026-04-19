import { useState, useEffect } from 'react'
import TopBar from './components/TopBar'
import Landing from './components/Landing'
import SeekerFlow from './components/SeekerFlow'
import ProviderFlow from './components/ProviderFlow'
import SponsorFlow from './components/SponsorFlow'

export default function App() {
  const [flow, setFlow] = useState(() => localStorage.getItem('hearth.flow') || 'landing')
  const [initialQuery, setInitialQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => { localStorage.setItem('hearth.flow', flow) }, [flow])
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
      </div>

      <div className="flowbar">
        {[
          { id: 'landing', label: 'Landing' },
          { id: 'seeker', label: 'Seeker' },
          { id: 'provider', label: 'Provider' },
          { id: 'sponsor', label: 'Sponsor' },
        ].map(f => (
          <button key={f.id} onClick={() => setFlow(f.id)} className={flow === f.id ? 'active' : ''}>
            {f.label}
          </button>
        ))}
      </div>
    </>
  )
}
