import Fastify, { FastifyInstance } from 'fastify';
import autoLoad from '@fastify/autoload';
import path from 'path';
import errors from 'http-errors';

import type { EnvConfig } from './config';
import initFirestore from './firestore';

function buildServer(config: EnvConfig): FastifyInstance {
  const opts = {
    ...config,
    logger: {
      level: config.LOG_LEVEL,
      ...(config.PRETTY_PRINT && {
        transport: {
          target: 'pino-pretty',
        },
      }),
    },
  };

  const fastify = Fastify(opts);
  fastify.register(import('@fastify/cors'), {
    origin: true,
  });

  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: config,
  });

  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'routes'),
  });

  fastify.decorate('firebase', initFirestore(config))

  fastify.setErrorHandler((error, _req, reply) => {
    if (error instanceof errors.HttpError || error.statusCode === 400 || error.statusCode === 401) {
      reply.status(<number>error.statusCode).send(error);
    } else {
      fastify.log.info(error);
      reply.status(500).send(new errors.InternalServerError());
    }
  });

  fastify.log.info('Fastify is starting up!');

  return fastify;
}

export default buildServer;
