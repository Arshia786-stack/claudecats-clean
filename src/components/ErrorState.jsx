export default function ErrorState({ message, onRetry }) {
  return (
    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
      <p className="text-sm font-medium text-red-700">Something went wrong</p>
      <p className="mt-1 text-sm text-red-500">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 text-sm font-medium text-red-700 underline underline-offset-2"
        >
          Try again
        </button>
      )}
    </div>
  )
}
