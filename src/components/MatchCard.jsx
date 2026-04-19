const dietaryStyle = {
  halal: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  vegan: 'bg-green-50 text-green-700 border-green-200',
  vegetarian: 'bg-lime-50 text-lime-700 border-lime-200',
  'gluten-free': 'bg-sky-50 text-sky-700 border-sky-200',
  'nut-free': 'bg-amber-50 text-amber-700 border-amber-200',
}

const providerStyle = {
  neighbor: 'bg-teal-50 text-teal-700',
  'campus cafe': 'bg-blue-50 text-blue-700',
  'campus org': 'bg-violet-50 text-violet-700',
  restaurant: 'bg-rose-50 text-rose-700',
  'campus pantry': 'bg-teal-50 text-teal-700',
}

export default function MatchCard({ match, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(match.id)}
      className={[
        'w-full rounded-2xl border bg-white p-5 text-left shadow-sm transition',
        selected
          ? 'border-[var(--color-hearth)] ring-1 ring-[var(--color-hearth)]/20 shadow-md'
          : 'border-stone-200 hover:border-stone-300 hover:shadow-md',
      ].join(' ')}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl leading-none">{match.emoji}</span>
          <div>
            <p className="font-semibold text-stone-900">{match.title}</p>
            <p className="mt-0.5 text-xs text-stone-500">
              by {match.providerName} ·{' '}
              <span
                className={[
                  'rounded-full px-2 py-0.5 text-[10px] font-medium',
                  providerStyle[match.providerType] || 'bg-stone-100 text-stone-600',
                ].join(' ')}
              >
                {match.providerType}
              </span>
            </p>
          </div>
        </div>
        <span className="shrink-0 text-xs text-stone-400">{match.distance}</span>
      </div>

      {/* Meta row */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
        <span>🕒 {match.pickupWindow}</span>
        <span>👥 {match.portionsLeft} portions left</span>
        <span>📍 {match.area}</span>
      </div>

      {/* Dietary tags */}
      {match.dietary.length > 0 && (
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

      {/* AI reasoning */}
      {match.reasoning && (
        <p className="mt-3 text-xs leading-relaxed text-stone-400 italic">
          ✦ {match.reasoning}
        </p>
      )}

      {/* CTA */}
      <div className="mt-4 flex justify-end">
        <span className="text-xs font-medium text-[var(--color-hearth)]">
          View pickup details →
        </span>
      </div>
    </button>
  )
}
