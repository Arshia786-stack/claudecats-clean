import { useState } from 'react'
import Header from './components/Header'
import SearchHero from './components/SearchHero'
import MapPanel from './components/MapPanel'
import ProviderPanel from './components/ProviderPanel'
import { seekerSearch, submitProvider, generateImpactMessage } from './lib/mockApi'

export default function App() {
  const [view, setView] = useState('seeker')

  // Seeker state
  const [seekerPrompt, setSeekerPrompt] = useState('')
  const [seekerLoading, setSeekerLoading] = useState(false)
  const [seekerError, setSeekerError] = useState(null)
  const [parsedIntent, setParsedIntent] = useState(null)
  const [matches, setMatches] = useState([])
  const [selectedMatchId, setSelectedMatchId] = useState(null)

  // Provider state
  const [providerPrompt, setProviderPrompt] = useState('')
  const [providerLoading, setProviderLoading] = useState(false)
  const [providerError, setProviderError] = useState(null)
  const [parsedListing, setParsedListing] = useState(null)
  const [publishing, setPublishing] = useState(false)
  const [publishSuccess, setPublishSuccess] = useState(false)
  const [impactMessage, setImpactMessage] = useState(null)

  async function handleSeekerSubmit() {
    if (!seekerPrompt.trim() || seekerLoading) return
    setSeekerLoading(true)
    setSeekerError(null)
    setParsedIntent(null)
    setMatches([])
    setSelectedMatchId(null)
    try {
      const { intent, matches: results } = await seekerSearch(seekerPrompt.trim())
      setParsedIntent(intent)
      setMatches(results)
      if (results.length) setSelectedMatchId(results[0].id)
    } catch (err) {
      setSeekerError(err.message)
    } finally {
      setSeekerLoading(false)
    }
  }

  async function handleProviderSubmit() {
    if (!providerPrompt.trim() || providerLoading) return
    setProviderLoading(true)
    setProviderError(null)
    setParsedListing(null)
    try {
      const listing = await submitProvider(providerPrompt.trim())
      setParsedListing(listing)
    } catch (err) {
      setProviderError(err.message)
    } finally {
      setProviderLoading(false)
    }
  }

  async function handlePublish() {
    setPublishing(true)
    setPublishSuccess(true)
    try {
      const impact = await generateImpactMessage(parsedListing)
      setImpactMessage(impact)
    } finally {
      setPublishing(false)
    }
  }

  function handleViewChange(next) {
    setView(next)
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-stone-50">
      <Header view={view} onViewChange={handleViewChange} />

      {view === 'seeker' ? (
        // Split layout: scrollable results + fixed map
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto px-8 py-8">
            <div className="mx-auto max-w-xl">
              <SearchHero
                prompt={seekerPrompt}
                onChange={setSeekerPrompt}
                onSubmit={handleSeekerSubmit}
                loading={seekerLoading}
                error={seekerError}
                parsedIntent={parsedIntent}
                matches={matches}
                selectedMatchId={selectedMatchId}
                onSelectMatch={setSelectedMatchId}
              />
            </div>
          </div>
          <div className="hidden w-80 shrink-0 border-l border-stone-200 lg:block xl:w-96">
            <MapPanel matches={matches} selectedId={selectedMatchId} />
          </div>
        </div>
      ) : (
        // Single column centered layout for provider
        <div className="min-h-0 flex-1 overflow-y-auto px-8 py-8">
          <ProviderPanel
            prompt={providerPrompt}
            onChange={setProviderPrompt}
            onSubmit={handleProviderSubmit}
            loading={providerLoading}
            error={providerError}
            parsedListing={parsedListing}
            onPublish={handlePublish}
            publishing={publishing}
            publishSuccess={publishSuccess}
            impactMessage={impactMessage}
          />
        </div>
      )}
    </div>
  )
}
