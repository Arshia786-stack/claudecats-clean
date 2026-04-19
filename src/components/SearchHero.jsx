import PromptBar from './PromptBar'
import PromptChips from './PromptChips'
import MatchList from './MatchList'
import RecipeCard from './RecipeCard'
import EmptyState from './EmptyState'
import LoadingState from './LoadingState'
import ErrorState from './ErrorState'

const EXAMPLES = [
  'I need food tonight, halal, and I only have a microwave',
  'Looking for something vegan, can pick up by 7pm',
  'Anything gluten-free near campus?',
]

const dietaryStyle = {
  halal: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  vegan: 'bg-green-50 text-green-700 border-green-200',
  vegetarian: 'bg-lime-50 text-lime-700 border-lime-200',
  'gluten-free': 'bg-sky-50 text-sky-700 border-sky-200',
  'nut-free': 'bg-amber-50 text-amber-700 border-amber-200',
}

function IntentTags({ intent }) {
  const tags = [
    ...intent.dietary,
    intent.urgency !== 'flexible' ? intent.urgency : null,
    intent.kitchen !== 'any' ? intent.kitchen : null,
  ].filter(Boolean)

  if (!tags.length) return null

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="text-xs text-stone-400">Understood:</span>
      {tags.map((tag) => (
        <span
          key={tag}
          className={[
            'rounded-full border px-2.5 py-0.5 text-[11px] font-medium',
            dietaryStyle[tag] || 'border-stone-200 bg-stone-50 text-stone-600',
          ].join(' ')}
        >
          {tag}
        </span>
      ))}
    </div>
  )
}

export default function SearchHero({
  prompt, onChange, onSubmit, loading, error,
  parsedIntent, matches, selectedMatchId, onSelectMatch,
  onReserve, reservedId, reserveLoading, recipe,
}) {
  const hasResults = matches.length > 0
  const isIdle = !loading && !error && !parsedIntent
  const reservedMatch = reservedId ? matches.find((m) => m.id === reservedId) : null

  return (
    <div className="flex flex-col">
      {isIdle && (
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
            Find food in your community
          </h1>
          <p className="mt-1.5 text-sm text-stone-500">
            Describe what you need. No account. No judgment.
          </p>
        </div>
      )}

      <PromptBar
        value={prompt}
        onChange={onChange}
        onSubmit={onSubmit}
        loading={loading}
        placeholder="I need food tonight, halal, and I only have a microwave…"
        submitLabel="Find food"
      />

      {isIdle && <PromptChips examples={EXAMPLES} onSelect={onChange} />}

      {loading && <LoadingState message="Finding what's nearby…" />}
      {error && <ErrorState message={error} onRetry={onSubmit} />}
      {parsedIntent && !loading && <IntentTags intent={parsedIntent} />}

      {hasResults && !loading && (
        <MatchList
          matches={matches}
          selectedId={selectedMatchId}
          onSelect={onSelectMatch}
          onReserve={onReserve}
          reservedId={reservedId}
          reserveLoading={reserveLoading}
        />
      )}

      {reservedMatch && !reserveLoading && !recipe && (
        <div className="mt-5 rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-500">
          Generating your recipe…
        </div>
      )}

      {recipe && <RecipeCard recipe={recipe} />}

      {isIdle && <EmptyState />}
    </div>
  )
}
