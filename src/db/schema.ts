import {
  pgTable, uuid, text, timestamp, integer, smallint, boolean,
  numeric, jsonb, primaryKey, uniqueIndex, index, date
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: text('username').notNull(),
  email: text('email').notNull(),
  passwordHash: text('password_hash').notNull(),
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  primaryGymId: uuid('primary_gym_id'),
  role: text('role').default('user').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (t) => ({
  usernameUq: uniqueIndex('users_username_uq').on(t.username),
  emailUq: uniqueIndex('users_email_uq').on(t.email)
}));

export const gyms = pgTable('gyms', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  address: text('address'),
  city: text('city'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (t) => ({
  nameIdx: index('gyms_name_idx').on(t.name)
}));

export const exercises = pgTable('exercises', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  // 'chest','back','shoulders','biceps','triceps','core','quads','hamstrings','glutes','calves','cardio','full'
  muscleGroups: text('muscle_groups').array().notNull(),
  equipment: text('equipment').array().default(sql`'{}'::text[]`).notNull(),
  difficulty: smallint('difficulty').default(2).notNull(),
  // segundos por set estimado (incl. ejecución)
  secondsPerSet: integer('seconds_per_set').default(45).notNull(),
  defaultRestSeconds: integer('default_rest_seconds').default(60).notNull(),
  defaultSets: integer('default_sets').default(3).notNull(),
  defaultReps: integer('default_reps').default(10).notNull(),
  videoUrl: text('video_url'),
  isPublic: boolean('is_public').default(true).notNull(),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const routines = pgTable('routines', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  focus: text('focus').notNull(),
  estimatedMinutes: integer('estimated_minutes').default(30).notNull(),
  isPublic: boolean('is_public').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const routineItems = pgTable('routine_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  routineId: uuid('routine_id').references(() => routines.id, { onDelete: 'cascade' }).notNull(),
  exerciseId: uuid('exercise_id').references(() => exercises.id).notNull(),
  position: integer('position').notNull(),
  sets: integer('sets').default(3).notNull(),
  reps: integer('reps').default(10).notNull(),
  restSeconds: integer('rest_seconds').default(60).notNull(),
  notes: text('notes')
});

export const workoutSessions = pgTable('workout_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  gymId: uuid('gym_id').references(() => gyms.id),
  routineId: uuid('routine_id').references(() => routines.id),
  focus: text('focus').notNull(),
  plannedMinutes: integer('planned_minutes').notNull(),
  actualMinutes: integer('actual_minutes'),
  status: text('status').default('in_progress').notNull(), // in_progress | completed | abandoned
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true })
}, (t) => ({
  userDateIdx: index('sessions_user_date_idx').on(t.userId, t.startedAt)
}));

export const sessionExercises = pgTable('session_exercises', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => workoutSessions.id, { onDelete: 'cascade' }).notNull(),
  exerciseId: uuid('exercise_id').references(() => exercises.id).notNull(),
  position: integer('position').notNull(),
  plannedSets: integer('planned_sets').notNull(),
  plannedReps: integer('planned_reps').notNull(),
  restSeconds: integer('rest_seconds').notNull(),
  completedSets: integer('completed_sets').default(0).notNull(),
  completedReps: integer('completed_reps').default(0).notNull(),
  weightKg: numeric('weight_kg')
});

export const contacts = pgTable('contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  requesterId: uuid('requester_id').references(() => users.id).notNull(),
  addresseeId: uuid('addressee_id').references(() => users.id).notNull(),
  status: text('status').default('pending').notNull(), // pending | accepted | blocked
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (t) => ({
  pairUq: uniqueIndex('contacts_pair_uq').on(t.requesterId, t.addresseeId)
}));

export const achievements = pgTable('achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  iconEmoji: text('icon_emoji'),
  rule: jsonb('rule').notNull()
}, (t) => ({
  codeUq: uniqueIndex('achievements_code_uq').on(t.code)
}));

export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userAId: uuid('user_a_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  userBId: uuid('user_b_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  lastMessageAt: timestamp('last_message_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (t) => ({
  pairUq: uniqueIndex('conversations_pair_uq').on(t.userAId, t.userBId)
}));

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }).notNull(),
  senderId: uuid('sender_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  body: text('body').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (t) => ({
  convIdx: index('messages_conv_idx').on(t.conversationId, t.createdAt)
}));

export const sleepLogs = pgTable('sleep_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  logDate: date('log_date').notNull(),
  sleepTime: text('sleep_time'), // 'HH:MM' del día anterior
  wakeTime: text('wake_time'),   // 'HH:MM' del logDate
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (t) => ({
  userDateUq: uniqueIndex('sleep_logs_user_date_uq').on(t.userId, t.logDate)
}));

export const userAchievements = pgTable('user_achievements', {
  userId: uuid('user_id').references(() => users.id).notNull(),
  achievementId: uuid('achievement_id').references(() => achievements.id).notNull(),
  unlockedAt: timestamp('unlocked_at', { withTimezone: true }).defaultNow().notNull()
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.achievementId] })
}));

export const usersRelations = relations(users, ({ many, one }) => ({
  sessions: many(workoutSessions),
  routines: many(routines),
  primaryGym: one(gyms, { fields: [users.primaryGymId], references: [gyms.id] })
}));

export const sessionsRelations = relations(workoutSessions, ({ many, one }) => ({
  exercises: many(sessionExercises),
  user: one(users, { fields: [workoutSessions.userId], references: [users.id] }),
  gym: one(gyms, { fields: [workoutSessions.gymId], references: [gyms.id] })
}));

export const sessionExercisesRelations = relations(sessionExercises, ({ one }) => ({
  session: one(workoutSessions, { fields: [sessionExercises.sessionId], references: [workoutSessions.id] }),
  exercise: one(exercises, { fields: [sessionExercises.exerciseId], references: [exercises.id] })
}));
