const dietaryStyle = {
  halal: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  vegan: 'bg-green-50 text-green-700 border-green-200',
  vegetarian: 'bg-lime-50 text-lime-700 border-lime-200',
  'gluten-free': 'bg-sky-50 text-sky-700 border-sky-200',
  'nut-free': 'bg-amber-50 text-amber-700 border-amber-200',
  kosher: 'bg-purple-50 text-purple-700 border-purple-200',
  'dairy-free': 'bg-blue-50 text-blue-700 border-blue-200',
}

export default function MatchCard({ match, selected, onSelect, onReserve, reserved, reserveLoading, anyReserved }) {
  return (
    <div
      className={[
        'w-full rounded-2xl border bg-white p-5 shadow-sm transition',
        selected
          ? 'border-[var(--color-hearth)] ring-1 ring-[var(--color-hearth)]/20 shadow-md'
          : 'border-stone-200',
        reserved ? 'opacity-90' : '',
      ].join(' ')}
    >
      {/* Clickable top section */}
      <button
        type="button"
        onClick={() => onSelect(match.id)}
        className="w-full text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl leading-none">{match.emoji}</span>
            <div>
              <p className="font-semibold text-stone-900">{match.title}</p>
              <p className="mt-0.5 text-xs text-stone-500">
                by {match.providerName}
                {match.cuisine && (
                  <span className="ml-1.5 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600">
                    {match.cuisine}
                  </span>
                )}
              </p>
            </div>
          </div>
          <span className="shrink-0 text-xs text-stone-400">{match.distance}</span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
          <span>🕒 {match.pickupWindow}</span>
          <span>👥 {match.portionsLeft} portions left</span>
          <span>📍 {match.area}</span>
        </div>

        {match.dietary?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {match.dietary.map((tag) => (
              <span
                key={tag}
                className={[
                  'rounded-full border px-2.5 py-0.5 text-[11px] font-medium',
                  dietaryStyle[tag] || 'bg-stone-100 text-stone-600 border-stone-200',
                ].join(' ')}
              >
                {tag}
              </span>
            ))}
            {match.microwavable && (
              <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-0.5 text-[11px] text-stone-500">
                microwave OK
              </span>
            )}
          </div>
        )}

        {match.reasoning && (
          <p className="mt-3 text-xs leading-relaxed text-stone-400 italic">
            ✦ {match.reasoning}
          </p>
        )}
      </button>

      {/* Reserve CTA */}
      <div className="mt-4 flex justify-end">
        {reserved ? (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            ✓ Reserved
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onReserve(match)}
            disabled={anyReserved || reserveLoading}
            className="rounded-xl bg-[var(--color-hearth)] px-4 py-1.5 text-xs font-medium text-white transition hover:bg-[var(--color-hearth-dark)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {reserveLoading ? 'Reserving…' : 'Reserve pickup'}
          </button>
        )}
      </div>
    </div>
  )
}
