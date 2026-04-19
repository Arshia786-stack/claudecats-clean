import { useState, useEffect } from 'react'
import Icon from './Icon'
import RealMap from './RealMap'
import { fetchAllListings, reserveListing } from '../lib/api'

// ── Colour palette per provider type ─────────────────────────────────────────
const TYPE_META = {
  'home cook':  { label: 'Home Cook',   color: 'oklch(0.72 0.09 55)',  bg: 'oklch(0.97 0.03 55)',  symbol: '🏠' },
  restaurant:   { label: 'Restaurant',  color: 'oklch(0.52 0.14 30)',  bg: 'oklch(0.97 0.03 30)',  symbol: '🍽' },
  'campus org': { label: 'Campus Org',  color: 'oklch(0.42 0.13 145)', bg: 'oklch(0.95 0.04 145)', symbol: '🎓' },
  company:      { label: 'Company',     color: 'oklch(0.52 0.12 240)', bg: 'oklch(0.96 0.03 240)', symbol: '🏢' },
}
const typeMeta = (t) => TYPE_META[t?.toLowerCase()] || TYPE_META['home cook']

const DIETARY_ICONS = { halal: '🌙', vegan: '🌱', vegetarian: '🥗', 'gluten-free': '🌾', kosher: '✡', 'dairy-free': '🥛' }

// ── Gradient placeholders (when no photo uploaded) ────────────────────────────
const GRADIENTS = [
  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
  'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
  'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
  'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)',
  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
]
const gradientFor = (id) => GRADIENTS[(parseInt(id, 10) || 0) % GRADIENTS.length]

// ── Food card ─────────────────────────────────────────────────────────────────
function FoodCard({ listing, onOpen }) {
  const meta = typeMeta(listing.providerType)
  const available = listing.portionsLeft > 0
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onOpen(listing)}
      style={{
        borderRadius: 20, overflow: 'hidden', cursor: 'pointer',
        background: 'var(--paper-2)',
        border: `1.5px solid ${hovered ? 'var(--ember)' : 'var(--line)'}`,
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.13)' : '0 2px 8px rgba(0,0,0,0.05)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'all 0.2s ease',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Image area */}
      <div style={{ position: 'relative', height: 180, flexShrink: 0 }}>
        {listing.imageBase64 ? (
          <img
            src={`data:${listing.imageMime || 'image/jpeg'};base64,${listing.imageBase64}`}
            alt={listing.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: gradientFor(listing.id), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 52, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))' }}>{listing.emoji || '🍽'}</span>
          </div>
        )}

        {/* Status badge */}
        <div style={{
          position: 'absolute', top: 12, left: 12,
          padding: '4px 10px', borderRadius: 999,
          background: available ? 'rgba(16,185,129,0.92)' : 'rgba(0,0,0,0.45)',
          color: '#fff', fontSize: 11, fontWeight: 700,
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: available ? '#86efac' : '#9ca3af', display: 'inline-block' }}/>
          {available ? `${listing.portionsLeft} left` : 'Fully reserved'}
        </div>

        {/* Provider type badge */}
        <div style={{
          position: 'absolute', top: 12, right: 12,
          padding: '4px 10px', borderRadius: 999,
          background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
          fontSize: 11, fontWeight: 600, color: meta.color,
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          {meta.symbol} {meta.label}
        </div>

        {/* Dark gradient overlay at bottom */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(to top, rgba(0,0,0,0.35), transparent)' }}/>
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 3, fontWeight: 500 }}>{listing.providerName}</div>
          <div style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.3, color: 'var(--ink)' }}>{listing.title}</div>
        </div>

        {/* Dietary tags */}
        {listing.dietary?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {listing.dietary.slice(0, 3).map(d => (
              <span key={d} style={{
                padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 500,
                background: 'var(--paper-3)', color: 'var(--ink-2)',
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                {DIETARY_ICONS[d] || ''} {d}
              </span>
            ))}
          </div>
        )}

        {/* Location + time */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon name="pin" size={11} color="var(--ember)"/> {listing.area || listing.pickupLocation || 'UCLA area'}
          </span>
          {listing.pickupWindow && (
            <span style={{ fontSize: 12, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="clock" size={11}/> {listing.pickupWindow}
            </span>
          )}
        </div>

        {/* Nutrition strip (if available) */}
        {listing.nutrition?.calories && (
          <div style={{ display: 'flex', gap: 8, padding: '7px 10px', background: 'var(--paper-3)', borderRadius: 10 }}>
            {[['cal', listing.nutrition.calories], ['pro', `${listing.nutrition.protein}g`], ['carbs', `${listing.nutrition.carbs}g`]].map(([k, v]) => (
              <div key={k} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}>{v}</div>
                <div style={{ fontSize: 9, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k}</div>
              </div>
            ))}
          </div>
        )}

        <button
          className="btn btn-ember"
          style={{ height: 38, fontSize: 13, marginTop: 'auto', width: '100%' }}
          disabled={!available}
          onClick={e => { e.stopPropagation(); onOpen(listing) }}
        >
          {available ? 'View & Reserve' : 'Fully Reserved'}
        </button>
      </div>
    </div>
  )
}

// ── Detail modal ──────────────────────────────────────────────────────────────
function FoodDetail({ listing, onClose, onReserve, reserved }) {
  const meta = typeMeta(listing.providerType)
  const available = listing.portionsLeft > 0
  const isReserved = reserved === listing.id
  const directionsUrl = listing.lat && listing.lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${listing.lat},${listing.lng}`
    : listing.pickupLocation
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(listing.pickupLocation)}`
      : null

  const pin = listing.lat && listing.lng
    ? [{ id: listing.id, lat: listing.lat, lng: listing.lng, label: '★', caption: listing.providerName?.split(' ')[0] }]
    : []

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div style={{ width: 'min(800px,100%)', maxHeight: '92vh', overflow: 'auto', background: 'var(--paper)', borderRadius: 24, boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>

        {/* Hero image */}
        <div style={{ position: 'relative', height: 260 }}>
          {listing.imageBase64 ? (
            <img src={`data:${listing.imageMime || 'image/jpeg'};base64,${listing.imageBase64}`} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '24px 24px 0 0' }}/>
          ) : (
            <div style={{ width: '100%', height: '100%', background: gradientFor(listing.id), borderRadius: '24px 24px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 80, filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.15))' }}>{listing.emoji || '🍽'}</span>
            </div>
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)', borderRadius: '24px 24px 0 0' }}/>
          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="close" size={16}/>
          </button>
          <div style={{ position: 'absolute', bottom: 20, left: 24 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', color: '#fff', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
              {meta.symbol} {meta.label}
            </div>
            <div style={{ color: '#fff', fontSize: 26, fontWeight: 800, lineHeight: 1.2, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>{listing.title}</div>
          </div>
        </div>

        <div style={{ padding: '24px 28px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Left column */}
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{listing.providerName}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 16 }}>{listing.pickupLocation}</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                ['Pickup window', listing.pickupWindow],
                ['Portions left', `${listing.portionsLeft} of ${listing.portions}`],
                ['Cuisine', listing.cuisine],
                listing.microwavable && ['Kitchen', 'Microwave-friendly'],
              ].filter(Boolean).map(([k, v]) => v && (
                <div key={k} style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--ink-3)', paddingTop: 1 }}>{k}</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>

            {listing.dietary?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                {listing.dietary.map(d => (
                  <span key={d} style={{ padding: '5px 12px', borderRadius: 999, fontSize: 12, background: 'var(--paper-3)', color: 'var(--ink-2)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    {DIETARY_ICONS[d] || ''} {d}
                  </span>
                ))}
              </div>
            )}

            {listing.description && (
              <div style={{ padding: 14, background: 'var(--paper-3)', borderRadius: 14, fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: 20 }}>
                {listing.description}
              </div>
            )}

            {/* Nutrition */}
            {listing.nutrition?.calories && (
              <div style={{ padding: 14, background: 'oklch(0.95 0.04 145)', borderRadius: 14, marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'oklch(0.38 0.12 145)', marginBottom: 10 }}>Nutrition per serving</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                  {[['cal', listing.nutrition.calories], ['protein', `${listing.nutrition.protein}g`], ['carbs', `${listing.nutrition.carbs}g`], ['fat', `${listing.nutrition.fat}g`], ['fiber', `${listing.nutrition.fiber}g`]].map(([k, v]) => (
                    <div key={k} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: 'oklch(0.3 0.1 145)' }}>{v ?? '—'}</div>
                      <div style={{ fontSize: 9, color: 'oklch(0.48 0.1 145)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn-ember"
                style={{ flex: 1, height: 48, fontSize: 14 }}
                disabled={!available || isReserved}
                onClick={() => onReserve(listing)}
              >
                {isReserved ? 'Reserved ✓' : available ? 'Reserve my portion' : 'Fully Reserved'}
              </button>
              {directionsUrl && (
                <button className="btn btn-ghost" style={{ height: 48 }} onClick={() => window.open(directionsUrl, '_blank')}>
                  <Icon name="pin" size={14}/> Directions
                </button>
              )}
            </div>
          </div>

          {/* Right column — map */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {pin.length > 0 ? (
              <RealMap pins={pin} highlight={listing.id} height={280} center={[listing.lat, listing.lng]} zoom={15}/>
            ) : (
              <div style={{ height: 280, background: 'var(--paper-3)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>No map location</span>
              </div>
            )}

            {listing.foodItems?.length > 0 && (
              <div style={{ padding: 16, background: 'var(--paper-3)', borderRadius: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', marginBottom: 10 }}>What's included</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {listing.foodItems.map(item => (
                    <span key={item} style={{ padding: '4px 10px', borderRadius: 999, background: 'var(--paper)', fontSize: 12, border: '1px solid var(--line)', color: 'var(--ink-2)' }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {listing.allergens?.length > 0 && (
              <div style={{ padding: 12, background: 'oklch(0.98 0.03 55)', borderRadius: 12, border: '1px solid oklch(0.92 0.07 55)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'oklch(0.5 0.12 55)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                  ⚠ Allergens
                </div>
                <div style={{ fontSize: 13, color: 'oklch(0.4 0.1 55)' }}>{listing.allergens.join(', ')}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main FoodLibrary page ─────────────────────────────────────────────────────
export default function FoodLibrary() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [openListing, setOpenListing] = useState(null)
  const [reserved, setReserved] = useState(null)
  const [mapHighlight, setMapHighlight] = useState(null)

  useEffect(() => {
    fetchAllListings()
      .then(data => { setListings(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const DIETARY_FILTERS = ['all', 'halal', 'vegan', 'vegetarian', 'gluten-free', 'kosher']
  const TYPE_FILTERS = [
    { id: 'all', label: 'All types' },
    { id: 'home cook', label: '🏠 Home Cook' },
    { id: 'restaurant', label: '🍽 Restaurant' },
    { id: 'campus org', label: '🎓 Campus Org' },
    { id: 'company', label: '🏢 Company' },
  ]

  const visible = listings.filter(l => {
    const matchesDiet = filter === 'all' || l.dietary?.includes(filter)
    const matchesType = typeFilter === 'all' || l.providerType?.toLowerCase() === typeFilter
    const matchesSearch = !search.trim() || [l.title, l.providerName, l.cuisine, l.area].join(' ').toLowerCase().includes(search.toLowerCase())
    return matchesDiet && matchesType && matchesSearch
  })

  const mapPins = visible
    .filter(l => l.lat && l.lng)
    .map((l, i) => ({ id: l.id, lat: l.lat, lng: l.lng, label: 'ABCDEFGHIJKLMNOP'[i] || '·', caption: l.providerName?.split(' ')[0] || '' }))

  const chipStyle = (active) => ({
    padding: '7px 14px', borderRadius: 999, fontSize: 12, cursor: 'pointer',
    fontFamily: 'inherit', transition: 'all 0.15s', fontWeight: active ? 600 : 400,
    background: active ? 'var(--ink)' : 'var(--paper-2)',
    color: active ? '#fff' : 'var(--ink-2)',
    border: `1.5px solid ${active ? 'var(--ink)' : 'var(--line)'}`,
    whiteSpace: 'nowrap',
  })

  async function handleReserve(listing) {
    setReserved(listing.id)
    setOpenListing(null)
    try { await reserveListing(listing.id, 'lib-' + Date.now()) } catch {}
    setListings(prev => prev.map(l => l.id === listing.id ? { ...l, portionsLeft: Math.max(0, (l.portionsLeft || 0) - 1) } : l))
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>

      {/* Hero header */}
      <div style={{ padding: '48px 48px 0', maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 28 }}>🥘</span>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-3)' }}>Food Library</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 44, fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.02em', lineHeight: 1 }}>
              Everything being shared.
            </h1>
            <div style={{ fontSize: 16, color: 'var(--ink-3)', maxWidth: 480 }}>
              Real food from real people near UCLA — home cooks, restaurants, campus orgs.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 14 }}>
            <span style={{ fontSize: 22 }}>📊</span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{listings.filter(l => l.portionsLeft > 0).reduce((s, l) => s + (l.portionsLeft || 0), 0)}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>portions available now</div>
            </div>
            <div style={{ width: 1, height: 32, background: 'var(--line)', margin: '0 6px' }}/>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{listings.length}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>total listings</div>
            </div>
          </div>
        </div>

        {/* Search + filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 200, maxWidth: 400, padding: '10px 16px', background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 12 }}>
            <Icon name="search" size={15} color="var(--ink-3)"/>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, provider, cuisine…"
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 14, width: '100%', fontFamily: 'inherit' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {DIETARY_FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={chipStyle(filter === f)}>
                {DIETARY_ICONS[f] || ''} {f === 'all' ? 'All dietary' : f}
              </button>
            ))}
          </div>
        </div>

        {/* Type filter row */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 32, flexWrap: 'wrap' }}>
          {TYPE_FILTERS.map(f => (
            <button key={f.id} onClick={() => setTypeFilter(f.id)}
              style={{
                ...chipStyle(typeFilter === f.id),
                background: typeFilter === f.id ? typeMeta(f.id === 'all' ? 'home cook' : f.id).bg : 'var(--paper-2)',
                color: typeFilter === f.id ? typeMeta(f.id === 'all' ? 'home cook' : f.id).color : 'var(--ink-2)',
                border: `1.5px solid ${typeFilter === f.id ? typeMeta(f.id === 'all' ? 'home cook' : f.id).color : 'var(--line)'}`,
              }}>
              {f.label}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-3)', alignSelf: 'center', padding: '0 4px' }}>
            {visible.length} listing{visible.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Main grid + map */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 0, maxWidth: 1400, margin: '0 auto', padding: '0 48px 60px' }}>

        {/* Grid */}
        <div style={{ paddingRight: 32 }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12 }}>
              <span className="typing"><span/><span/><span/></span>
              <span style={{ color: 'var(--ink-3)', fontSize: 14 }}>Loading listings…</span>
            </div>
          ) : visible.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🍽</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Nothing matches yet</div>
              <div style={{ color: 'var(--ink-3)' }}>Try a different filter, or check back later when providers add more food.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 18 }}>
              {visible.map(l => (
                <FoodCard
                  key={l.id}
                  listing={l}
                  onOpen={setOpenListing}
                  onHover={setMapHighlight}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sticky map */}
        <div style={{ position: 'sticky', top: 80, height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-3)' }}>
            {mapPins.length} locations on map
          </div>
          {mapPins.length > 0 ? (
            <RealMap
              pins={mapPins}
              highlight={mapHighlight || openListing?.id}
              height="100%"
              borderRadius="20px"
              onPinClick={(id) => setOpenListing(visible.find(l => l.id === id))}
            />
          ) : (
            <div style={{ flex: 1, background: 'var(--paper-2)', borderRadius: 20, border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontSize: 32 }}>🗺</span>
              <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>No locations to show</span>
            </div>
          )}
        </div>
      </div>

      {/* Detail modal */}
      {openListing && (
        <FoodDetail
          listing={openListing}
          onClose={() => setOpenListing(null)}
          onReserve={handleReserve}
          reserved={reserved}
        />
      )}
    </div>
  )
}
