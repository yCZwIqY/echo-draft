import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { app, protocol } from 'electron';

const CONTENT_TYPES: Record<string, string> = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

export function registerRendererProtocol() {
  protocol.handle('app', async (request) => {
    const rendererRoot = path.resolve(app.getAppPath(), 'build/client');
    const requestPath = decodeURIComponent(new URL(request.url).pathname).replace(/^[/\\]+/, '');
    const requestedFile = path.resolve(rendererRoot, requestPath || 'index.html');
    const isWithinRendererRoot =
      requestedFile === rendererRoot || requestedFile.startsWith(`${rendererRoot}${path.sep}`);

    try {
      const content = await readFile(isWithinRendererRoot ? requestedFile : '');
      return new Response(content, {
        headers: {
          'content-type': CONTENT_TYPES[path.extname(requestedFile)] ?? 'application/octet-stream',
        },
      });
    } catch {
      const content = await readFile(path.join(rendererRoot, 'index.html'));
      return new Response(content, {
        headers: {
          'content-type': 'text/html',
        },
      });
    }
  });
}
