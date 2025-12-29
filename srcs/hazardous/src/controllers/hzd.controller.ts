import { FastifyInstance, FastifyRequest } from 'fastify';

export async function welcom(this: FastifyInstance) {
  return {
    status: 'success',
    message: 'Hazardous Collective',
  };
}

export async function healthCheck() {
  return {
    status: 'healthy',
    service: 'hazardous-collective',
    timestamp: new Date().toISOString(),
  };
}
