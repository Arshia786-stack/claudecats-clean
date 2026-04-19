const stats = [
  { value: '847', label: 'meals shared' },
  { value: '124', label: 'active providers' },
  { value: '31', label: 'dietary needs matched' },
]

export default function StatsStrip() {
  return (
    <div className="flex items-center gap-6">
      {stats.map(({ value, label }) => (
        <div key={label} className="flex items-baseline gap-1.5">
          <span className="text-sm font-semibold text-stone-700">{value}</span>
          <span className="text-xs text-stone-400">{label}</span>
        </div>
      ))}
    </div>
  )
}
