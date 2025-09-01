import { NextResponse } from 'next/server';
import schemes from '@/lib/schemes';

export async function GET(request, { params }) {
  const { schemeId } = await params;
  if (!schemeId) {
    return NextResponse.json({ error: 'schemeId required' }, { status: 400 });
  }

  const found = schemes.find(s => s.schemeId === schemeId || String(s.id) === schemeId);
  if (!found) {
    return NextResponse.json({ error: 'Scheme not found' }, { status: 404 });
  }

  return NextResponse.json(found);
}
