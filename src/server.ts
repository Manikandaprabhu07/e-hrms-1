import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { Readable } from 'node:stream';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Proxy `/api/*` calls to the Nest backend when running SSR (prod build).
 * In dev, Angular's dev-server proxy (proxy.conf.json) handles this.
 */
const backendBaseUrl = process.env['BACKEND_URL'] || 'https://e-hrms-2.onrender.com';
app.use('/api', async (req, res, next) => {
  try {
    const targetUrl = new URL(req.originalUrl, backendBaseUrl);

    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (value === undefined) continue;
      headers[key] = Array.isArray(value) ? value.join(',') : value;
    }

    // Let fetch set these appropriately for the target.
    delete headers['host'];

    const init: RequestInit & { duplex?: 'half' } = {
      method: req.method,
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      init.body = req as any;
      init.duplex = 'half';
    }

    const upstream = await fetch(targetUrl, init);

    res.status(upstream.status);

    const setCookies = (upstream.headers as any).getSetCookie?.();
    if (Array.isArray(setCookies) && setCookies.length > 0) {
      res.setHeader('set-cookie', setCookies);
    }

    upstream.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') return;
      res.setHeader(key, value);
    });

    if (!upstream.body) {
      res.end();
      return;
    }

    Readable.fromWeb(upstream.body as any).pipe(res);
  } catch (error) {
    next(error);
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
