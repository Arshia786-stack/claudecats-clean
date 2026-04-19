const tagStyles = {
  halal: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  vegan: 'border-green-200 bg-green-50 text-green-700',
  vegetarian: 'border-lime-200 bg-lime-50 text-lime-700',
  'gluten-free': 'border-sky-200 bg-sky-50 text-sky-700',
  'nut-free': 'border-amber-200 bg-amber-50 text-amber-700',
  microwavable: 'border-orange-200 bg-orange-50 text-orange-700',
}

export default function MatchCard({ match, active, onReserve }) {
  return (
    <article
      className={[
        'overflow-hidden rounded-[28px] border bg-white text-left shadow-[0_16px_40px_rgba(28,20,14,0.08)] transition',
        active
          ? 'border-[var(--color-hearth)] ring-2 ring-orange-100'
          : 'border-stone-200 hover:-translate-y-0.5 hover:shadow-[0_20px_46px_rgba(28,20,14,0.12)]',
      ].join(' ')}
    >
      <div className="flex h-40 items-center justify-center bg-orange-50 text-6xl">
        {match.emoji}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-stone-900">{match.title}</h3>
            <p className="mt-2 text-sm text-stone-500">
              ⭐ {match.score} match · {match.pickupWindow}
            </p>
          </div>
          <button
            type="button"
            className="rounded-full border border-stone-200 px-3 py-1.5 text-sm text-stone-500 transition hover:border-stone-300 hover:text-stone-800"
          >
            ♡
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-stone-500">
          {[...match.tags, match.microwavable ? 'microwavable' : null]
            .filter(Boolean)
            .map((tag) => (
              <span
                key={tag}
                className={[
                  'rounded-full border px-2.5 py-1 font-medium',
                  tagStyles[tag] || 'border-stone-200 bg-stone-50 text-stone-600',
                ].join(' ')}
              >
                {tag === 'microwavable' ? 'microwave OK' : tag}
              </span>
            ))}
          <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 font-medium text-stone-600">
            {match.portions} servings
          </span>
        </div>

        <p className="mt-4 text-sm font-medium text-stone-800">
          {match.location} · {match.distance}
        </p>
        <p className="mt-3 text-sm leading-7 text-stone-500 italic">"{match.reasoning}"</p>
        <p className="mt-3 text-sm text-stone-600">Heat note: {match.prep}</p>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onReserve}
            className="flex-1 rounded-full bg-[var(--color-hearth)] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(232,98,42,0.24)] transition hover:bg-[var(--color-hearth-dark)]"
          >
            Reserve this
          </button>
          <button
            type="button"
            className="rounded-full border border-stone-200 px-4 py-3 text-sm font-medium text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
          >
            Details
          </button>
        </div>
      </div>
    </article>
  )
}
