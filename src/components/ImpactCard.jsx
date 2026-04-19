export default function ImpactCard({ impact }) {
  return (
    <section className="mx-auto max-w-5xl">
      <div className="rounded-[32px] border border-orange-100 bg-[linear-gradient(135deg,#fff7f1_0%,#ffffff_55%,#fff4eb_100%)] p-6 shadow-[0_24px_60px_rgba(232,98,42,0.14)] sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-hearth)]">
          Impact moment
        </p>
        <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
              {impact.headline}
            </h2>
            <p className="mt-4 text-base leading-8 text-stone-700">{impact.body}</p>
          </div>
          <div className="rounded-[28px] border border-white/80 bg-white/80 px-5 py-4 shadow-sm">
            <p className="text-sm text-stone-500">Hearth signal</p>
            <p className="mt-2 text-lg font-semibold text-stone-900">{impact.metric}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
