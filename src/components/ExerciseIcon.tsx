type Props = { muscleGroups: string[]; size?: number; className?: string };

const COLORS: Record<string, { bg: string; fg: string }> = {
  chest:      { bg: '#7c2d12', fg: '#fed7aa' },
  back:       { bg: '#1e3a8a', fg: '#bfdbfe' },
  shoulders:  { bg: '#78350f', fg: '#fcd34d' },
  biceps:     { bg: '#831843', fg: '#fbcfe8' },
  triceps:    { bg: '#581c87', fg: '#e9d5ff' },
  quads:      { bg: '#14532d', fg: '#bbf7d0' },
  glutes:     { bg: '#14532d', fg: '#bbf7d0' },
  hamstrings: { bg: '#14532d', fg: '#bbf7d0' },
  calves:     { bg: '#064e3b', fg: '#a7f3d0' },
  core:       { bg: '#713f12', fg: '#fde68a' },
  cardio:     { bg: '#7f1d1d', fg: '#fecaca' },
  full:       { bg: '#374151', fg: '#e5e7eb' }
};

function pickCategory(groups: string[]): keyof typeof COLORS {
  for (const g of groups) {
    if (g in COLORS) return g as keyof typeof COLORS;
  }
  return 'full';
}

function Glyph({ cat, color }: { cat: string; color: string }) {
  // Cada glifo es un dibujo plano simple, centrado en un viewBox 64x64
  switch (cat) {
    case 'chest':
      // Barra con discos (press de banca)
      return (
        <g fill={color}>
          <rect x="6"  y="29" width="6"  height="6" rx="1" />
          <rect x="13" y="26" width="4"  height="12" rx="1" />
          <rect x="17" y="30" width="30" height="4" />
          <rect x="47" y="26" width="4"  height="12" rx="1" />
          <rect x="52" y="29" width="6"  height="6" rx="1" />
        </g>
      );
    case 'back':
      // Barra de dominadas con figura colgando
      return (
        <g fill={color}>
          <rect x="8" y="10" width="48" height="3" />
          <rect x="9" y="10" width="3" height="8" />
          <rect x="52" y="10" width="3" height="8" />
          <circle cx="32" cy="22" r="4" />
          <rect x="30" y="14" width="2" height="6" />
          <rect x="32" y="14" width="2" height="6" />
          <rect x="29" y="26" width="6" height="14" rx="1" />
          <rect x="28" y="40" width="3" height="12" rx="1" />
          <rect x="33" y="40" width="3" height="12" rx="1" />
        </g>
      );
    case 'shoulders':
      // Figura con brazos en cruz
      return (
        <g fill={color}>
          <circle cx="32" cy="16" r="5" />
          <rect x="6"  y="24" width="52" height="4" rx="1" />
          <rect x="29" y="22" width="6"  height="22" rx="1" />
          <rect x="27" y="44" width="4"  height="14" />
          <rect x="33" y="44" width="4"  height="14" />
        </g>
      );
    case 'biceps':
      // Brazo flexionando
      return (
        <g fill={color}>
          <rect x="12" y="34" width="18" height="10" rx="3" />
          <path d="M 30 24 q 14 4 14 18 l -10 2 q -2 -8 -10 -10 z" />
          <circle cx="42" cy="20" r="6" />
        </g>
      );
    case 'triceps':
      // Brazo extendido con peso
      return (
        <g fill={color}>
          <circle cx="14" cy="16" r="5" />
          <rect x="13" y="20" width="3" height="28" />
          <rect x="10" y="46" width="9" height="6" rx="1" />
          <rect x="13" y="50" width="36" height="3" />
          <circle cx="50" cy="51" r="5" />
        </g>
      );
    case 'quads':
    case 'glutes':
    case 'hamstrings':
      // Figura haciendo sentadilla
      return (
        <g fill={color}>
          <circle cx="32" cy="12" r="4" />
          <rect x="30" y="16" width="4" height="14" />
          <path d="M 22 30 h 20 v 8 l -8 6 v 10 h -4 v -10 l -8 -6 z" />
          <rect x="20" y="54" width="10" height="3" />
          <rect x="34" y="54" width="10" height="3" />
        </g>
      );
    case 'calves':
      // Pierna con pantorrilla
      return (
        <g fill={color}>
          <path d="M 26 8 h 12 v 22 q 0 4 -4 4 h -4 q -4 0 -4 -4 z" />
          <path d="M 28 34 q 6 4 6 12 q 0 8 -4 12 h -6 q -2 -10 -2 -14 q 0 -6 6 -10 z" />
          <rect x="20" y="56" width="14" height="4" rx="1" />
        </g>
      );
    case 'core':
      // Torso con abdominales marcados
      return (
        <g fill={color}>
          <path d="M 18 16 q 14 -6 28 0 v 32 q -14 6 -28 0 z" />
          <rect x="22" y="22" width="20" height="2" fill={color === '#fde68a' ? '#713f12' : '#000'} opacity="0.3" />
          <rect x="22" y="28" width="20" height="2" fill={color === '#fde68a' ? '#713f12' : '#000'} opacity="0.3" />
          <rect x="22" y="34" width="20" height="2" fill={color === '#fde68a' ? '#713f12' : '#000'} opacity="0.3" />
          <rect x="22" y="40" width="20" height="2" fill={color === '#fde68a' ? '#713f12' : '#000'} opacity="0.3" />
          <rect x="31" y="20" width="2" height="26" fill={color === '#fde68a' ? '#713f12' : '#000'} opacity="0.3" />
        </g>
      );
    case 'cardio':
      // Corazón con latido
      return (
        <g fill={color}>
          <path d="M 32 50 l -14 -14 a 8 8 0 1 1 14 -10 a 8 8 0 1 1 14 10 z" />
          <polyline points="6,32 18,32 22,24 28,40 32,32 58,32"
            fill="none" stroke={color} strokeWidth="2.5" />
        </g>
      );
    default:
      // Figura genérica (cuerpo completo)
      return (
        <g fill={color}>
          <circle cx="32" cy="14" r="5" />
          <rect x="29" y="20" width="6" height="20" rx="1" />
          <rect x="14" y="22" width="14" height="4" rx="1" transform="rotate(20 21 24)" />
          <rect x="36" y="22" width="14" height="4" rx="1" transform="rotate(-20 43 24)" />
          <rect x="28" y="40" width="3" height="16" />
          <rect x="33" y="40" width="3" height="16" />
        </g>
      );
  }
}

export default function ExerciseIcon({ muscleGroups, size = 56, className = '' }: Props) {
  const cat = pickCategory(muscleGroups);
  const { bg, fg } = COLORS[cat];
  return (
    <svg width={size} height={size} viewBox="0 0 64 64"
      className={`rounded-lg ${className}`} role="img" aria-label={cat}>
      <rect width="64" height="64" rx="10" fill={bg} />
      <Glyph cat={cat} color={fg} />
    </svg>
  );
}
