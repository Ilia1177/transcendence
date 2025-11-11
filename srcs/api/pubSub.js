// pubSub.js
import fp from 'fastify-plugin';
import Redis from 'ioredis';

async function redisPlugin(fastify, options) {
  const redisUrl = 'redis://redis-broker:6379'; //process.env.REDIS_URL || 'redis://redis-broker:6379';
  
  fastify.log.info(`Attempting to connect to Redis at: ${redisUrl}`);

  // Publisher - for sending messages
  const redisPublisher = new Redis(redisUrl, {
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      fastify.log.info(`Redis publisher reconnecting... attempt ${times}`);
      return delay;
    },
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
  });

  // Subscriber - for static channels only
  const redisSubscriber = new Redis(redisUrl, {
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      fastify.log.info(`Redis subscriber reconnecting... attempt ${times}`);
      return delay;
    },
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
  });

  // Dedicated client for dynamic RPC-style subscriptions
  const redisRpcClient = new Redis(redisUrl, {
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      fastify.log.info(`Redis RPC client reconnecting... attempt ${times}`);
      return delay;
    },
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
  });

  // Track messages globally
  let lastMessage = null;
  let messageCount = 0;
  const connectionReady = {
    publisher: false,
    subscriber: false,
    rpc: false,
  };

  // Publisher connection events
  redisPublisher.on('error', (err) => {
    fastify.log.error(`Redis publisher error: ${err.message}`);
    connectionReady.publisher = false;
  });

  redisPublisher.on('connect', () => {
    fastify.log.info('Redis publisher connecting...');
  });

  redisPublisher.on('ready', () => {
    fastify.log.info('✅ Redis publisher ready');
    connectionReady.publisher = true;
  });

  // Subscriber connection events
  redisSubscriber.on('error', (err) => {
    fastify.log.error(`Redis subscriber error: ${err.message}`);
    connectionReady.subscriber = false;
  });

  redisSubscriber.on('connect', () => {
    fastify.log.info('Redis subscriber connecting...');
  });

  redisSubscriber.on('ready', () => {
    fastify.log.info('✅ Redis subscriber ready');
    connectionReady.subscriber = true;
  });

  // RPC client connection events
  redisRpcClient.on('error', (err) => {
    fastify.log.error(`Redis RPC client error: ${err.message}`);
    connectionReady.rpc = false;
  });

  redisRpcClient.on('ready', () => {
    fastify.log.info('✅ Redis RPC client ready');
    connectionReady.rpc = true;
  });

  // Track all messages from static subscriber
  redisSubscriber.on('message', (channel, message) => {
    lastMessage = message;
    messageCount++;
    fastify.log.debug(`[Redis:${channel}] ${message}`);
  });

  // Decorate fastify instance
  fastify.decorate('redisPublisher', redisPublisher);
  fastify.decorate('redisSubscriber', redisSubscriber);
  fastify.decorate('redisRpcClient', redisRpcClient);
  fastify.decorate('redisStats', {
    get lastMessage() { return lastMessage; },
    get messageCount() { return messageCount; },
    get ready() { 
      return connectionReady.publisher && connectionReady.subscriber && connectionReady.rpc;
    },
  });

  // Wait for all connections to be ready before proceeding
  try {
    fastify.log.info('Waiting for Redis connections...');
    
    await Promise.all([
      new Promise((resolve, reject) => {
        if (redisPublisher.status === 'ready') return resolve();
        redisPublisher.once('ready', resolve);
        redisPublisher.once('error', reject);
        setTimeout(() => reject(new Error('Publisher connection timeout')), 10000);
      }),
      new Promise((resolve, reject) => {
        if (redisSubscriber.status === 'ready') return resolve();
        redisSubscriber.once('ready', resolve);
        redisSubscriber.once('error', reject);
        setTimeout(() => reject(new Error('Subscriber connection timeout')), 10000);
      }),
      new Promise((resolve, reject) => {
        if (redisRpcClient.status === 'ready') return resolve();
        redisRpcClient.once('ready', resolve);
        redisRpcClient.once('error', reject);
        setTimeout(() => reject(new Error('RPC client connection timeout')), 10000);
      }),
    ]);

    // Subscribe to static channels after connection is ready
    const channels = ['health_test'];
    for (const ch of channels) {
      await redisSubscriber.subscribe(ch);
      fastify.log.info(`✅ Subscribed to Redis channel: ${ch}`);
    }

    fastify.log.info('🚀 All Redis connections established');
  } catch (err) {
    fastify.log.error(`❌ Redis connection failed: ${err.message}`);
    throw err; // This will prevent the server from starting if Redis is unavailable
  }

  // Graceful shutdown
  fastify.addHook('onClose', async (instance) => {
    fastify.log.info('Closing Redis connections...');
    try {
      await Promise.all([
        redisPublisher.quit(),
        redisSubscriber.quit(),
        redisRpcClient.quit(),
      ]);
      fastify.log.info('Redis connections closed');
    } catch (err) {
      fastify.log.warn(`Error closing Redis: ${err.message}`);
    }
  });
}

export default fp(redisPlugin);
