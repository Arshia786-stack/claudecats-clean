import { useState } from 'react'
import Icon from './Icon'
import { SPONSOR_METRICS } from '../data/hearthData'

function Field({ label, value, type }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div className="mono" style={{ color: 'var(--ink-3)', marginBottom: 6 }}>{label}</div>
      <div style={{
        padding: '12px 14px', border: '1px solid var(--line-2)',
        borderRadius: 10, background: 'var(--paper)', fontSize: 14,
        fontFamily: type === "password" ? 'var(--f-mono)' : undefined,
      }}>{value}</div>
    </div>
  )
}

function SponsorLogin({ onEnter }) {
  return (
    <div style={{ maxWidth: 480, margin: '80px auto', padding: '0 24px' }}>
      <div className="card" style={{ padding: 32 }}>
        <div className="mono" style={{ color: 'var(--ember)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ember)', display: 'inline-block' }}/> Sponsor portal
        </div>
        <h1 className="serif" style={{ fontSize: 32, margin: '0 0 8px', letterSpacing: '-0.01em' }}>Welcome back.</h1>
        <div style={{ color: 'var(--ink-2)', marginBottom: 24, fontSize: 14 }}>
          Sign in to see this week's impact and the report Claude wrote for your team.
        </div>
        <Field label="Email" value="ops@acmefoundation.org"/>
        <Field label="Password" value="••••••••••••" type="password"/>
        <button className="btn btn-primary" style={{ width: '100%', height: 48, marginTop: 8 }} onClick={onEnter}>
          Sign in <Icon name="arrow" size={14}/>
        </button>
        <div style={{ marginTop: 16, fontSize: 12, color: 'var(--ink-3)', textAlign: 'center' }}>
          SSO via Google Workspace · Magic link
        </div>
      </div>
    </div>
  )
}

function Chart({ data }) {
  const max = Math.max(...data)
  const W = 600, H = 200, P = 20
  const step = (W - P * 2) / (data.length - 1)
  const pts = data.map((v, i) => [P + i * step, H - P - (v / max) * (H - P * 2)])
  const path = "M" + pts.map(p => p.join(",")).join(" L")
  const area = path + ` L ${pts[pts.length-1][0]},${H-P} L ${pts[0][0]},${H-P} Z`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 200 }}>
      <defs>
        <linearGradient id="emberFade" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--ember)" stopOpacity="0.18"/>
          <stop offset="1" stopColor="var(--ember)" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map(y => (
        <line key={y} x1={P} x2={W-P} y1={P + y * (H - P*2)} y2={P + y * (H - P*2)}
          stroke="oklch(0.88 0.015 70)" strokeDasharray="2 4"/>
      ))}
      <path d={area} fill="url(#emberFade)"/>
      <path d={path} stroke="var(--ember)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 4 : 2} fill="var(--ember)"/>
      ))}
      <text x={pts[pts.length-1][0] - 8} y={pts[pts.length-1][1] - 10}
        fontFamily="var(--f-mono)" fontSize="11" fill="var(--ember-d)" textAnchor="end">
        4,812
      </text>
    </svg>
  )
}

function SponsorDashboard({ onReport }) {
  const m = SPONSOR_METRICS
  return (
    <div style={{ padding: '32px 40px 80px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div className="mono" style={{ color: 'var(--ink-3)', marginBottom: 6 }}>{m.period}</div>
          <h1 className="serif" style={{ fontSize: 42, margin: 0, letterSpacing: '-0.01em' }}>{m.name} · impact</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" style={{ height: 40, fontSize: 13 }}><Icon name="doc" size={14}/> Export CSV</button>
          <button className="btn btn-primary" style={{ height: 40, fontSize: 13 }} onClick={onReport}><Icon name="chart" size={14}/> Weekly report</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {m.hero.map(h => (
          <div key={h.label} className="card" style={{ padding: 22 }}>
            <div className="mono" style={{ color: 'var(--ink-3)' }}>{h.label}</div>
            <div className="serif" style={{ fontSize: 44, lineHeight: 1.05, letterSpacing: '-0.02em', marginTop: 6 }}>{h.value}</div>
            <div className="mono" style={{ color: h.tone === 'sage' ? 'var(--sage)' : 'var(--ember-d)', marginTop: 8 }}>
              {h.delta} vs. last week
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, marginBottom: 28 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <div>
              <div className="mono" style={{ color: 'var(--ink-3)' }}>Meals served · 24 weeks</div>
              <div className="serif" style={{ fontSize: 22, marginTop: 4 }}>A steady climb.</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <span className="tag active">Weekly</span>
              <span className="tag">Daily</span>
              <span className="tag">Hourly</span>
            </div>
          </div>
          <Chart data={m.chart}/>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <div className="mono" style={{ color: 'var(--ink-3)', marginBottom: 4 }}>By neighborhood</div>
          <div className="serif" style={{ fontSize: 22, marginBottom: 18 }}>Where meals went.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {m.neighborhoods.map(n => (
              <div key={n.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ fontWeight: 500 }}>{n.name}</span>
                  <span className="mono" style={{ color: 'var(--ink-3)' }}>{n.meals.toLocaleString()} meals</span>
                </div>
                <div style={{ height: 6, background: 'var(--paper-3)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${n.pct * 100}%`, height: '100%', background: 'var(--ember)', borderRadius: 999 }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <div className="mono" style={{ color: 'var(--ink-3)', marginBottom: 4 }}>Real notes, no names</div>
          <div className="serif" style={{ fontSize: 22, marginBottom: 18 }}>Voices from this week.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {m.stories.map((s, i) => (
              <div key={i} style={{ padding: 16, background: 'var(--paper)', borderRadius: 12, border: '1px solid var(--line)' }}>
                <div className="serif" style={{ fontSize: 18, fontStyle: 'italic', lineHeight: 1.45 }}>"{s.quote}"</div>
                <div className="mono" style={{ color: 'var(--ink-3)', marginTop: 10 }}>— {s.neighbor}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <div className="mono" style={{ color: 'var(--ink-3)', marginBottom: 4 }}>Live feed · Airtable</div>
          <div className="serif" style={{ fontSize: 22, marginBottom: 14 }}>What's happening now.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { t: "2 min ago", msg: "Mission Food Pantry reserved — chicken & rice · seeker in SoMa" },
              { t: "8 min ago", msg: "St. Anthony's posted 28 portions of lentil stew" },
              { t: "14 min ago", msg: "Noor Community Table opens pickup in 45 min" },
              { t: "22 min ago", msg: "GLIDE sandwiches · 12 reserved in the last hour" },
              { t: "31 min ago", msg: "New provider onboarded · Bayview Market" },
            ].map((e, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '90px 1fr', gap: 10,
                paddingBottom: 10,
                borderBottom: i < 4 ? '1px dashed var(--line)' : 'none',
              }}>
                <span className="mono" style={{ color: 'var(--ink-3)' }}>{e.t}</span>
                <span style={{ fontSize: 13, color: 'var(--ink)' }}>{e.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SponsorReport({ onBack }) {
  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '48px 24px 120px' }}>
      <button onClick={onBack} className="mono" style={{ color: 'var(--ink-2)', marginBottom: 20 }}>← Back to dashboard</button>
      <div className="card" style={{ padding: 48, background: 'var(--paper)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div className="mono" style={{ color: 'var(--ember)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="chart" size={12}/> Weekly impact report
            </div>
            <div className="mono" style={{ color: 'var(--ink-3)' }}>{SPONSOR_METRICS.period}</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-ghost" style={{ fontSize: 12, height: 36 }}>Copy</button>
            <button className="btn btn-ghost" style={{ fontSize: 12, height: 36 }}>Export PDF</button>
          </div>
        </div>

        <h1 className="serif" style={{ fontSize: 48, lineHeight: 1.05, margin: '0 0 28px', letterSpacing: '-0.02em' }}>
          A quiet, good week in the Mission.
        </h1>

        <div style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--ink)', fontFamily: 'var(--f-serif)' }}>
          <p style={{ marginTop: 0 }}>Dear {SPONSOR_METRICS.name} team,</p>
          <p>
            This week, <strong>4,812 meals</strong> moved through FULL — a 12% lift over the previous week — reaching <strong>1,207 neighbors</strong> across six San Francisco neighborhoods. Thirty-eight providers contributed, three of them brand-new.
          </p>
          <p>
            The Mission District led again (1,280 meals), driven by Mission Food Pantry's new evening window. Bayview saw the steepest climb — up 34% — after SF Marin Food Bank started posting grocery boxes to FULL instead of a phone tree.
          </p>
          <p>
            Our average match time <strong>dropped to 2.4 minutes</strong>, down 20%. Most of that gain came from better dietary parsing: halal and vegetarian searches now resolve on the first message 87% of the time.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, margin: '28px 0' }}>
          {[
            { k: "4,812", v: "meals served" },
            { k: "1,207", v: "unique neighbors" },
            { k: "2.4 min", v: "median match time" },
          ].map(s => (
            <div key={s.v} style={{ padding: 18, background: 'var(--paper-2)', borderRadius: 12, border: '1px solid var(--line)' }}>
              <div className="serif" style={{ fontSize: 32, letterSpacing: '-0.01em' }}>{s.k}</div>
              <div className="mono" style={{ color: 'var(--ink-3)', marginTop: 4 }}>{s.v}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--ink)', fontFamily: 'var(--f-serif)' }}>
          <p>
            A short story, as always: a parent in Bayview reserved a grocery box at 6:12pm Thursday. By 7:40 she was home with lentils, eggs, two loaves of bread, and a crate of apples. Her note back to the provider read, <em>"the kids actually liked the lentils."</em> That's a win.
          </p>
          <p>
            Next week we're shipping Spanish-language chat, and we're partnering with two more kitchens in the Outer Mission. Your funding made the match engine, the safety checks, and this report possible.
          </p>
          <p style={{ marginBottom: 0 }}>
            With warmth,<br/>
            <em>The FULL team</em>
          </p>
        </div>

        <div className="hr" style={{ margin: '32px 0' }}/>
        <div className="mono" style={{ color: 'var(--ink-3)', fontSize: 10 }}>
          Generated {new Date().toLocaleString()} · live data
        </div>
      </div>
    </div>
  )
}

export default function SponsorFlow() {
  const [stage, setStage] = useState("login")
  if (stage === "login") return <SponsorLogin onEnter={() => setStage("dashboard")}/>
  if (stage === "report") return <SponsorReport onBack={() => setStage("dashboard")}/>
  return <SponsorDashboard onReport={() => setStage("report")}/>
}
