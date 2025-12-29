import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import { hazardousRoutes } from './routes/hzd.routes.js'
const fastify = Fastify({ logger: true });

// WebSocket game endpoint
fastify.register(hazardousRoutes);

// 404 handler
fastify.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
  reply.code(404).send({
    status: 'error',
    message: 'Endpoint not found',
    method: request.method,
    path: request.url,
  });
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3003, host: '0.0.0.0' });
    fastify.log.info('WebSocket Pong server running on port 3003');
    fastify.log.info('Connect to: ws://localhost:3003/game/{sessionId}');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

// Cleanup on shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down game service...');
  process.exit(0);
});
