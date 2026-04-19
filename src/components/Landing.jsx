import { useState, useEffect, useRef } from 'react'
import Icon from './Icon'
import RealMap from './RealMap'
import { fetchAvailableListings } from '../lib/api'

const SUGGESTIONS = [
  'Halal food tonight',
  'Vegan options nearby',
  'Need food right now',
  'Something microwavable',
  'Gluten-free meals',
  'Family-size portions',
]

async function streamAssist(message, listings, { onText, onMeta, onError }) {
  const res = await fetch('/api/claude/assist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, listings }),
  })
  if (!res.ok) throw new Error('Chat failed')

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop()
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      try {
        const parsed = JSON.parse(line.slice(6))
        if (parsed.type === 'text') onText(parsed.text)
        else if (parsed.type === 'meta' && parsed.done) onMeta(parsed.matchIds || [])
        else if (parsed.type === 'error') onError?.(parsed.error)
      } catch {}
    }
  }
}

function MiniListingCard({ listing, onSelect }) {
  const [hovered, setHovered] = useState(false)
  const available = (listing.portionsLeft ?? listing.portions ?? 0) > 0

  return (
    <button
      onClick={() => onSelect(listing.title)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        textAlign: 'left', padding: '12px 14px', borderRadius: 14, cursor: 'pointer',
        background: hovered ? 'var(--paper-3)' : 'var(--paper-2)',
        border: `1.5px solid ${hovered ? 'var(--ember)' : 'var(--line)'}`,
        transition: 'all 0.15s', display: 'flex', gap: 12, alignItems: 'flex-start',
        transform: hovered ? 'translateY(-1px)' : 'none',
        boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.1)' : 'none',
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
      }}>
        {(listing.title || 'F')[0].toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.3, marginBottom: 2 }}>{listing.title}</div>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 4 }}>{listing.providerName}</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(listing.dietary || []).slice(0, 2).map(d => (
            <span key={d} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, background: 'var(--sage-t)', color: 'oklch(0.38 0.12 145)', fontWeight: 500 }}>
              {d}
            </span>
          ))}
          <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, background: available ? 'var(--sage-t)' : 'var(--paper-3)', color: available ? 'oklch(0.38 0.12 145)' : 'var(--ink-3)', fontWeight: 500 }}>
            {available ? `${listing.portionsLeft} left` : 'Full'}
          </span>
        </div>
      </div>
    </button>
  )
}

export default function Landing({ onFlow, onStartSeeker }) {
  const [query, setQuery] = useState('')
  const [listings, setListings] = useState([])
  const [chatText, setChatText] = useState('')
  const [chatActive, setChatActive] = useState(false)
  const [chatLoading, setChatLoading] = useState(false)
  const [matchedIds, setMatchedIds] = useState([])
  const [mapHighlight, setMapHighlight] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    fetchAvailableListings().then(setListings).catch(() => {})
  }, [])

  const pins = listings
    .filter(l => l.lat && l.lng)
    .slice(0, 10)
    .map((l, i) => ({
      id: l.id,
      lat: l.lat, lng: l.lng,
      label: 'ABCDEFGHIJKLMNOP'[i],
      caption: l.distance || l.area?.split(',')[0] || '',
    }))

  const matchedListings = matchedIds.length > 0
    ? matchedIds.map(id => listings.find(l => l.id === id)).filter(Boolean)
    : listings.slice(0, 3)

  async function handleAsk(msg) {
    const text = (msg || query).trim()
    if (!text || chatLoading) return
    setQuery(text)
    setChatActive(true)
    setChatLoading(true)
    setChatText('')
    setMatchedIds([])

    try {
      await streamAssist(text, listings, {
        onText: chunk => setChatText(prev => prev + chunk),
        onMeta: ids => setMatchedIds(ids),
        onError: () => setChatText('Something went wrong. Try again.'),
      })
    } catch {
      setChatText('Could not connect. Make sure the server is running.')
    } finally {
      setChatLoading(false)
    }
  }

  function handleGoFind() {
    onStartSeeker(query || 'free food near me')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden' }}>

      {/* ── Left panel ── */}
      <div style={{ padding: '56px 56px 40px', display: 'flex', flexDirection: 'column', overflowY: 'auto', maxHeight: 'calc(100vh - 64px)' }}>

        {/* Hero */}
        {!chatActive && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ember)', animation: 'pulse 2s ease-in-out infinite' }}/>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ember)' }}>
                {listings.length > 0 ? `${listings.length} listings active near UCLA` : 'Free food near you'}
              </span>
            </div>
            <h1 style={{ fontSize: 52, lineHeight: 1.04, margin: '0 0 18px', letterSpacing: '-0.04em', fontWeight: 800 }}>
              Find food in<br/>
              <span style={{ color: 'var(--ember-d)' }}>plain language.</span>
            </h1>
            <p style={{ fontSize: 16, color: 'var(--ink-2)', margin: 0, lineHeight: 1.65, maxWidth: 420 }}>
              Tell us what you need. We'll search real listings from home cooks, campus orgs, and restaurants near UCLA — right now.
            </p>
          </div>
        )}

        {/* Chat response area */}
        {chatActive && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <button
                onClick={() => { setChatActive(false); setQuery(''); setChatText(''); setMatchedIds([]) }}
                style={{ fontSize: 12, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'underline', textUnderlineOffset: 3 }}
              >
                ← Back
              </button>
            </div>

            {/* User bubble */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--ember)', color: '#fff', borderRadius: '18px 18px 4px 18px', fontSize: 14, maxWidth: '80%' }}>
                {query}
              </div>
            </div>

            {/* FULL response bubble */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--paper-3)', border: '1.5px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                F
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 6, fontFamily: 'var(--f-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>FULL</div>
                <div style={{ padding: '14px 16px', background: 'var(--paper-2)', borderRadius: '4px 18px 18px 18px', border: '1px solid var(--line)', fontSize: 14, lineHeight: 1.65, color: 'var(--ink)', minHeight: 48 }}>
                  {chatLoading && !chatText ? (
                    <span className="typing"><span/><span/><span/></span>
                  ) : (
                    <span>{chatText}</span>
                  )}
                </div>

                {/* Matched listings */}
                {!chatLoading && matchedListings.length > 0 && (
                  <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ fontSize: 11, fontFamily: 'var(--f-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', marginBottom: 4 }}>
                      Available now
                    </div>
                    {matchedListings.map(l => (
                      <MiniListingCard key={l.id} listing={l} onSelect={t => { onStartSeeker(t) }}/>
                    ))}
                  </div>
                )}

                {!chatLoading && chatText && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    <button className="btn btn-ember" style={{ height: 42, fontSize: 13, flex: 1 }} onClick={handleGoFind}>
                      See all matches <Icon name="arrow" size={13}/>
                    </button>
                    <button className="btn btn-ghost" style={{ height: 42, fontSize: 13 }} onClick={() => { setChatActive(false); setQuery('') }}>
                      Ask again
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Search / chat input */}
        <div style={{ marginBottom: 16 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '6px 6px 6px 16px',
            background: 'var(--paper)',
            border: `2px solid ${chatActive ? 'var(--ember)' : 'var(--line-2)'}`,
            borderRadius: 999,
            boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
            transition: 'border-color 0.2s',
          }}>
            <Icon name="search" size={16} color="var(--ink-3)"/>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAsk()}
              placeholder="I need halal food tonight, microwave only…"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 15, padding: '10px 0', minWidth: 0, color: 'var(--ink)' }}
            />
            <button
              className="btn btn-ember"
              style={{ height: 46, padding: '0 22px', fontSize: 14, borderRadius: 999, flexShrink: 0 }}
              onClick={() => handleAsk()}
              disabled={chatLoading}
            >
              {chatLoading ? <span className="typing"><span/><span/><span/></span> : <>Ask FULL <Icon name="arrow" size={14}/></>}
            </button>
          </div>
        </div>

        {/* Suggestion chips */}
        {!chatActive && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 36 }}>
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => handleAsk(s)}
                style={{
                  padding: '8px 14px', borderRadius: 999, fontSize: 13,
                  background: 'var(--paper-2)', border: '1.5px solid var(--line)',
                  color: 'var(--ink-2)', cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ember)'; e.currentTarget.style.color = 'var(--ember)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.color = 'var(--ink-2)' }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Bottom nav */}
        <div style={{ display: 'flex', gap: 24, borderTop: '1px solid var(--line)', paddingTop: 20, marginTop: 'auto' }}>
          <button onClick={() => onFlow('provider')} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 500, color: 'var(--ink-2)' }}>
            <Icon name="hand" size={15} color="var(--ember)"/> Share food
          </button>
          <button onClick={() => onFlow('sponsor')} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 500, color: 'var(--ink-2)' }}>
            <Icon name="chart" size={15} color="var(--ember)"/> Partners
          </button>
          <button onClick={() => onFlow('library')} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 500, color: 'var(--ink-2)' }}>
            Food Library
          </button>
          <button onClick={() => onFlow('seeker')} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 500, color: 'var(--ink-2)', marginLeft: 'auto' }}>
            Browse all <Icon name="arrow" size={14}/>
          </button>
        </div>
      </div>

      {/* ── Right panel: real map ── */}
      <div style={{ position: 'relative', height: 'calc(100vh - 64px)', background: 'var(--paper-3)' }}>
        {pins.length > 0 ? (
          <RealMap
            pins={pins}
            highlight={mapHighlight}
            height="100%"
            borderRadius="0"
            zoom={13}
          />
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <span className="typing"><span/><span/><span/></span>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--ink-3)' }}>Loading listings…</span>
          </div>
        )}

        {/* Listings strip at bottom of map */}
        {listings.length > 0 && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '16px 20px',
            background: 'linear-gradient(to top, rgba(255,255,255,0.98) 70%, transparent)',
            display: 'flex', gap: 10, overflowX: 'auto',
          }}>
            {listings.slice(0, 4).map((l, i) => (
              <button
                key={l.id}
                onClick={() => onStartSeeker(l.title)}
                onMouseEnter={() => setMapHighlight(l.id)}
                onMouseLeave={() => setMapHighlight(null)}
                style={{
                  flexShrink: 0, width: 200, padding: '10px 12px',
                  background: 'var(--paper)', border: `1.5px solid ${mapHighlight === l.id ? 'var(--ember)' : 'var(--line)'}`,
                  borderRadius: 14, textAlign: 'left', cursor: 'pointer',
                  transition: 'all 0.15s', boxShadow: mapHighlight === l.id ? '0 4px 16px rgba(0,0,0,0.12)' : 'none',
                  transform: mapHighlight === l.id ? 'translateY(-2px)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--ember-t)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>
                    {'ABCDEFGHIJ'[i]}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: 12, lineHeight: 1.3, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 4 }}>{l.providerName}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--sage)', flexShrink: 0 }}/>
                  <span style={{ fontSize: 10, color: 'var(--sage)', fontWeight: 600 }}>{l.portionsLeft} left</span>
                  {(l.dietary || []).slice(0, 1).map(d => (
                    <span key={d} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 999, background: 'var(--paper-3)', color: 'var(--ink-3)', marginLeft: 4 }}>{d}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
