/**
 * Production Hardened Health Check & Keepalive Function for Vercel
 * 
 * Purpose:
 * - Responds to authenticated keepalive/health requests from Vercel Cron or external schedulers.
 * - Performs a lightweight, legitimate database query directly via PostgREST to reset PostgreSQL inactivity timer.
 * - Uses native platform fetch (zero external dependencies required in serverless function).
 * - Enforces Bearer token authentication via CRON_SECRET.
 * - Idempotent, safe, and read-only (zero writes, zero schema alterations).
 */

export default async function handler(req, res) {
  // Enforce HTTP methods
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Authenticate with CRON_SECRET
  const authHeader = req.headers['authorization'];
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    console.error('[Health] CRON_SECRET is not configured in environment variables');
    return res.status(500).json({ error: 'Server configuration error: CRON_SECRET is missing' });
  }

  if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing authorization token' });
  }

  // 2. Validate Supabase credentials (supports standard or VITE_ prefixed env vars)
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('[Health] Supabase URL or Key is missing in environment variables');
    return res.status(500).json({ error: 'Server configuration error: Supabase credentials missing' });
  }

  const startTime = Date.now();
  try {
    // Perform lightweight read via Supabase PostgREST endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/settings?select=id&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[Health] Supabase query failed (${response.status}):`, errText);
      return res.status(502).json({
        status: 'unhealthy',
        database: 'Supabase Postgres',
        statusCode: response.status,
        latencyMs,
        error: errText,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`[Health] Supabase ping succeeded (${latencyMs}ms)`);
    return res.status(200).json({
      status: 'healthy',
      database: 'Supabase Postgres',
      latencyMs,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    console.error('[Health] Unexpected error during database health check:', err.message);
    return res.status(500).json({
      status: 'error',
      latencyMs,
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
}
