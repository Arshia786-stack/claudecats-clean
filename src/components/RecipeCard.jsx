export default function RecipeCard({ recipe }) {
  return (
    <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-amber-600">Recipe suggestion</p>

      <div className="mt-3">
        <p className="font-semibold text-stone-900">{recipe.name}</p>
        <p className="mt-0.5 text-sm text-stone-500 italic">{recipe.tagline}</p>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-500">
        <span>⏱</span>
        <span>{recipe.cookTime}</span>
      </div>

      <ol className="mt-4 space-y-2">
        {recipe.steps.map((step, i) => (
          <li key={i} className="flex gap-3 text-sm text-stone-700">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-[10px] font-semibold text-amber-700">
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      {recipe.nutritionNote && (
        <p className="mt-4 text-xs text-stone-500">{recipe.nutritionNote}</p>
      )}
      {recipe.culturalNote && (
        <p className="mt-1 text-xs text-stone-400 italic">{recipe.culturalNote}</p>
      )}
    </div>
  )
}
