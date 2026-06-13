export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 340 235"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Envios Goyo"
      fill="currentColor"
    >
      {/* Large dot above the I in ENVIOS */}
      <circle cx="207" cy="15" r="13" />
      {/* ENVIOS */}
      <text
        x="170"
        y="95"
        fontFamily="'Arial Black', Arial, sans-serif"
        fontWeight="900"
        fontSize="78"
        textAnchor="middle"
        letterSpacing="-1"
      >
        ENVIOS
      </text>
      {/* GOYO */}
      <text
        x="170"
        y="192"
        fontFamily="'Arial Black', Arial, sans-serif"
        fontWeight="900"
        fontSize="98"
        textAnchor="middle"
        letterSpacing="-2"
      >
        GOYO
      </text>
      {/* Smile arc */}
      <path
        d="M 96 213 Q 170 255 244 213"
        stroke="currentColor"
        strokeWidth="9"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}
