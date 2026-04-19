export default function LoadingState({ message = "Finding what's nearby\u2026" }) {
  return (
    <div className="mt-10 flex flex-col items-center text-center">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block h-2 w-2 animate-bounce rounded-full bg-[var(--color-hearth)]"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
      <p className="mt-3 text-sm text-stone-500">{message}</p>
    </div>
  )
}
