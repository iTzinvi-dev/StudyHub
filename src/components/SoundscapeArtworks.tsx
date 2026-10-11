import React from 'react';

interface SoundscapeArtworkProps {
  trackId: string;
  className?: string;
}

export const SoundscapeArtwork: React.FC<SoundscapeArtworkProps> = ({ trackId, className = 'w-full h-36' }) => {
  switch (trackId) {
    case 'stormy-library':
      return (
        <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <linearGradient id="libBg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2A1008" />
              <stop offset="50%" stopColor="#4A1C0E" />
              <stop offset="100%" stopColor="#1E0A04" />
            </linearGradient>
            <radialGradient id="lampGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFF3D6" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#FF9B54" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FF7B47" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="libWindow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FF9E64" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#C4441D" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#240B05" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="goldAcc" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          {/* Warm background */}
          <rect width="320" height="200" rx="16" fill="url(#libBg)" />
          {/* Arched Gothic Window with warm amber glow */}
          <path d="M105 160 V70 C105 30 160 12 160 12 C160 12 215 30 215 70 V160 Z" fill="url(#libWindow)" stroke="#FDE68A" strokeWidth="2" strokeOpacity="0.5" />
          <path d="M160 12 V160 M105 95 H215 M105 130 H215" stroke="#FDF0D5" strokeWidth="1.5" strokeOpacity="0.4" />
          <circle cx="160" cy="55" r="16" stroke="#FDE68A" strokeWidth="1.5" strokeOpacity="0.5" fill="none" />
          {/* Gentle rain streaks */}
          <line x1="120" y1="35" x2="114" y2="65" stroke="#FDF0D5" strokeWidth="1.5" strokeOpacity="0.7" strokeDasharray="5 7" />
          <line x1="145" y1="50" x2="139" y2="95" stroke="#FDF0D5" strokeWidth="1.5" strokeOpacity="0.6" strokeDasharray="7 6" />
          <line x1="175" y1="40" x2="169" y2="85" stroke="#FDF0D5" strokeWidth="1.5" strokeOpacity="0.75" strokeDasharray="6 7" />
          <line x1="200" y1="65" x2="194" y2="115" stroke="#FDF0D5" strokeWidth="1.5" strokeOpacity="0.6" strokeDasharray="5 7" />
          {/* Bookshelf Silhouettes left */}
          <rect x="18" y="35" width="70" height="135" rx="5" fill="#140602" stroke="#61210F" strokeWidth="1.5" />
          <line x1="18" y1="72" x2="88" y2="72" stroke="#FDE68A" strokeOpacity="0.3" strokeWidth="2" />
          <line x1="18" y1="112" x2="88" y2="112" stroke="#FDE68A" strokeOpacity="0.3" strokeWidth="2" />
          <line x1="18" y1="152" x2="88" y2="152" stroke="#FDE68A" strokeOpacity="0.3" strokeWidth="2" />
          {/* Vibrant colorful books */}
          <rect x="25" y="44" width="9" height="28" rx="1.5" fill="#FF7B47" />
          <rect x="36" y="40" width="11" height="32" rx="1.5" fill="#F59E0B" />
          <rect x="49" y="47" width="8" height="25" rx="1.5" fill="#10B981" />
          <rect x="59" y="42" width="12" height="30" rx="1.5" fill="#EC4899" />
          <rect x="73" y="45" width="9" height="27" rx="1.5" fill="#FDF0D5" />
          <rect x="25" y="82" width="13" height="30" rx="1.5" fill="#3B82F6" />
          <rect x="40" y="85" width="9" height="27" rx="1.5" fill="#FF7B47" />
          <rect x="51" y="80" width="12" height="32" rx="1.5" fill="#FDE68A" />
          <rect x="65" y="83" width="14" height="29" rx="1.5" fill="#8B5CF6" />
          {/* Right bookshelf */}
          <rect x="232" y="35" width="70" height="135" rx="5" fill="#140602" stroke="#61210F" strokeWidth="1.5" />
          <line x1="232" y1="72" x2="302" y2="72" stroke="#FDE68A" strokeOpacity="0.3" strokeWidth="2" />
          <line x1="232" y1="112" x2="302" y2="112" stroke="#FDE68A" strokeOpacity="0.3" strokeWidth="2" />
          <line x1="232" y1="152" x2="302" y2="152" stroke="#FDE68A" strokeOpacity="0.3" strokeWidth="2" />
          <rect x="238" y="80" width="10" height="32" rx="1.5" fill="#FF7B47" />
          <rect x="250" y="84" width="9" height="28" rx="1.5" fill="#FDF0D5" />
          <rect x="261" y="78" width="13" height="34" rx="1.5" fill="#10B981" />
          <rect x="276" y="82" width="11" height="30" rx="1.5" fill="#F59E0B" />
          {/* Desk & Open Book */}
          <path d="M65 170 H255 V196 H65 Z" fill="#301007" stroke="#FF7B47" strokeWidth="1" />
          <path d="M132 167 Q160 160 160 174 Q160 160 188 167 L184 179 Q160 171 160 182 Q160 171 136 179 Z" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="1" />
          {/* Glowing Green/Emerald & Gold Banker's Lamp */}
          <ellipse cx="160" cy="140" rx="20" ry="8" fill="#10B981" stroke="#FDE68A" strokeWidth="1.5" />
          <path d="M160 148 V168" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
          <circle cx="160" cy="140" r="32" fill="url(#lampGlow)" />
        </svg>
      );

    case 'rainy-cabin':
      return (
        <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <linearGradient id="cabinSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#28130B" />
              <stop offset="50%" stopColor="#4A1E11" />
              <stop offset="100%" stopColor="#1C0904" />
            </linearGradient>
            <radialGradient id="hearthRadiance" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="50%" stopColor="#FF7B47" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FF7B47" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="cabinRoof" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8A2E12" />
              <stop offset="100%" stopColor="#4A1608" />
            </linearGradient>
          </defs>
          <rect width="320" height="200" rx="16" fill="url(#cabinSky)" />
          {/* Warm Mountains */}
          <path d="M0 125 L75 55 L145 110 L220 45 L320 130 V200 H0 Z" fill="#3D150B" opacity="0.75" />
          <path d="M0 145 L95 85 L165 130 L255 75 L320 140 V200 H0 Z" fill="#290E07" />
          {/* Pine trees with warm touches */}
          <polygon points="35,135 20,172 50,172" fill="#1A0703" />
          <polygon points="35,115 25,145 45,145" fill="#2E1108" />
          <polygon points="65,130 50,165 80,165" fill="#1A0703" />
          <polygon points="265,125 250,168 280,168" fill="#1A0703" />
          <polygon points="285,135 275,172 295,172" fill="#2E1108" />
          {/* Stone Chimney */}
          <rect x="200" y="75" width="20" height="45" rx="3" fill="#4A1C0E" stroke="#FF7B47" strokeWidth="1.5" />
          {/* Cheerful Golden Smoke Rings */}
          <circle cx="210" cy="65" r="5" fill="#FDE68A" opacity="0.6" />
          <circle cx="216" cy="52" r="7" fill="#FDE68A" opacity="0.45" />
          <circle cx="222" cy="38" r="9" fill="#FFFBEB" opacity="0.3" />
          {/* Cabin Walls */}
          <rect x="105" y="112" width="115" height="70" rx="4" fill="#42180B" stroke="#FF7B47" strokeWidth="2" strokeOpacity="0.6" />
          {/* Roof */}
          <polygon points="162.5,70 90,115 235,115" fill="url(#cabinRoof)" stroke="#FDE68A" strokeWidth="2" strokeOpacity="0.6" />
          {/* Radiant Hearth Window */}
          <rect x="125" y="128" width="34" height="30" rx="4" fill="url(#hearthRadiance)" stroke="#FDE68A" strokeWidth="2" />
          <line x1="142" y1="128" x2="142" y2="158" stroke="#3B1309" strokeWidth="2" />
          <line x1="125" y1="143" x2="159" y2="143" stroke="#3B1309" strokeWidth="2" />
          <circle cx="142" cy="143" r="26" fill="url(#hearthRadiance)" opacity="0.4" />
          {/* Cabin Door */}
          <rect x="175" y="128" width="25" height="54" rx="3" fill="#240B05" stroke="#FDE68A" strokeWidth="1.5" strokeOpacity="0.4" />
          <circle cx="193" cy="154" r="2.5" fill="#FDE68A" />
          {/* Rain lines */}
          <line x1="30" y1="20" x2="18" y2="55" stroke="#FDF0D5" strokeWidth="1.5" strokeOpacity="0.5" strokeDasharray="5 7" />
          <line x1="90" y1="15" x2="78" y2="50" stroke="#FDF0D5" strokeWidth="1.5" strokeOpacity="0.55" strokeDasharray="6 6" />
          <line x1="160" y1="10" x2="148" y2="45" stroke="#FDF0D5" strokeWidth="1.5" strokeOpacity="0.45" strokeDasharray="5 8" />
          <line x1="245" y1="15" x2="233" y2="55" stroke="#FDF0D5" strokeWidth="1.5" strokeOpacity="0.6" strokeDasharray="7 5" />
          <line x1="295" y1="30" x2="283" y2="70" stroke="#FDF0D5" strokeWidth="1.5" strokeOpacity="0.5" strokeDasharray="5 7" />
        </svg>
      );

    case 'midnight-cafe':
      return (
        <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <linearGradient id="cafeSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2D1107" />
              <stop offset="50%" stopColor="#501F0E" />
              <stop offset="100%" stopColor="#1E0A04" />
            </linearGradient>
            <linearGradient id="steamGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#FF7B47" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect width="320" height="200" rx="16" fill="url(#cafeSky)" />
          {/* Warm Bokeh Circles outside rainy window */}
          <circle cx="65" cy="50" r="24" fill="#FF7B47" opacity="0.35" />
          <circle cx="115" cy="35" r="16" fill="#FDE68A" opacity="0.3" />
          <circle cx="210" cy="45" r="28" fill="#F59E0B" opacity="0.3" />
          <circle cx="265" cy="65" r="20" fill="#EC4899" opacity="0.25" />
          <circle cx="160" cy="40" r="14" fill="#38BDF8" opacity="0.2" />
          {/* Rain streaks on glass */}
          <line x1="50" y1="15" x2="44" y2="85" stroke="#FDF0D5" strokeWidth="1.5" strokeOpacity="0.45" strokeDasharray="8 8" />
          <line x1="130" y1="10" x2="124" y2="95" stroke="#FDF0D5" strokeWidth="1.5" strokeOpacity="0.55" strokeDasharray="10 7" />
          <line x1="215" y1="20" x2="209" y2="90" stroke="#FDF0D5" strokeWidth="1.5" strokeOpacity="0.45" strokeDasharray="7 9" />
          <line x1="275" y1="10" x2="269" y2="80" stroke="#FDF0D5" strokeWidth="1.5" strokeOpacity="0.5" strokeDasharray="9 6" />
          {/* Warm Mahogany Cafe Counter */}
          <path d="M0 132 Q160 124 320 132 V200 H0 Z" fill="#381308" />
          <line x1="0" y1="133" x2="320" y2="133" stroke="#FDE68A" strokeWidth="2" strokeOpacity="0.4" />
          {/* Saucer */}
          <ellipse cx="160" cy="168" rx="52" ry="12" fill="#782A14" stroke="#FDE68A" strokeWidth="2" strokeOpacity="0.8" />
          <ellipse cx="160" cy="166" rx="42" ry="9" fill="#4A180B" />
          {/* Ceramic Mug */}
          <path d="M128 114 H192 V152 C192 163 177 167 160 167 C143 167 128 163 128 152 Z" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="2" />
          <path d="M133 116 H187 V150 C187 159 175 163 160 163 C145 163 133 159 133 150 Z" fill="#501C0D" />
          {/* Latte Art Heart */}
          <ellipse cx="160" cy="122" rx="24" ry="6" fill="#3B1309" />
          <circle cx="155" cy="122" r="3.5" fill="#FFFBEB" />
          <circle cx="165" cy="122" r="3.5" fill="#FFFBEB" />
          <polygon points="152,123 168,123 160,127" fill="#FFFBEB" />
          {/* Mug Handle */}
          <path d="M192 122 C208 122 208 146 192 146" stroke="#FFFBEB" strokeWidth="5" strokeLinecap="round" fill="none" />
          {/* Spiraling Cozy Steam */}
          <path d="M152 108 Q144 92 152 78 Q160 64 152 50" stroke="url(#steamGrad)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M166 108 Q174 92 166 76 Q158 60 166 46" stroke="url(#steamGrad)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        </svg>
      );

    case 'deep-forest':
      return (
        <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <linearGradient id="forestSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1B0C06" />
              <stop offset="50%" stopColor="#35160A" />
              <stop offset="100%" stopColor="#100502" />
            </linearGradient>
            <linearGradient id="streamGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#34D399" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#FDE68A" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <rect width="320" height="200" rx="16" fill="url(#forestSky)" />
          {/* Golden Crescent Moon */}
          <circle cx="250" cy="45" r="18" fill="#FDE68A" />
          <circle cx="257" cy="41" r="16" fill="#1B0C06" />
          {/* Starlight sparkles */}
          <circle cx="55" cy="30" r="2" fill="#FFFBEB" />
          <circle cx="105" cy="45" r="2" fill="#FDE68A" />
          <circle cx="175" cy="25" r="2.5" fill="#FFFBEB" />
          <circle cx="215" cy="65" r="2" fill="#38BDF8" />
          <circle cx="285" cy="35" r="1.5" fill="#FDE68A" />
          {/* Ridge tree lines */}
          <path d="M0 130 L30 100 L50 120 L85 90 L115 115 L155 85 L180 110 L220 80 L250 105 L285 75 L320 105 V200 H0 Z" fill="#2E1208" />
          {/* Midground Pines */}
          <polygon points="40,95 20,160 60,160" fill="#1A0703" />
          <polygon points="90,80 65,155 115,155" fill="#220904" />
          <polygon points="230,85 205,155 255,155" fill="#1A0703" />
          <polygon points="280,70 255,150 305,150" fill="#220904" />
          {/* Winding Luminous Stream */}
          <path d="M160 115 Q140 135 170 155 Q130 175 160 200 H200 Q170 175 205 155 Q175 135 185 115 Z" fill="url(#streamGrad)" />
          {/* Glowing Fireflies */}
          <circle cx="125" cy="140" r="3.5" fill="#34D399" />
          <circle cx="125" cy="140" r="7" fill="#34D399" opacity="0.35" />
          <circle cx="195" cy="130" r="3.5" fill="#FDE68A" />
          <circle cx="195" cy="130" r="7" fill="#FDE68A" opacity="0.35" />
          <circle cx="155" cy="165" r="3.5" fill="#38BDF8" />
          <circle cx="155" cy="165" r="7" fill="#38BDF8" opacity="0.35" />
          <circle cx="95" cy="160" r="3" fill="#FF7B47" />
          <circle cx="225" cy="150" r="3" fill="#FDE68A" />
        </svg>
      );

    case 'ocean-thunder':
      return (
        <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <linearGradient id="oceanBg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1C0A05" />
              <stop offset="50%" stopColor="#35160E" />
              <stop offset="100%" stopColor="#140602" />
            </linearGradient>
            <linearGradient id="boltGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="60%" stopColor="#FDE68A" />
              <stop offset="100%" stopColor="#FF7B47" />
            </linearGradient>
            <linearGradient id="seaWave" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0284C7" />
              <stop offset="50%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
          </defs>
          <rect width="320" height="200" rx="16" fill="url(#oceanBg)" />
          {/* Cloud Bank */}
          <path d="M-20 60 Q40 25 100 45 Q160 15 220 40 Q280 20 340 50 V110 H-20 Z" fill="#42180E" opacity="0.75" />
          {/* Resonant Lightning Bolt */}
          <path d="M190 18 L175 58 L195 63 L170 115" stroke="url(#boltGrad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M190 18 L175 58 L195 63 L170 115" stroke="#FDE68A" strokeWidth="8" strokeOpacity="0.3" strokeLinecap="round" />
          {/* Coastal Cliff & Lighthouse */}
          <path d="M255 100 L320 85 V200 H240 Z" fill="#240B05" />
          <rect x="278" y="58" width="14" height="32" rx="2" fill="#FFFBEB" />
          <polygon points="285,48 274,58 296,58" fill="#FF7B47" />
          {/* Lighthouse beam */}
          <polygon points="285,53 0,25 0,95" fill="#FDE68A" opacity="0.15" />
          {/* Dynamic Ocean Surf */}
          <path d="M0 145 C45 130 90 160 140 140 C190 120 230 150 275 135 C300 128 320 135 320 135 V200 H0 Z" fill="#2E1007" />
          <path d="M0 165 C60 142 110 175 165 152 C220 132 270 160 320 148 V200 H0 Z" fill="url(#seaWave)" stroke="#FFFBEB" strokeWidth="3" />
          {/* Sparkling foam beads */}
          <circle cx="165" cy="151" r="3.5" fill="#FFFBEB" />
          <circle cx="176" cy="154" r="3" fill="#FFFBEB" />
          <circle cx="154" cy="153" r="2.5" fill="#FFFBEB" />
          <circle cx="270" cy="146" r="3.5" fill="#FFFBEB" />
        </svg>
      );

    case 'tokyo-rain':
      return (
        <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <linearGradient id="tokyoSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1E0A05" />
              <stop offset="65%" stopColor="#3B140B" />
              <stop offset="100%" stopColor="#140602" />
            </linearGradient>
          </defs>
          <rect width="320" height="200" rx="16" fill="url(#tokyoSky)" />
          {/* Tokyo Tower Silhouette in Warm Glow */}
          <line x1="260" y1="18" x2="260" y2="110" stroke="#FF7B47" strokeWidth="2.5" />
          <polygon points="260,18 250,65 270,65" stroke="#FDE68A" strokeWidth="2" fill="none" />
          <circle cx="260" cy="16" r="3.5" fill="#FF7B47" />
          {/* Buildings */}
          <rect x="25" y="70" width="45" height="100" fill="#240B05" />
          <rect x="80" y="50" width="55" height="120" fill="#331008" />
          <rect x="145" y="80" width="40" height="90" fill="#240B05" />
          <rect x="195" y="60" width="50" height="110" fill="#331008" />
          {/* Neon Signboards (Vibrant Cyan & Amber) */}
          <rect x="86" y="62" width="15" height="45" rx="3" fill="#1C0602" stroke="#FF7B47" strokeWidth="2" />
          <circle cx="93.5" cy="71" r="2.5" fill="#FF7B47" />
          <circle cx="93.5" cy="83" r="2.5" fill="#FDE68A" />
          <circle cx="93.5" cy="95" r="2.5" fill="#FF7B47" />
          <rect x="202" y="72" width="14" height="42" rx="3" fill="#1C0602" stroke="#38BDF8" strokeWidth="2" />
          <circle cx="209" cy="80" r="2.5" fill="#38BDF8" />
          <circle cx="209" cy="92" r="2.5" fill="#A855F7" />
          <circle cx="209" cy="104" r="2.5" fill="#38BDF8" />
          {/* Street with vibrant neon reflections */}
          <rect x="0" y="160" width="320" height="40" fill="#100401" />
          <ellipse cx="105" cy="180" rx="50" ry="10" fill="#FF7B47" opacity="0.45" />
          <ellipse cx="215" cy="182" rx="42" ry="9" fill="#38BDF8" opacity="0.4" />
          {/* Clear Umbrella walking silhouette */}
          <path d="M140 148 Q160 128 180 148 Z" fill="#FFFBEB" opacity="0.5" stroke="#FDE68A" strokeWidth="2" />
          <line x1="160" y1="128" x2="160" y2="168" stroke="#FDE68A" strokeWidth="2.5" strokeLinecap="round" />
          {/* Rain streaks */}
          <line x1="50" y1="15" x2="45" y2="70" stroke="#FDF0D5" strokeWidth="1.5" strokeOpacity="0.5" strokeDasharray="5 7" />
          <line x1="110" y1="10" x2="105" y2="85" stroke="#FDF0D5" strokeWidth="1.5" strokeOpacity="0.6" strokeDasharray="7 6" />
          <line x1="170" y1="20" x2="165" y2="90" stroke="#FDF0D5" strokeWidth="1.5" strokeOpacity="0.5" strokeDasharray="6 8" />
          <line x1="230" y1="15" x2="225" y2="75" stroke="#FDF0D5" strokeWidth="1.5" strokeOpacity="0.55" strokeDasharray="5 6" />
        </svg>
      );

    case 'himalayan-zen':
      return (
        <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <linearGradient id="zenSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#250F08" />
              <stop offset="50%" stopColor="#4A1E11" />
              <stop offset="100%" stopColor="#1C0904" />
            </linearGradient>
            <linearGradient id="goldBowl" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="40%" stopColor="#FDE68A" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          <rect width="320" height="200" rx="16" fill="url(#zenSky)" />
          {/* Himalayan Peaks with sunrise gold */}
          <polygon points="160,30 105,120 215,120" fill="#501C0E" />
          <polygon points="160,30 145,68 160,62 175,68" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1.5" />
          <polygon points="75,60 15,140 135,140" fill="#3D1409" />
          <polygon points="75,60 65,92 75,86 85,92" fill="#FFFBEB" />
          <polygon points="245,55 185,140 305,140" fill="#3D1409" />
          <polygon points="245,55 235,88 245,82 255,88" fill="#FFFBEB" />
          {/* Monastery / Pagoda Roof */}
          <path d="M125 124 C145 110 175 110 195 124 L190 135 H130 Z" fill="#782A14" stroke="#FDE68A" strokeWidth="2" />
          <path d="M135 110 C150 100 170 100 185 110 L182 118 H138 Z" fill="#FF7B47" stroke="#FDE68A" strokeWidth="1" />
          {/* Golden Tibetan Singing Bowl */}
          <ellipse cx="160" cy="165" rx="38" ry="12" fill="#2E1007" />
          <path d="M126 154 C126 182 194 182 194 154 Z" fill="url(#goldBowl)" stroke="#FFFBEB" strokeWidth="2.5" />
          <ellipse cx="160" cy="154" rx="34" ry="8" fill="#782A14" stroke="#FDE68A" strokeWidth="1.5" />
          {/* Harmonic soundwaves */}
          <ellipse cx="160" cy="154" rx="50" ry="13" stroke="#FDE68A" strokeWidth="2" strokeOpacity="0.75" fill="none" strokeDasharray="6 6" />
          <ellipse cx="160" cy="154" rx="72" ry="19" stroke="#FF7B47" strokeWidth="1.5" strokeOpacity="0.55" fill="none" strokeDasharray="8 8" />
          <ellipse cx="160" cy="154" rx="95" ry="25" stroke="#FDE68A" strokeWidth="1.2" strokeOpacity="0.35" fill="none" strokeDasharray="10 10" />
          {/* Lotus Petal */}
          <path d="M160 132 C154 143 160 151 160 151 C160 151 166 143 160 132 Z" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1" />
        </svg>
      );

    case 'bonfire-campfire':
    default:
      return (
        <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <linearGradient id="bonfireBg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1E0A05" />
              <stop offset="60%" stopColor="#42180B" />
              <stop offset="100%" stopColor="#140602" />
            </linearGradient>
            <linearGradient id="roaringFlame" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#C4441D" />
              <stop offset="35%" stopColor="#FF7B47" />
              <stop offset="75%" stopColor="#FDE68A" />
              <stop offset="100%" stopColor="#FFFBEB" />
            </linearGradient>
          </defs>
          <rect width="320" height="200" rx="16" fill="url(#bonfireBg)" />
          {/* Bright Starry Night */}
          <circle cx="50" cy="30" r="2" fill="#FFFBEB" />
          <circle cx="95" cy="18" r="2.5" fill="#FDE68A" />
          <circle cx="150" cy="35" r="2" fill="#FF7B47" />
          <circle cx="220" cy="22" r="2.5" fill="#FFFBEB" />
          <circle cx="270" cy="40" r="2" fill="#FDE68A" />
          {/* Warm Embers Field */}
          <circle cx="160" cy="138" r="70" fill="#FF7B47" opacity="0.35" />
          {/* Stone fire ring */}
          <ellipse cx="160" cy="165" rx="58" ry="18" fill="#240B05" stroke="#782A14" strokeWidth="3" />
          <ellipse cx="112" cy="162" rx="10" ry="7" fill="#4A180B" stroke="#FDE68A" strokeWidth="1" strokeOpacity="0.4" />
          <ellipse cx="138" cy="173" rx="12" ry="8" fill="#4A180B" stroke="#FDE68A" strokeWidth="1" strokeOpacity="0.4" />
          <ellipse cx="178" cy="174" rx="13" ry="8" fill="#4A180B" stroke="#FDE68A" strokeWidth="1" strokeOpacity="0.4" />
          <ellipse cx="208" cy="164" rx="10" ry="7" fill="#4A180B" stroke="#FDE68A" strokeWidth="1" strokeOpacity="0.4" />
          {/* Crossed Logs */}
          <line x1="118" y1="172" x2="202" y2="150" stroke="#782A14" strokeWidth="9" strokeLinecap="round" />
          <line x1="122" y1="150" x2="198" y2="172" stroke="#4A180B" strokeWidth="9" strokeLinecap="round" />
          {/* Brilliant Flame */}
          <path d="M160 65 C138 98 132 125 132 155 C142 162 178 162 188 155 C188 125 182 98 160 65 Z" fill="url(#roaringFlame)" />
          {/* Inner core */}
          <path d="M160 92 C146 114 144 135 144 154 C150 158 170 158 176 154 C176 135 174 114 160 92 Z" fill="#FFFBEB" />
          {/* Dancing golden sparks rising */}
          <circle cx="152" cy="52" r="3" fill="#FF7B47" />
          <circle cx="168" cy="42" r="3.5" fill="#FDE68A" />
          <circle cx="144" cy="32" r="2" fill="#FF7B47" />
          <circle cx="180" cy="28" r="3" fill="#FFFBEB" />
          <circle cx="160" cy="18" r="2.5" fill="#FDE68A" />
        </svg>
      );
  }
};
