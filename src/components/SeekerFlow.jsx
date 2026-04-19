import { useState, useRef, useEffect } from 'react'
import Icon from './Icon'
import Placeholder from './Placeholder'
import RealMap from './RealMap'
import { LISTINGS, RESOURCES, RECIPES } from '../data/hearthData'
import { fetchAvailableListings, matchSeeker, reserveListing } from '../lib/api'
import { getSeekerProfile, saveSeekerProfile, clearSeekerProfile } from '../lib/auth'

const Dot = ({ color = 'var(--ember)', size = 8 }) => (
  <span style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }}/>
)

// ── Preference options ──────────────────────────────────────────────────────
const DIETARY_OPTIONS = [
  { id: 'halal', label: 'Halal' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'gluten-free', label: 'Gluten-free' },
  { id: 'kosher', label: 'Kosher' },
  { id: 'dairy-free', label: 'Dairy-free' },
]

const URGENCY_OPTIONS = [
  { id: 'tonight', label: 'Tonight' },
  { id: 'tomorrow', label: 'Tomorrow' },
  { id: 'flexible', label: 'Flexible' },
]

const KITCHEN_OPTIONS = [
  { id: 'any', label: 'Any kitchen' },
  { id: 'microwave only', label: 'Microwave only' },
  { id: 'no kitchen', label: 'No kitchen' },
  { id: 'full kitchen', label: 'Full kitchen' },
]

// ── Claude agent runner ─────────────────────────────────────────────────────
async function runAgentSearch({ dietary, urgency, kitchen, note, onStatus }) {
  onStatus('Scanning what\'s available nearby…')
  const listings = await fetchAvailableListings()

  // Build profile from UI selections
  let profile = {
    dietary,
    urgency,
    kitchenType: kitchen,
    culturalPreferences: [],
    favoriteIngredients: [],
    avoid: [],
    summary: [...dietary, urgency, kitchen !== 'any' ? kitchen : ''].filter(Boolean).join(' · '),
  }

  // If user typed a note, ask Claude to enrich the profile
  if (note.trim()) {
    onStatus('Reading your note…')
    try {
      const res = await fetch('/api/claude/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: note }] }),
      })
      if (res.ok) {
        const { profile: extracted } = await res.json()
        profile = {
          ...profile,
          ...extracted,
          dietary: [...new Set([...dietary, ...(extracted?.dietary || [])])],
          summary: extracted?.summary || profile.summary,
        }
      }
    } catch { /* use base profile */ }
  }

  onStatus('Matching your preferences to listings…')
  const matched = await matchSeeker(profile, listings).catch(() => listings.slice(0, 4))

  saveSeekerProfile(profile)
  return { profile, matched }
}

// ── Search / Preferences panel ──────────────────────────────────────────────
function SearchPanel({ onComplete, initialQuery }) {
  const saved = getSeekerProfile()
  const [dietary, setDietary] = useState(saved?.dietary || [])
  const [urgency, setUrgency] = useState(saved?.urgency || 'tonight')
  const [kitchen, setKitchen] = useState(saved?.kitchenType || 'any')
  const [note, setNote] = useState(initialQuery || '')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [saveName, setSaveName] = useState(saved?.name || '')
  const [showNameInput, setShowNameInput] = useState(false)
  const [lastPressed, setLastPressed] = useState(null)
  const autoRan = useRef(false)

  // Auto-search when arriving from landing with a query
  useEffect(() => {
    if (initialQuery && !autoRan.current) {
      autoRan.current = true
      handleSearch()
    }
  }, [])

  const toggleDietary = (id) => {
    setLastPressed(id)
    setTimeout(() => setLastPressed(null), 300)
    setDietary(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleSearch = async () => {
    if (loading) return
    setLoading(true)
    setStatus('Scanning what\'s available nearby…')
    try {
      const { profile, matched } = await runAgentSearch({
        dietary, urgency, kitchen, note,
        onStatus: setStatus,
      })
      if (saveName.trim()) profile.name = saveName.trim()
      onComplete(profile, matched)
    } catch {
      setStatus('Something went wrong — try again.')
      setLoading(false)
    }
  }

  const chipStyle = (active, pressed) => ({
    padding: '9px 16px', borderRadius: 999, fontSize: 13, cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
    background: active ? 'var(--ember)' : 'var(--paper-2)',
    color: active ? '#fff' : 'var(--ink)',
    border: `1.5px solid ${active ? 'var(--ember)' : 'var(--line)'}`,
    fontWeight: active ? 600 : 400,
    transform: pressed ? 'scale(0.93)' : active ? 'scale(1.04)' : 'scale(1)',
    boxShadow: active ? '0 4px 12px rgba(220,90,40,0.25)' : 'none',
  })

  const segStyle = (active) => ({
    padding: '9px 18px', borderRadius: 10, fontSize: 13, cursor: 'pointer',
    fontFamily: 'inherit', transition: 'all 0.15s',
    background: active ? 'var(--paper)' : 'transparent',
    color: active ? 'var(--ink)' : 'var(--ink-3)',
    border: `1.5px solid ${active ? 'var(--line-2)' : 'transparent'}`,
    fontWeight: active ? 600 : 400,
    boxShadow: active ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
  })

  const profileLines = [
    dietary.length > 0 && dietary.join(', '),
    urgency && `${urgency === 'tonight' ? 'Needed tonight' : urgency === 'tomorrow' ? 'For tomorrow' : 'Flexible timing'}`,
    kitchen !== 'any' && kitchen,
  ].filter(Boolean)

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px 80px' }}>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 40, alignItems: 'start' }}>

        {/* Left: form */}
        <div>
          <div style={{ marginBottom: 36 }}>
            <div className="mono" style={{ color: 'var(--ember)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Dot color="var(--ember)"/> FULL · Find Food
            </div>
            <h1 className="serif" style={{ fontSize: 44, margin: '0 0 10px', letterSpacing: '-0.02em', lineHeight: 1.05 }}>
              What do you need tonight?
            </h1>
            <div style={{ fontSize: 15, color: 'var(--ink-2)', maxWidth: 460 }}>
              Set your preferences and we'll match you with real food available near UCLA right now.
            </div>
          </div>

          {/* Saved banner */}
          {saved?.name && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
              background: 'var(--sage-t)', borderRadius: 14, marginBottom: 28,
              border: '1px solid oklch(0.88 0.06 145)',
            }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'oklch(0.42 0.12 145)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                {saved.name[0].toUpperCase()}
              </div>
              <span style={{ fontSize: 13, color: 'oklch(0.32 0.1 145)' }}>
                Hey <strong>{saved.name}</strong> — your preferences are ready to go.
              </span>
              <button onClick={() => { clearSeekerProfile(); window.location.reload() }}
                style={{ marginLeft: 'auto', fontSize: 11, color: 'oklch(0.5 0.1 145)', textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer' }}>
                Clear
              </button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>

            {/* Dietary */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div className="mono" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)' }}>Dietary needs</div>
                {dietary.length > 0 && (
                  <button onClick={() => setDietary([])} style={{ fontSize: 11, color: 'var(--ink-3)', textDecoration: 'underline', cursor: 'pointer' }}>Clear</button>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {DIETARY_OPTIONS.map(opt => (
                  <button key={opt.id} onClick={() => toggleDietary(opt.id)} style={chipStyle(dietary.includes(opt.id), lastPressed === opt.id)}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Timing + Kitchen */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <div className="mono" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', marginBottom: 12 }}>When</div>
                <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--paper-2)', borderRadius: 12, border: '1px solid var(--line)' }}>
                  {URGENCY_OPTIONS.map(opt => (
                    <button key={opt.id} onClick={() => setUrgency(opt.id)} style={{ ...segStyle(urgency === opt.id), flex: 1, textAlign: 'center' }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', marginBottom: 12 }}>Kitchen</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {KITCHEN_OPTIONS.map(opt => (
                    <button key={opt.id} onClick={() => setKitchen(opt.id)} style={chipStyle(kitchen === opt.id, false)}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Optional note */}
            <div>
              <div className="mono" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', marginBottom: 10 }}>
                Anything specific? <span style={{ textTransform: 'none', fontWeight: 400, letterSpacing: 0 }}>(optional — helps us match better)</span>
              </div>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSearch() } }}
                placeholder="e.g. picking up for a roommate with a soy allergy, need something filling"
                rows={2}
                style={{
                  width: '100%', resize: 'none', fontFamily: 'inherit',
                  border: '1.5px solid var(--line)', borderRadius: 12,
                  padding: '12px 14px', fontSize: 14, background: 'var(--paper)',
                  outline: 'none', lineHeight: 1.5, color: 'var(--ink)',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--ember)'}
                onBlur={e => e.target.style.borderColor = 'var(--line)'}
              />
            </div>

            {/* Optional name save */}
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 20 }}>
              {!showNameInput && !saved?.name ? (
                <button
                  onClick={() => setShowNameInput(true)}
                  style={{ fontSize: 13, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer' }}
                >
                  <Icon name="pin" size={13}/> Save your name so we remember you (optional)
                </button>
              ) : showNameInput ? (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input
                    value={saveName}
                    onChange={e => setSaveName(e.target.value)}
                    placeholder="Your name or nickname"
                    style={{ flex: 1, padding: '9px 14px', border: '1.5px solid var(--ember)', borderRadius: 10, fontSize: 14, background: 'var(--paper)', outline: 'none', fontFamily: 'inherit' }}
                    autoFocus
                  />
                  <button onClick={() => setShowNameInput(false)} style={{ padding: '9px 16px', borderRadius: 10, fontSize: 13, color: 'var(--ink-3)', border: '1px solid var(--line)', cursor: 'pointer', background: 'var(--paper-2)' }}>
                    Skip
                  </button>
                </div>
              ) : null}
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6 }}>
                Saved locally on this device only. No account, no email needed.
              </div>
            </div>

            {/* Search button */}
            <div>
              <button
                className="btn btn-ember"
                onClick={handleSearch}
                disabled={loading}
                style={{ height: 58, padding: '0 40px', fontSize: 16, fontWeight: 700, minWidth: 220, borderRadius: 999, transition: 'all 0.2s', boxShadow: loading ? 'none' : '0 6px 24px rgba(220,90,40,0.3)' }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="typing" style={{ display: 'inline-flex' }}><span/><span/><span/></span>
                    Finding food…
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Icon name="search" size={17}/> Find Food Now
                  </span>
                )}
              </button>

              {status && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, padding: '10px 16px', background: 'var(--paper-3)', borderRadius: 10, width: 'fit-content', border: '1px solid var(--line)' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ember)', animation: 'pulse 1.2s ease-in-out infinite' }}/>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-2)', letterSpacing: '0.04em' }}>{status}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: live profile card */}
        <div style={{ position: 'sticky', top: 92 }}>
          <div style={{ borderRadius: 20, overflow: 'hidden', border: '1.5px solid var(--line)', background: 'var(--paper-2)' }}>
            {/* Card header */}
            <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--line)', background: 'var(--paper)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-3)', marginBottom: 10 }}>Your profile</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                  background: dietary.length > 0 ? 'var(--ember)' : 'var(--paper-3)',
                  color: dietary.length > 0 ? '#fff' : 'var(--ink-3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, transition: 'background 0.3s',
                }}>
                  {saveName?.[0]?.toUpperCase() || (dietary.length > 0 ? dietary[0][0].toUpperCase() : '·')}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>
                    {saveName || saved?.name || 'Anonymous'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                    {dietary.length > 0 ? dietary.slice(0,2).join(', ') : 'No dietary filters'}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile lines */}
            <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {profileLines.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--ink-3)', fontStyle: 'italic' }}>Set your preferences above and we'll find the best matches.</div>
              ) : profileLines.map((line, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ember)', flexShrink: 0 }}/>
                  {line}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--line)', background: 'var(--paper)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="shield" size={12} color="var(--sage)"/>
              <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>Stays on your device only</span>
            </div>
          </div>

          {/* How it works */}
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: 'pin', title: 'Real listings nearby', desc: 'Home cooks, campus orgs, restaurants near UCLA.' },
              { icon: 'bowl', title: 'Smart matching', desc: 'We rank results by your dietary needs and timing.' },
              { icon: 'shield', title: 'No account needed', desc: 'Your preferences stay on your device.' },
            ].map(item => (
              <div key={item.icon} style={{ padding: '12px 14px', background: 'var(--paper-2)', borderRadius: 14, border: '1px solid var(--line)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Icon name={item.icon} size={16} color="var(--ink-3)" style={{ flexShrink: 0, marginTop: 2 }}/>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.4 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Listing card ─────────────────────────────────────────────────────────────
function ListingCard({ listing, highlighted, onHover, onClick, reserved, compact }) {
  const isReserved = reserved === listing.id
  return (
    <div
      onMouseEnter={() => onHover?.(listing.id)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onClick?.(listing)}
      className="card"
      style={{
        cursor: 'pointer',
        transition: 'transform 0.15s ease, border-color 0.15s',
        borderColor: highlighted === listing.id ? 'var(--ember)' : 'var(--line)',
        transform: highlighted === listing.id ? 'translateY(-2px)' : 'none',
        display: compact ? 'flex' : 'block',
        gap: compact ? 14 : 0,
        padding: compact ? 12 : 0,
      }}
    >
      <Placeholder
        variant={listing.image} label={listing.imgLabel}
        ratio={compact ? '1/1' : '5/4'}
        style={compact ? { width: 96, height: 96, flexShrink: 0, borderRadius: 12 } : {}}
      />
      <div style={{ padding: compact ? 0 : 18, flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="mono" style={{ color: 'var(--ink-3)', marginBottom: 4, fontSize: 11 }}>{listing.provider}</div>
            <div style={{ fontWeight: 500, fontSize: compact ? 15 : 17, lineHeight: 1.3, marginBottom: 6 }}>{listing.title}</div>
          </div>
          {!compact && listing.mapLabel && (
            <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--paper)', border: '1px solid var(--line)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="mono" style={{ color: 'var(--ink-2)', fontSize: 10 }}>{listing.mapLabel}</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
          <span className="mono" style={{ color: 'var(--sage)', display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
            <Dot color="var(--sage)" size={6}/> {listing.badge}
          </span>
          <span className="mono" style={{ color: 'var(--ink-3)', fontSize: 11 }}>{listing.distance}</span>
        </div>
        {!compact && (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
              {listing.tags.map(t => <span key={t} className="tag">{t}</span>)}
            </div>
            {listing.matchReason && (
              <div style={{ marginTop: 12, padding: '10px 12px', background: 'var(--ember-t)', borderRadius: 10, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <Icon name="star" size={12} color="var(--ember-d)" stroke={1.5}/>
                <div style={{ fontSize: 12, color: 'var(--ember-d)', fontStyle: 'italic', fontFamily: 'var(--f-serif)', lineHeight: 1.4 }}>
                  {listing.matchReason}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <div className="mono" style={{ color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                <Icon name="clock" size={11}/> {listing.pickup}
              </div>
              {isReserved
                ? <span className="tag sage"><Icon name="check" size={11}/> reserved</span>
                : <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ember)' }}>Reserve →</span>}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Directions helper ────────────────────────────────────────────────────────
function directionsUrl(listing) {
  if (listing.lat && listing.lng)
    return `https://www.google.com/maps/dir/?api=1&destination=${listing.lat},${listing.lng}`
  if (listing.neighborhood)
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(listing.neighborhood + ', Los Angeles, CA')}`
  return null
}

function DirectionsBtn({ listing, style = {} }) {
  const url = directionsUrl(listing)
  if (!url) return null
  return (
    <button className="btn btn-ghost" style={{ height: 52, ...style }} onClick={() => window.open(url, '_blank')}>
      <Icon name="pin" size={15}/> Directions
    </button>
  )
}

// ── Listing detail modal ─────────────────────────────────────────────────────
function ListingDetail({ listing, onClose, onReserve, isReserved }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'oklch(0 0 0 / 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="card" style={{ width: 'min(720px, 100%)', maxHeight: '90vh', overflow: 'auto', background: 'var(--paper)' }} onClick={e => e.stopPropagation()}>
        <div style={{ position: 'relative' }}>
          <Placeholder variant={listing.image} label={listing.imgLabel} ratio="16/9"/>
          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: '50%', background: 'var(--paper)', border: '1px solid var(--line-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="close" size={16}/>
          </button>
        </div>
        <div style={{ padding: 28 }}>
          <div className="mono" style={{ color: 'var(--ink-3)', marginBottom: 8, fontSize: 11 }}>{listing.provider} · {listing.neighborhood}</div>
          <h2 className="serif" style={{ fontSize: 30, margin: '0 0 16px', letterSpacing: '-0.01em' }}>{listing.title}</h2>
          <div style={{ display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
            {[['Pickup window', listing.pickup], ['Distance', listing.distance], ['Portions left', `${listing.portions}`]].map(([l, v]) => v && (
              <div key={l}>
                <div className="mono" style={{ color: 'var(--ink-3)', marginBottom: 4, fontSize: 10 }}>{l}</div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>
          {listing.matchReason && (
            <div style={{ padding: 16, background: 'var(--ember-t)', borderRadius: 12, marginBottom: 22 }}>
              <div className="mono" style={{ color: 'var(--ember-d)', marginBottom: 6, fontSize: 10 }}>Why this works for you</div>
              <div className="serif" style={{ fontSize: 18, fontStyle: 'italic', color: 'var(--ember-d)' }}>{listing.matchReason}</div>
            </div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 22 }}>
            {listing.tags.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ember" style={{ flex: 1, height: 52, fontSize: 15 }} onClick={() => onReserve(listing)} disabled={isReserved}>
              {isReserved ? 'Reserved ✓' : 'Reserve my portion'}
            </button>
            <DirectionsBtn listing={listing}/>
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--ink-3)' }}>Reservations hold for 30 minutes. No ID needed — just show up.</div>
        </div>
      </div>
    </div>
  )
}

// ── Order tracker ────────────────────────────────────────────────────────────
const ORDER_STAGES = ['reserved', 'onMyWay', 'collected']

function OrderTracker({ stage }) {
  const steps = [{ id: 'reserved', label: 'Reserved' }, { id: 'onMyWay', label: 'On My Way' }, { id: 'collected', label: 'Collected' }]
  const cur = ORDER_STAGES.indexOf(stage)
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
      {steps.map((s, i) => {
        const done = i <= cur
        return (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: done ? 'oklch(0.45 0.12 145)' : 'var(--paper-3)', border: `2px solid ${done ? 'oklch(0.45 0.12 145)' : 'var(--line-2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                {done && <Icon name="check" size={12} color="#fff"/>}
              </div>
              <span className="mono" style={{ fontSize: 10, color: done ? 'oklch(0.45 0.12 145)' : 'var(--ink-3)', whiteSpace: 'nowrap' }}>{s.label}</span>
            </div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: 2, margin: '0 6px', background: i < cur ? 'oklch(0.45 0.12 145)' : 'var(--line-2)', marginBottom: 16, transition: 'background 0.3s' }}/>}
          </div>
        )
      })}
    </div>
  )
}

// ── Reserved confirmation modal ───────────────────────────────────────────────
function ReservedConfirmation({ listing, onClose }) {
  const [orderStage, setOrderStage] = useState('reserved')
  const recipe = RECIPES?.[listing._raw?.cuisine] || RECIPES?.default

  const handleCollected = async () => {
    setOrderStage('collected')
    try { await reserveListing(listing._raw?.id || listing.id, 'seeker-' + Date.now()) } catch {}
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 110, background: 'oklch(0.22 0.02 60 / 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(8px)' }}>
      <div className="card" style={{ width: 'min(640px, 100%)', background: 'var(--paper)', maxHeight: '92vh', overflow: 'auto' }}>
        <div style={{ padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: orderStage === 'collected' ? 'var(--ember-t)' : 'var(--sage-t)', color: orderStage === 'collected' ? 'var(--ember-d)' : 'oklch(0.35 0.08 150)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
              <Icon name={orderStage === 'collected' ? 'star' : 'check'} size={22}/>
            </div>
            <div>
              <div className="mono" style={{ color: orderStage === 'collected' ? 'var(--ember)' : 'var(--sage)', fontSize: 11 }}>
                {orderStage === 'reserved' && 'Reserved · held 30 min'}
                {orderStage === 'onMyWay' && 'On your way · heading to pickup'}
                {orderStage === 'collected' && 'Collected · enjoy your meal'}
              </div>
              <div className="serif" style={{ fontSize: 26, letterSpacing: '-0.01em' }}>
                {orderStage === 'reserved' && "You're set."}
                {orderStage === 'onMyWay' && "See you there."}
                {orderStage === 'collected' && "Glad you got it."}
              </div>
            </div>
          </div>

          <OrderTracker stage={orderStage}/>

          <div style={{ display: 'flex', gap: 16, padding: 16, background: 'var(--paper-2)', borderRadius: 12, marginBottom: 24 }}>
            <Placeholder variant={listing.image} label="" ratio="1/1" style={{ width: 80, height: 80, borderRadius: 10 }}/>
            <div style={{ flex: 1 }}>
              <div className="mono" style={{ color: 'var(--ink-3)', fontSize: 11 }}>{listing.provider}</div>
              <div style={{ fontWeight: 500 }}>{listing.title}</div>
              <div className="mono" style={{ color: 'var(--ink-2)', marginTop: 4, fontSize: 11 }}>{listing.pickup} · {listing.distance}</div>
              {listing.neighborhood && <div className="mono" style={{ color: 'var(--ink-3)', fontSize: 11, marginTop: 2 }}>{listing.neighborhood}</div>}
            </div>
          </div>

          {orderStage === 'collected' && recipe && (
            <div style={{ padding: 20, borderRadius: 14, border: '1px dashed var(--line-2)', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Icon name="leaf" size={14} color="var(--ember)"/>
                <div className="mono" style={{ color: 'var(--ember)', fontSize: 11 }}>A note from FULL</div>
              </div>
              <div className="serif" style={{ fontSize: 21, marginBottom: 14, letterSpacing: '-0.005em' }}>{recipe.title}</div>
              {recipe.tips.map((t, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 14, marginBottom: 8 }}>
                  <div className="mono" style={{ color: 'var(--ink-3)', paddingTop: 2, fontSize: 11 }}>{t.h}</div>
                  <div style={{ fontSize: 14, color: 'var(--ink)' }}>{t.b}</div>
                </div>
              ))}
              {recipe.safety && (
                <div style={{ marginTop: 12, fontSize: 12, color: 'var(--ink-3)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Icon name="shield" size={12}/> {recipe.safety}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            {orderStage === 'reserved' && (<><DirectionsBtn listing={listing} style={{ flex: 1 }}/><button className="btn btn-primary" style={{ flex: 1, height: 52 }} onClick={() => setOrderStage('onMyWay')}>On My Way</button></>)}
            {orderStage === 'onMyWay' && (<><DirectionsBtn listing={listing} style={{ flex: 1 }}/><button className="btn btn-ember" style={{ flex: 1, height: 52, fontSize: 15 }} onClick={handleCollected}>I've Picked It Up</button></>)}
            {orderStage === 'collected' && (<button className="btn btn-ghost" onClick={onClose} style={{ flex: 1, height: 48 }}>Back to results</button>)}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Results page ─────────────────────────────────────────────────────────────
function SeekerResults({ listings, profile, onReserve, reserved, onBackToSearch }) {
  const [highlight, setHighlight] = useState(null)
  const [filter, setFilter] = useState('all')
  const [openListing, setOpenListing] = useState(null)

  const allListings = listings?.length ? listings : LISTINGS
  const filters = ['all', 'halal', 'vegan', 'vegetarian', 'gluten-free', 'microwave ok']
  const visible = allListings.filter(l => filter === 'all' || l.tags?.includes(filter))

  const pins = visible
    .filter(l => l.lat && l.lng)
    .map((l, i) => ({ id: l.id, lat: l.lat, lng: l.lng, label: l.mapLabel || 'ABCDEFGH'[i], caption: l.distance || '' }))

  const profileSummary = [
    profile?.dietary?.join(', '),
    profile?.urgency,
    profile?.kitchenType && profile.kitchenType !== 'any' ? profile.kitchenType : null,
  ].filter(Boolean).join(' · ') || 'open to anything nearby'

  return (
    <div style={{ padding: '28px 40px 60px' }}>

      {/* Search bar / back */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, background: 'var(--paper)', border: '1px solid var(--line-2)', borderRadius: 999, padding: '8px 16px', maxWidth: 640 }}>
          <Icon name="search" size={15} color="var(--ink-3)"/>
          <span style={{ color: 'var(--ink)', fontSize: 14 }}>{profileSummary}</span>
          <button onClick={onBackToSearch} className="mono" style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--ink-3)' }}>Edit prefs</button>
        </div>
        <span className="mono" style={{ color: 'var(--ink-3)', fontSize: 11 }}>{visible.length} matches · UCLA area</span>
      </div>

      {/* Filters */}
      <div className="scroll-x" style={{ marginBottom: 22, gap: 8 }}>
        {filters.map(f => (
          <button key={f} className={`tag ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)} style={{ cursor: 'pointer', height: 32, fontSize: 11 }}>{f}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 28, alignItems: 'start' }}>
        {/* Listings */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <h2 className="serif" style={{ fontSize: 24, margin: 0, letterSpacing: '-0.01em' }}>Matched for you</h2>
            <span className="mono" style={{ color: 'var(--ink-3)', fontSize: 11 }}>best match first</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {visible.slice(0, 4).map(l => (
              <ListingCard key={l.id} listing={l} highlighted={highlight} onHover={setHighlight} onClick={setOpenListing} reserved={reserved}/>
            ))}
          </div>
          {visible.length > 4 && (
            <>
              <div style={{ marginTop: 36, marginBottom: 14 }}>
                <h2 className="serif" style={{ fontSize: 20, margin: 0 }}>More nearby</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {visible.slice(4).map(l => <ListingCard key={l.id} listing={l} compact highlighted={highlight} onHover={setHighlight} onClick={setOpenListing} reserved={reserved}/>)}
              </div>
            </>
          )}

          {/* Resources */}
          <div style={{ marginTop: 44, marginBottom: 14 }}>
            <h2 className="serif" style={{ fontSize: 20, margin: 0 }}>Good resources to know</h2>
            <div style={{ color: 'var(--ink-3)', fontSize: 13, marginTop: 4 }}>Benefits, campus support, free produce near UCLA.</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {RESOURCES.map(r => (
              <div key={r.id} className="card" style={{ padding: 14, display: 'flex', gap: 14, alignItems: 'center' }}>
                <Placeholder variant={r.image} label="" ratio="1/1" style={{ width: 56, height: 56, borderRadius: 10, flexShrink: 0 }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="mono" style={{ color: 'var(--ink-3)', fontSize: 10 }}>{r.kicker}</div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{r.title}</div>
                  <div style={{ color: 'var(--ink-3)', fontSize: 12 }}>{r.time}</div>
                </div>
                <Icon name="arrow" size={15} color="var(--ink-2)"/>
              </div>
            ))}
          </div>
        </div>

        {/* Sticky sidebar: profile card + map */}
        <div style={{ position: 'sticky', top: 92, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Profile card */}
          <div className="card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Icon name="compass" size={13} color="var(--ember)"/>
              <span className="mono" style={{ fontSize: 10, color: 'var(--ember)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Matched for you</span>
            </div>
            {profile?.summary && (
              <div style={{ padding: '7px 12px', background: 'var(--ember-t)', borderRadius: 8, marginBottom: 10 }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ember-d)' }}>{profile.summary}</span>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {[
                profile?.dietary?.length && ['Dietary', profile.dietary.join(' · ')],
                profile?.urgency && ['When', profile.urgency],
                profile?.kitchenType && profile.kitchenType !== 'any' && ['Kitchen', profile.kitchenType],
                profile?.avoid?.length && ['Avoid', profile.avoid.join(', ')],
              ].filter(Boolean).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 10, fontSize: 13 }}>
                  <span className="mono" style={{ width: 56, color: 'var(--ink-3)', fontSize: 10, flexShrink: 0, paddingTop: 1 }}>{k}</span>
                  <span style={{ color: 'var(--ink)' }}>{v}</span>
                </div>
              ))}
            </div>
            <button onClick={onBackToSearch} style={{ marginTop: 12, fontSize: 12, color: 'var(--ink-2)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
              Edit preferences →
            </button>
          </div>

          {/* Real map */}
          {pins.length > 0 ? (
            <RealMap
              pins={pins}
              highlight={highlight || openListing?.id}
              height={400}
              onPinClick={(id) => setOpenListing(visible.find(x => x.id === id))}
            />
          ) : (
            <div style={{ height: 400, background: 'var(--paper-2)', borderRadius: 'var(--r-lg)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="mono" style={{ color: 'var(--ink-3)', fontSize: 12 }}>No location data for these listings</span>
            </div>
          )}
        </div>
      </div>

      {openListing && (
        <ListingDetail listing={openListing} onClose={() => setOpenListing(null)} onReserve={(l) => { onReserve(l); setOpenListing(null) }} isReserved={reserved === openListing.id}/>
      )}
    </div>
  )
}

// ── Normalize API listing ─────────────────────────────────────────────────────
function normalizeApiListing(l, i) {
  const labels = 'ABCDEFGHIJKLMNOP'
  return {
    id: l.id,
    title: l.title,
    provider: l.providerName || 'Community',
    providerType: l.providerType || 'community',
    pickup: l.pickupWindow || 'anytime',
    neighborhood: l.area || l.pickupLocation || '',
    distance: l.distance || '? min walk',
    tags: [...(l.dietary || []), l.microwavable ? 'microwave ok' : null].filter(Boolean),
    portions: l.portionsLeft ?? l.portions ?? 0,
    matchReason: l.reasoning || `${(l.dietary || []).join(', ') || 'available'} · ${l.portionsLeft ?? l.portions} portions`,
    image: ['warm', 'sage', 'plum', 'cool', 'butter'][i % 5],
    imgLabel: `[${l.title?.toLowerCase() || 'food'}]`,
    badge: (l.portionsLeft ?? l.portions) > 0 ? 'available now' : 'limited',
    mapLabel: labels[i] || l.id,
    lat: l.lat || null,
    lng: l.lng || null,
    _raw: l,
  }
}

// ── Root ─────────────────────────────────────────────────────────────────────
export default function SeekerFlow({ initialQuery }) {
  const [stage, setStage] = useState('search')
  const [reserved, setReserved] = useState(null)
  const [reservedListing, setReservedListing] = useState(null)
  const [realListings, setRealListings] = useState(null)
  const [profile, setProfile] = useState(null)

  function handleComplete(prof, matched) {
    setProfile(prof)
    setRealListings(matched.map((l, i) => normalizeApiListing(l, i)))
    setStage('results')
  }

  if (stage === 'search') {
    return <SearchPanel onComplete={handleComplete} initialQuery={initialQuery}/>
  }

  return (
    <>
      <SeekerResults
        listings={realListings}
        profile={profile}
        reserved={reserved}
        onBackToSearch={() => setStage('search')}
        onReserve={(l) => { setReserved(l.id); setReservedListing(l) }}
      />
      {reservedListing && (
        <ReservedConfirmation listing={reservedListing} onClose={() => setReservedListing(null)}/>
      )}
    </>
  )
}
