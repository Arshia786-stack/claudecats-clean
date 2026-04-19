// Mock campus map — no map library, styled HTML only

const buildings = [
  { label: 'Library', x: 42, y: 8, w: 60, h: 30 },
  { label: 'Dorm 4', x: 22, y: 30, w: 50, h: 35 },
  { label: 'Student Union', x: 55, y: 46, w: 64, h: 36 },
  { label: 'Wellness Ctr', x: 38, y: 64, w: 68, h: 28 },
  { label: 'Eng. Bldg', x: 48, y: 14, w: 56, h: 30 },
  { label: 'Multicultural Ctr', x: 30, y: 44, w: 56, h: 26 },
  { label: 'Grad Housing', x: 67, y: 22, w: 52, h: 32 },
]

export default function MapPanel({ matches, selectedId }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#EAE6DC]">
      {/* Road grid */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[33%] left-0 right-0 h-[2px] bg-white/70" />
        <div className="absolute top-[66%] left-0 right-0 h-[2px] bg-white/70" />
        <div className="absolute left-[33%] top-0 bottom-0 w-[2px] bg-white/70" />
        <div className="absolute left-[66%] top-0 bottom-0 w-[2px] bg-white/70" />
      </div>

      {/* Building blocks */}
      {buildings.map((b) => (
        <div
          key={b.label}
          className="absolute rounded border border-white/40 bg-white/35 flex items-center justify-center"
          style={{ left: `${b.x}%`, top: `${b.y}%`, width: b.w, height: b.h, transform: 'translate(-50%, -50%)' }}
        >
          <span className="text-[9px] font-medium text-stone-500 text-center leading-tight px-1">
            {b.label}
          </span>
        </div>
      ))}

      {/* Food listing pins */}
      {matches.map((match) => (
        <div
          key={match.id}
          className="absolute flex flex-col items-center"
          style={{
            left: `${match.pinX}%`,
            top: `${match.pinY}%`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div
            className={[
              'flex h-9 w-9 items-center justify-center rounded-full border-2 border-white shadow-lg text-lg transition-transform',
              selectedId === match.id
                ? 'bg-[var(--color-hearth)] scale-110'
                : 'bg-white hover:scale-105',
            ].join(' ')}
          >
            {match.emoji}
          </div>
          <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-stone-400 shadow" />
        </div>
      ))}

      {/* You are here */}
      <div
        className="absolute"
        style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
      >
        <div className="relative flex h-4 w-4 items-center justify-center">
          <div className="absolute h-8 w-8 animate-ping rounded-full bg-blue-400/30" />
          <div className="h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow" />
        </div>
      </div>

      {/* Label overlay */}
      <div className="absolute bottom-3 left-3 rounded-lg bg-white/80 px-2.5 py-1.5 shadow-sm backdrop-blur-sm">
        <p className="text-[10px] font-medium text-stone-500">Campus area · Live</p>
      </div>

      {/* Empty state overlay */}
      {matches.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="rounded-xl bg-white/80 px-4 py-2 text-xs text-stone-500 shadow-sm backdrop-blur-sm">
            Search to see food nearby
          </p>
        </div>
      )}
    </div>
  )
}
