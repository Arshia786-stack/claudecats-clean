export default function Placeholder({ label, variant = "warm", ratio = "4/3", style = {}, children }) {
  return (
    <div className={`ph ${variant}`} style={{ aspectRatio: ratio, width: '100%', ...style }}>
      {children}
      {label && <span className="ph-label">{label}</span>}
    </div>
  )
}
