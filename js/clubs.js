// Official club data: European giants popular in Nigeria & historic Nigerian Premier League clubs
export const NIGERIAN_CLUBS = [
  {
    id: 'enyimba',
    name: 'Enyimba FC',
    shortName: 'Enyimba',
    abbr: 'ENY',
    city: 'Aba, Abia',
    nickname: 'The People\'s Elephant',
    league: 'NPFL',
    colorCategory: 'blue',
    primaryColor: '#003399',   // Royal Elephant Blue
    secondaryColor: '#ffffff', // White
    accentColor: '#f59e0b',    // Gold
    textColor: '#ffffff',
    badgeSvg: `<svg viewBox="0 0 100 100" class="club-badge-svg">
      <defs>
        <linearGradient id="enyimbaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0044cc"/>
          <stop offset="100%" stop-color="#002266"/>
        </linearGradient>
      </defs>
      <path d="M50 5 L88 20 L88 58 C88 78 50 95 50 95 C50 95 12 78 12 58 L12 20 Z" fill="url(#enyimbaGrad)" stroke="#f59e0b" stroke-width="4"/>
      <path d="M35 40 C35 30 65 30 65 40 C65 46 72 48 76 54 C80 60 76 68 70 65 C68 64 68 75 60 75 L56 75 L56 60 L44 60 L44 75 L38 75 C34 75 34 56 35 40 Z" fill="#ffffff"/>
      <circle cx="58" cy="38" r="3" fill="#003399"/>
      <path d="M68 52 C74 54 78 58 76 62 C74 58 70 55 66 54 Z" fill="#f59e0b"/>
      <polygon points="50,14 52,19 57,19 53,22 55,27 50,24 45,27 47,22 43,19 48,19" fill="#f59e0b"/>
      <text x="50" y="86" text-anchor="middle" font-size="9" font-weight="900" fill="#ffffff" font-family="'Outfit', sans-serif">ENYIMBA</text>
    </svg>`
  },
  {
    id: 'kanopillars',
    name: 'Kano Pillars',
    shortName: 'Kano Pillars',
    abbr: 'PIL',
    city: 'Kano',
    nickname: 'Sai Masu Gida',
    league: 'NPFL',
    colorCategory: 'green',
    primaryColor: '#008751',   // Emerald Green
    secondaryColor: '#fcd116', // Sunny Gold
    accentColor: '#ffffff',
    textColor: '#ffffff',
    badgeSvg: `<svg viewBox="0 0 100 100" class="club-badge-svg">
      <defs>
        <linearGradient id="pillarsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#00a86b"/>
          <stop offset="100%" stop-color="#005a36"/>
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#pillarsGrad)" stroke="#fcd116" stroke-width="4"/>
      <polygon points="50,22 74,68 26,68" fill="#fcd116"/>
      <polygon points="50,22 50,68 74,68" fill="#e6b800"/>
      <circle cx="50" cy="46" r="10" fill="#ffffff" stroke="#005a36" stroke-width="1.5"/>
      <circle cx="50" cy="46" r="4" fill="#008751"/>
      <text x="50" y="82" text-anchor="middle" font-size="8.5" font-weight="900" fill="#ffffff" font-family="'Outfit', sans-serif">KANO PILLARS</text>
    </svg>`
  },
  {
    id: 'shootingstars',
    name: 'Shooting Stars 3SC',
    shortName: '3SC Ibadan',
    abbr: '3SC',
    city: 'Ibadan, Oyo',
    nickname: 'Oluyole Warriors',
    league: 'NPFL',
    colorCategory: 'blue',
    primaryColor: '#1e3a8a',   // Deep Blue
    secondaryColor: '#eab308', // Gold
    accentColor: '#ffffff',
    textColor: '#ffffff',
    badgeSvg: `<svg viewBox="0 0 100 100" class="club-badge-svg">
      <defs>
        <linearGradient id="threeScGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1d4ed8"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
      </defs>
      <path d="M50 6 L86 22 L86 60 C86 76 50 94 50 94 C50 94 14 76 14 60 L14 22 Z" fill="url(#threeScGrad)" stroke="#eab308" stroke-width="4"/>
      <path d="M26 38 Q50 30 76 26" stroke="#eab308" stroke-width="2" stroke-dasharray="2,2"/>
      <polygon points="32,36 34,40 38,40 35,42 36,46 32,44 28,46 29,42 26,40 30,40" fill="#ffffff"/>
      <polygon points="50,30 52,34 56,34 53,36 54,40 50,38 46,40 47,36 44,34 48,34" fill="#eab308"/>
      <polygon points="68,26 70,30 74,30 71,32 72,36 68,34 64,36 65,32 62,30 66,30" fill="#ffffff"/>
      <text x="50" y="64" text-anchor="middle" font-size="20" font-weight="900" fill="#eab308" font-family="'Outfit', sans-serif">3SC</text>
      <text x="50" y="78" text-anchor="middle" font-size="8" font-weight="700" fill="#ffffff" font-family="'Outfit', sans-serif">IBADAN</text>
    </svg>`
  },
  {
    id: 'remostars',
    name: 'Remo Stars',
    shortName: 'Remo Stars',
    abbr: 'REM',
    city: 'Ikenne, Ogun',
    nickname: 'Sky Blue Stars',
    league: 'NPFL',
    colorCategory: 'blue',
    primaryColor: '#0284c7',   // Sky Blue
    secondaryColor: '#ffffff', // White
    accentColor: '#38bdf8',
    textColor: '#ffffff',
    badgeSvg: `<svg viewBox="0 0 100 100" class="club-badge-svg">
      <defs>
        <linearGradient id="remoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#38bdf8"/>
          <stop offset="100%" stop-color="#0284c7"/>
        </linearGradient>
      </defs>
      <path d="M50 8 L88 24 L80 76 L50 94 L20 76 L12 24 Z" fill="url(#remoGrad)" stroke="#ffffff" stroke-width="3"/>
      <polygon points="50,22 56,38 74,38 59,49 65,65 50,54 35,65 41,49 26,38 44,38" fill="#ffffff"/>
      <polygon points="50,28 54,40 66,40 56,48 60,60 50,51 40,60 44,48 34,40 46,40" fill="#0284c7"/>
      <text x="50" y="82" text-anchor="middle" font-size="9" font-weight="900" fill="#ffffff" font-family="'Outfit', sans-serif">REMO STARS</text>
    </svg>`
  },
  {
    id: 'rangers',
    name: 'Rangers International',
    shortName: 'Enugu Rangers',
    abbr: 'RAN',
    city: 'Enugu',
    nickname: 'Flying Antelopes',
    league: 'NPFL',
    colorCategory: 'red',
    primaryColor: '#dc2626',   // Bold Crimson Red
    secondaryColor: '#ffffff', // White
    accentColor: '#991b1b',
    textColor: '#ffffff',
    badgeSvg: `<svg viewBox="0 0 100 100" class="club-badge-svg">
      <circle cx="50" cy="50" r="44" fill="#dc2626" stroke="#ffffff" stroke-width="4"/>
      <circle cx="50" cy="50" r="38" fill="none" stroke="#991b1b" stroke-width="2"/>
      <path d="M42 34 Q32 18 24 20 Q34 26 38 38 Z" fill="#ffffff"/>
      <path d="M58 34 Q68 18 76 20 Q66 26 62 38 Z" fill="#ffffff"/>
      <ellipse cx="50" cy="48" rx="14" ry="16" fill="#ffffff"/>
      <circle cx="45" cy="44" r="2.5" fill="#dc2626"/>
      <circle cx="55" cy="44" r="2.5" fill="#dc2626"/>
      <ellipse cx="50" cy="56" rx="5" ry="3" fill="#dc2626"/>
      <text x="50" y="82" text-anchor="middle" font-size="8.5" font-weight="900" fill="#ffffff" font-family="'Outfit', sans-serif">RANGERS INT</text>
    </svg>`
  }
];

export const EUROPEAN_CLUBS = [
  {
    id: 'chelsea',
    name: 'Chelsea FC',
    shortName: 'Chelsea',
    abbr: 'CHE',
    city: 'London, England',
    nickname: 'The Blues',
    league: 'Europe',
    colorCategory: 'blue',
    primaryColor: '#034694',   // Chelsea Blue
    secondaryColor: '#ffffff', // White
    accentColor: '#d1ab3e',    // Gold
    textColor: '#ffffff',
    badgeSvg: `<svg viewBox="0 0 100 100" class="club-badge-svg">
      <circle cx="50" cy="50" r="44" fill="#034694" stroke="#ffffff" stroke-width="3"/>
      <circle cx="50" cy="50" r="36" fill="#ffffff" stroke="#d1ab3e" stroke-width="2"/>
      <circle cx="50" cy="50" r="26" fill="#034694"/>
      <path d="M48 30 C52 28 58 30 57 36 C55 40 58 44 60 48 L62 56 L56 56 L54 50 L48 52 L48 64 L42 64 L44 48 C42 46 40 40 44 34 Z" fill="#d1ab3e"/>
      <circle cx="54" cy="34" r="1.5" fill="#ffffff"/>
      <line x1="62" y1="32" x2="62" y2="62" stroke="#d1ab3e" stroke-width="2.5"/>
      <circle cx="62" cy="30" r="3" fill="#d1ab3e"/>
      <text x="50" y="86" text-anchor="middle" font-size="8.5" font-weight="900" fill="#ffffff" font-family="'Outfit', sans-serif">CHELSEA</text>
    </svg>`
  },
  {
    id: 'arsenal',
    name: 'Arsenal FC',
    shortName: 'Arsenal',
    abbr: 'ARS',
    city: 'London, England',
    nickname: 'The Gunners',
    league: 'Europe',
    colorCategory: 'red',
    primaryColor: '#db0007',   // Cannon Red
    secondaryColor: '#ffffff', // White
    accentColor: '#9c824a',    // Gold
    textColor: '#ffffff',
    badgeSvg: `<svg viewBox="0 0 100 100" class="club-badge-svg">
      <path d="M50 6 L86 20 L86 60 C86 78 50 94 50 94 C50 94 14 78 14 60 L14 20 Z" fill="#db0007" stroke="#9c824a" stroke-width="3.5"/>
      <ellipse cx="44" cy="52" rx="9" ry="9" fill="#9c824a" stroke="#ffffff" stroke-width="1.5"/>
      <ellipse cx="44" cy="52" rx="4" ry="4" fill="#db0007"/>
      <polygon points="44,46 72,40 74,43 74,48 44,52" fill="#9c824a" stroke="#ffffff" stroke-width="1"/>
      <polygon points="72,39 76,38 76,49 72,48" fill="#9c824a"/>
      <polygon points="34,56 46,50 48,54 36,60" fill="#9c824a"/>
      <text x="50" y="28" text-anchor="middle" font-size="10" font-weight="900" fill="#ffffff" font-family="'Outfit', sans-serif">ARSENAL</text>
    </svg>`
  },
  {
    id: 'manutd',
    name: 'Manchester United',
    shortName: 'Man United',
    abbr: 'MUN',
    city: 'Manchester, England',
    nickname: 'Red Devils',
    league: 'Europe',
    colorCategory: 'red',
    primaryColor: '#da291c',   // Red Devil
    secondaryColor: '#fbe122', // Yellow
    accentColor: '#000000',
    textColor: '#ffffff',
    badgeSvg: `<svg viewBox="0 0 100 100" class="club-badge-svg">
      <path d="M50 6 L86 22 L86 62 C86 78 50 94 50 94 C50 94 14 78 14 62 L14 22 Z" fill="#da291c" stroke="#fbe122" stroke-width="3.5"/>
      <path d="M16 23 L84 23 L80 34 L20 34 Z" fill="#fbe122"/>
      <path d="M50 40 C44 40 42 46 42 50 C42 56 46 62 50 64 C54 62 58 56 58 50 C58 46 56 40 50 40 Z" fill="#fbe122"/>
      <line x1="62" y1="40" x2="62" y2="68" stroke="#fbe122" stroke-width="2"/>
      <path d="M58 42 L62 38 L66 42" stroke="#fbe122" stroke-width="2" fill="none"/>
      <text x="50" y="32" text-anchor="middle" font-size="7" font-weight="900" fill="#da291c" font-family="'Outfit', sans-serif">MANCHESTER</text>
      <text x="50" y="84" text-anchor="middle" font-size="7.5" font-weight="900" fill="#fbe122" font-family="'Outfit', sans-serif">UNITED</text>
    </svg>`
  },
  {
    id: 'realmadrid',
    name: 'Real Madrid',
    shortName: 'Real Madrid',
    abbr: 'RMA',
    city: 'Madrid, Spain',
    nickname: 'Los Blancos',
    league: 'Europe',
    colorCategory: 'white',
    primaryColor: '#f8fafc',   // Pure White
    secondaryColor: '#522b7a', // Royal Purple
    accentColor: '#ee9f27',    // Spanish Gold
    textColor: '#1e293b',
    badgeSvg: `<svg viewBox="0 0 100 100" class="club-badge-svg">
      <path d="M30 24 L34 16 L50 20 L66 16 L70 24 Z" fill="#ee9f27" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="50" cy="14" r="3" fill="#ee9f27"/>
      <circle cx="50" cy="56" r="34" fill="#ffffff" stroke="#ee9f27" stroke-width="3.5"/>
      <path d="M28 42 L62 78 A34 34 0 0 1 48 89 L24 62 Z" fill="#522b7a"/>
      <text x="50" y="64" text-anchor="middle" font-size="22" font-weight="900" fill="#ee9f27" font-family="'Outfit', sans-serif">RMC</text>
    </svg>`
  },
  {
    id: 'barcelona',
    name: 'FC Barcelona',
    shortName: 'Barcelona',
    abbr: 'BAR',
    city: 'Barcelona, Spain',
    nickname: 'Blaugrana',
    league: 'Europe',
    colorCategory: 'garnet',
    primaryColor: '#a50044',   // Garnet Red
    secondaryColor: '#004d98', // Deep Blue
    accentColor: '#edbb00',    // Gold
    textColor: '#ffffff',
    badgeSvg: `<svg viewBox="0 0 100 100" class="club-badge-svg">
      <path d="M18 16 Q50 24 82 16 L86 52 C86 74 50 94 50 94 C50 94 14 74 14 52 Z" fill="#edbb00" stroke="#edbb00" stroke-width="3"/>
      <path d="M18 19 L48 19 L48 46 L16 46 Z" fill="#ffffff"/>
      <rect x="30" y="19" width="6" height="27" fill="#dc2626"/>
      <rect x="18" y="30" width="30" height="6" fill="#dc2626"/>
      <path d="M52 19 L82 19 L84 46 L52 46 Z" fill="#edbb00"/>
      <rect x="58" y="19" width="4" height="27" fill="#dc2626"/>
      <rect x="68" y="19" width="4" height="27" fill="#dc2626"/>
      <rect x="78" y="19" width="4" height="27" fill="#dc2626"/>
      <path d="M16 52 L84 52 L84 62 C84 76 50 92 50 92 C50 92 16 76 16 62 Z" fill="#004d98"/>
      <path d="M38 52 L48 52 L48 90 C45 88 42 86 38 82 Z" fill="#a50044"/>
      <path d="M62 52 L72 52 L72 82 C68 86 65 88 62 90 Z" fill="#a50044"/>
      <circle cx="50" cy="52" r="8" fill="#edbb00" stroke="#0f172a" stroke-width="1.5"/>
    </svg>`
  },
  {
    id: 'liverpool',
    name: 'Liverpool FC',
    shortName: 'Liverpool',
    abbr: 'LIV',
    city: 'Liverpool, England',
    nickname: 'The Reds',
    league: 'Europe',
    colorCategory: 'red',
    primaryColor: '#c8102e',   // Crimson Red
    secondaryColor: '#ffffff', // White
    accentColor: '#00b2a9',    // Teal Green
    textColor: '#ffffff',
    badgeSvg: `<svg viewBox="0 0 100 100" class="club-badge-svg">
      <path d="M50 8 L86 22 L86 62 C86 78 50 94 50 94 C50 94 14 78 14 62 L14 22 Z" fill="#c8102e" stroke="#00b2a9" stroke-width="3.5"/>
      <path d="M48 34 C50 30 56 30 58 35 C56 38 60 42 62 48 L56 56 L52 50 L46 52 L46 64 L40 64 L42 46 C40 44 38 40 42 36 Z" fill="#ffffff"/>
      <circle cx="53" cy="33" r="1.5" fill="#c8102e"/>
      <path d="M48 34 Q42 30 40 33" stroke="#00b2a9" stroke-width="2" fill="none"/>
      <text x="50" y="24" text-anchor="middle" font-size="7" font-weight="900" fill="#ffffff" font-family="'Outfit', sans-serif">LIVERPOOL</text>
      <text x="50" y="84" text-anchor="middle" font-size="8" font-weight="900" fill="#00b2a9" font-family="'Outfit', sans-serif">YNWA</text>
    </svg>`
  }
];

export const ALL_CLUBS = [...EUROPEAN_CLUBS, ...NIGERIAN_CLUBS];

/**
 * Kit Clash Prevention Rule:
 * Opponent MUST be an authentic Nigerian club with a completely DIFFERENT color hue!
 */
export function getRandomOpponentClub(playerClubOrId) {
  const playerClub = typeof playerClubOrId === 'string'
    ? ALL_CLUBS.find(c => c.id === playerClubOrId) || ALL_CLUBS[0]
    : playerClubOrId;

  const playerCategory = playerClub?.colorCategory || 'blue';

  const nonClashing = NIGERIAN_CLUBS.filter(c => 
    c.id !== playerClub.id && c.colorCategory !== playerCategory
  );

  if (nonClashing.length > 0) {
    return nonClashing[Math.floor(Math.random() * nonClashing.length)];
  }

  const fallback = NIGERIAN_CLUBS.filter(c => c.id !== playerClub.id);
  return fallback[Math.floor(Math.random() * fallback.length)];
}
