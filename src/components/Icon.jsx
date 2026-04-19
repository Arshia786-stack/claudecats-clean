export default function Icon({ name, size = 18, stroke = 1.6, color = "currentColor" }) {
  const c = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: color, strokeWidth: stroke,
    strokeLinecap: "round", strokeLinejoin: "round",
  }
  switch (name) {
    case "search":  return <svg {...c}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
    case "arrow":   return <svg {...c}><path d="M5 12h14m-6-6 6 6-6 6"/></svg>
    case "menu":    return <svg {...c}><path d="M4 7h16M4 12h16M4 17h16"/></svg>
    case "pin":     return <svg {...c}><path d="M12 22s-7-7.5-7-12a7 7 0 1 1 14 0c0 4.5-7 12-7 12Z"/><circle cx="12" cy="10" r="2.5"/></svg>
    case "clock":   return <svg {...c}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
    case "heart":   return <svg {...c}><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z"/></svg>
    case "sparkle": return <svg {...c}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></svg>
    case "check":   return <svg {...c}><path d="m4 12 5 5L20 6"/></svg>
    case "plus":    return <svg {...c}><path d="M12 5v14M5 12h14"/></svg>
    case "close":   return <svg {...c}><path d="M6 6l12 12M18 6 6 18"/></svg>
    case "mic":     return <svg {...c}><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4"/></svg>
    case "send":    return <svg {...c}><path d="m5 12 15-7-5 15-3-6-7-2Z"/></svg>
    case "user":    return <svg {...c}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
    case "bell":    return <svg {...c}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 21a2 2 0 0 0 4 0"/></svg>
    case "bowl":    return <svg {...c}><path d="M3 11h18a9 9 0 0 1-18 0ZM8 7c0-2 4-2 4 0M14 6c0-2 4-2 4 0"/></svg>
    case "chart":   return <svg {...c}><path d="M4 20V8M10 20V4M16 20v-8M22 20H2"/></svg>
    case "coin":    return <svg {...c}><circle cx="12" cy="12" r="9"/><path d="M15 9a3 3 0 0 0-6 0c0 3 6 2 6 5a3 3 0 0 1-6 0M12 6v12"/></svg>
    case "doc":     return <svg {...c}><path d="M6 3h9l4 4v14H6zM14 3v5h5"/></svg>
    case "flame":   return <svg {...c}><path d="M12 22c-4 0-7-3-7-7 0-3 2-4 3-7 1 2 2 3 4 3 0-3-1-5 0-8 4 3 7 7 7 12 0 4-3 7-7 7Z"/></svg>
    case "shield":  return <svg {...c}><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/></svg>
    case "compass": return <svg {...c}><circle cx="12" cy="12" r="9"/><path d="m15 9-2 4-4 2 2-4 4-2Z"/></svg>
    case "star":    return <svg {...c}><path d="m12 3 3 6 6 1-4.5 4 1 6-5.5-3-5.5 3 1-6L3 10l6-1 3-6Z"/></svg>
    case "hand":    return <svg {...c}><path d="M7 11V5a2 2 0 0 1 4 0v6M11 11V3a2 2 0 0 1 4 0v8M15 11V5a2 2 0 0 1 4 0v10a6 6 0 0 1-12 0v-4a2 2 0 0 1 4 0"/></svg>
    case "leaf":    return <svg {...c}><path d="M4 20c12 0 16-8 16-16C8 4 4 8 4 20ZM4 20l10-10"/></svg>
    default: return null
  }
}
