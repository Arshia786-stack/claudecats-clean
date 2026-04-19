export default function Logo({ size = 24 }) {
  return (
    <span className="logo" style={{ fontSize: size }}>
      <span className="logo-mark" style={{ width: size * 1.1, height: size * 1.1 }} />
      <span style={{ fontFamily: 'var(--f-serif)' }}>Hearth</span>
    </span>
  )
}
