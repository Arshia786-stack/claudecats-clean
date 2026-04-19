import StatsStrip from './StatsStrip'

export default function Header({ view, onViewChange }) {
  return (
    <header className="shrink-0 border-b border-stone-200 bg-white">
      <div className="flex h-14 items-center justify-between px-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <span className="text-xl leading-none">🔥</span>
          <span className="text-base font-bold tracking-tight text-stone-900">Hearth</span>
        </div>

        {/* View toggle */}
        <div className="flex items-center rounded-xl border border-stone-200 bg-stone-50 p-1">
          {[
            { key: 'seeker', label: 'Find Food' },
            { key: 'provider', label: 'Share Food' },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => onViewChange(key)}
              className={[
                'rounded-lg px-4 py-1.5 text-sm font-medium transition',
                view === key
                  ? 'bg-[var(--color-hearth)] text-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-800',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Stats — desktop only */}
        <div className="hidden lg:block">
          <StatsStrip />
        </div>
      </div>
    </header>
  )
}
