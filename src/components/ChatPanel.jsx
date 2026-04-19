const starterPrompts = [
  'Summarize the latest user feedback themes',
  'Draft a launch checklist for the beta release',
  'Review this conversation and extract action items',
]

function ChatPanel() {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-semibold text-white">
        AI
      </div>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
        What can I help with today?
      </h1>
      <p className="mt-3 text-base leading-relaxed text-stone-500">
        Ask me to analyze, summarize, draft, or coordinate — I'll take it from there.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {starterPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="rounded-2xl border border-stone-200 bg-white p-4 text-left text-sm text-stone-700 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ChatPanel
