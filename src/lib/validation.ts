import { z } from 'zod';

export const RegisterSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y _'),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  displayName: z.string().min(1).max(40).optional()
});

export const LoginSchema = z.object({
  identifier: z.string().min(3), // username o email
  password: z.string().min(1)
});

export const FOCUS_OPTIONS = ['upper','lower','push','pull','full','cardio','mixed','core'] as const;
export type Focus = typeof FOCUS_OPTIONS[number];

export const ProposalSchema = z.object({
  focus: z.enum(FOCUS_OPTIONS),
  durationMin: z.number().int().min(10).max(120)
});

export const GymSchema = z.object({
  name: z.string().min(2).max(80),
  address: z.string().max(200).optional(),
  city: z.string().max(80).optional()
});
