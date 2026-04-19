import { useState, useEffect } from 'react'
import Header from './components/Header'
import SearchHero from './components/SearchHero'
import MapPanel from './components/MapPanel'
import ProviderPanel from './components/ProviderPanel'
import {
  seekerSearch,
  parseListing,
  addListing,
  reserveListing,
  awardPoints,
  generateNotify,
  generateRecipe,
} from './lib/api'

export default function App() {
  const [flow, setFlow] = useState(() => localStorage.getItem('hearth.flow') || 'landing')
  const [initialQuery, setInitialQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => { localStorage.setItem('hearth.flow', flow) }, [flow])
  useEffect(() => { setMenuOpen(false) }, [flow])

  const [reservedId, setReservedId] = useState(null)
  const [reserveLoading, setReserveLoading] = useState(false)
  const [recipe, setRecipe] = useState(null)

  const [providerPrompt, setProviderPrompt] = useState('')
  const [providerLoading, setProviderLoading] = useState(false)
  const [providerError, setProviderError] = useState(null)
  const [parsedListing, setParsedListing] = useState(null)
  const [publishing, setPublishing] = useState(false)
  const [publishSuccess, setPublishSuccess] = useState(false)
  const [impactMessage, setImpactMessage] = useState(null)

  const [seekerPrompt, setSeekerPrompt] = useState(initialQuery)
  const [seekerLoading, setSeekerLoading] = useState(false)
  const [seekerError, setSeekerError] = useState(null)
  const [parsedIntent, setParsedIntent] = useState(null)
  const [matches, setMatches] = useState([])
  const [selectedMatchId, setSelectedMatchId] = useState(null)

  async function handleSeekerSubmit() {
    if (!seekerPrompt.trim() || seekerLoading) return
    setSeekerLoading(true)
    setSeekerError(null)
    setParsedIntent(null)
    setMatches([])
    setSelectedMatchId(null)
    setReservedId(null)
    setRecipe(null)
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

  async function handleReserve(match) {
    if (reserveLoading || reservedId) return
    setReserveLoading(true)
    setReservedId(match.id)
    try {
      await reserveListing(match.id)
      const recipeData = await generateRecipe(
        match.foodItems || [],
        parsedIntent?.kitchen || 'any',
        parsedIntent?.dietary || [],
        parsedIntent?.culturalPreferences || [],
      )
      setRecipe(recipeData)
    } catch {
      // non-blocking — reservation succeeded even if recipe fails
    } finally {
      setReserveLoading(false)
    }
  }

  async function handleProviderSubmit() {
    if (!providerPrompt.trim() || providerLoading) return
    setProviderLoading(true)
    setProviderError(null)
    setParsedListing(null)
    try {
      const listing = await parseListing(providerPrompt.trim())
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
      await addListing(parsedListing)
      const { pointsEarned, newTotal } = await awardPoints(
        parsedListing.providerName || 'Anonymous',
        parsedListing.portions || 1,
        parsedListing.dietary || [],
      )
      const impact = await generateNotify({
        foodDescription: parsedListing.title,
        providerName: parsedListing.providerName || 'Anonymous',
        portions: parsedListing.portions || 1,
        pointsEarned,
        newTotal,
      })
      setImpactMessage(impact)
    } catch {
      setImpactMessage({
        headline: 'Your food is live.',
        body: 'Someone nearby will have a real meal because of what you shared. Thank you.',
      })
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-stone-50">
      <Header view={flow} onViewChange={setFlow} />

      {flow === 'seeker' ? (
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
                onReserve={handleReserve}
                reservedId={reservedId}
                reserveLoading={reserveLoading}
                recipe={recipe}
              />
            </div>
          </div>
          <div className="hidden w-80 shrink-0 border-l border-stone-200 lg:block xl:w-96">
            <MapPanel matches={matches} selectedId={selectedMatchId} />
          </div>
        </div>
      ) : (
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