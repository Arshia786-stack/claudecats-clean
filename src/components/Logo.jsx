export default function Logo({ size = 24 }) {
  return (
    <span className="logo" style={{ fontSize: size }}>
      <svg
        className="logo-mark"
        viewBox="0 0 64 64"
        aria-hidden="true"
        style={{ width: size * 1.35, height: size * 1.35 }}
      >
        <defs>
          <mask id="full-logo-sprout-mask">
            <rect width="64" height="64" fill="white" />
            <path
              d="M32 23V41"
              fill="none"
              stroke="black"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M32 25C32 18 26 15 20 15C20 22 24.5 27 32 27"
              fill="none"
              stroke="black"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M32 25C32 18 38 15 44 15C44 22 39.5 27 32 27"
              fill="none"
              stroke="black"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </mask>
        </defs>
        <circle cx="32" cy="32" r="30" fill="var(--ember)" mask="url(#full-logo-sprout-mask)" />
        <path
          d="M14 44C20 40 26 38 32 38C38 38 44 40 50 44"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>
      <span style={{ fontFamily: 'var(--f-sans)' }}>FULL</span>
    </span>
  )
}
