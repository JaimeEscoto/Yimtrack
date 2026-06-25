import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { ProposalSchema } from '@/lib/validation';
import { generateProposal } from '@/lib/workout-generator';

export async function POST(req: Request) {
  try {
    await requireUser();
  } catch { return NextResponse.json({ error: 'unauth' }, { status: 401 }); }
  const body = await req.json();
  const parsed = ProposalSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const proposal = await generateProposal(parsed.data.focus, parsed.data.durationMin);
  return NextResponse.json(proposal);
}
