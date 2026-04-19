export default function ProviderView({
  prompt,
  loading,
  error,
  listingPreview,
  publishState,
  onPromptChange,
  onSubmit,
  onPublish,
}) {
  return (
    <section className="mx-auto max-w-5xl space-y-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <div className="rounded-[32px] border border-white/80 bg-white px-6 py-6 shadow-[0_24px_60px_rgba(28,20,14,0.08)] sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-hearth)]">
            Share food simply
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900">
            Tell Hearth what is available.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
            Write this like a message to a friend. Hearth will pull out the useful details,
            flag missing safety information, and get it ready to publish.
          </p>

          <div className="mt-6 rounded-[28px] border border-stone-200 bg-[var(--color-card-soft)] p-4">
            <label htmlFor="provider-prompt" className="sr-only">
              Describe the food you want to share
            </label>
            <textarea
              id="provider-prompt"
              value={prompt}
              onChange={(event) => onPromptChange(event.target.value)}
              rows={5}
              className="w-full resize-none border-0 bg-transparent p-0 text-base leading-7 text-stone-900 outline-none placeholder:text-stone-400"
              placeholder="I made too much jollof rice, 6 portions, pickup before 8pm, near dorm 4."
            />
            <div className="mt-4 flex flex-col gap-3 border-t border-stone-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-stone-500">
                Include what it is, how much, where pickup works, and when it was made.
              </p>
              <button
                type="button"
                onClick={() => onSubmit(prompt)}
                disabled={loading}
                className="rounded-full bg-[var(--color-hearth)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(232,98,42,0.24)] transition hover:bg-[var(--color-hearth-dark)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Parsing listing...' : 'Preview listing'}
              </button>
            </div>
          </div>

          {error ? (
            <div className="mt-5 rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
        </div>

        <div className="rounded-[32px] border border-white/80 bg-white p-6 shadow-[0_24px_60px_rgba(28,20,14,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
            Before you publish
          </p>
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-stone-900">
            Keep it safe and easy to pick up
          </h2>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            For the demo, Hearth checks for missing prep and allergen details before the
            listing goes live.
          </p>
          <div className="mt-5 rounded-[24px] border border-orange-100 bg-orange-50 p-4 text-sm leading-7 text-stone-700">
            Good Samaritan coverage may apply where local law allows. Providers should only
            share food they believe is safe to offer.
          </div>
        </div>
      </div>

      <div className="rounded-[32px] border border-white/80 bg-white p-6 shadow-[0_24px_60px_rgba(28,20,14,0.08)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
              Listing preview
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900">
              Structured from a single message
            </h2>
          </div>
          {listingPreview ? (
            <button
              type="button"
              onClick={onPublish}
              disabled={publishState === 'publishing'}
              className="rounded-full bg-[var(--color-hearth)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(232,98,42,0.24)] transition hover:bg-[var(--color-hearth-dark)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {publishState === 'publishing'
                ? 'Publishing...'
                : publishState === 'success'
                  ? 'Published'
                  : 'Publish to Hearth'}
            </button>
          ) : null}
        </div>

        {!listingPreview && !loading ? (
          <div className="mt-6 rounded-[28px] border border-dashed border-stone-300 bg-[var(--color-card-soft)] px-6 py-8 text-center">
            <p className="text-lg font-semibold text-stone-900">No listing preview yet</p>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              Paste a natural-language food message to generate the structured card and
              safety follow-up.
            </p>
          </div>
        ) : null}

        {loading ? (
          <div className="mt-6 h-72 animate-pulse rounded-[28px] border border-stone-200 bg-[var(--color-card-soft)]" />
        ) : null}

        {listingPreview ? (
          <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-[28px] border border-stone-200 bg-[var(--color-card-soft)] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-4xl">{listingPreview.emoji}</p>
                  <h3 className="mt-4 text-2xl font-semibold tracking-tight text-stone-900">
                    {listingPreview.title}
                  </h3>
                  <p className="mt-2 text-sm text-stone-500">{listingPreview.summary}</p>
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Ready for review
                </span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  ['Portions', listingPreview.portions],
                  ['Pickup window', listingPreview.pickupWindow],
                  ['Pickup spot', listingPreview.location],
                  ['Dietary notes', listingPreview.dietary.join(', ') || 'None noted'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-white px-4 py-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                      {label}
                    </p>
                    <p className="mt-2 text-sm font-medium text-stone-800">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-stone-900">Safety follow-up</p>
                {listingPreview.missingInfo.length ? (
                  <div className="mt-3 space-y-2">
                    {listingPreview.missingInfo.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-stone-700"
                      >
                        Please add {item.toLowerCase()} before this goes live.
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    Safety details look complete for the demo flow.
                  </p>
                )}
              </div>

              <div className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-stone-900">Publish status</p>
                <p className="mt-3 text-sm leading-7 text-stone-600">
                  {publishState === 'success'
                    ? 'Your listing is live and ready to be matched.'
                    : 'Publish after reviewing the parsed preview and any safety gaps.'}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
