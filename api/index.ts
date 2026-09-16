// Vercel Serverless Function Entry Point for SiAP
// This file wraps the Express app with proper error boundary

import type { IncomingMessage, ServerResponse } from 'http';

let handler: ((req: IncomingMessage, res: ServerResponse) => void) | null = null;
let initError: Error | null = null;
let initDone = false;

async function initialize() {
  if (initDone) return;
  initDone = true;
  try {
    const mod = await import('../server/app.js');
    handler = (mod.app || mod.default) as any;
    console.log('[SiAP] Express app initialized successfully');
  } catch (err: any) {
    initError = err;
    console.error('[SiAP] FATAL: Failed to initialize Express app:', err?.message, err?.stack);
  }
}

// Pre-initialize (non-blocking)
initialize().catch(() => {});

export default async function siapHandler(req: IncomingMessage, res: ServerResponse) {
  // Ensure init completes
  if (!initDone) {
    await initialize();
  }

  if (initError) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Server initialization failed',
      detail: initError.message,
      stack: process.env.NODE_ENV === 'development' ? initError.stack : undefined,
    }));
    return;
  }

  if (!handler) {
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Handler not ready' }));
    return;
  }

  try {
    handler(req, res);
  } catch (err: any) {
    console.error('[SiAP] Request handler error:', err?.message);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Request failed', detail: err.message }));
    }
  }
}
