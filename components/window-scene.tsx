export function WindowScene() {
  return (
    <svg className="window-scene" viewBox="0 0 600 310" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="evening" x1="300" y1="0" x2="300" y2="260" gradientUnits="userSpaceOnUse">
          <stop stopColor="#343647" />
          <stop offset="1" stopColor="#76707C" />
        </linearGradient>
        <clipPath id="window-clip"><rect x="130" y="20" width="340" height="220" rx="90" /></clipPath>
      </defs>
      <g clipPath="url(#window-clip)">
        <path fill="url(#evening)" d="M130 20h340v220H130z" />
        <circle cx="386" cy="77" r="23" fill="#E6D9BB" />
        <path d="M100 209 207 133l83 57 72-71 132 92v70H100Z" fill="#414951" />
        <path d="m100 247 119-57 84 42 95-54 110 67v40H100Z" fill="#303D40" />
        <g className="rain-strokes" stroke="#C8CAD8" strokeOpacity=".25" strokeLinecap="round">
          <path d="m178 64-6 20m67-47-6 20m109 36-6 20m83 16-6 20m-183-8-6 20m59 15-6 20m-99-33-6 20m203-106-6 20m-77-32-6 20" />
        </g>
      </g>
      <rect x="130" y="20" width="340" height="220" rx="90" stroke="#8B827D" strokeWidth="8" />
      <path d="M300 22v216M133 133h334" stroke="#8B827D" strokeWidth="7" />
      <path d="M102 244h396" stroke="#B8A38F" strokeWidth="10" strokeLinecap="round" />
      <path d="M62 283h476" stroke="#776C65" strokeWidth="4" strokeLinecap="round" />
      <path d="m176 273 72-15 52 12 53-12 72 15-125 9Z" fill="#C7BDA7" />
      <path d="m300 270 1 11m-112-10 56-9m-31 12 33-6m65 5 38-9" stroke="#8E887B" strokeWidth="2" />
      <path d="M444 256h32v19a8 8 0 0 1-8 8h-16a8 8 0 0 1-8-8Z" fill="#B4BF9D" />
      <path d="M476 259h6a7 7 0 0 1 0 14h-6" stroke="#B4BF9D" strokeWidth="4" />
      <path className="tea-steam" d="M457 246c-8-9 8-12 0-22" stroke="#C7BDA7" strokeOpacity=".5" strokeWidth="2" strokeLinecap="round" />
      <path d="M92 262h35l-5 20H97Z" fill="#BC927D" />
      <path d="M110 263v-40m0 22c-20 0-24-16-18-20 14 1 18 11 18 20Zm0-9c0-14 10-23 20-21 1 12-7 20-20 21Z" fill="#99AA89" stroke="#99AA89" strokeWidth="2" />
    </svg>
  );
}
