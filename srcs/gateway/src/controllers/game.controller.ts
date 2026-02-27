import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { proxyRequest, webSocketProxyRequest } from '../utils/proxy.js';
import { GATEWAY_CONFIG } from '../utils/constants.js';
import { fetchOptions } from '../utils/mtlsAgent.js';

import { logger } from '../utils/logger.js';
import { mtlsAgent } from '../utils/mtlsAgent.js';
import { MTLSRequestInit } from '../types/https.js';
import { CatchAllParams } from '../types/params.types.js';

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

  // app.delete('/del/:sessionId', async (request, reply) => {
  //   app.log.info({ event: 'game_delete_session', remote: 'game', url: '/del/:sessionId' });
  //   const { sessionId } = request.params as { sessionId: string };
  //   const res = await proxyRequest(
  //     app,
  //     request,
  //     reply,
  //     `${GATEWAY_CONFIG.SERVICES.GAME}/del/${sessionId}`,
  //   );
  //   return res;
  // });

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

  // app.get('/sessions', async (request, reply) => {
  //   app.log.info({ event: 'game_sessions', remote: 'game', url: '/sessions' });
  //   const res = await proxyRequest(app, request, reply, `${GATEWAY_CONFIG.SERVICES.GAME}/sessions`);
  //   return res;
  // });

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

  app.all(
    '/*',
    async (request: FastifyRequest<{ Params: CatchAllParams }>, reply: FastifyReply) => {
      const rawPath = request.params['*'];
      const cleanPath = rawPath.startsWith('/') ? rawPath.substring(1) : rawPath;
      const url = `${GATEWAY_CONFIG.SERVICES.AUTH}/${cleanPath}`;
      const queryString = new URL(request.url, 'https://localhost').search;
      const fullUrl = `${url}${queryString}`;

      // Configuration de la requête avec l'agent mTLS
      const init: MTLSRequestInit = {
        method: request.method,
        headers: {
          // On propage les headers de contenu si nécessaire
          ...(request.headers['content-type'] && {
            'content-type': request.headers['content-type'] as string,
          }),
          // Ajout des headers de sécurité interne
          'x-user-name': (request.headers['x-user-name'] as string) || '',
          'x-user-id': (request.headers['x-user-id'] as string) || '',
        },
        dispatcher: mtlsAgent, // Injection cruciale pour le mTLS
      };

      const rawUser = request.headers['x-user-name'] as string | string[] | undefined;
      const user = Array.isArray(rawUser) ? rawUser[0] : (rawUser ?? null);

      logger.info({
        event: 'auth_proxy_request',
        rawPath,
        method: request.method,
        user,
      });

      if (request.method !== 'GET' && request.method !== 'HEAD' && request.body) {
        // (init.headers as Record<string, string>)['content-type'] =
        //   request.headers['content-type'] || 'application/json';
        init.body = JSON.stringify(request.body);
      }

      const res = await proxyRequest(app, request, reply, fullUrl, init);
      return res;
    },
  );

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
}
