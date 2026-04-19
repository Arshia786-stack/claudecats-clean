import { useState } from 'react'
import Logo from './Logo'
import Icon from './Icon'
import Avatar from './Avatar'
import { getProviderAccount, getSeekerProfile, clearProviderAccount, clearSeekerProfile } from '../lib/auth'

const PROVIDER_TYPE_LABELS = { home: 'Home Cook', restaurant: 'Restaurant', org: 'Campus Org', company: 'Company' }

function AccountMenu({ onFlow }) {
  const provider = getProviderAccount()
  const seeker = getSeekerProfile()
  const hasAccount = !!(provider || seeker)

  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 12px)', right: 0,
      width: 320, background: 'var(--paper-2)',
      border: '1px solid var(--line-2)', borderRadius: 18,
      boxShadow: 'var(--shadow-lift)',
      padding: 10, zIndex: 50,
    }}>

      {/* Identity block */}
      {provider ? (
        <div style={{ padding: '12px 14px 14px', marginBottom: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ember)', marginBottom: 8 }}>Provider Account</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--ember-t)', color: 'var(--ember-d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>
              {provider.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{provider.name}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                {PROVIDER_TYPE_LABELS[provider.type] || provider.type} · {provider.address?.split(',')[0] || 'No address'}
              </div>
            </div>
          </div>
        </div>
      ) : seeker ? (
        <div style={{ padding: '12px 14px 14px', marginBottom: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'oklch(0.42 0.12 145)', marginBottom: 8 }}>Your Profile</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'oklch(0.94 0.05 145)', color: 'oklch(0.38 0.12 145)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
              <Icon name="leaf" size={18} color="oklch(0.38 0.12 145)"/>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Food seeker</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{seeker.summary || 'Preferences saved'}</div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '10px 14px 6px' }}>
          <div style={{ color: 'var(--ink-3)', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Settings</div>
        </div>
      )}

      {/* Seeker dietary preferences */}
      {seeker?.dietary?.length > 0 && (
        <div style={{ padding: '8px 14px', background: 'oklch(0.96 0.03 145)', borderRadius: 10, margin: '4px 4px 8px' }}>
          <div style={{ fontSize: 10, color: 'oklch(0.42 0.12 145)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Food preferences</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {seeker.dietary.map(d => (
              <span key={d} style={{ padding: '3px 8px', borderRadius: 999, fontSize: 11, background: 'oklch(0.94 0.05 145)', color: 'oklch(0.38 0.12 145)', fontWeight: 500 }}>
                {d}
              </span>
            ))}
          </div>
          {seeker.kitchenType && seeker.kitchenType !== 'any' && (
            <div style={{ fontSize: 12, color: 'oklch(0.42 0.12 145)', marginTop: 6 }}>Kitchen: {seeker.kitchenType}</div>
          )}
        </div>
      )}

      {/* Provider quick stats */}
      {provider?.address && (
        <div style={{ padding: '8px 14px', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-3)' }}>
            <Icon name="pin" size={11} color="var(--ember)"/>
            {provider.address}
          </div>
          {provider.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>
              <Icon name="bell" size={11}/>
              {provider.phone}
            </div>
          )}
        </div>
      )}

      <div className="hr" style={{ margin: '4px 0' }}/>

      {/* Navigation actions */}
      {[
        !provider && { label: 'Become a provider', icon: 'hand', color: 'var(--ember)', sub: 'Share extra food with neighbors', flow: 'provider' },
        provider && { label: 'Share food now', icon: 'hand', color: 'var(--ember)', sub: `Sharing as ${provider.name}`, flow: 'provider' },
        { label: 'Sponsor dashboard', icon: 'chart', color: 'var(--ink-2)', sub: 'For funders & partners', flow: 'sponsor' },
      ].filter(Boolean).map((item, i) => (
        <button key={i} onClick={() => onFlow(item.flow)} style={{
          display: 'flex', alignItems: 'center', gap: 14,
          width: '100%', padding: '10px 14px', borderRadius: 12, textAlign: 'left',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--paper-3)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Icon name={item.icon} size={18} color={item.color}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500 }}>{item.label}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{item.sub}</div>
          </div>
        </button>
      ))}

      {/* Sign out */}
      {hasAccount && (
        <>
          <div className="hr" style={{ margin: '4px 0' }}/>
          {provider && (
            <button
              onClick={() => { clearProviderAccount(); window.location.reload() }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 14px', borderRadius: 10, textAlign: 'left', fontSize: 13, color: 'var(--ink-3)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--paper-3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Icon name="close" size={14}/> Sign out of provider account
            </button>
          )}
          {seeker && (
            <button
              onClick={() => { clearSeekerProfile(); window.location.reload() }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 14px', borderRadius: 10, textAlign: 'left', fontSize: 13, color: 'var(--ink-3)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--paper-3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Icon name="close" size={14}/> Clear food preferences
            </button>
          )}
        </>
      )}
    </div>
  )
}

export default function TopBar({ onFlow, current, menuOpen, onOpenMenu }) {
  const defaultLocationLabel = 'Los Angeles, CA'
  const [locationLabel, setLocationLabel] = useState(defaultLocationLabel)
  const [isLocating, setIsLocating] = useState(false)

  const provider = getProviderAccount()
  const seeker = getSeekerProfile()
  const displayName = provider?.name || (seeker?.summary ? 'FULL' : null) || locationLabel

  async function handleLocationRequest() {
    if (!navigator.geolocation || isLocating) return
    setIsLocating(true)
    const getPosition = () => new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 })
    })
    try {
      const position = await getPosition()
      const { latitude, longitude } = position.coords
      try {
        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
        const data = await res.json()
        setLocationLabel(data.city || data.locality || data.principalSubdivision || 'Nearby')
      } catch { setLocationLabel('Nearby') }
    } catch { setLocationLabel(defaultLocationLabel) }
    finally { setIsLocating(false) }
  }

  const navItems = [
    { id: 'seeker', label: 'Find Food' },
    { id: 'provider', label: 'Share Food' },
    { id: 'library', label: 'Food Library' },
    { id: 'sponsor', label: 'Partners' },
  ]

  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 44 }}>
        <button onClick={() => onFlow('landing')} style={{ display: 'flex', alignItems: 'center' }}>
          <Logo size={24}/>
        </button>
      </div>
      <nav style={{ display: 'flex', gap: 4, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
        {navItems.map(item => (
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
          <Avatar name={displayName} size={28} tone={provider ? 'ember' : 'sage'}/>
        </button>
        {menuOpen && <AccountMenu onFlow={onFlow}/>}
      </div>
    </div>
  )
}
