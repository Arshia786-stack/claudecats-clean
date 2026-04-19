export default function Header({ view, onViewChange }) {
  return (
    <header className="rounded-[30px] border border-white/80 bg-white px-4 py-4 shadow-[0_18px_50px_rgba(28,20,14,0.06)] sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-xl shadow-sm">
            🔥
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-hearth)]">
              Community food coordination
            </p>
            <p className="mt-1 text-xl font-semibold tracking-tight text-stone-900">Hearth</p>
          </div>
        </div>

        <div className="flex items-center rounded-full border border-stone-200 bg-stone-50 p-1">
          {[
            { key: 'seeker', label: 'Find Food' },
            { key: 'provider', label: 'Share Food' },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => onViewChange(key)}
              className={[
                'rounded-full px-4 py-2 text-sm font-medium transition',
                view === key
                  ? 'bg-[var(--color-hearth)] text-white shadow-[0_10px_18px_rgba(232,98,42,0.22)]'
                  : 'text-stone-500 hover:text-stone-800',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-stone-700">
          <p className="font-medium text-stone-900">Demo-ready MVP</p>
          <p className="mt-1 text-stone-500">Prompt-first flows for seekers and providers</p>
        </div>
      </div>
    </header>
  )
}
