import React from 'react';

interface MascotProps {
  state?: 'idle' | 'thinking' | 'listening' | 'speaking' | 'happy' | 'wave' | 'offline';
  className?: string;
  size?: number;
}

export const Mascot: React.FC<MascotProps> = ({ state = 'idle', className = '', size = 120 }) => {
  // Determine facial expression based on state
  const getFacialExpression = () => {
    switch (state) {
      case 'thinking':
        return (
          <>
            {/* Thinking eyes: dot dot dot */}
            <circle cx="42" cy="52" r="3" fill="#2E1E38" />
            <circle cx="50" cy="52" r="3" fill="#2E1E38" />
            <circle cx="58" cy="52" r="3" fill="#2E1E38" />
            {/* Thinking smile: small curve */}
            <path d="M 47 59 Q 50 61 53 59" stroke="#2E1E38" strokeWidth="2" strokeLinecap="round" fill="none" />
          </>
        );
      case 'listening':
        return (
          <>
            {/* Listening eyes: wide, cute */}
            <circle cx="40" cy="50" r="4.5" fill="#2E1E38" />
            <circle cx="60" cy="50" r="4.5" fill="#2E1E38" />
            {/* Cute surprised mouth */}
            <circle cx="50" cy="60" r="3.5" fill="#2E1E38" />
          </>
        );
      case 'speaking':
        return (
          <>
            {/* Speaking eyes: happy arches */}
            <path d="M 36 52 Q 40 47 44 52" stroke="#2E1E38" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 56 52 Q 60 47 64 52" stroke="#2E1E38" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Talking open mouth */}
            <path d="M 45 59 Q 50 64 55 59" stroke="#2E1E38" strokeWidth="3" strokeLinecap="round" fill="none" />
          </>
        );
      case 'happy':
      case 'wave':
        return (
          <>
            {/* Happy eyes: curved arches */}
            <path d="M 36 51 Q 40 45 44 51" stroke="#2E1E38" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 56 51 Q 60 45 64 51" stroke="#2E1E38" strokeWidth="3" strokeLinecap="round" fill="none" />
            {/* Big happy smile */}
            <path d="M 42 58 Q 50 66 58 58" stroke="#2E1E38" strokeWidth="3" strokeLinecap="round" fill="none" />
            {/* Soft pink blush */}
            <circle cx="34" cy="58" r="4" fill="#FCA3B7" opacity="0.6" />
            <circle cx="66" cy="58" r="4" fill="#FCA3B7" opacity="0.6" />
          </>
        );
      case 'offline':
        return (
          <>
            {/* Offline eyes: sleeping bars */}
            <line x1="36" y1="52" x2="44" y2="52" stroke="#666" strokeWidth="3" strokeLinecap="round" />
            <line x1="56" y1="52" x2="64" y2="52" stroke="#666" strokeWidth="3" strokeLinecap="round" />
            {/* Neutral line mouth */}
            <line x1="46" y1="59" x2="54" y2="59" stroke="#666" strokeWidth="2" strokeLinecap="round" />
          </>
        );
      case 'idle':
      default:
        return (
          <>
            {/* Idle eyes: friendly standard dots */}
            <circle cx="40" cy="51" r="4" fill="#2E1E38" />
            <circle cx="60" cy="51" r="4" fill="#2E1E38" />
            {/* Soft gentle smile */}
            <path d="M 44 59 Q 50 64 56 59" stroke="#2E1E38" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Tiny blush dots */}
            <circle cx="35" cy="56" r="2.5" fill="#FCE1E4" />
            <circle cx="65" cy="56" r="2.5" fill="#FCE1E4" />
          </>
        );
    }
  };

  // Determine antenna coloring and glowing
  const getAntennaColor = () => {
    if (state === 'offline') return '#B2A89F';
    if (state === 'thinking') return '#E4C1F9';
    if (state === 'listening') return '#D0E1FD';
    if (state === 'speaking') return '#FFE5EC';
    return '#FCF6BD';
  };

  const isAntennaGlowing = state !== 'offline';

  return (
    <div className={`relative inline-block ${state !== 'offline' ? 'animate-float' : ''} ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Shadow under robot body */}
        <ellipse cx="50" cy="94" rx="26" ry="4" fill="#2E1E38" fillOpacity="0.08" />

        {/* Glow surrounding active robot */}
        {state !== 'offline' && (
          <circle
            cx="50"
            cy="55"
            r="38"
            fill="url(#mascotGlow)"
            className="animate-breath"
            style={{ transformOrigin: '50% 55%' }}
          />
        )}

        {/* --- Antenna --- */}
        {/* Stem */}
        <line x1="50" y1="28" x2="50" y2="18" stroke="#2E1E38" strokeWidth="4" strokeLinecap="round" />
        
        {/* Glow behind antenna tip */}
        {isAntennaGlowing && (
          <circle
            cx="50"
            cy="15"
            r="8"
            fill={getAntennaColor()}
            opacity="0.5"
            className="animate-pulse-slow"
          />
        )}
        
        {/* Antenna Heart/Star Tip */}
        {state === 'happy' || state === 'wave' ? (
          // Star Antenna Tip
          <path
            d="M 50 8 L 52 13 L 57 14 L 53 17 L 54 22 L 50 19 L 46 22 L 47 17 L 43 14 L 48 13 Z"
            fill={getAntennaColor()}
            stroke="#2E1E38"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        ) : (
          // Round Bulb Antenna Tip
          <circle cx="50" cy="14" r="6" fill={getAntennaColor()} stroke="#2E1E38" strokeWidth="2.5" />
        )}

        {/* --- Robot Arms --- */}
        {/* Left Arm */}
        <path
          d={state === 'wave' ? "M 22 55 Q 12 36 10 32" : "M 22 58 Q 14 58 12 66"}
          stroke="#2E1E38"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        {/* Wave arm tip sparkle */}
        {state === 'wave' && (
          <path
            d="M 8 24 L 9 26 L 11 27 L 9 28 L 8 30 L 7 28 L 5 27 L 7 26 Z"
            fill="#FCF6BD"
          />
        )}

        {/* Right Arm */}
        <path
          d="M 78 58 Q 86 58 88 66"
          stroke="#2E1E38"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        {/* --- Robot Ears --- */}
        <rect x="12" y="46" width="6" height="14" rx="3" fill="#D0E1FD" stroke="#2E1E38" strokeWidth="2.5" />
        <rect x="82" y="46" width="6" height="14" rx="3" fill="#D0E1FD" stroke="#2E1E38" strokeWidth="2.5" />

        {/* --- Robot Body (Warm Lilac / Cream) --- */}
        <rect
          x="18"
          y="26"
          width="64"
          height="54"
          rx="27"
          fill={state === 'offline' ? '#D6CFC9' : '#FFE5EC'}
          stroke="#2E1E38"
          strokeWidth="3.5"
        />

        {/* Decorative heart chest sticker */}
        {state !== 'offline' && (
          <path
            d="M 50 74 C 50 74 46 70 46 68 C 46 66.5 47 65.5 48.5 65.5 C 49.3 65.5 49.8 66 50 66.5 C 50.2 66 50.7 65.5 51.5 65.5 C 53 65.5 54 66.5 54 68 C 54 70 50 74 50 74 Z"
            fill="#FCA3B7"
            stroke="#2E1E38"
            strokeWidth="1.5"
          />
        )}

        {/* --- Display Screen Face (Cream White) --- */}
        <rect
          x="26"
          y="34"
          width="48"
          height="34"
          rx="17"
          fill={state === 'offline' ? '#BCAFA4' : '#FFFBF7'}
          stroke="#2E1E38"
          strokeWidth="3"
        />

        {/* Render facial expressions inside display screen */}
        {getFacialExpression()}

        {/* Cute Sparkles / Star Elements floating around robot */}
        {state === 'happy' && (
          <>
            {/* Sparkle 1 */}
            <path
              d="M 86 16 L 87.5 20 L 91.5 21 L 87.5 22 L 86 26 L 84.5 22 L 80.5 21 L 84.5 20 Z"
              fill="#FCF6BD"
              stroke="#2E1E38"
              strokeWidth="1"
            />
            {/* Sparkle 2 */}
            <path
              d="M 12 18 L 13.5 21 L 16.5 22 L 13.5 23 L 12 26 L 10.5 23 L 7.5 22 L 10.5 21 Z"
              fill="#FCF6BD"
              stroke="#2E1E38"
              strokeWidth="1"
            />
          </>
        )}

        {/* Gradients definitions */}
        <defs>
          <radialGradient id="mascotGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E4C1F9" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#E4C1F9" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};
export default Mascot;
