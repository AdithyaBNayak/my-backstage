import { errorHandler } from '@backstage/backend-common';
import { Config } from '@backstage/config';
import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';

export interface RouterOptions {
  logger: Logger;
  config: Config;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger,config } = options;

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.get('/hello', (_, response) => { // express js request query
    logger.info('GET Hello Request');
    response.json({ status: 'world' });
  });

  router.get('/config/:configId', (request , response) => {
    const { configId } = request.params ; // configId can be a key inside the config
    const value = config.getOptionalString(`githubCodeResource.${configId}`)
    logger.info('Got request to read a config');
    response.json({ response: value });
  });

  router.use(errorHandler());
  return router;
}
