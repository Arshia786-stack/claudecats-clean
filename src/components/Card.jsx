function Card({ children, className = '' }) {
  return (
    <div className={['rounded-2xl border border-stone-200 bg-white shadow-sm', className].join(' ')}>
      {children}
    </div>
  )
}

export default Card
