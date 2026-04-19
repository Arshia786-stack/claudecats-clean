export default function Avatar({ name, size = 32, tone = "ember" }) {
  const bg = { ember: 'var(--ember-t)', sage: 'var(--sage-t)', ink: 'var(--paper-3)' }[tone]
  const fg = { ember: 'var(--ember-d)', sage: 'oklch(0.35 0.08 150)', ink: 'var(--ink)' }[tone]
  const initials = (name || "").split(" ").map(w => w[0]).slice(0, 2).join("")
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, color: fg,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--f-mono)', fontSize: size * 0.36, fontWeight: 500,
      letterSpacing: '0.04em', flexShrink: 0,
    }}>{initials}</div>
  )
}
