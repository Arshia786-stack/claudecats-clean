import PromptBar from './PromptBar'
import PromptChips from './PromptChips'
import ParsedListingCard from './ParsedListingCard'
import ImpactMessageCard from './ImpactMessageCard'
import LoadingState from './LoadingState'
import ErrorState from './ErrorState'

const EXAMPLES = [
  'I made too much jollof rice, 6 portions, pickup before 8pm, near dorm 4',
  'Extra veggie curry, serves 4, nut-free, available until 9pm at grad housing',
  'Leftover event sandwiches — 12 portions, pickup by 6pm, student union lobby',
]

export default function ProviderPanel({
  prompt, onChange, onSubmit, loading, error,
  parsedListing, onPublish, publishing,
  publishSuccess, impactMessage,
}) {
  const isIdle = !loading && !error && !parsedListing && !publishSuccess

  return (
    <div className="mx-auto w-full max-w-xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Share what you have
        </h1>
        <p className="mt-1.5 text-sm text-stone-500">
          Describe your food in plain language. We'll handle the rest.
        </p>
      </div>

      {/* Input — hide after successful publish */}
      {!publishSuccess && (
        <>
          <PromptBar
            value={prompt}
            onChange={onChange}
            onSubmit={onSubmit}
            loading={loading}
            placeholder="I made too much jollof rice, 6 portions, pickup before 8pm, near dorm 4…"
            submitLabel="Parse listing"
          />
          {isIdle && <PromptChips examples={EXAMPLES} onSelect={onChange} />}
        </>
      )}

      {loading && <LoadingState message="Reading your listing…" />}
      {error && <ErrorState message={error} onRetry={onSubmit} />}

      {parsedListing && !publishSuccess && (
        <ParsedListingCard
          listing={parsedListing}
          onPublish={onPublish}
          publishing={publishing}
        />
      )}

      {/* Success + impact message */}
      {publishSuccess && (
        <div>
          <div className="rounded-2xl border border-[var(--color-success)]/25 bg-[var(--color-success-light)] px-5 py-4">
            <p className="font-medium text-[var(--color-success)]">✓ Listing is live</p>
            <p className="mt-0.5 text-sm text-stone-600">
              Your food is visible to seekers nearby. Thank you.
            </p>
          </div>

          {publishing && <LoadingState message="Generating your impact note…" />}

          {impactMessage && <ImpactMessageCard impact={impactMessage} />}
        </div>
      )}
    </div>
  )
}
