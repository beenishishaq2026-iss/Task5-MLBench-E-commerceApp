export default function EmptyCartIllustration({ className = "h-40 w-40" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} role="img" aria-label="No products found">
      <circle cx="200" cy="195" r="150" fill="#F3E5D3" />
      <ellipse cx="200" cy="350" rx="112" ry="14" fill="#A98A4E" opacity="0.25" />
      <line x1="121" y1="273" x2="133" y2="294" stroke="#2B2420" strokeWidth="6" strokeLinecap="round" />
      <line x1="270" y1="273" x2="259" y2="294" stroke="#2B2420" strokeWidth="6" strokeLinecap="round" />
      <circle cx="133" cy="308" r="15" fill="#2B2420" />
      <circle cx="133" cy="308" r="5" fill="#FBF6EE" />
      <circle cx="259" cy="308" r="15" fill="#2B2420" />
      <circle cx="259" cy="308" r="5" fill="#FBF6EE" />
      <path d="M 270 148 L 300 148 L 328 115" fill="none" stroke="#2B2420" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="312" y="108" width="28" height="14" rx="7" fill="#963F22" transform="rotate(-38 326 115)" />
      <path d="M 121 148 L 270 148 L 283 273 L 106 273 Z" fill="none" stroke="#2B2420" strokeWidth="7" strokeLinejoin="round" />
      <rect x="112" y="153" width="39" height="34" rx="3" fill="#B5502D" />
      <rect x="112" y="191" width="39" height="38" rx="3" fill="#E07A3E" />
      <rect x="112" y="233" width="37" height="36" rx="3" fill="#B5502D" />
      <line x1="154" y1="150" x2="150" y2="273" stroke="#2B2420" strokeWidth="2.5" />
      <line x1="195" y1="149" x2="194" y2="273" stroke="#2B2420" strokeWidth="2.5" />
      <line x1="236" y1="148" x2="238" y2="273" stroke="#2B2420" strokeWidth="2.5" />
      <line x1="115" y1="191" x2="277" y2="191" stroke="#2B2420" strokeWidth="2.5" />
      <line x1="113" y1="229" x2="279" y2="229" stroke="#2B2420" strokeWidth="2.5" />
      <g transform="rotate(8 226 194)">
        <rect x="176" y="132" width="100" height="124" rx="4" fill="#FFFFFF" stroke="#A98A4E" strokeOpacity="0.4" />
        <polygon points="258,132 276,132 276,150" fill="#E07A3E" />
        <text x="226" y="176" textAnchor="middle" fontSize="13" fontWeight="500" fill="#2B2420">No products</text>
        <text x="226" y="194" textAnchor="middle" fontSize="13" fontWeight="500" fill="#2B2420">found</text>
        <circle cx="214" cy="216" r="3.5" fill="#2B2420" />
        <circle cx="238" cy="216" r="3.5" fill="#2B2420" />
        <path d="M 208 237 Q 226 224 244 237" fill="none" stroke="#2B2420" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}