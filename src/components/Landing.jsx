import { useState } from 'react'
import Icon from './Icon'
import Placeholder from './Placeholder'

const SUGGESTIONS = [
  "Need food now", "Protein meals", "Open tonight",
  "Halal", "Vegetarian", "Groceries for a family",
]

function HeroCard({ top, left, right, rotate, delay, kicker, title, image, label, status, statusColor, tags }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="card"
      style={{
        position: 'absolute', top, left, right,
        width: 296,
        transform: `rotate(${hover ? 0 : rotate}deg) translateY(${hover ? -4 : 0}px)`,
        transition: `transform 0.35s cubic-bezier(.2,.8,.2,1) ${delay}s, box-shadow 0.2s`,
        boxShadow: hover ? 'var(--shadow-lift)' : 'var(--shadow-card)',
        animation: `heroIn 0.8s cubic-bezier(.2,.8,.2,1) ${delay}s both`,
      }}
    >
      <Placeholder variant={image} label={label} ratio="5/4"/>
      <div style={{ padding: 18 }}>
        <div className="mono" style={{ color: 'var(--ink-3)', marginBottom: 6, fontSize: 10 }}>{kicker}</div>
        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8, color: 'var(--ink)' }}>{title}</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          {tags.map(t => <span key={t} className="tag" style={{ height: 24, fontSize: 11, padding: '0 10px' }}>{t}</span>)}
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.06em',
          textTransform: 'uppercase', color: statusColor, fontWeight: 500,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor }}/>
          {status}
        </div>
      </div>
    </div>
  )
}

function EntryCard({ icon, label, title, body, cta, onClick, accent }) {
  return (
    <button onClick={onClick} className="card" style={{
      textAlign: 'left', display: 'flex', flexDirection: 'column',
      padding: 30, minHeight: 288,
      background: accent ? 'var(--ink)' : 'var(--paper-2)',
      color: accent ? '#FFF5EA' : 'var(--ink)',
      border: accent ? '1px solid var(--ink)' : '1px solid var(--line)',
      transition: 'transform 0.15s ease, box-shadow 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lift)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-card)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 44 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: accent ? 'rgba(255,230,214,0.12)' : 'var(--ember-w)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name={icon} size={22} color={accent ? '#FFB889' : 'var(--ember)'}/>
        </div>
        <span className="mono" style={{ color: accent ? 'rgba(255,230,214,0.55)' : 'var(--ink-3)' }}>{label}</span>
      </div>
      <div className="serif" style={{ fontSize: 34, marginBottom: 14, letterSpacing: '-0.01em', lineHeight: 1.1 }}>{title}</div>
      <div style={{ fontSize: 14.5, lineHeight: 1.55, color: accent ? 'rgba(255,230,214,0.7)' : 'var(--ink-2)', marginBottom: 28, flex: 1 }}>{body}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 500, color: accent ? '#FFB889' : 'var(--ember-d)' }}>
        {cta} <Icon name="arrow" size={14}/>
      </div>
    </button>
  )
}

export default function Landing({ onFlow, onStartSeeker }) {
  const [query, setQuery] = useState("")
  return (
    <div>
      {/* Hero */}
      <div style={{ padding: '72px 48px 96px', maxWidth: 1320, margin: '0 auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1.05fr 0.95fr',
          gap: 72, alignItems: 'center', minHeight: 560,
        }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 24 }}>
              <span className="dot"/> A warm place to start
            </div>
            <h1 className="serif" style={{
              fontSize: 88, lineHeight: 1.0, margin: '0 0 28px',
              letterSpacing: '-0.02em', textWrap: 'balance',
              color: 'var(--ink)', fontWeight: 400,
            }}>
              Find food<br/>near you, in<br/>
              <em style={{ color: 'var(--ember-d)' }}>plain language.</em>
            </h1>
            <p style={{ fontSize: 19, color: 'var(--ink-2)', maxWidth: 520, margin: '0 0 40px', lineHeight: 1.5 }}>
              Tell Hearth what you need — who it's for, when, any diet — and we'll show real, open options nearby. No forms, no login, always free.
            </p>
            <div className="prompt-bar ring">
              <Icon name="search" size={18} color="var(--ink-3)"/>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onStartSeeker(query || "food near me at 5pm, I need protein")}
                placeholder="I need… food at 5pm with protein, halal if possible"
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 16, padding: '10px 0' }}
              />
              <button className="btn btn-primary" style={{ height: 44, padding: '0 22px' }}
                onClick={() => onStartSeeker(query || "food near me at 5pm, I need protein")}>
                Start <Icon name="arrow" size={16}/>
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 20, maxWidth: 620 }}>
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => onStartSeeker(s)} className="tag" style={{ cursor: 'pointer' }}>{s}</button>
              ))}
            </div>
          </div>

          {/* Hero cards */}
          <div style={{ position: 'relative', height: 560 }}>
            <HeroCard
              top={0} left={60} rotate={-4} delay={0}
              kicker="Mission Food Pantry · 0.4 mi" title="Chicken & rice bowls"
              image="warm" label="[chicken & rice]"
              status="open · serving now" statusColor="var(--sage)"
              tags={["halal", "protein"]}
            />
            <HeroCard
              top={70} right={-20} rotate={3} delay={0.1}
              kicker="St. Anthony's Kitchen · 0.7 mi" title="Lentil stew & bread"
              image="sage" label="[lentil stew]"
              status="28 portions left" statusColor="var(--sage)"
              tags={["vegetarian", "hot meal"]}
            />
            <HeroCard
              top={260} left={20} rotate={-1} delay={0.2}
              kicker="Shanti Community · 1.6 mi" title="Vegetable curry & roti"
              image="plum" label="[veg curry]"
              status="opens in 30 min" statusColor="var(--ember)"
              tags={["dairy-free", "vegan"]}
            />
            <HeroCard
              top={380} right={20} rotate={2.5} delay={0.3}
              kicker="Noor Community · 1.3 mi" title="Halal shawarma wraps"
              image="butter" label="[shawarma]"
              status="60 portions · opens 6pm" statusColor="var(--ember)"
              tags={["halal", "protein"]}
            />
          </div>
        </div>
      </div>

      {/* Trust strip */}
      <div style={{ background: 'var(--paper-3)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', padding: '40px 48px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40 }}>
          {[
            { n: "No login.", b: "We never ask for ID, income, or proof." },
            { n: "Plain language.", b: "Describe what you need — we parse the rest." },
            { n: "Safety-checked.", b: "Every listing passes a basic food-safety check." },
            { n: "Always free.", b: "For seekers. For providers. For everyone." },
          ].map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'var(--paper-2)', border: '1px solid var(--line)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--ember)', flexShrink: 0,
              }}>
                <Icon name={["shield","sparkle","check","heart"][i]} size={16}/>
              </div>
              <div>
                <div className="serif" style={{ fontSize: 20, marginBottom: 4, letterSpacing: '-0.005em' }}>{t.n}</div>
                <div style={{ color: 'var(--ink-2)', fontSize: 13.5, lineHeight: 1.5 }}>{t.b}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Three entry points */}
      <div style={{ padding: '88px 48px 120px', maxWidth: 1320, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 40 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 14 }}><span className="dot"/> Three ways in</div>
            <h2 className="serif" style={{ fontSize: 48, margin: 0, letterSpacing: '-0.015em' }}>Seek, share, sponsor.</h2>
          </div>
          <div className="mono" style={{ color: 'var(--ink-3)' }}>No login required</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          <EntryCard
            icon="bowl" label="01 · Seeker" title="I need food"
            body="Tell us what you need. See nearby options with real times, dietary tags, and why it fits."
            cta="Start with a message" onClick={() => onFlow('seeker')} accent
          />
          <EntryCard
            icon="hand" label="02 · Provider" title="I have food to share"
            body="Extra from a restaurant, event, or pantry? Describe it in a sentence — we'll post it."
            cta="Share a listing" onClick={() => onFlow('provider')}
          />
          <EntryCard
            icon="chart" label="03 · Sponsor" title="I fund this work"
            body="Weekly impact reports written by Claude, pulled from real meal data."
            cta="See a dashboard" onClick={() => onFlow('sponsor')}
          />
        </div>
      </div>
    </div>
  )
}
