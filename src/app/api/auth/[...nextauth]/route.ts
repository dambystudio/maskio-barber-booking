import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { NextRequest } from 'next/server';
import { cookies, headers } from 'next/headers';

const handler = NextAuth(authOptions);

export async function GET(request: NextRequest, context: any) {
  // Preload async APIs to avoid Next.js 15 warnings
  try {
    await cookies();
    await headers();
  } catch (error) {
    // Ignore preload errors
  }
  
  if (context?.params) {
    const resolvedParams = await context.params;
    return handler(request, { params: resolvedParams });
  }
  
  return handler(request, context);
}

export async function POST(request: NextRequest, context: any) {
  // Preload async APIs to avoid Next.js 15 warnings
  try {
    await cookies();
    await headers();
  } catch (error) {
    // Ignore preload errors
  }
  
  if (context?.params) {
    const resolvedParams = await context.params;
    return handler(request, { params: resolvedParams });
  }
  
  return handler(request, context);
}
