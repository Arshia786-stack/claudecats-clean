import { useEffect, useRef, useState } from 'react'

const UCLA = [34.0689, -118.4452]

export default function RealMap({
  pins = [],
  highlight = null,
  height = 520,
  center,
  zoom = 14,
  borderRadius = 'var(--r-lg)',
  onPinClick,
}) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef({})
  const [leafletReady, setLeafletReady] = useState(!!window.L)
  const [mapReady, setMapReady] = useState(false)  // true after Leaflet map is initialized

  // Wait for Leaflet CDN
  useEffect(() => {
    if (window.L) { setLeafletReady(true); return }
    const check = setInterval(() => {
      if (window.L) { setLeafletReady(true); clearInterval(check) }
    }, 80)
    return () => clearInterval(check)
  }, [])

  // Initialize Leaflet map once CDN is ready
  useEffect(() => {
    if (!leafletReady || !containerRef.current || mapRef.current) return

    const map = window.L.map(containerRef.current, {
      center: center || UCLA,
      zoom,
      zoomControl: false,
      attributionControl: false,
    })

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map)

    window.L.control.zoom({ position: 'topright' }).addTo(map)

    const attr = window.L.control.attribution({ position: 'bottomright', prefix: false })
    attr.addAttribution('<a href="https://openstreetmap.org/copyright">© OpenStreetMap</a>')
    attr.addTo(map)

    mapRef.current = map
    setMapReady(true)  // trigger the pins effect

    return () => {
      map.remove()
      mapRef.current = null
      markersRef.current = {}
      setMapReady(false)
    }
  }, [leafletReady])

  // Render / refresh pins — runs when map is ready OR pins/highlight change
  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || !map || !window.L) return

    // Clear old markers
    Object.values(markersRef.current).forEach(m => m.remove())
    markersRef.current = {}

    const validPins = pins.filter(p => p.lat && p.lng)

    validPins.forEach((pin, i) => {
      const isHi = highlight === pin.id
      const bg = isHi ? 'oklch(0.42 0.14 145)' : '#fff'
      const textColor = isHi ? '#fff' : '#111827'
      const dotBg = isHi ? 'rgba(255,255,255,0.3)' : 'oklch(0.91 0.06 145)'
      const dotColor = isHi ? '#fff' : 'oklch(0.32 0.12 145)'
      const border = isHi ? 'oklch(0.38 0.14 145)' : '#d1d5db'

      const html = `
        <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">
          <div style="
            display:flex;align-items:center;gap:5px;
            padding:4px 10px 4px 4px;
            background:${bg};color:${textColor};
            border-radius:999px;
            border:2px solid ${border};
            font-family:system-ui,sans-serif;font-size:11px;font-weight:700;
            white-space:nowrap;
            box-shadow:0 3px 14px rgba(0,0,0,0.2);
            transition:all 0.15s;
          ">
            <span style="
              width:22px;height:22px;border-radius:50%;
              background:${dotBg};color:${dotColor};
              display:inline-flex;align-items:center;justify-content:center;
              font-size:11px;font-weight:800;flex-shrink:0;
            ">${pin.label || String.fromCharCode(65 + i)}</span>
            <span style="max-width:100px;overflow:hidden;text-overflow:ellipsis;">${pin.caption || ''}</span>
          </div>
          <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid ${border};margin-top:0;"></div>
        </div>`

      const icon = window.L.divIcon({
        className: '',
        html,
        iconAnchor: [38, 38],
        iconSize: [1, 1],
      })

      const marker = window.L.marker([pin.lat, pin.lng], { icon })
        .addTo(map)
        .on('click', () => onPinClick?.(pin.id))

      markersRef.current[pin.id] = marker
    })

    // Fit map to all pins or center on single pin
    if (validPins.length > 1) {
      const bounds = window.L.latLngBounds(validPins.map(p => [p.lat, p.lng]))
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15, animate: false })
    } else if (validPins.length === 1) {
      map.setView([validPins[0].lat, validPins[0].lng], zoom || 15, { animate: false })
    }
  }, [mapReady, pins, highlight])

  // Pan to highlighted pin smoothly
  useEffect(() => {
    if (!mapReady || !highlight) return
    const pin = pins.find(p => p.id === highlight)
    if (pin?.lat && pin?.lng) {
      mapRef.current?.panTo([pin.lat, pin.lng], { animate: true, duration: 0.35 })
    }
  }, [mapReady, highlight])

  // Update center when prop changes (e.g. provider address changes)
  useEffect(() => {
    if (!mapReady || !center) return
    mapRef.current?.setView(center, zoom, { animate: true, duration: 0.4 })
  }, [mapReady, center, zoom])

  if (!leafletReady) {
    return (
      <div style={{ width: '100%', height, borderRadius, border: '1px solid var(--line)', background: 'var(--paper-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)' }}>Loading map…</span>
      </div>
    )
  }

  return (
    <div ref={containerRef} style={{ width: '100%', height, borderRadius, overflow: 'hidden', border: '1px solid var(--line)' }}/>
  )
}
