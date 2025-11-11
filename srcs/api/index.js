import Fastify from 'fastify';
import PubSub from './pubSub.js';
import Routes from './routes.js';
// import Redis from 'ioredis';

// const routes = require('./routes');
const fastify = Fastify({
  logger: true,
});

fastify.register(PubSub);
fastify.register(Routes);

// Start server
const start = async () => {
  try {
    await fastify.listen({
      port: 3000,
      host: '0.0.0.0',
    });
    fastify.log.info(`✅ API Gateway listening on port 3000`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

