import { useState, useRef, useEffect } from 'react'
import Icon from './Icon'
import Placeholder from './Placeholder'
import MiniMap from './MiniMap'
import { LISTINGS, RESOURCES, RECIPE } from '../data/hearthData'

const Dot = ({ color = 'var(--ember)', size = 8 }) => (
  <span style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }}/>
)

function SeekerChat({ initialQuery, onComplete }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi, I'm Hearth. What would help most right now?" },
  ])
  const [input, setInput] = useState(initialQuery || "")
  const [typing, setTyping] = useState(false)
  const [step, setStep] = useState(0)
  const scrollRef = useRef(null)

  const SCRIPT = [
    { reply: "Got it. Anyone else eating, or just you? Any diet to know about?", userHint: "just me, halal if possible" },
    { reply: "Thanks. How far can you travel right now?", userHint: "about 20 min walking" },
    { reply: "That's enough. Building your profile and pulling what's open near you…", tool: true },
  ]

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, typing])

  const send = (text) => {
    if (!text.trim()) return
    setMessages(m => [...m, { role: "user", text }])
    setInput("")
    setTyping(true)
    setTimeout(() => {
      const next = SCRIPT[step]
      if (!next) return
      setTyping(false)
      setMessages(m => [...m, { role: "assistant", text: next.reply, tool: next.tool }])
      setStep(s => s + 1)
      if (next.tool) setTimeout(() => onComplete(), 1400)
    }, 900)
  }

  useEffect(() => {
    if (initialQuery && messages.length === 1) {
      setTimeout(() => send(initialQuery), 400)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const currentHint = SCRIPT[step]?.userHint || ""

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px 200px' }}>
      <div style={{ marginBottom: 24 }}>
        <div className="mono" style={{ color: 'var(--ember)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Dot color="var(--ember)"/> Talking with Hearth
        </div>
        <h1 className="serif" style={{ fontSize: 38, margin: 0, letterSpacing: '-0.01em' }}>
          Let's figure out what you need.
        </h1>
      </div>

      <div ref={scrollRef} style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 380, paddingBottom: 20 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {m.role === 'assistant' && (
              <div style={{ marginRight: 10, paddingTop: 4 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--ember-t)', color: 'var(--ember-d)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name="sparkle" size={14}/>
                </div>
              </div>
            )}
            <div className={`bubble ${m.role}`}>
              {m.text}
              {m.tool && (
                <div style={{
                  marginTop: 10, padding: 10, borderRadius: 10,
                  background: 'var(--paper-3)', color: 'var(--ink-2)',
                  fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.06em',
                  textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span className="typing"><span/><span/><span/></span>
                  fetching listings · matching profile
                </div>
              )}
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: 'flex' }}>
            <div style={{ marginRight: 10, paddingTop: 4 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--ember-t)', color: 'var(--ember-d)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="sparkle" size={14}/>
              </div>
            </div>
            <div className="bubble assistant">
              <span className="typing"><span/><span/><span/></span>
            </div>
          </div>
        )}
      </div>

      <div style={{
        position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
        width: 'min(720px, calc(100vw - 48px))',
        background: 'var(--paper)', border: '1px solid var(--line-2)', borderRadius: 24,
        padding: 12, display: 'flex', alignItems: 'flex-end', gap: 8,
        boxShadow: '0 20px 50px oklch(0 0 0 / 0.08)', zIndex: 10,
      }} className="ring">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
          placeholder={currentHint ? `try: "${currentHint}"` : "type a message…"}
          rows={1}
          style={{
            flex: 1, border: 'none', outline: 'none', resize: 'none',
            background: 'transparent', padding: '10px 10px', fontSize: 15,
            minHeight: 24, maxHeight: 120,
          }}
        />
        <button className="btn btn-ghost" style={{ width: 44, padding: 0 }}>
          <Icon name="mic" size={16}/>
        </button>
        <button className="btn btn-primary" onClick={() => send(input)} style={{ width: 44, padding: 0 }}>
          <Icon name="send" size={16}/>
        </button>
      </div>
    </div>
  )
}

function ProfileSummary({ onBack }) {
  const profile = [
    { k: "Dietary", v: "halal · high protein preferred" },
    { k: "Party", v: "just you (1 meal)" },
    { k: "When", v: "around 5pm today" },
    { k: "Travel", v: "up to 20 min on foot" },
    { k: "Language", v: "English" },
  ]
  return (
    <div className="card" style={{ padding: 20, maxWidth: 360 }}>
      <div className="mono" style={{ color: 'var(--ink-3)', marginBottom: 8 }}>Profile Hearth built for you</div>
      <div className="serif" style={{ fontSize: 22, marginBottom: 12 }}>Here's what I heard.</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {profile.map(p => (
          <div key={p.k} style={{ display: 'flex', gap: 12, fontSize: 13 }}>
            <span style={{ width: 72, color: 'var(--ink-3)' }} className="mono">{p.k}</span>
            <span style={{ flex: 1, color: 'var(--ink)' }}>{p.v}</span>
          </div>
        ))}
      </div>
      <button onClick={onBack} style={{ marginTop: 16, fontSize: 13, color: 'var(--ink-2)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
        Edit in chat →
      </button>
    </div>
  )
}

function ListingCard({ listing, highlighted, onHover, onClick, reserved, compact }) {
  const isReserved = reserved === listing.id
  return (
    <div
      onMouseEnter={() => onHover && onHover(listing.id)}
      onMouseLeave={() => onHover && onHover(null)}
      onClick={() => onClick && onClick(listing)}
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
        ratio={compact ? "1/1" : "5/4"}
        style={compact ? { width: 96, height: 96, flexShrink: 0, borderRadius: 12 } : {}}
      />
      <div style={{ padding: compact ? 0 : 18, flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="mono" style={{ color: 'var(--ink-3)', marginBottom: 4 }}>{listing.provider}</div>
            <div style={{ fontWeight: 500, fontSize: compact ? 15 : 17, lineHeight: 1.3, marginBottom: 6 }}>{listing.title}</div>
          </div>
          {!compact && (
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'var(--paper)', border: '1px solid var(--line)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--ink-2)', flexShrink: 0,
            }}>
              <span className="mono" style={{ color: 'var(--ink-2)', fontSize: 10 }}>{listing.map.label}</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 4 }}>
          <span className="mono" style={{ color: 'var(--sage)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Dot color="var(--sage)"/> {listing.badge}
          </span>
          <span className="mono" style={{ color: 'var(--ink-3)' }}>{listing.distance} · {listing.walkTime}</span>
        </div>
        {!compact && (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
              {listing.tags.map(t => <span key={t} className="tag">{t}</span>)}
            </div>
            <div style={{ marginTop: 14, padding: 12, background: 'var(--ember-t)', borderRadius: 10, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Icon name="sparkle" size={14} color="var(--ember-d)"/>
              <div style={{ fontSize: 13, color: 'var(--ember-d)', fontStyle: 'italic', fontFamily: 'var(--f-serif)' }}>
                {listing.matchReason}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
              <div className="mono" style={{ color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon name="clock" size={12}/> {listing.pickup}
              </div>
              {isReserved ? (
                <span className="tag sage"><Icon name="check" size={12}/> reserved</span>
              ) : (
                <span style={{ fontSize: 13, fontWeight: 500 }}>Reserve →</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function ListingDetail({ listing, onClose, onReserve, isReserved }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'oklch(0 0 0 / 0.3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, backdropFilter: 'blur(4px)',
    }} onClick={onClose}>
      <div className="card" style={{ width: 'min(720px, 100%)', maxHeight: '90vh', overflow: 'auto', background: 'var(--paper)' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ position: 'relative' }}>
          <Placeholder variant={listing.image} label={listing.imgLabel} ratio="16/9"/>
          <button onClick={onClose} style={{
            position: 'absolute', top: 16, right: 16,
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--paper)', border: '1px solid var(--line-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="close" size={16}/>
          </button>
        </div>
        <div style={{ padding: 28 }}>
          <div className="mono" style={{ color: 'var(--ink-3)', marginBottom: 8 }}>{listing.provider} · {listing.neighborhood}</div>
          <h2 className="serif" style={{ fontSize: 32, margin: '0 0 14px', letterSpacing: '-0.01em' }}>{listing.title}</h2>
          <div style={{ display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
            {[["Pickup window", listing.pickup], ["Distance", `${listing.distance} · ${listing.walkTime}`], ["Portions left", `${listing.portions}`]].map(([l, v]) => (
              <div key={l}><div className="mono" style={{ color: 'var(--ink-3)', marginBottom: 4 }}>{l}</div><div style={{ fontSize: 15, fontWeight: 500 }}>{v}</div></div>
            ))}
          </div>
          <div style={{ padding: 16, background: 'var(--ember-t)', borderRadius: 12, marginBottom: 24 }}>
            <div className="mono" style={{ color: 'var(--ember-d)', marginBottom: 6 }}>Why this matches you</div>
            <div className="serif" style={{ fontSize: 18, fontStyle: 'italic', color: 'var(--ember-d)' }}>{listing.matchReason}</div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
            {listing.tags.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ember" style={{ flex: 1, height: 52, fontSize: 15 }}
              onClick={() => onReserve(listing)} disabled={isReserved}>
              {isReserved ? 'Reserved ✓' : 'Reserve my portion'}
            </button>
            <button className="btn btn-ghost" style={{ height: 52 }}><Icon name="pin" size={16}/> Directions</button>
          </div>
          <div style={{ marginTop: 14, fontSize: 12, color: 'var(--ink-3)' }}>
            Reservations hold for 30 minutes. No ID needed — just show up.
          </div>
        </div>
      </div>
    </div>
  )
}

function ReservedConfirmation({ listing, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 110,
      background: 'oklch(0.22 0.02 60 / 0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, backdropFilter: 'blur(8px)',
    }}>
      <div className="card" style={{ width: 'min(640px, 100%)', background: 'var(--paper)' }}>
        <div style={{ padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'var(--sage-t)', color: 'oklch(0.35 0.08 150)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><Icon name="check" size={22}/></div>
            <div>
              <div className="mono" style={{ color: 'var(--sage)' }}>Reserved · held 30 min</div>
              <div className="serif" style={{ fontSize: 26, letterSpacing: '-0.01em' }}>You're set.</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, padding: 16, background: 'var(--paper-2)', borderRadius: 12, marginBottom: 24 }}>
            <Placeholder variant={listing.image} label="" ratio="1/1" style={{ width: 80, height: 80, borderRadius: 10 }}/>
            <div style={{ flex: 1 }}>
              <div className="mono" style={{ color: 'var(--ink-3)' }}>{listing.provider}</div>
              <div style={{ fontWeight: 500 }}>{listing.title}</div>
              <div className="mono" style={{ color: 'var(--ink-2)', marginTop: 4 }}>{listing.pickup} · {listing.distance}</div>
            </div>
          </div>

          <div style={{ padding: 20, borderRadius: 14, border: '1px dashed var(--line-2)', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Icon name="sparkle" size={14} color="var(--ember)"/>
              <div className="mono" style={{ color: 'var(--ember)' }}>A note from Hearth</div>
            </div>
            <div className="serif" style={{ fontSize: 22, marginBottom: 14, letterSpacing: '-0.005em' }}>{RECIPE.title}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {RECIPE.tips.map((t, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 14 }}>
                  <div className="mono" style={{ color: 'var(--ink-3)', paddingTop: 2 }}>{t.h}</div>
                  <div style={{ fontSize: 14, color: 'var(--ink)' }}>{t.b}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, fontSize: 12, color: 'var(--ink-3)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="shield" size={12}/> {RECIPE.safety}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" style={{ flex: 1, height: 48 }}>
              <Icon name="pin" size={16}/> Get directions
            </button>
            <button className="btn btn-ghost" onClick={onClose} style={{ height: 48 }}>Back to results</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SeekerResults({ onReserve, reserved, onBackToChat }) {
  const [highlight, setHighlight] = useState(null)
  const [filter, setFilter] = useState("all")
  const [openListing, setOpenListing] = useState(null)

  const filters = ["all", "protein", "halal", "vegetarian", "open now", "dairy-free", "groceries"]
  const visible = LISTINGS.filter(l =>
    filter === "all" || l.tags.includes(filter) || (filter === "open now" && l.badge === "serving now")
  )
  const pins = visible.map(l => ({
    ...l.map, id: l.id, caption: l.distance, tone: l.map.tone,
    onClick: id => setOpenListing(LISTINGS.find(x => x.id === id)),
  }))

  return (
    <div style={{ padding: '28px 40px 60px' }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, flex: 1,
          background: 'var(--paper)', border: '1px solid var(--line-2)',
          borderRadius: 999, padding: '8px 16px', maxWidth: 640,
        }}>
          <Icon name="search" size={16} color="var(--ink-3)"/>
          <span style={{ color: 'var(--ink)', fontSize: 14 }}>food near me at 5pm · protein · halal · 20 min walk</span>
          <button onClick={onBackToChat} className="mono" style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-3)' }}>Edit</button>
        </div>
        <span className="mono" style={{ color: 'var(--ink-3)' }}>{visible.length} matches · Mission District</span>
      </div>

      <div className="scroll-x" style={{ marginBottom: 24, gap: 8 }}>
        {filters.map(f => (
          <button key={f} className={`tag ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)} style={{ cursor: 'pointer', height: 34, fontSize: 11 }}>{f}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 28, alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <h2 className="serif" style={{ fontSize: 26, margin: 0, letterSpacing: '-0.01em' }}>Serving now, near you</h2>
            <span className="mono" style={{ color: 'var(--ink-3)' }}>sorted by match</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {visible.slice(0, 4).map(l => (
              <ListingCard key={l.id} listing={l} highlighted={highlight} onHover={setHighlight} onClick={setOpenListing} reserved={reserved}/>
            ))}
          </div>

          <div style={{ marginTop: 40, marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h2 className="serif" style={{ fontSize: 22, margin: 0, letterSpacing: '-0.01em' }}>Popular food banks & pantries near you</h2>
            <span className="mono" style={{ color: 'var(--ink-3)' }}>this week</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {visible.slice(4).map(l => (
              <ListingCard key={l.id} listing={l} compact highlighted={highlight} onHover={setHighlight} onClick={setOpenListing} reserved={reserved}/>
            ))}
          </div>

          <div style={{ marginTop: 48, marginBottom: 14 }}>
            <h2 className="serif" style={{ fontSize: 22, margin: 0, letterSpacing: '-0.01em' }}>Good resources to know</h2>
            <div style={{ color: 'var(--ink-3)', fontSize: 13, marginTop: 4 }}>Benefits, transit, hygiene — things that help around food.</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {RESOURCES.map(r => (
              <div key={r.id} className="card" style={{ padding: 14, display: 'flex', gap: 14, alignItems: 'center' }}>
                <Placeholder variant={r.image} label="" ratio="1/1" style={{ width: 60, height: 60, borderRadius: 10, flexShrink: 0 }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="mono" style={{ color: 'var(--ink-3)' }}>{r.kicker}</div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{r.title}</div>
                  <div style={{ color: 'var(--ink-3)', fontSize: 12 }}>{r.time}</div>
                </div>
                <Icon name="arrow" size={16} color="var(--ink-2)"/>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'sticky', top: 92, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <ProfileSummary onBack={onBackToChat}/>
          <MiniMap pins={pins} highlight={highlight || (openListing && openListing.id)} height={560}/>
        </div>
      </div>

      {openListing && (
        <ListingDetail
          listing={openListing}
          onClose={() => setOpenListing(null)}
          onReserve={(l) => { onReserve(l); setOpenListing(null) }}
          isReserved={reserved === openListing.id}
        />
      )}
    </div>
  )
}

export default function SeekerFlow({ initialQuery }) {
  const [stage, setStage] = useState("chat")
  const [reserved, setReserved] = useState(null)
  const [reservedListing, setReservedListing] = useState(null)

  if (stage === "chat") {
    return <SeekerChat initialQuery={initialQuery} onComplete={() => setStage("results")}/>
  }

  return (
    <>
      <SeekerResults
        reserved={reserved}
        onBackToChat={() => setStage("chat")}
        onReserve={(l) => { setReserved(l.id); setReservedListing(l) }}
      />
      {reservedListing && (
        <ReservedConfirmation listing={reservedListing} onClose={() => setReservedListing(null)}/>
      )}
    </>
  )
}
