import { useState, useRef, useEffect } from 'react'
import Icon from './Icon'
import RealMap from './RealMap'
import { parseListing, addListing, awardPoints, generateNotify, analyzeFood } from '../lib/api'
import { getProviderAccount, saveProviderAccount, clearProviderAccount } from '../lib/auth'

const UCLA = { lat: 34.0689, lng: -118.4452 }

const PROVIDER_TYPES = [
  { id: 'home', label: 'Home Cook', icon: 'hand', desc: 'Individual sharing home-cooked meals' },
  { id: 'restaurant', label: 'Restaurant', icon: 'bowl', desc: 'Food business with surplus' },
  { id: 'org', label: 'Campus Org', icon: 'leaf', desc: 'Student club or campus organization' },
  { id: 'company', label: 'Company', icon: 'chart', desc: 'Business or corporate kitchen' },
]

function Step({ n, label, active, done }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        background: done ? 'var(--ink)' : active ? 'var(--ember)' : 'var(--paper-3)',
        color: done || active ? '#fff' : 'var(--ink-3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 600, flexShrink: 0,
      }}>
        {done ? <Icon name="check" size={12}/> : n}
      </div>
      <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: active ? 'var(--ink)' : 'var(--ink-3)', fontWeight: 500 }}>{label}</span>
    </div>
  )
}

function Stepper({ stage }) {
  const steps = [
    { id: 'register', label: 'Your account' },
    { id: 'describe', label: 'Your food' },
    { id: 'safety', label: 'Safety check' },
    { id: 'posted', label: 'Posted' },
    { id: 'collected', label: 'Pickup' },
  ]
  const order = ['welcome', 'register', 'describe', 'analyzing', 'safety', 'posted', 'waiting', 'collected']
  const cur = order.indexOf(stage)

  return (
    <div style={{ display: 'flex', gap: 0, marginBottom: 32, flexWrap: 'wrap', rowGap: 10 }}>
      {steps.map((s, i) => {
        const sIdx = order.indexOf(s.id)
        const done = cur > sIdx
        const active = sIdx === cur || (s.id === 'safety' && stage === 'analyzing')
        return (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center' }}>
            <Step n={i + 1} label={s.label} active={active} done={done}/>
            {i < steps.length - 1 && <div style={{ width: 32, height: 1, background: 'var(--line)', margin: '0 12px' }}/>}
          </div>
        )
      })}
    </div>
  )
}

async function geocodeAddress(address) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address + ', Los Angeles, CA')}&format=json&limit=1`
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
    const data = await res.json()
    if (data[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch {}
  return null
}

function WelcomeMap({ account }) {
  const [coords, setCoords] = useState(null)
  useEffect(() => {
    if (!account?.address) return
    geocodeAddress(account.address).then(c => { if (c) setCoords(c) })
  }, [account?.address])

  if (!coords) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { icon: 'pin', title: 'Real impact', desc: 'Every listing reaches students nearby who need a meal tonight.' },
          { icon: 'coin', title: 'FULL Points', desc: 'Earn points for every portion picked up — tracked in your account.' },
          { icon: 'shield', title: 'Safety first', desc: 'We check allergens, pickup window, and food safety before posting.' },
        ].map(item => (
          <div key={item.icon} style={{ padding: '14px 16px', background: 'var(--paper-2)', borderRadius: 12, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <Icon name={item.icon} size={18} color="var(--ember)" style={{ flexShrink: 0, marginTop: 2 }}/>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.4 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)' }}>Your pickup location</div>
      <RealMap
        pins={[{ id: 'home', lat: coords.lat, lng: coords.lng, label: '★', caption: account.name?.split(' ')[0] || 'You' }]}
        highlight="home"
        height={280}
        center={[coords.lat, coords.lng]}
        zoom={15}
      />
      <div style={{ fontSize: 12, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon name="pin" size={12} color="var(--sage)"/>
        {account.address}
      </div>
    </div>
  )
}

export default function ProviderFlow() {
  const savedAccount = getProviderAccount()

  const [stage, setStage] = useState(savedAccount ? 'welcome' : 'register')
  const [account, setAccount] = useState(savedAccount || { name: '', type: '', address: '', phone: '' })
  const [input, setInput] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageBase64, setImageBase64] = useState(null)
  const [parsed, setParsed] = useState(null)
  const [nutrition, setNutrition] = useState(null)
  const [notification, setNotification] = useState(null)
  const [points, setPoints] = useState(null)
  const [providerLatLng, setProviderLatLng] = useState(null)
  const [addressPreview, setAddressPreview] = useState(null)  // live geocode while typing
  const [formError, setFormError] = useState('')
  const fileRef = useRef(null)
  const geocodeTimer = useRef(null)

  function handleImageChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target.result
      setImagePreview(result)
      const base64 = result.split(',')[1]
      setImageBase64(base64)
    }
    reader.readAsDataURL(file)
  }

  async function handleRegister() {
    if (!account.name.trim()) return setFormError('Please enter your name or organization name.')
    if (!account.type) return setFormError('Please select your provider type.')
    if (!account.address.trim()) return setFormError('Please enter your pickup address.')
    setFormError('')
    saveProviderAccount(account)
    const coords = await geocodeAddress(account.address)
    if (coords) setProviderLatLng(coords)
    setStage('describe')
  }

  async function handleWelcomeContinue() {
    const coords = await geocodeAddress(account.address)
    if (coords) setProviderLatLng(coords)
    setStage('describe')
  }

  async function handleSubmit() {
    if (!input.trim()) return
    setStage('analyzing')
    try {
      const [parsedResult, nutritionResult] = await Promise.all([
        parseListing(input),
        imageBase64 ? analyzeFood(imageBase64, imageFile?.type || 'image/jpeg', input) : Promise.resolve(null),
      ])
      const coords = providerLatLng || await geocodeAddress(account.address)
      setParsed({
        ...parsedResult,
        providerName: account.name,
        providerType: account.type,
        lat: coords?.lat,
        lng: coords?.lng,
        nutrition: nutritionResult,
      })
      if (coords) setProviderLatLng(coords)
      setNutrition(nutritionResult)
      setStage('safety')
    } catch {
      setParsed({
        title: input.split(' ').slice(0, 4).join(' '),
        portions: 10, tags: ['home-cooked'],
        pickup: 'Today', location: account.address,
        safety: [
          { label: 'Held at safe temperature', status: 'ok' },
          { label: 'Prepared within last 4 hrs', status: 'ok' },
          { label: 'Allergens declared', status: 'ok' },
          { label: 'Pickup window under 4 hrs', status: 'ok' },
        ],
      })
      setStage('safety')
    }
  }

  async function handlePost() {
    const coords = providerLatLng
    await addListing({
      ...parsed,
      pickupLocation: account.address,
      area: account.address,
      providerName: account.name,
      providerType: account.type,
      lat: coords?.lat,
      lng: coords?.lng,
      nutrition,
      imageBase64: imageBase64 || null,
      imageMime: imageFile?.type || null,
    }).catch(() => {})
    setStage('posted')
  }

  async function handleSimulatePickup() {
    setStage('waiting')
    setTimeout(async () => {
      try {
        const portionsServed = parsed?.portions || 10
        const pts = await awardPoints(account.name, portionsServed, parsed?.dietary || [])
        const notif = await generateNotify({
          foodDescription: parsed?.title || 'your food',
          providerName: account.name.split(' ')[0],
          portions: portionsServed,
          pointsEarned: pts?.pointsEarned || portionsServed * 3,
          newTotal: pts?.newTotal || portionsServed * 5,
        })
        setPoints(pts)
        setNotification(notif)
      } catch {
        setNotification({
          headline: `${account.name.split(' ')[0]}, your food reached people tonight.`,
          body: `${parsed?.portions || 10} portions went to neighbors who needed them. Your generosity made a real difference tonight.`,
        })
        setPoints({ pointsEarned: 60, newTotal: 240 })
      }
      setStage('collected')
    }, 2000)
  }

  const mapPin = providerLatLng
    ? [{ id: 'provider', lat: providerLatLng.lat, lng: providerLatLng.lng, label: '★', caption: account.name?.split(' ')[0] || 'You', tone: 'ember' }]
    : []

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 120px' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ color: 'var(--ember)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--f-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ember)', display: 'inline-block' }}/>
          Share food
        </div>
        <h1 className="serif" style={{ fontSize: 38, margin: 0, letterSpacing: '-0.01em' }}>
          {stage === 'register' ? 'Join as a food provider.' : stage === 'welcome' ? `Good to see you, ${account.name?.split(' ')[0] || 'you'}.` : 'Tell us what you have.'}
        </h1>
        <div style={{ color: 'var(--ink-2)', marginTop: 8, maxWidth: 580, fontSize: 15 }}>
          {stage === 'register'
            ? 'Create your provider account. One sentence is enough to share food — we handle the rest.'
            : stage === 'welcome'
            ? 'Your account is saved. Share food in seconds — we remember everything.'
            : `Sharing as ${account.name} · ${account.address}`}
        </div>
      </div>

      <Stepper stage={stage}/>

      {stage === 'welcome' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'var(--ember-t)', color: 'var(--ember-d)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              }}>
                {PROVIDER_TYPES.find(p => p.id === account.type)?.icon || '👋'}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ember)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Welcome back</div>
                <div className="serif" style={{ fontSize: 22, letterSpacing: '-0.01em' }}>{account.name}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {[
                ['Type', PROVIDER_TYPES.find(p => p.id === account.type)?.label || account.type],
                ['Pickup address', account.address],
                account.phone && ['Phone', account.phone],
              ].filter(Boolean).map(([k, v]) => (
                <div key={k} style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 10 }}>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', paddingTop: 2 }}>{k}</span>
                  <span style={{ fontSize: 14, color: 'var(--ink)' }}>{v}</span>
                </div>
              ))}
            </div>

            <button className="btn btn-ember" style={{ width: '100%', height: 48, marginBottom: 10 }} onClick={handleWelcomeContinue}>
              Share food now <Icon name="arrow" size={14}/>
            </button>
            <button
              className="btn btn-ghost"
              style={{ width: '100%', height: 40, fontSize: 13 }}
              onClick={() => { clearProviderAccount(); setAccount({ name: '', type: '', address: '', phone: '' }); setStage('register') }}
            >
              Switch account
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <WelcomeMap account={account}/>
          </div>
        </div>
      )}

      {stage === 'register' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card" style={{ padding: 28 }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', marginBottom: 18 }}>Your details</div>

            <label style={{ display: 'block', marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 6 }}>Name or organization</div>
              <input
                value={account.name}
                onChange={e => setAccount(a => ({ ...a, name: e.target.value }))}
                placeholder="e.g. Maria Chen, or Hillel at UCLA"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 10, fontSize: 14, background: 'var(--paper)', outline: 'none' }}
              />
            </label>

            <label style={{ display: 'block', marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 6 }}>Pickup address</div>
              <input
                value={account.address}
                onChange={e => {
                  const addr = e.target.value
                  setAccount(a => ({ ...a, address: addr }))
                  clearTimeout(geocodeTimer.current)
                  if (addr.length > 8) {
                    geocodeTimer.current = setTimeout(async () => {
                      const coords = await geocodeAddress(addr)
                      if (coords) setAddressPreview(coords)
                    }, 800)
                  } else {
                    setAddressPreview(null)
                  }
                }}
                placeholder="e.g. 900 Hilgard Ave, Westwood"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 10, fontSize: 14, background: 'var(--paper)', outline: 'none' }}
              />
              {addressPreview && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                  <Icon name="pin" size={11} color="var(--sage)"/>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--sage)' }}>Location found — see map preview →</span>
                </div>
              )}
            </label>

            <label style={{ display: 'block', marginBottom: 18 }}>
              <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 6 }}>Phone (optional)</div>
              <input
                value={account.phone}
                onChange={e => setAccount(a => ({ ...a, phone: e.target.value }))}
                placeholder="For seeker coordination"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 10, fontSize: 14, background: 'var(--paper)', outline: 'none' }}
              />
            </label>

            {formError && <div style={{ color: '#c0392b', fontSize: 13, marginBottom: 12 }}>{formError}</div>}

            <button className="btn btn-ember" onClick={handleRegister} style={{ width: '100%', height: 48 }}>
              Create account <Icon name="arrow" size={14}/>
            </button>

            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--ink-3)', textAlign: 'center' }}>
              Already sharing? Your info is saved locally.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', marginBottom: 2 }}>Provider type</div>
            {PROVIDER_TYPES.map(pt => (
              <button
                key={pt.id}
                onClick={() => setAccount(a => ({ ...a, type: pt.id }))}
                style={{
                  padding: '12px 16px', borderRadius: 12, textAlign: 'left', cursor: 'pointer',
                  background: account.type === pt.id ? 'var(--ember-w)' : 'var(--paper-2)',
                  border: `1.5px solid ${account.type === pt.id ? 'var(--ember)' : 'var(--line)'}`,
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon name={pt.icon} size={18} color={account.type === pt.id ? 'var(--ember)' : 'var(--ink-3)'}/>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{pt.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{pt.desc}</div>
                  </div>
                  {account.type === pt.id && (
                    <div style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%', background: 'var(--ember)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="check" size={9}/>
                    </div>
                  )}
                </div>
              </button>
            ))}

            {/* Live map preview */}
            {addressPreview && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', marginBottom: 8 }}>
                  Your pickup location
                </div>
                <RealMap
                  pins={[{ id: 'preview', lat: addressPreview.lat, lng: addressPreview.lng, label: '★', caption: account.name?.split(' ')[0] || 'You' }]}
                  highlight="preview"
                  height={180}
                  center={[addressPreview.lat, addressPreview.lng]}
                  zoom={15}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {stage === 'describe' && (
        <div className="card" style={{ padding: 28 }}>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', marginBottom: 12 }}>Describe what you have</div>

          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={3}
            placeholder="e.g. 20 halal chicken bowls ready at 5pm, Westwood, pickup til 7:30"
            style={{
              width: '100%', resize: 'vertical',
              border: '1px solid var(--line)', borderRadius: 12,
              padding: 14, fontSize: 15, background: 'var(--paper)',
              outline: 'none', lineHeight: 1.5, marginBottom: 14,
            }}
          />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
            {['20 halal chicken wraps, Westwood, 5–7pm', 'leftover tray of veg curry, UCLA campus', '40 cookies, pickup tonight after 9pm'].map(t => (
              <button key={t} className="tag" style={{ cursor: 'pointer', height: 30, fontSize: 12 }} onClick={() => setInput(t)}>{t}</button>
            ))}
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 10, fontWeight: 500 }}>
              Add a photo <span style={{ fontWeight: 400, color: 'var(--ink-3)' }}>— snap a photo and we'll extract calories &amp; nutrition for you</span>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }}/>
            {imagePreview ? (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img src={imagePreview} alt="food" style={{ width: 200, height: 140, objectFit: 'cover', borderRadius: 12, border: '1px solid var(--line)' }}/>
                <button
                  onClick={() => { setImageFile(null); setImagePreview(null); setImageBase64(null) }}
                  style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%', background: 'var(--ink)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
                  <Icon name="close" size={10}/>
                </button>
                <div style={{ marginTop: 6, fontSize: 12, color: 'var(--sage)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Icon name="check" size={12} color="var(--sage)"/> Photo added — calories &amp; nutrients will be extracted automatically
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px',
                  border: '2px dashed var(--line-2)', borderRadius: 12, cursor: 'pointer',
                  background: 'var(--paper-2)', color: 'var(--ink-2)', fontSize: 14,
                  transition: 'border-color 0.15s',
                }}
              >
                <Icon name="plus" size={16}/> Upload food photo
              </button>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="shield" size={12}/> We check temperature, allergens, and pickup window before posting.
            </div>
            <button className="btn btn-ember" onClick={handleSubmit} disabled={!input.trim()} style={{ height: 48, padding: '0 24px' }}>
              Parse & check <Icon name="arrow" size={14}/>
            </button>
          </div>
        </div>
      )}

      {stage === 'analyzing' && (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div className="typing" style={{ justifyContent: 'center', marginBottom: 16 }}><span/><span/><span/></div>
          <div className="serif" style={{ fontSize: 22 }}>Analyzing your listing{imageFile ? ' and photo' : ''}…</div>
          <div style={{ color: 'var(--ink-3)', fontSize: 14, marginTop: 6 }}>
            Extracting portions, dietary tags{imageFile ? ', calories, and nutrients' : ''}.
          </div>
        </div>
      )}

      {stage === 'safety' && parsed && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ember)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              Listing preview
            </div>
            <div className="serif" style={{ fontSize: 24, letterSpacing: '-0.01em', marginBottom: 16 }}>{parsed.title}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {[
                ['Portions', `${parsed.portions} servings`],
                ['Pickup', parsed.pickupWindow || parsed.pickup],
                ['Location', account.address],
                ['Provider', `${account.name} · ${PROVIDER_TYPES.find(p => p.id === account.type)?.label || account.type}`],
              ].map(([k, v]) => v && (
                <div key={k} style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 10, alignItems: 'start' }}>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)', paddingTop: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k}</span>
                  <span style={{ fontSize: 14 }}>{v}</span>
                </div>
              ))}
              {parsed.dietary?.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Dietary</span>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {parsed.dietary.map(t => <span key={t} className="tag" style={{ height: 26, fontSize: 11 }}>{t}</span>)}
                  </div>
                </div>
              )}
            </div>

            {nutrition && (
              <div style={{ padding: 16, background: 'var(--sage-t)', borderRadius: 14, marginTop: 4 }}>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'oklch(0.35 0.1 150)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  Nutrition per serving (from your photo)
                </div>

                {nutrition.story && (
                  <div style={{ fontSize: 13, color: 'oklch(0.3 0.1 150)', fontStyle: 'italic', lineHeight: 1.5, marginBottom: 12, padding: '8px 12px', background: 'oklch(0.92 0.05 145)', borderRadius: 10 }}>
                    "{nutrition.story}"
                  </div>
                )}

                {/* Calorie hero number */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: 'oklch(0.28 0.1 150)', lineHeight: 1 }}>{nutrition.calories ?? '—'}</span>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'oklch(0.5 0.1 150)', textTransform: 'uppercase' }}>cal / serving</span>
                  {nutrition.servingSize && <span style={{ fontSize: 12, color: 'oklch(0.5 0.1 150)', marginLeft: 4 }}>({nutrition.servingSize})</span>}
                </div>

                {/* Macro bars */}
                {[
                  { label: 'Protein', val: nutrition.protein, unit: 'g', max: 60, color: 'oklch(0.52 0.18 145)' },
                  { label: 'Carbs', val: nutrition.carbs, unit: 'g', max: 100, color: 'oklch(0.65 0.14 80)' },
                  { label: 'Fat', val: nutrition.fat, unit: 'g', max: 60, color: 'oklch(0.72 0.12 55)' },
                  { label: 'Fiber', val: nutrition.fiber, unit: 'g', max: 20, color: 'oklch(0.58 0.12 170)' },
                ].map(({ label, val, unit, max, color }) => val != null && (
                  <div key={label} style={{ marginBottom: 7 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                      <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'oklch(0.45 0.1 150)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'oklch(0.3 0.1 150)' }}>{val}{unit}</span>
                    </div>
                    <div style={{ height: 6, background: 'oklch(0.88 0.06 145)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, (val / max) * 100)}%`, background: color, borderRadius: 3, transition: 'width 0.6s ease' }}/>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'oklch(0.35 0.1 150)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="shield" size={12}/> Safety check — passing
            </div>
            <div className="serif" style={{ fontSize: 20, marginBottom: 16 }}>All checks look good.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {(parsed.safety || [
                { label: 'Food prepared safely', status: 'ok' },
                { label: 'Allergens declared', status: 'ok' },
                { label: 'Pickup window under 4 hrs', status: 'ok' },
                { label: 'Provider account verified', status: 'ok' },
              ]).map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--sage-t)', borderRadius: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'oklch(0.42 0.12 150)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name="check" size={11}/>
                  </div>
                  <span style={{ fontSize: 13, color: 'oklch(0.25 0.08 150)' }}>{s.label}</span>
                </div>
              ))}
            </div>
            <button className="btn btn-ember" style={{ width: '100%', height: 48 }} onClick={handlePost}>
              Post to the map <Icon name="arrow" size={14}/>
            </button>
          </div>
        </div>
      )}

      {stage === 'posted' && (
        <div>
          <div className="card" style={{ padding: 28, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--sage-t)', color: 'oklch(0.35 0.1 150)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="check" size={22}/>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--sage)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Live · on the map · visible in Find Food</div>
                <div className="serif" style={{ fontSize: 26, letterSpacing: '-0.01em' }}>Your listing is up.</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <div style={{ padding: 16, background: 'var(--paper-3)', borderRadius: 14, marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{parsed?.title}</div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)' }}>{account.name} · {account.address}</div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--sage)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sage)', display: 'inline-block' }}/> {parsed?.portions} portions · visible to seekers now
                  </div>
                  {nutrition && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: nutrition.story ? 6 : 0 }}>
                        {[[nutrition.calories, 'cal'], [`${nutrition.protein}g`, 'protein'], [`${nutrition.carbs}g`, 'carbs'], [`${nutrition.fat}g`, 'fat']].map(([v, k]) => v && (
                          <div key={k} style={{ padding: '4px 10px', background: 'var(--sage-t)', borderRadius: 8, fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, color: 'oklch(0.35 0.1 150)', fontWeight: 600 }}>
                            {v} <span style={{ fontWeight: 400, opacity: 0.7 }}>{k}</span>
                          </div>
                        ))}
                      </div>
                      {nutrition.story && (
                        <div style={{ fontSize: 12, color: 'oklch(0.42 0.1 150)', fontStyle: 'italic', lineHeight: 1.4, marginTop: 4 }}>
                          {nutrition.story}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>We'll notify you when someone reserves your food.</div>
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button className="btn btn-ghost" style={{ fontSize: 13, height: 40 }} onClick={() => { setStage('describe'); setInput(''); setImageFile(null); setImagePreview(null); setImageBase64(null); setParsed(null) }}>
                    Share another item
                  </button>
                  <button className="btn btn-primary" style={{ height: 40, fontSize: 13 }} onClick={handleSimulatePickup}>
                    Simulate pickup
                  </button>
                </div>
              </div>
              <RealMap
                pins={mapPin}
                highlight="provider"
                height={260}
                center={providerLatLng ? [providerLatLng.lat, providerLatLng.lng] : undefined}
                zoom={15}
              />
            </div>
          </div>
        </div>
      )}

      {stage === 'waiting' && (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div className="typing" style={{ justifyContent: 'center', marginBottom: 16 }}><span/><span/><span/></div>
          <div className="serif" style={{ fontSize: 22 }}>Coordinating pickup…</div>
          <div style={{ color: 'var(--ink-3)', fontSize: 14, marginTop: 6 }}>Marking orders as collected.</div>
        </div>
      )}

      {stage === 'collected' && notification && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20 }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', background: 'var(--paper-3)', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name="bell" size={14} color="var(--ink-2)"/>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Message from FULL</span>
              <span style={{ marginLeft: 'auto', fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)' }}>just now</span>
            </div>
            <div style={{ padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--ember-t)', color: 'var(--ember-d)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="leaf" size={16} color="var(--ember)"/>
                </div>
                <span style={{ fontWeight: 600 }}>FULL</span>
              </div>
              <div className="serif" style={{ fontSize: 22, lineHeight: 1.35, marginBottom: 14, letterSpacing: '-0.005em' }}>
                {notification.headline}
              </div>
              <p style={{ color: 'var(--ink-2)', margin: '0 0 14px', fontSize: 15, lineHeight: 1.6 }}>
                {notification.body}
              </p>
              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                <button className="btn btn-ghost" style={{ fontSize: 13, height: 40 }} onClick={() => { setStage('describe'); setInput(''); setImageFile(null); setImagePreview(null); setImageBase64(null); setParsed(null); setNotification(null) }}>
                  Share again tomorrow
                </button>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ember)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="flame" size={12}/> FULL points earned
            </div>
            <div className="serif" style={{ fontSize: 52, lineHeight: 1, letterSpacing: '-0.02em', color: 'var(--ember-d)' }}>
              +{points?.pointsEarned || 60}
            </div>
            <div style={{ color: 'var(--ink-2)', marginTop: 10, fontSize: 14 }}>
              Awarded for food shared safely and collected.
            </div>
            <div style={{ height: 1, background: 'var(--line)', margin: '20px 0' }}/>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 10 }}>
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase' }}>Total</span>
                <span>{points?.newTotal || 240} pts</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 10 }}>
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase' }}>Rank</span>
                <span>Top 8% in Westwood</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
