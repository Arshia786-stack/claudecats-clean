import { useState } from 'react'
import Header from './components/Header'
import ImpactCard from './components/ImpactCard'
import ProviderView from './components/ProviderView'
import SeekerView from './components/SeekerView'
import {
  generateImpactMessage,
  parseProviderListing,
  searchSeekerMatches,
} from './lib/mockApi'

const DEFAULT_SEEKER_PROMPT = 'I need food tonight, halal, and I only have a microwave.'
const DEFAULT_PROVIDER_PROMPT =
  'I made too much jollof rice, 6 portions, pickup before 8pm, near dorm 4.'

export default function App() {
  const [view, setView] = useState('seeker')

  const [seekerPrompt, setSeekerPrompt] = useState(DEFAULT_SEEKER_PROMPT)
  const [seekerLoading, setSeekerLoading] = useState(false)
  const [seekerError, setSeekerError] = useState('')
  const [parsedSeeker, setParsedSeeker] = useState(null)
  const [matches, setMatches] = useState([])
  const [activeMatchId, setActiveMatchId] = useState('')
  const [seekerReservation, setSeekerReservation] = useState('')

  const [providerPrompt, setProviderPrompt] = useState(DEFAULT_PROVIDER_PROMPT)
  const [providerLoading, setProviderLoading] = useState(false)
  const [providerError, setProviderError] = useState('')
  const [listingPreview, setListingPreview] = useState(null)
  const [publishState, setPublishState] = useState('idle')
  const [impactMessage, setImpactMessage] = useState(null)

  async function handleSeekerSubmit(nextPrompt) {
    const prompt = nextPrompt.trim()
    if (!prompt || seekerLoading) return

    setSeekerPrompt(prompt)
    setSeekerLoading(true)
    setSeekerError('')
    setParsedSeeker(null)
    setMatches([])
    setActiveMatchId('')
    setSeekerReservation('')

    try {
      const result = await searchSeekerMatches(prompt)
      setParsedSeeker(result.parsedIntent)
      setMatches(result.matches)
      setActiveMatchId(result.matches[0]?.id || '')
    } catch (error) {
      setSeekerError(error.message || 'We could not load matches right now.')
    } finally {
      setSeekerLoading(false)
    }
  }

  function handleReserve(match) {
    setActiveMatchId(match.id)
    setSeekerReservation(`Reserved ${match.title} for pickup ${match.pickupWindow.toLowerCase()}.`)
  }

  async function handleProviderParse(nextPrompt) {
    const prompt = nextPrompt.trim()
    if (!prompt || providerLoading) return

    setProviderPrompt(prompt)
    setProviderLoading(true)
    setProviderError('')
    setListingPreview(null)
    setPublishState('idle')
    setImpactMessage(null)

    try {
      const listing = await parseProviderListing(prompt)
      setListingPreview(listing)
    } catch (error) {
      setProviderError(error.message || 'We could not parse that listing.')
    } finally {
      setProviderLoading(false)
    }
  }

  async function handlePublish() {
    if (!listingPreview || publishState === 'publishing') return

    setPublishState('publishing')
    setProviderError('')

    try {
      const impact = await generateImpactMessage(listingPreview)
      setImpactMessage(impact)
      setPublishState('success')
    } catch (error) {
      setProviderError(error.message || 'The listing was parsed, but publishing failed.')
      setPublishState('idle')
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-cream)] text-stone-900">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(232,98,42,0.09),_transparent_42%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <Header view={view} onViewChange={setView} />

        <main className="flex-1 py-6 sm:py-8">
          {view === 'seeker' ? (
            <SeekerView
              prompt={seekerPrompt}
              loading={seekerLoading}
              error={seekerError}
              parsedIntent={parsedSeeker}
              matches={matches}
              activeMatchId={activeMatchId}
              reservationMessage={seekerReservation}
              onPromptChange={setSeekerPrompt}
              onSubmit={handleSeekerSubmit}
              onReserve={handleReserve}
            />
          ) : (
            <div className="space-y-5">
              <ProviderView
                prompt={providerPrompt}
                loading={providerLoading}
                error={providerError}
                listingPreview={listingPreview}
                publishState={publishState}
                onPromptChange={setProviderPrompt}
                onSubmit={handleProviderParse}
                onPublish={handlePublish}
              />
              {impactMessage ? <ImpactCard impact={impactMessage} /> : null}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
