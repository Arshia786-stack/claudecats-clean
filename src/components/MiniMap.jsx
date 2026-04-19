export default function MiniMap({ pins = [], highlight = null, height = 520 }) {
  const streets = [
    "M-20 80 Q 200 60 440 120 T 900 100",
    "M-20 180 Q 200 200 400 160 T 900 240",
    "M-20 300 Q 160 280 320 340 T 700 310 T 920 360",
    "M-20 440 Q 240 400 460 460 T 920 440",
    "M120 -20 Q 140 200 100 420 T 140 820",
    "M320 -20 Q 340 200 300 440 T 340 820",
    "M520 -20 Q 540 200 500 420 T 540 820",
    "M720 -20 Q 740 200 700 420 T 740 820",
  ]
  return (
    <div style={{
      position: 'relative', width: '100%', height,
      background: 'oklch(0.955 0.012 75)',
      borderRadius: 'var(--r-lg)',
      overflow: 'hidden', border: '1px solid var(--line)',
    }}>
      <svg viewBox="0 0 900 600" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <ellipse cx="180" cy="420" rx="120" ry="70" fill="oklch(0.9 0.045 150)"/>
        <ellipse cx="720" cy="180" rx="100" ry="60" fill="oklch(0.9 0.045 150)"/>
        <path d="M0 560 Q 300 540 600 580 T 900 560 L 900 600 L 0 600 Z" fill="oklch(0.9 0.04 230)"/>
        {streets.map((d, i) => (
          <path key={i} d={d} stroke="oklch(0.92 0.012 70)" strokeWidth={i % 4 === 0 ? 10 : 6} fill="none" strokeLinecap="round"/>
        ))}
        {streets.map((d, i) => (
          <path key={"i"+i} d={d} stroke="oklch(0.98 0.01 70)" strokeWidth={i % 4 === 0 ? 4 : 2} fill="none" strokeLinecap="round"/>
        ))}
        {Array.from({ length: 28 }).map((_, i) => {
          const x = (i * 97) % 900
          const y = (i * 73) % 600
          return <rect key={i} x={x} y={y} width="18" height="14" rx="2" fill="oklch(0.93 0.015 75)" opacity="0.6"/>
        })}
      </svg>
      <div style={{
        position: 'absolute', top: 14, right: 14,
        background: 'var(--paper)', width: 32, height: 32, borderRadius: 8,
        border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-2)',
      }}>N</div>
      {pins.map((p) => {
        const isHi = highlight === p.id
        return (
          <button key={p.id} onClick={() => p.onClick && p.onClick(p.id)} style={{
            position: 'absolute',
            left: `${p.x}%`, top: `${p.y}%`,
            transform: `translate(-50%, -100%) scale(${isHi ? 1.1 : 1})`,
            transition: 'transform 0.15s ease',
            cursor: 'pointer',
            filter: isHi
              ? 'drop-shadow(0 4px 10px oklch(0.55 0.15 38 / 0.4))'
              : 'drop-shadow(0 2px 4px oklch(0 0 0 / 0.15))',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 10px 4px 4px',
              background: isHi ? 'var(--ember)' : 'var(--paper)',
              color: isHi ? '#fff' : 'var(--ink)',
              borderRadius: 999,
              border: `1px solid ${isHi ? 'var(--ember)' : 'var(--line-2)'}`,
              fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.04em',
              fontWeight: 500, whiteSpace: 'nowrap',
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: '50%',
                background: isHi ? 'var(--paper)' : (p.tone === 'sage' ? 'var(--sage-t)' : 'var(--ember-t)'),
                color: isHi ? 'var(--ember)' : (p.tone === 'sage' ? 'oklch(0.35 0.08 150)' : 'var(--ember-d)'),
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 600,
              }}>{p.label}</span>
              <span>{p.caption}</span>
            </div>
            <div style={{
              width: 8, height: 8,
              background: isHi ? 'var(--ember)' : 'var(--paper)',
              border: `1px solid ${isHi ? 'var(--ember)' : 'var(--line-2)'}`,
              borderTop: 'none', borderLeft: 'none',
              transform: 'rotate(45deg)',
              margin: '-5px auto 0', position: 'relative', zIndex: -1,
            }}/>
          </button>
        )
      })}
      <div style={{
        position: 'absolute', bottom: 12, left: 14,
        fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)',
        letterSpacing: '0.08em', textTransform: 'uppercase',
      }}>Mission District · 1.2 mi radius</div>
    </div>
  )
}
