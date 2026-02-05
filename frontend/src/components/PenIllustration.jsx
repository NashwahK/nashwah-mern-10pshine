function PenIllustration({ isDark }) {
  return (
    <div className="w-full h-full flex items-center justify-center relative">
      {/* Background decorative circles */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className={`absolute w-64 h-64 rounded-full ${isDark ? 'bg-zinc-800/40' : 'bg-zinc-200/30'} blur-3xl`}></div>
        <div className={`absolute w-48 h-48 rounded-full ${isDark ? 'bg-zinc-700/20' : 'bg-zinc-300/20'} blur-2xl -top-12 -right-12`}></div>
      </div>

      {/* SVG Pen Illustration */}
      <svg
        viewBox="0 0 300 400"
        className="w-48 h-64 relative z-10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ink flow trail */}
        <path
          d="M 150 180 Q 160 160 155 140 Q 150 120 145 100"
          stroke={isDark ? '#e4e4e7' : '#27272a'}
          strokeWidth="2"
          opacity="0.3"
          strokeDasharray="5,5"
        />

        {/* Pen barrel */}
        <rect
          x="130"
          y="200"
          width="40"
          height="140"
          rx="20"
          stroke={isDark ? '#e4e4e7' : '#27272a'}
          strokeWidth="2.5"
          opacity="0.8"
        />

        {/* Barrel gradient shine */}
        <rect
          x="132"
          y="205"
          width="8"
          height="130"
          rx="4"
          fill={isDark ? '#ffffff' : '#000000'}
          opacity="0.15"
        />

        {/* Pen grip */}
        <g opacity="0.6">
          <circle cx="150" cy="260" r="22" stroke={isDark ? '#e4e4e7' : '#27272a'} strokeWidth="2" />
          <circle cx="150" cy="260" r="18" fill="none" stroke={isDark ? '#e4e4e7' : '#27272a'} strokeWidth="1" opacity="0.4" />
        </g>

        {/* Nib (pen point) */}
        <g>
          {/* Nib body */}
          <path
            d="M 140 200 L 145 160 L 155 160 L 160 200 Z"
            fill={isDark ? '#d4d4d8' : '#3f3f46'}
            opacity="0.9"
          />

          {/* Nib split detail */}
          <line
            x1="150"
            y1="160"
            x2="150"
            y2="200"
            stroke={isDark ? '#e4e4e7' : '#27272a'}
            strokeWidth="1"
            opacity="0.5"
          />

          {/* Nib tip shine */}
          <circle cx="150" cy="158" r="2.5" fill={isDark ? '#fbbf24' : '#f59e0b'} opacity="0.8" />
        </g>

        {/* Writing marks - suggestion of notes */}
        <g opacity="0.4" stroke={isDark ? '#e4e4e7' : '#27272a'} strokeWidth="1.5">
          <path d="M 80 100 Q 85 102 90 100" />
          <path d="M 80 110 Q 85 112 90 110" />
          <path d="M 80 120 Q 85 122 90 120" />
          <path d="M 220 110 Q 215 112 210 110" />
          <path d="M 220 120 Q 215 122 210 120" />
          <path d="M 220 130 Q 215 132 210 130" />
        </g>

        {/* Decorative ink drops */}
        <circle cx="90" cy="140" r="2.5" fill={isDark ? '#e4e4e7' : '#27272a'} opacity="0.3" />
        <circle cx="210" cy="150" r="2" fill={isDark ? '#e4e4e7' : '#27272a'} opacity="0.25" />
        <circle cx="95" cy="160" r="1.5" fill={isDark ? '#e4e4e7' : '#27272a'} opacity="0.2" />
      </svg>
    </div>
  );
}

export default PenIllustration;
