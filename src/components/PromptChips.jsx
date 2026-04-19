export default function PromptChips({ examples, onSelect }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {examples.map((text) => (
        <button
          key={text}
          type="button"
          onClick={() => onSelect(text)}
          className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-600 transition hover:border-stone-300 hover:text-stone-900"
        >
          {text}
        </button>
      ))}
    </div>
  )
}
