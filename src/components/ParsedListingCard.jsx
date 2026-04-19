export default function ParsedListingCard({ listing, onPublish, publishing }) {
  const fields = [
    { label: 'Food', value: listing.title },
    { label: 'Portions', value: listing.portions ?? '—' },
    { label: 'Pickup by', value: listing.pickupDeadline ?? '—' },
    { label: 'Location', value: listing.location ?? '—' },
    { label: 'Dietary', value: listing.dietary.length ? listing.dietary.join(', ') : 'Not specified' },
  ]

  return (
    <div className="mt-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
        Here's what I understood
      </p>

      <div className="mt-4 space-y-2">
        {fields.map(({ label, value }) => (
          <div key={label} className="flex items-baseline gap-3">
            <span className="w-20 shrink-0 text-xs text-stone-400">{label}</span>
            <span className="text-sm font-medium text-stone-800">{value}</span>
          </div>
        ))}
      </div>

      {listing.missingFields.length > 0 && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-medium text-amber-700">
            Missing: {listing.missingFields.join(' · ')}
          </p>
          <p className="mt-0.5 text-xs text-amber-600">
            Adding these helps seekers trust your listing.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onPublish}
        disabled={publishing}
        className="mt-5 w-full rounded-xl bg-[var(--color-hearth)] py-2.5 text-sm font-medium text-white transition hover:bg-[var(--color-hearth-dark)] disabled:opacity-40"
      >
        {publishing ? 'Publishing…' : 'Publish listing'}
      </button>
    </div>
  )
}
