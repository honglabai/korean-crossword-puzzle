import React from 'react';

/**
 * Seated Assembly Speaker / Constitutional Sage illustration sitting on the rostrum/throne
 * directly touching the top frame of the puzzle board.
 */
export const SpeakerIllustration: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative flex justify-center items-end ${className}`}>
      <svg
        viewBox="0 0 320 180"
        className="w-56 sm:w-64 h-auto drop-shadow-xs overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="speakerRobe" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4fc3f7" />
            <stop offset="100%" stopColor="#0288d1" />
          </linearGradient>
          <linearGradient id="chairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#81d4fa" />
            <stop offset="100%" stopColor="#29b6f6" />
          </linearGradient>
          <pattern id="robePattern" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="6" cy="6" r="1.2" fill="#0277bd" opacity="0.4" />
          </pattern>
        </defs>

        {/* Armchair / Rostrum backrest */}
        <rect x="65" y="45" width="190" height="120" rx="20" fill="url(#chairGrad)" stroke="#0277bd" strokeWidth="3" />
        <path d="M65,70 Q160,40 255,70" stroke="#01579b" strokeWidth="2.5" fill="none" />
        {/* Left Armrest */}
        <path d="M45,95 Q55,85 75,95 L75,150 L45,150 Z" fill="#b3e5fc" stroke="#0277bd" strokeWidth="3" />
        {/* Right Armrest */}
        <path d="M245,95 Q265,85 275,95 L275,150 L245,150 Z" fill="#b3e5fc" stroke="#0277bd" strokeWidth="3" />

        {/* Speaker / Constitutional Sage Head */}
        <g id="head">
          {/* Traditional Scholar / Speaker Gat / Official Hat */}
          <path d="M125,32 L195,32 L185,15 L135,15 Z" fill="#01579b" stroke="#004d40" strokeWidth="1.5" />
          <line x1="110" y1="32" x2="210" y2="32" stroke="#01579b" strokeWidth="4" strokeLinecap="round" />
          {/* Top knot / Crown ribbon */}
          <rect x="153" y="6" width="14" height="10" rx="3" fill="#29b6f6" stroke="#01579b" strokeWidth="1.5" />

          {/* Face */}
          <ellipse cx="160" cy="52" rx="24" ry="22" fill="#ffffff" stroke="#0277bd" strokeWidth="2.5" />
          {/* Eyes (smiling wisely) */}
          <path d="M148,50 Q152,47 156,50" fill="none" stroke="#01579b" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M164,50 Q168,47 172,50" fill="none" stroke="#01579b" strokeWidth="2.5" strokeLinecap="round" />
          {/* Wise smile & Beard */}
          <path d="M155,59 Q160,63 165,59" fill="none" stroke="#01579b" strokeWidth="2" strokeLinecap="round" />
          {/* Dignified White / Light-Blue Beard */}
          <path d="M152,63 Q160,82 168,63 Z" fill="#e1f5fe" stroke="#0277bd" strokeWidth="1.5" />
          {/* Ears */}
          <circle cx="136" cy="52" r="5" fill="#ffffff" stroke="#0277bd" strokeWidth="2" />
          <circle cx="184" cy="52" r="5" fill="#ffffff" stroke="#0277bd" strokeWidth="2" />
        </g>

        {/* Robe / Blue Body */}
        <g id="body">
          <path
            d="M100,75 C100,75 125,70 160,70 C195,70 220,75 220,75 L235,170 L85,170 Z"
            fill="url(#speakerRobe)"
            stroke="#0277bd"
            strokeWidth="3"
          />
          {/* Robe texture */}
          <path
            d="M100,75 C100,75 125,70 160,70 C195,70 220,75 220,75 L235,170 L85,170 Z"
            fill="url(#robePattern)"
          />
          {/* Collar / V-neck */}
          <path d="M142,70 L160,95 L178,70" fill="#ffffff" stroke="#01579b" strokeWidth="2.5" />
          {/* Embroidered National Assembly / Sun Symbol on Chest */}
          <circle cx="160" cy="115" r="16" fill="#ffffff" stroke="#0288d1" strokeWidth="2" />
          <text x="160" y="120" textAnchor="middle" fontSize="12" fontWeight="900" fill="#01579b">國</text>
        </g>

        {/* Left Hand: Holding Gavel (의사봉) */}
        <g id="gavel-hand">
          <rect x="95" y="105" width="8" height="28" rx="2" transform="rotate(-35 95 105)" fill="#b0bec5" stroke="#37474f" strokeWidth="1.5" />
          <rect x="75" y="102" width="22" height="10" rx="3" transform="rotate(-35 75 102)" fill="#90a4ae" stroke="#37474f" strokeWidth="1.5" />
          {/* Hand */}
          <circle cx="110" cy="120" r="9" fill="#ffffff" stroke="#0277bd" strokeWidth="2" />
        </g>

        {/* Right Hand: Holding Open Constitution Book (헌법전) */}
        <g id="book-hand">
          <g transform="translate(170, 110)">
            {/* Open Book Pages */}
            <path d="M0,15 Q25,0 50,12 L50,34 Q25,22 0,36 Z" fill="#ffffff" stroke="#0277bd" strokeWidth="2" />
            <path d="M0,15 Q-25,0 -50,12 L-50,34 Q-25,22 0,36 Z" fill="#ffffff" stroke="#0277bd" strokeWidth="2" />
            {/* Book Spine */}
            <line x1="0" y1="15" x2="0" y2="36" stroke="#01579b" strokeWidth="2.5" />
            {/* Text lines */}
            <line x1="-38" y1="18" x2="-10" y2="24" stroke="#81d4fa" strokeWidth="1.5" />
            <line x1="-38" y1="24" x2="-10" y2="30" stroke="#81d4fa" strokeWidth="1.5" />
            <line x1="10" y1="24" x2="38" y2="18" stroke="#81d4fa" strokeWidth="1.5" />
            <line x1="10" y1="30" x2="38" y2="24" stroke="#81d4fa" strokeWidth="1.5" />
            {/* '憲法' written tiny */}
            <text x="25" y="14" fontSize="6" fontWeight="bold" fill="#01579b">헌법</text>
          </g>
          {/* Hand */}
          <circle cx="210" cy="125" r="9" fill="#ffffff" stroke="#0277bd" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
};

/**
 * Cute mini voter / reporter character hanging on the top right edge of the grid board
 */
export const HangingMiniCharacterTopRight: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`absolute -top-7 -right-3 z-20 pointer-events-none ${className}`}>
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Little kid/reporter hanging with ponytail */}
        {/* Ponytail flying */}
        <path d="M42,20 Q54,10 52,4 Q42,12 36,18" fill="#01579b" stroke="#01579b" strokeWidth="2" />
        {/* Head */}
        <circle cx="30" cy="24" r="14" fill="#ffffff" stroke="#0288d1" strokeWidth="2.5" />
        {/* Hair bangs */}
        <path d="M18,20 Q30,12 42,20" fill="#01579b" stroke="#01579b" strokeWidth="2" />
        {/* Cute Big Eyes looking down at puzzle */}
        <circle cx="26" cy="25" r="2.5" fill="#01579b" />
        <circle cx="34" cy="25" r="2.5" fill="#01579b" />
        <circle cx="27" cy="24" r="1" fill="#ffffff" />
        <circle cx="35" cy="24" r="1" fill="#ffffff" />
        {/* Rosy Cheek */}
        <ellipse cx="23" cy="28" rx="2" ry="1.5" fill="#ff8a80" opacity="0.6" />
        <ellipse cx="37" cy="28" rx="2" ry="1.5" fill="#ff8a80" opacity="0.6" />
        {/* Cute O-mouth */}
        <circle cx="30" cy="30" r="1.5" fill="#01579b" />

        {/* Little Hands gripping the board edge */}
        <circle cx="20" cy="36" r="3.5" fill="#ffffff" stroke="#0288d1" strokeWidth="2" />
        <circle cx="38" cy="36" r="3.5" fill="#ffffff" stroke="#0288d1" strokeWidth="2" />

        {/* Body & legs in air */}
        <path d="M28,34 L25,48 L20,54" stroke="#0288d1" strokeWidth="3" strokeLinecap="round" />
        <path d="M32,34 L36,46 L44,50" stroke="#0288d1" strokeWidth="3" strokeLinecap="round" />
        {/* Shirt */}
        <ellipse cx="30" cy="38" rx="7" ry="5" fill="#4fc3f7" stroke="#0288d1" strokeWidth="2" />
      </svg>
    </div>
  );
};

/**
 * Cute mini character hanging playfully at the bottom edge of the board
 */
export const HangingMiniCharacterBottom: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`absolute -bottom-7 left-1/2 -translate-x-1/2 z-20 pointer-events-none ${className}`}>
      <svg width="65" height="55" viewBox="0 0 65 55" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Hands gripping the frame above */}
        <circle cx="24" cy="6" r="3.5" fill="#ffffff" stroke="#0288d1" strokeWidth="2" />
        <circle cx="40" cy="6" r="3.5" fill="#ffffff" stroke="#0288d1" strokeWidth="2" />
        {/* Arms pulling up */}
        <path d="M24,7 L28,14" stroke="#0288d1" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M40,7 L36,14" stroke="#0288d1" strokeWidth="2.5" strokeLinecap="round" />

        {/* Head */}
        <circle cx="32" cy="24" r="13" fill="#ffffff" stroke="#0288d1" strokeWidth="2.5" />
        {/* Hair ribbon */}
        <path d="M24,14 Q32,10 40,14" stroke="#01579b" strokeWidth="3" strokeLinecap="round" />
        <circle cx="22" cy="14" r="3" fill="#29b6f6" stroke="#01579b" strokeWidth="1.5" />
        {/* Eyes looking up curiously */}
        <path d="M27,22 Q30,19 33,22" fill="none" stroke="#01579b" strokeWidth="2" strokeLinecap="round" />
        <path d="M35,22 Q38,19 41,22" fill="none" stroke="#01579b" strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="26" cy="26" rx="2" ry="1.2" fill="#ff8a80" opacity="0.6" />
        <ellipse cx="38" cy="26" rx="2" ry="1.2" fill="#ff8a80" opacity="0.6" />
        <path d="M30,28 Q32,30 34,28" fill="none" stroke="#01579b" strokeWidth="1.8" strokeLinecap="round" />

        {/* Dotted pattern shirt */}
        <path d="M26,35 L22,46 L42,46 L38,35 Z" fill="#81d4fa" stroke="#0288d1" strokeWidth="2" />
        {/* Feet kicking */}
        <circle cx="24" cy="49" r="3" fill="#ffffff" stroke="#0288d1" strokeWidth="1.5" />
        <circle cx="40" cy="49" r="3" fill="#ffffff" stroke="#0288d1" strokeWidth="1.5" />
      </svg>
    </div>
  );
};

/**
 * Bottom-left layered foliage from reference image
 */
export const BottomLeftFoliage: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`pointer-events-none select-none ${className}`}>
      <svg width="85" height="65" viewBox="0 0 85 65" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Pale blue outer petal */}
        <path
          d="M10,65 C5,45 15,15 35,22 C48,27 45,55 35,65 Z"
          fill="#b3e5fc"
          stroke="#4fc3f7"
          strokeWidth="2"
        />
        {/* Medium cyan central leaf */}
        <path
          d="M25,65 C18,35 32,5 50,15 C62,22 55,50 48,65 Z"
          fill="#4fc3f7"
          stroke="#0288d1"
          strokeWidth="2"
        />
        {/* Deep blue inner leaf with notch */}
        <path
          d="M45,65 C40,40 52,22 68,26 C75,28 75,40 70,44 C76,46 75,56 68,65 Z"
          fill="#0288d1"
          stroke="#01579b"
          strokeWidth="2"
        />
        <circle cx="68" cy="40" r="3" fill="#ffffff" />
      </svg>
    </div>
  );
};

/**
 * Bottom-right potted plant + Page badge from reference image
 */
export const BottomRightPlantAndBadge: React.FC<{
  pageNumber?: number | string;
  className?: string;
}> = ({ pageNumber = 9, className = '' }) => {
  return (
    <div className={`flex items-end gap-3 pointer-events-none select-none ${className}`}>
      {/* Potted plant line art */}
      <svg width="45" height="55" viewBox="0 0 45 55" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Stem and arching leaves */}
        <path d="M22,35 Q10,18 2,15 Q14,24 22,35" fill="#e1f5fe" stroke="#0288d1" strokeWidth="1.8" />
        <path d="M22,35 Q22,8 30,5 Q26,18 22,35" fill="#e1f5fe" stroke="#0288d1" strokeWidth="1.8" />
        <path d="M22,35 Q35,16 42,20 Q32,25 22,35" fill="#e1f5fe" stroke="#0288d1" strokeWidth="1.8" />
        {/* Pot */}
        <path d="M14,35 L30,35 L27,48 L17,48 Z" fill="#ffffff" stroke="#0288d1" strokeWidth="2" />
        {/* Pot stand / legs */}
        <line x1="17" y1="48" x2="14" y2="53" stroke="#0288d1" strokeWidth="2" strokeLinecap="round" />
        <line x1="27" y1="48" x2="30" y2="53" stroke="#0288d1" strokeWidth="2" strokeLinecap="round" />
      </svg>

      {/* Blue Pill Page / Level Badge (like '9' in the reference image) */}
      <div className="flex items-center justify-center bg-[#29b6f6] text-white font-extrabold text-sm px-4 py-1 rounded-l-full shadow-xs">
        {pageNumber}
      </div>
    </div>
  );
};
