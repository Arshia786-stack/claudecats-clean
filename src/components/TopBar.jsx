import { useState } from 'react'
import Logo from './Logo'
import Icon from './Icon'
import Avatar from './Avatar'

function AccountMenu({ onFlow }) {
  const items = [
    { label: "Food preferences", icon: "heart", sub: "halal · high protein · no dairy" },
    { label: "Places I've used", icon: "pin", sub: "3 pantries · 2 kitchens" },
    { label: "Language", icon: "compass", sub: "English · Español · 中文" },
    { label: "Accessibility", icon: "shield", sub: "larger type · screen reader" },
  ]
  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 12px)', right: 0,
      width: 320, background: 'var(--paper-2)',
      border: '1px solid var(--line-2)', borderRadius: 18,
      boxShadow: 'var(--shadow-lift)',
      padding: 10, zIndex: 50,
    }}>
      <div style={{ padding: '10px 14px 6px' }}>
        <div style={{ color: 'var(--ink-3)', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Settings</div>
      </div>
      {items.map((it, i) => (
        <button key={i} style={{
          display: 'flex', alignItems: 'center', gap: 14,
          width: '100%', padding: '10px 14px', borderRadius: 12, textAlign: 'left',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--paper-3)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Icon name={it.icon} size={18} color="var(--ink-2)"/>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500 }}>{it.label}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{it.sub}</div>
          </div>
        </button>
      ))}
      <div className="hr" style={{ margin: '8px 0' }}/>
      <button onClick={() => onFlow('provider')} style={{
        display: 'flex', alignItems: 'center', gap: 14,
        width: '100%', padding: '10px 14px', borderRadius: 12, textAlign: 'left',
      }}>
        <Icon name="hand" size={18} color="var(--ember)"/>
        <div>
          <div style={{ fontWeight: 500 }}>Become a provider</div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Share extra food with neighbors</div>
        </div>
      </button>
      <button onClick={() => onFlow('sponsor')} style={{
        display: 'flex', alignItems: 'center', gap: 14,
        width: '100%', padding: '10px 14px', borderRadius: 12, textAlign: 'left',
      }}>
        <Icon name="chart" size={18} color="var(--ink-2)"/>
        <div>
          <div style={{ fontWeight: 500 }}>Sponsor dashboard</div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>For funders & partners</div>
        </div>
      </button>
    </div>
  )
}

export default function TopBar({ onFlow, current, menuOpen, onOpenMenu }) {
  const defaultLocationLabel = 'Los Angeles, CA'
  const [locationLabel, setLocationLabel] = useState(defaultLocationLabel)
  const [isLocating, setIsLocating] = useState(false)

  async function handleLocationRequest() {
    if (!navigator.geolocation || isLocating) return

    setIsLocating(true)

    const getPosition = () => new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      })
    })

    try {
      const position = await getPosition()
      const { latitude, longitude } = position.coords

      try {
        const res = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        )
        const data = await res.json()
        const nextLabel =
          data.city ||
          data.locality ||
          data.principalSubdivision ||
          'Nearby'

        setLocationLabel(nextLabel)
      } catch {
        setLocationLabel('Nearby')
      }
    } catch {
      setLocationLabel(defaultLocationLabel)
    } finally {
      setIsLocating(false)
    }
  }

  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 44 }}>
        <button onClick={() => onFlow('landing')} style={{ display: 'flex', alignItems: 'center' }}>
          <Logo size={24}/>
        </button>
      </div>
      <nav style={{ display: 'flex', gap: 4, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
        {[
          { id: 'seeker', label: 'Find Food' },
          { id: 'provider', label: 'Share Food' },
          { id: 'sponsor', label: 'Partners' },
        ].map(item => (
          <button key={item.id} onClick={() => onFlow(item.id)}
            style={{
              padding: '10px 18px', borderRadius: 999,
              fontSize: 14, fontWeight: 500,
              color: current === item.id ? 'var(--ink)' : 'var(--ink-2)',
              background: current === item.id ? 'var(--paper-3)' : 'transparent',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (current !== item.id) e.currentTarget.style.background = 'var(--paper-3)' }}
            onMouseLeave={e => { if (current !== item.id) e.currentTarget.style.background = 'transparent' }}
          >{item.label}</button>
        ))}
      </nav>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
        <button
          className="btn btn-ghost"
          style={{ height: 40, fontSize: 14, padding: '0 16px' }}
          onClick={handleLocationRequest}
          title="Use your current location"
        >
          <Icon name="pin" size={14} color="var(--ember)"/> {isLocating ? 'Locating…' : locationLabel}
        </button>
        <button onClick={onOpenMenu} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '6px 10px 6px 14px',
          border: '1px solid var(--line-2)', borderRadius: 999,
          background: 'var(--paper-2)', boxShadow: 'var(--shadow-card)',
        }}>
          <Icon name="menu" size={16} color="var(--ink-2)"/>
          <Avatar name={locationLabel} size={28} tone="ember"/>
        </button>
        {menuOpen && <AccountMenu onFlow={onFlow}/>}
      </div>
    </div>
  )
}
