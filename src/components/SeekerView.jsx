import MatchCard from './MatchCard'

const examplePrompts = [
  'I need food tonight, halal, and I only have a microwave.',
  'Something vegetarian I can pick up in the next hour.',
  'I need dinner near campus and I cannot have nuts.',
]

export default function SeekerView({
  prompt,
  loading,
  error,
  parsedIntent,
  matches,
  activeMatchId,
  reservationMessage,
  onPromptChange,
  onSubmit,
  onReserve,
}) {
  return (
    <section className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
      <div className="space-y-5">
        <div className="rounded-[32px] border border-white/80 bg-white px-6 py-6 shadow-[0_24px_60px_rgba(28,20,14,0.08)] sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-hearth)]">
                Find dinner naturally
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
                Describe what you need in your own words.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-stone-600 sm:text-base">
                Hearth turns a plain-language request into nearby food options that fit
                timing, dietary needs, and your kitchen setup.
              </p>
            </div>
            <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-stone-700">
              <p className="font-medium text-stone-900">Campus tonight</p>
              <p className="mt-1 text-stone-500">3 minute to 12 minute pickup range</p>
            </div>
          </div>

          <div className="mt-6 rounded-[28px] border border-stone-200 bg-[var(--color-card-soft)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
            <label htmlFor="seeker-prompt" className="sr-only">
              Describe your food need
            </label>
            <textarea
              id="seeker-prompt"
              value={prompt}
              onChange={(event) => onPromptChange(event.target.value)}
              rows={4}
              className="w-full resize-none border-0 bg-transparent p-0 text-base leading-7 text-stone-900 outline-none placeholder:text-stone-400"
              placeholder="I need food tonight, halal, and I only have a microwave."
            />
            <div className="mt-4 flex flex-col gap-3 border-t border-stone-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {examplePrompts.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => onPromptChange(example)}
                    className="rounded-full border border-stone-200 bg-white px-3 py-2 text-sm text-stone-600 transition hover:border-orange-200 hover:text-[var(--color-hearth)]"
                  >
                    {example}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => onSubmit(prompt)}
                disabled={loading}
                className="rounded-full bg-[var(--color-hearth)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(232,98,42,0.24)] transition hover:bg-[var(--color-hearth-dark)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Finding nearby meals...' : 'Find food'}
              </button>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 shadow-sm">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[290px] animate-pulse rounded-[28px] border border-stone-200 bg-white shadow-sm"
              />
            ))}
          </div>
        ) : null}

        {!loading && !error && matches.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {matches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                active={match.id === activeMatchId}
                onReserve={() => onReserve(match)}
              />
            ))}
          </div>
        ) : null}

        {!loading && !error && parsedIntent && matches.length === 0 ? (
          <div className="rounded-[28px] border border-stone-200 bg-white px-6 py-6 text-sm text-stone-600 shadow-sm">
            We understood the request, but there are no strong fits nearby right now. Try
            broadening timing, pickup area, or dietary filters.
          </div>
        ) : null}

        {!loading && !error && !parsedIntent ? (
          <div className="rounded-[28px] border border-dashed border-stone-300 bg-white/70 px-6 py-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-stone-900">Start with a natural request</p>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              Mention timing, dietary fit, kitchen setup, or location. Hearth will surface
              the best nearby options without making this feel like a form.
            </p>
          </div>
        ) : null}
      </div>

      <aside className="space-y-5">
        <div className="rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_24px_60px_rgba(28,20,14,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
            Parsed need
          </p>
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-stone-900">
            Quietly turning language into signal
          </h2>

          <div className="mt-5 flex flex-wrap gap-2">
            {(parsedIntent?.tags || []).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-medium text-[var(--color-hearth)]"
              >
                {tag}
              </span>
            ))}
            {!parsedIntent ? (
              <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-500">
                Waiting for a request
              </span>
            ) : null}
          </div>

          <div className="mt-5 space-y-4">
            {[
              ['Urgency', parsedIntent?.urgency || 'Not set yet'],
              ['Dietary fit', parsedIntent?.dietary || 'Will infer from prompt'],
              ['Kitchen setup', parsedIntent?.kitchen || 'Will infer from prompt'],
              ['Timing', parsedIntent?.timing || 'Flexible until asked'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-stone-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                  {label}
                </p>
                <p className="mt-2 text-sm font-medium text-stone-800">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_24px_60px_rgba(28,20,14,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
            Pickup feel
          </p>
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-stone-900">
            Nearby and doable tonight
          </h2>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            Matches favor food that fits the request, can be picked up soon, and works with
            the kitchen setup described.
          </p>
          <div className="mt-5 rounded-[24px] border border-stone-200 bg-[var(--color-card-soft)] p-4">
            <p className="text-sm text-stone-500">Reserve status</p>
            <p className="mt-2 text-sm font-medium text-stone-900">
              {reservationMessage || 'No pickup reserved yet.'}
            </p>
          </div>
        </div>
      </aside>
    </section>
  )
}
