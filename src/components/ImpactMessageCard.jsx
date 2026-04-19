export default function ImpactMessageCard({ impact }) {
  return (
    <div className="mt-6 rounded-2xl border border-[var(--color-hearth)]/20 bg-[var(--color-hearth-light)] p-6">
      <div className="flex items-start gap-4">
        <span className="text-3xl leading-none">🔥</span>
        <div>
          <p className="font-semibold text-stone-900">{impact.headline}</p>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">{impact.body}</p>
          <p className="mt-4 text-xs text-stone-400">— From the FULL community</p>
        </div>
      </div>
    </div>
  )
}
