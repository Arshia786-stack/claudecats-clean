import Card from './Card'

const navItems = [
  { label: 'Overview', meta: 'Workspace' },
  { label: 'Sessions', meta: '12 active' },
  { label: 'Agents', meta: 'Prompt-ready' },
]

const recentThreads = [
  'Product launch planning',
  'Pricing page rewrite',
  'Support workflow cleanup',
]

function Sidebar() {
  return (
    <Card className="flex h-full flex-col p-4 sm:p-5">
      {/* Sidebar content */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Navigation</p>
          <h2 className="mt-2 text-base font-semibold text-white">Workspace</h2>
        </div>
        <button
          type="button"
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
        >
          Filter
        </button>
      </div>

      <div className="mt-5 space-y-2">
        {navItems.map((item, index) => (
          <button
            key={item.label}
            type="button"
            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
              index === 1
                ? 'border-violet-400/30 bg-violet-500/12 text-white shadow-[0_0_30px_rgba(139,92,246,0.12)]'
                : 'border-white/8 bg-white/[0.03] text-zinc-300 hover:border-white/15 hover:bg-white/[0.05] hover:text-white'
            }`}
          >
            <span className="font-medium">{item.label}</span>
            <span className="text-xs text-zinc-500">{item.meta}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-4">
        <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Recent threads</p>
        <div className="mt-4 space-y-3">
          {recentThreads.map((thread) => (
            <button
              key={thread}
              type="button"
              className="flex w-full items-center justify-between rounded-2xl border border-transparent px-3 py-3 text-left text-sm text-zinc-400 transition hover:border-white/10 hover:bg-white/[0.04] hover:text-zinc-100"
            >
              <span>{thread}</span>
              <span className="text-zinc-600">+</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-[24px] border border-dashed border-white/10 bg-white/[0.025] p-4">
        <p className="text-sm font-medium text-zinc-200">No pinned workflows yet</p>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Save repeatable prompts, result templates, or agent presets here when the product
          wiring is added.
        </p>
      </div>
    </Card>
  )
}

export default Sidebar
