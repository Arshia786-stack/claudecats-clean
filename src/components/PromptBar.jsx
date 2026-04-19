export default function PromptBar({
  value,
  onChange,
  onSubmit,
  loading,
  placeholder,
  submitLabel = 'Search',
}) {
  function handleKeyDown(e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onSubmit()
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white shadow-sm">
      <textarea
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={loading}
        className="w-full resize-none rounded-t-2xl bg-transparent px-4 pt-4 pb-2 text-sm leading-relaxed text-stone-800 placeholder-stone-400 focus:outline-none disabled:opacity-50"
      />
      <div className="flex items-center justify-end px-4 pb-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading || !value.trim()}
          className="rounded-xl bg-[var(--color-hearth)] px-5 py-2 text-sm font-medium text-white transition hover:bg-[var(--color-hearth-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--color-hearth)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? 'Working…' : submitLabel}
        </button>
      </div>
    </div>
  )
}
