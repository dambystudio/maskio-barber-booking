import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { NextRequest } from 'next/server';

const handler = NextAuth(authOptions);

export async function GET(request: NextRequest, { params }: { params: Promise<{ nextauth: string[] }> }) {
  // Await params before using them
  const resolvedParams = await params;
  return await handler(request, { params: resolvedParams });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ nextauth: string[] }> }) {
  // Await params before using them  
  const resolvedParams = await params;
  return await handler(request, { params: resolvedParams });
}
