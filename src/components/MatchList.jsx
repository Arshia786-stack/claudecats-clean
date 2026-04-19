import MatchCard from './MatchCard'

export default function MatchList({ matches, selectedId, onSelect, onReserve, reservedId, reserveLoading }) {
  if (!matches.length) return null

  return (
    <div className="mt-5">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-stone-400">
        {matches.length} matches nearby
      </p>
      <div className="space-y-3">
        {matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            selected={selectedId === match.id}
            onSelect={onSelect}
            onReserve={onReserve}
            reserved={reservedId === match.id}
            reserveLoading={reserveLoading && reservedId === match.id}
            anyReserved={!!reservedId}
          />
        ))}
      </div>
    </div>
  )
}
