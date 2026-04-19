import Card from './Card'

const sections = [
  {
    label: 'Insights',
    description: 'Summaries, extracted entities, and confidence signals from your conversations.',
  },
  {
    label: 'Actions',
    description: 'Follow-ups, approvals, and workflow triggers queued for review.',
  },
  {
    label: 'Artifacts',
    description: 'Reports, drafts, and structured outputs ready to export.',
  },
]

function ActivityItem({ result }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-stone-700 leading-snug">{result.prompt}</p>
        <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-600">
          {result.status}
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-stone-500">{result.summary}</p>
      <p className="mt-3 text-xs text-stone-400">{new Date(result.createdAt).toLocaleTimeString()}</p>
    </Card>
  )
}

function ResultsPanel({ results, error }) {
  const hasResults = results.length > 0

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-stone-500">Recent activity</h2>
        {hasResults && (
          <button
            type="button"
            className="text-sm text-indigo-600 transition hover:text-indigo-800"
          >
            View all
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">Something went wrong</p>
          <p className="mt-1 text-sm text-red-500">{error}</p>
        </div>
      )}

      {!hasResults && !error && (
        <div className="mt-4 rounded-2xl border border-dashed border-stone-200 bg-white p-8 text-center">
          <p className="text-sm font-medium text-stone-700">No activity yet</p>
          <p className="mt-1 text-sm text-stone-400">Send a prompt to see results appear here.</p>
        </div>
      )}

      {hasResults && (
        <div className="mt-4 space-y-3">
          {results.map((result) => (
            <ActivityItem key={result.id} result={result} />
          ))}
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {sections.map((section) => (
          <Card key={section.label} className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-stone-800">{section.label}</h3>
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-stone-400">
                Soon
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-stone-500">{section.description}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ResultsPanel
