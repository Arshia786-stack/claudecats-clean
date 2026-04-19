import { useState } from 'react'
import Icon from './Icon'
import Placeholder from './Placeholder'
import MiniMap from './MiniMap'
import { PROVIDER_PARSE } from '../data/hearthData'

const Dot = ({ color = 'var(--ember)', size = 8 }) => (
  <span style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }}/>
)

function Row({ k, v }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12, alignItems: 'start' }}>
      <span className="mono" style={{ color: 'var(--ink-3)', paddingTop: 2 }}>{k}</span>
      <span style={{ fontSize: 14 }}>{v}</span>
    </div>
  )
}

export default function ProviderFlow() {
  const [stage, setStage] = useState("describe")
  const [input, setInput] = useState(PROVIDER_PARSE.input)
  const [parsed, setParsed] = useState(null)

  const submit = () => {
    setStage("parsing")
    setTimeout(() => {
      setParsed(PROVIDER_PARSE.parsed)
      setStage("safety")
    }, 1500)
  }

  const STEPS = [
    { id: "describe", label: "Describe" },
    { id: "safety", label: "Safety check" },
    { id: "posted", label: "Posted" },
    { id: "notified", label: "Pickup & points" },
  ]
  const ORDER = ["describe", "parsing", "safety", "posted", "notified"]
  const curIdx = ORDER.indexOf(stage)

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 120px' }}>
      <div style={{ marginBottom: 28 }}>
        <div className="mono" style={{ color: 'var(--ember)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Dot color="var(--ember)"/> Share food
        </div>
        <h1 className="serif" style={{ fontSize: 40, margin: 0, letterSpacing: '-0.01em' }}>Tell us what you have.</h1>
        <div style={{ color: 'var(--ink-2)', marginTop: 10, maxWidth: 620 }}>
          One sentence is enough. We'll parse it, run a quick safety check, and post it on the map for neighbors nearby.
        </div>
      </div>

      {/* Stepper */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 32 }}>
        {STEPS.map((s, i, arr) => {
          const sIdx = ORDER.indexOf(s.id)
          const done = curIdx > sIdx
          const active = curIdx === sIdx || (s.id === "safety" && stage === "parsing")
          return (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: done ? 'var(--ink)' : active ? 'var(--ember)' : 'var(--paper-3)',
                  color: done || active ? 'var(--paper)' : 'var(--ink-3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 500,
                }}>{done ? <Icon name="check" size={12}/> : i + 1}</div>
                <span className="mono" style={{ color: active ? 'var(--ink)' : 'var(--ink-3)' }}>{s.label}</span>
              </div>
              {i < arr.length - 1 && <div style={{ flex: 1, height: 1, background: 'var(--line)', margin: '0 16px' }}/>}
            </div>
          )
        })}
      </div>

      {stage === "describe" && (
        <div className="card" style={{ padding: 28 }}>
          <div className="mono" style={{ color: 'var(--ink-3)', marginBottom: 10 }}>Describe what you have</div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={4}
            style={{
              width: '100%', resize: 'vertical',
              border: '1px solid var(--line)', borderRadius: 12,
              padding: 14, fontSize: 15, background: 'var(--paper)',
              outline: 'none', lineHeight: 1.5,
            }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
            {["we have ~20 sandwiches", "leftover tray of veg curry", "40 halal chicken wraps", "crate of bananas + apples"].map(t => (
              <button key={t} className="tag" style={{ cursor: 'pointer', height: 32 }} onClick={() => setInput(t)}>{t}</button>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 22 }}>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', maxWidth: 420, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="shield" size={12}/> We'll check temperature, allergens, and pickup window before anything goes live.
            </div>
            <button className="btn btn-ember" onClick={submit} style={{ height: 48, padding: '0 24px' }}>
              Parse & check <Icon name="arrow" size={14}/>
            </button>
          </div>
        </div>
      )}

      {stage === "parsing" && (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div className="typing" style={{ justifyContent: 'center', marginBottom: 14 }}><span/><span/><span/></div>
          <div className="serif" style={{ fontSize: 22 }}>Reading your message…</div>
          <div style={{ color: 'var(--ink-3)', fontSize: 14, marginTop: 6 }}>Extracting portions, dietary tags, pickup window, and location.</div>
        </div>
      )}

      {stage === "safety" && parsed && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card" style={{ padding: 24 }}>
            <div className="mono" style={{ color: 'var(--ember)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="sparkle" size={12}/> Claude parsed this
            </div>
            <div className="serif" style={{ fontSize: 26, letterSpacing: '-0.01em', marginBottom: 18 }}>{parsed.title}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              <Row k="Portions" v={`${parsed.portions} servings`}/>
              <Row k="Pickup" v={parsed.pickup}/>
              <Row k="Location" v={parsed.location}/>
              <Row k="Tags" v={<div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{parsed.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>}/>
            </div>
            <button className="btn btn-ghost" style={{ fontSize: 13, height: 38 }}>
              <Icon name="plus" size={14}/> Adjust manually
            </button>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <div className="mono" style={{ color: 'var(--sage)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="shield" size={12}/> Safety check · passing
            </div>
            <div className="serif" style={{ fontSize: 22, marginBottom: 16 }}>All four checks look good.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {parsed.safety.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--sage-t)', borderRadius: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'oklch(0.55 0.1 150)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="check" size={12}/>
                  </div>
                  <span style={{ fontSize: 13, color: 'oklch(0.25 0.08 150)' }}>{s.label}</span>
                </div>
              ))}
            </div>
            <button className="btn btn-ember" style={{ width: '100%', height: 48 }} onClick={() => setStage("posted")}>
              Post to the map <Icon name="arrow" size={14}/>
            </button>
          </div>
        </div>
      )}

      {stage === "posted" && parsed && (
        <div className="card" style={{ padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--sage-t)', color: 'oklch(0.35 0.08 150)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="check" size={22}/>
            </div>
            <div>
              <div className="mono" style={{ color: 'var(--sage)' }}>Live · saved to Airtable · on the map</div>
              <div className="serif" style={{ fontSize: 26, letterSpacing: '-0.01em' }}>Your listing is up.</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div className="card" style={{ padding: 16, background: 'var(--paper)' }}>
              <Placeholder variant="warm" label="[chicken & rice]" ratio="16/9"/>
              <div style={{ padding: '14px 4px 2px' }}>
                <div className="mono" style={{ color: 'var(--ink-3)' }}>You · Mission District</div>
                <div style={{ fontWeight: 500, marginTop: 4 }}>{parsed.title}</div>
                <div className="mono" style={{ color: 'var(--sage)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Dot color="var(--sage)"/> 30 portions · open until 7:30pm
                </div>
              </div>
            </div>
            <MiniMap height={260} pins={[{ id: "me", x: 40, y: 50, label: "★", caption: "You", tone: "ember" }]} highlight="me"/>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="mono" style={{ color: 'var(--ink-3)' }}>we'll ping you when neighbors reserve</div>
            <button className="btn btn-primary" onClick={() => setStage("notified")}>
              Simulate pickup → <Icon name="arrow" size={14}/>
            </button>
          </div>
        </div>
      )}

      {stage === "notified" && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20 }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', background: 'var(--paper-3)', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name="bell" size={14} color="var(--ink-2)"/>
              <span className="mono" style={{ color: 'var(--ink-2)' }}>New message · written by Claude</span>
              <span style={{ marginLeft: 'auto', fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)' }}>just now</span>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--ember-t)', color: 'var(--ember-d)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="sparkle" size={14}/>
                </div>
                <div style={{ fontWeight: 500 }}>FULL</div>
              </div>
              <div className="serif" style={{ fontSize: 22, lineHeight: 1.35, marginBottom: 12, letterSpacing: '-0.005em' }}>
                All 30 portions went out in under 90 minutes.
              </div>
              <p style={{ color: 'var(--ink-2)', margin: 0, fontSize: 15 }}>
                Your chicken & rice bowls were picked up by 28 neighbors this evening — including a parent with two kids, a student who walked from SF State, and three folks you helped between 6 and 7pm.
              </p>
              <p style={{ color: 'var(--ink-2)', marginTop: 10, fontSize: 15 }}>
                Two leftover portions went to St. Anthony's for breakfast tomorrow. Nothing was wasted. Thank you.
              </p>
              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                <button className="btn btn-ghost" style={{ fontSize: 13, height: 40 }}>Share thanks back</button>
                <button className="btn btn-ghost" style={{ fontSize: 13, height: 40 }}>Post again tomorrow</button>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <div className="mono" style={{ color: 'var(--ember)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="flame" size={12}/> FULL points
            </div>
            <div className="serif" style={{ fontSize: 56, lineHeight: 1, letterSpacing: '-0.02em' }}>+ 140</div>
            <div style={{ color: 'var(--ink-2)', marginTop: 10, fontSize: 14 }}>Awarded for 28 meals served + a fast, safe listing.</div>
            <div className="hr" style={{ margin: '20px 0' }}/>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <Row k="This week" v="320 pts"/>
              <Row k="Lifetime" v="4,210 pts"/>
              <Row k="Rank" v="Top 4% in SF"/>
            </div>
            <button className="btn btn-ghost" style={{ width: '100%', marginTop: 18, height: 40, fontSize: 13 }}>
              See what points unlock
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
