import 'dotenv/config';
import { db } from './client';
import { exercises, achievements } from './schema';

const EXERCISES = [
  // Upper - push
  { name: 'Press de banca', muscleGroups: ['chest','triceps','shoulders'], equipment: ['barbell','bench'], difficulty: 3, secondsPerSet: 45, defaultRestSeconds: 90, defaultSets: 4, defaultReps: 8 },
  { name: 'Press inclinado con mancuernas', muscleGroups: ['chest','shoulders'], equipment: ['dumbbells','bench'], difficulty: 3, defaultSets: 3, defaultReps: 10 },
  { name: 'Fondos en paralelas', muscleGroups: ['chest','triceps'], equipment: ['dip_bar'], difficulty: 3 },
  { name: 'Press militar', muscleGroups: ['shoulders','triceps'], equipment: ['barbell'], difficulty: 3, defaultRestSeconds: 90 },
  { name: 'Elevaciones laterales', muscleGroups: ['shoulders'], equipment: ['dumbbells'], difficulty: 2, defaultSets: 3, defaultReps: 15 },
  { name: 'Extensiones de tríceps en polea', muscleGroups: ['triceps'], equipment: ['cable'], difficulty: 2, defaultSets: 3, defaultReps: 12 },
  { name: 'Flexiones', muscleGroups: ['chest','triceps','core'], equipment: [], difficulty: 1, defaultSets: 3, defaultReps: 15 },

  // Upper - pull
  { name: 'Dominadas', muscleGroups: ['back','biceps'], equipment: ['pullup_bar'], difficulty: 4, defaultSets: 4, defaultReps: 8 },
  { name: 'Remo con barra', muscleGroups: ['back','biceps'], equipment: ['barbell'], difficulty: 3 },
  { name: 'Jalón al pecho', muscleGroups: ['back','biceps'], equipment: ['cable'], difficulty: 2 },
  { name: 'Curl con barra', muscleGroups: ['biceps'], equipment: ['barbell'], difficulty: 2, defaultSets: 3, defaultReps: 10 },
  { name: 'Curl martillo', muscleGroups: ['biceps'], equipment: ['dumbbells'], difficulty: 2, defaultSets: 3, defaultReps: 12 },
  { name: 'Face pull', muscleGroups: ['shoulders','back'], equipment: ['cable'], difficulty: 2, defaultSets: 3, defaultReps: 15 },

  // Lower
  { name: 'Sentadilla con barra', muscleGroups: ['quads','glutes','hamstrings'], equipment: ['barbell','rack'], difficulty: 4, defaultSets: 4, defaultReps: 8, defaultRestSeconds: 120, secondsPerSet: 60 },
  { name: 'Peso muerto', muscleGroups: ['hamstrings','glutes','back'], equipment: ['barbell'], difficulty: 4, defaultSets: 4, defaultReps: 6, defaultRestSeconds: 150, secondsPerSet: 60 },
  { name: 'Prensa de piernas', muscleGroups: ['quads','glutes'], equipment: ['machine'], difficulty: 2, defaultSets: 3, defaultReps: 12 },
  { name: 'Zancadas', muscleGroups: ['quads','glutes'], equipment: ['dumbbells'], difficulty: 2, defaultSets: 3, defaultReps: 12 },
  { name: 'Hip thrust', muscleGroups: ['glutes','hamstrings'], equipment: ['barbell','bench'], difficulty: 3, defaultSets: 3, defaultReps: 10 },
  { name: 'Curl femoral', muscleGroups: ['hamstrings'], equipment: ['machine'], difficulty: 2 },
  { name: 'Extensión de cuádriceps', muscleGroups: ['quads'], equipment: ['machine'], difficulty: 2 },
  { name: 'Elevación de talones', muscleGroups: ['calves'], equipment: ['machine'], difficulty: 1, defaultSets: 4, defaultReps: 15 },

  // Core
  { name: 'Plancha', muscleGroups: ['core'], equipment: [], difficulty: 1, defaultSets: 3, defaultReps: 1, secondsPerSet: 45 },
  { name: 'Crunch abdominal', muscleGroups: ['core'], equipment: [], difficulty: 1, defaultSets: 3, defaultReps: 20 },
  { name: 'Elevación de piernas colgado', muscleGroups: ['core'], equipment: ['pullup_bar'], difficulty: 3, defaultSets: 3, defaultReps: 12 },

  // Cardio
  { name: 'Cinta — caminata rápida', muscleGroups: ['cardio'], equipment: ['treadmill'], difficulty: 1, secondsPerSet: 600, defaultRestSeconds: 0, defaultSets: 1, defaultReps: 1 },
  { name: 'Bicicleta estática', muscleGroups: ['cardio'], equipment: ['bike'], difficulty: 2, secondsPerSet: 600, defaultRestSeconds: 0, defaultSets: 1, defaultReps: 1 },
  { name: 'Remo ergómetro', muscleGroups: ['cardio','back'], equipment: ['rower'], difficulty: 2, secondsPerSet: 600, defaultRestSeconds: 0, defaultSets: 1, defaultReps: 1 },
  { name: 'Burpees', muscleGroups: ['cardio','full'], equipment: [], difficulty: 3, defaultSets: 3, defaultReps: 15, defaultRestSeconds: 45 }
];

const ACHIEVEMENTS = [
  { code: 'first_workout', name: 'Primer paso', description: 'Completa tu primera sesión', iconEmoji: '🎯', rule: { type: 'sessions_count', threshold: 1 } },
  { code: 'sessions_5', name: 'Constante', description: '5 sesiones completadas', iconEmoji: '🔥', rule: { type: 'sessions_count', threshold: 5 } },
  { code: 'sessions_25', name: 'Imparable', description: '25 sesiones completadas', iconEmoji: '🏆', rule: { type: 'sessions_count', threshold: 25 } },
  { code: 'sessions_100', name: 'Centurión', description: '100 sesiones completadas', iconEmoji: '💯', rule: { type: 'sessions_count', threshold: 100 } },
  { code: 'streak_3', name: 'Racha de 3 días', description: '3 días seguidos entrenando', iconEmoji: '⚡', rule: { type: 'streak_days', threshold: 3 } },
  { code: 'streak_7', name: 'Semana completa', description: '7 días seguidos', iconEmoji: '📅', rule: { type: 'streak_days', threshold: 7 } },
  { code: 'lower_10', name: 'Piernas de acero', description: '10 sesiones de tren inferior', iconEmoji: '🦵', rule: { type: 'focus_sessions', focus: 'lower', threshold: 10 } },
  { code: 'upper_10', name: 'Tren superior', description: '10 sesiones de tren superior', iconEmoji: '💪', rule: { type: 'focus_sessions', focus: 'upper', threshold: 10 } },
  { code: 'mixed_10', name: 'Versátil', description: '10 sesiones mixtas', iconEmoji: '🧬', rule: { type: 'focus_sessions', focus: 'mixed', threshold: 10 } }
];

async function main() {
  console.log('Seeding exercises…');
  for (const ex of EXERCISES) {
    await db.insert(exercises).values(ex as any).onConflictDoNothing();
  }
  console.log('Seeding achievements…');
  for (const a of ACHIEVEMENTS) {
    await db.insert(achievements).values(a as any).onConflictDoNothing();
  }
  console.log('Done.');
}

main().catch((e) => { console.error(e); process.exit(1); });
