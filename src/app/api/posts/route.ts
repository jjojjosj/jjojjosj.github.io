import { getAllPostsMeta } from '@/lib/posts';
import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET() {
  const posts = getAllPostsMeta();
  return NextResponse.json(posts);
}
