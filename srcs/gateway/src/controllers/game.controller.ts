import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { proxyRequest, webSocketProxyRequest } from '../utils/proxy.js';
import { GATEWAY_CONFIG } from '../utils/constants.js';
import { fetchOptions } from '../utils/mtlsAgent.js';

export function registerGameRoutes(app: FastifyInstance) {
  // Regular HTTP routes
  app.get('/health', async (request, reply) => {
    app.log.info({ event: 'game_health', remote: 'game', url: '/health' });
    const res = await proxyRequest(
      app,
      request,
      reply,
      `${GATEWAY_CONFIG.SERVICES.GAME}/health`,
      fetchOptions,
    );
    return res;
  });

  app.delete('/del/:sessionId', async (request, reply) => {
    app.log.info({ event: 'game_delete_session', remote: 'game', url: '/del/:sessionId' });
    const { sessionId } = request.params as { sessionId: string };
    const res = await proxyRequest(
      app,
      request,
      reply,
      `${GATEWAY_CONFIG.SERVICES.GAME}/del/${sessionId}`,
    );
    return res;
  });

  app.post('/settings', async (request, reply) => {
    app.log.info({ event: 'game_settings', remote: 'game', url: '/settings' });
    const res = await proxyRequest(
      app,
      request,
      reply,
      `${GATEWAY_CONFIG.SERVICES.GAME}/settings`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request.body),
      },
    );
    return res;
  });

  app.post('/create-session', async (request, reply) => {
    app.log.info({ event: 'game_create_session', remote: 'game', url: '/create-session' });
    const res = await proxyRequest(
      app,
      request,
      reply,
      `${GATEWAY_CONFIG.SERVICES.GAME}/create-session`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request.body),
      },
    );
    return res;
  });

  app.get('/sessions', async (request, reply) => {
    app.log.info({ event: 'game_sessions', remote: 'game', url: '/sessions' });
    const res = await proxyRequest(app, request, reply, `${GATEWAY_CONFIG.SERVICES.GAME}/sessions`);
    return res;
  });

  // // // WebSocket proxy route for /api/game/ws
  // app.get('/ws', { websocket: true }, (connection: any, request: FastifyRequest) => {
  //   webSocketProxyRequest(app, connection, request, '/ws');
  // });

  // WebSocket proxy route for /api/game/:sessionId (dynamic session IDs)
  // add ws because /:sessionId  intercept all routes
  app.get('/ws/:sessionId', { websocket: true }, (connection: any, request: FastifyRequest) => {
    const { sessionId } = request.params as { sessionId: string };
    const socket = connection.socket ?? connection; // handles both version of ws
    webSocketProxyRequest(app, socket, request, `/ws/${sessionId}`);
  });

  // app.all('/*', async (request, reply) => {
  //   const rawPath = (request.params as any)['*'];
  //   const cleanPath = rawPath.replace(/^api\/game\//, ''); // 🔥 FIX
  //   const url = `${GATEWAY_CONFIG.SERVICES.GAME}/${cleanPath}`;
  //   const queryString = new URL(request.url, 'https://localhost').search;
  //   const fullUrl = `${url}${queryString}`;
  //
  //   app.log.info({
  //     event: 'game_proxy_request',
  //     fullUrl,
  //     method: request.method,
  //     user: request.headers['x-user-name'] || null,
  //   });
  //
  //   const init: RequestInit = {
  //     method: request.method,
  //   };
  //
  //   if (request.method !== 'GET' && request.method !== 'HEAD') {
  //     init.body = JSON.stringify(request.body);
  //   }
  //
  //   const res = await proxyRequest(app, request, reply, fullUrl, init);
  //   return res;
  // });
  //
  app.all('/*', async (request, reply) => {
    const rawPath = (request.params as any)['*'];
    const cleanPath = rawPath.replace(/^api\/game\//, '');

    // DEBUG: Log the raw and cleaned paths
    console.log('🔍 RAW PATH:', rawPath);
    console.log('🔍 CLEAN PATH:', cleanPath);
    const url = `${GATEWAY_CONFIG.SERVICES.GAME}/${cleanPath}`;
    console.log('🔍 FULL URL:', url);

    const queryString = new URL(request.url, 'https://localhost').search;
    const fullUrl = `${url}${queryString}`;

    console.log('🔍 FINAL URL:', fullUrl);

    app.log.info({
      event: 'game_proxy_request',
      fullUrl,
      method: request.method,
      user: request.headers['x-user-name'] || null,
    });

    // Create headers object with all original headers
    const headers: Record<string, string> = {};

    // Copy all headers from the original request
    Object.entries(request.headers).forEach(([key, value]) => {
      if (value !== undefined) {
        // Handle array values (some headers can be arrays)
        headers[key] = Array.isArray(value) ? value.join(', ') : value;
      }
    });

    // Optional: Add/override specific headers
    // headers['x-forwarded-for'] = request.ip || request.socket.remoteAddress;
    headers['x-forwarded-host'] = request.hostname;
    headers['x-forwarded-proto'] = request.protocol;

    const init: RequestInit = {
      method: request.method,
      headers, // Add all headers here
    };

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      init.body = JSON.stringify(request.body);
    }

    const res = await proxyRequest(app, request, reply, fullUrl, init);
    return res;
  });
}
