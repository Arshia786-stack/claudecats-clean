import { useState } from 'react'
import Icon from './Icon'
import MiniMap from './MiniMap'

const SUGGESTIONS = [
  "Need food now", "Protein meals", "Open tonight",
  "Halal", "Family meals", "Free groceries",
]

const MAP_PINS = [
  { id: 1, x: 22, y: 32, label: 'A', caption: '0.4 mi', tone: 'sage' },
  { id: 2, x: 48, y: 50, label: 'B', caption: '0.7 mi', tone: 'sage' },
  { id: 3, x: 68, y: 22, label: 'C', caption: '1.1 mi', tone: 'ember' },
  { id: 4, x: 36, y: 65, label: 'D', caption: '1.4 mi', tone: 'ember' },
  { id: 5, x: 78, y: 55, label: 'E', caption: '1.8 mi', tone: 'sage' },
]

const RESULT_CARDS = [
  {
    id: 1, label: 'A',
    title: 'Chicken & Rice',
    provider: 'Mission Food Bank',
    distance: '0.4 mi',
    status: 'Open now',
    statusOk: true,
    tags: ['halal', 'protein'],
  },
  {
    id: 2, label: 'B',
    title: 'Lentil Stew',
    provider: 'Community Kitchen',
    distance: '0.7 mi',
    status: '28 portions left',
    statusOk: true,
    tags: ['vegetarian', 'hot meal'],
  },
  {
    id: 3, label: 'C',
    title: 'Veg Curry',
    provider: 'St. Anthony\'s',
    distance: '1.1 mi',
    status: 'Opens in 30 min',
    statusOk: false,
    tags: ['vegan', 'dairy-free'],
  },
]

function ResultCard({ card, active, onHover, onLeave, onSelect }) {
  return (
    <button
      onClick={onSelect}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        flexShrink: 0,
        width: 280,
        height: 148,
        textAlign: 'left',
        padding: '14px 16px',
        background: 'var(--paper-2)',
        border: `1.5px solid ${active ? 'var(--ember)' : 'var(--line)'}`,
        borderRadius: 'var(--r-md)',
        boxShadow: active ? 'var(--shadow-lift)' : 'var(--shadow-card)',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
          background: active ? 'var(--ember)' : 'var(--sage-t)',
          color: active ? '#fff' : 'var(--sage)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 700, transition: 'background 0.15s, color 0.15s',
        }}>{card.label}</span>
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', letterSpacing: '-0.01em', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {card.title}
        </span>
        <span style={{ fontSize: 12, color: 'var(--ink-3)', flexShrink: 0 }}>{card.distance}</span>
      </div>

      {/* Provider */}
      <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{card.provider}</div>

      {/* Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
          background: card.statusOk ? 'var(--sage)' : 'var(--ember-t)',
        }}/>
        <span style={{ fontSize: 12, fontWeight: 600, color: card.statusOk ? 'var(--sage)' : 'var(--ink-2)' }}>
          {card.status}
        </span>
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {card.tags.map(t => (
          <span key={t} className="tag" style={{ height: 20, fontSize: 11, padding: '0 8px' }}>{t}</span>
        ))}
      </div>
    </button>
  )
}

export default function Landing({ onFlow, onStartSeeker }) {
  const [query, setQuery] = useState("")
  const [highlight, setHighlight] = useState(null)

  function submit() {
    onStartSeeker(query || "I need dinner at 5pm with protein, halal if possible")
  }

  return (
    <div className="landing-shell">

      {/* ── Left: control rail ── */}
      <div className="landing-left">

        <div className="eyebrow" style={{ marginBottom: 22 }}>
          <span className="dot"/> Free food near you
        </div>

        <h1 style={{
          fontSize: 54, lineHeight: 1.04, margin: '0 0 18px',
          letterSpacing: '-0.04em', fontWeight: 800, color: 'var(--ink)',
        }}>
          Find food in<br/>
          <span style={{ color: 'var(--ember-d)' }}>plain language.</span>
        </h1>

        <p style={{
          fontSize: 16, color: 'var(--ink-2)', margin: '0 0 32px',
          lineHeight: 1.6, fontWeight: 400, maxWidth: 420,
        }}>
          Describe what you need. We'll find nearby food banks,
          free meals, and pantries open right now — no login required.
        </p>

        <div className="prompt-bar ring" style={{ marginBottom: 16 }}>
          <Icon name="search" size={18} color="var(--ink-3)"/>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="I need dinner at 5pm, halal if possible"
            style={{
              flex: 1, border: 'none', outline: 'none',
              background: 'transparent', fontSize: 15,
              padding: '10px 0', minWidth: 0,
            }}
          />
          <button
            className="btn btn-primary"
            style={{ height: 44, padding: '0 22px', fontSize: 14 }}
            onClick={submit}
          >
            Search <Icon name="arrow" size={16}/>
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 48 }}>
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => onStartSeeker(s)} className="tag" style={{ cursor: 'pointer' }}>
              {s}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 28, borderTop: '1px solid var(--line)', paddingTop: 24 }}>
          <button
            onClick={() => onFlow('provider')}
            style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 500, color: 'var(--ink-2)' }}
          >
            <Icon name="hand" size={15} color="var(--ember)"/> Share food
          </button>
          <button
            onClick={() => onFlow('sponsor')}
            style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 500, color: 'var(--ink-2)' }}
          >
            <Icon name="chart" size={15} color="var(--ember)"/> Partners
          </button>
          <button
            onClick={() => onFlow('seeker')}
            style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 500, color: 'var(--ink-2)', marginLeft: 'auto' }}
          >
            Chat instead <Icon name="arrow" size={14}/>
          </button>
        </div>
      </div>

      {/* ── Right: map + results ── */}
      <div className="landing-right">

        {/* Map */}
        <div className="landing-map">
          <MiniMap
            pins={MAP_PINS.map(p => ({ ...p, onClick: setHighlight }))}
            highlight={highlight}
            height="100%"
            borderRadius={0}
          />
        </div>

        {/* Results strip */}
        <div className="landing-results">
          {RESULT_CARDS.map(card => (
            <ResultCard
              key={card.id}
              card={card}
              active={highlight === card.id}
              onHover={() => setHighlight(card.id)}
              onLeave={() => setHighlight(null)}
              onSelect={() => onStartSeeker(card.title)}
            />
          ))}
          {/* "See all" ghost card */}
          <button
            onClick={() => onStartSeeker("free food near me")}
            style={{
              flexShrink: 0,
              width: 148,
              height: 148,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              border: '1.5px dashed var(--line-2)',
              borderRadius: 'var(--r-md)',
              background: 'transparent',
              color: 'var(--ink-3)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ember)'; e.currentTarget.style.color = 'var(--ember)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line-2)'; e.currentTarget.style.color = 'var(--ink-3)' }}
          >
            <Icon name="arrow" size={18}/>
            See all nearby
          </button>
        </div>
      </div>
    </div>
  )
}
