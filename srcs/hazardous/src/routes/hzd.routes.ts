import { FastifyInstance } from 'fastify';
import { welcom, healthCheck } from '../controllers/hzd.controller.js';

export async function hazardousRoutes(app: FastifyInstance) {
  app.post('/welcom', welcom);
  app.get('/health', healthCheck);
}
