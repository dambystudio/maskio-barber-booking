import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

/**
 * API Endpoint per logging da mobile/PWA
 * POST /api/log
 * 
 * Riceve log dal client e li salva nel database per debug
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { level, message, details, userAgent, url } = body;

    // Salva nel database (se esiste tabella system_logs)
    try {
      await sql`
        INSERT INTO system_logs (
          level, 
          message, 
          details, 
          user_agent,
          url,
          created_at
        ) VALUES (
          ${level || 'info'},
          ${message || 'No message'},
          ${JSON.stringify(details || {})},
          ${userAgent || 'unknown'},
          ${url || 'unknown'},
          NOW()
        )
      `;
    } catch (dbError) {
      // Se la tabella non esiste, ignora l'errore
      console.log('⚠️ [LOG API] Tabella system_logs non trovata, skip DB save');
    }

    // Log su console del server
    const logPrefix = `[CLIENT ${level?.toUpperCase() || 'INFO'}]`;
    console.log(`${logPrefix} ${message}`);
    if (details) {
      console.log(`${logPrefix} Details:`, details);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ [LOG API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to log' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/log
 * Recupera gli ultimi 50 log dal database
 */
export async function GET(request: NextRequest) {
  try {
    const logs = await sql`
      SELECT id, level, message, details, user_agent, url, created_at
      FROM system_logs
      ORDER BY created_at DESC
      LIMIT 50
    `;

    return NextResponse.json({ 
      success: true, 
      logs: logs.map(log => ({
        ...log,
        details: typeof log.details === 'string' ? JSON.parse(log.details) : log.details
      }))
    });
  } catch (error) {
    console.error('❌ [LOG API] Error fetching logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}
