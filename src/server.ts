import buildServer from './index';
import configSchema from './config';

const fastify = buildServer(configSchema);

async function start(): Promise<void> {
  try {

    await fastify.listen({ port: +(<string>process.env.PORT) });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
