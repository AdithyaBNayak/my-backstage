import { CatalogClient } from '@backstage/catalog-client';
import { createRouter } from '@backstage/plugin-scaffolder-backend';
import { Router } from 'express';
import type { PluginEnvironment } from '../types';
import { createFetchCustomTestAction, createAcmeExampleAction } from 'backstage-plugin-scaffolder-backend-module-notify-slack';
import { createBuiltinActions } from '@backstage/plugin-scaffolder-backend';
import { ScmIntegrations } from '@backstage/integration';
import { jenkinsCreateFolderAction } from './scaffolder/actions/jenkins-create-folder';
import { jenkinsCreateJobAction } from './scaffolder/actions/jenkins-create-job';
import { jenkinsRunJobAction } from './scaffolder/actions/jenkins-run-job';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const catalogClient = new CatalogClient({
    discoveryApi: env.discovery,
  });

  const integrations = ScmIntegrations.fromConfig(env.config);
  const builtInActions = createBuiltinActions({
    integrations,
    catalogClient,
    config: env.config,
    reader: env.reader,
  });

  const actions = [...builtInActions, 
    createFetchCustomTestAction(), 
    createAcmeExampleAction(), 
    jenkinsCreateFolderAction({config: env.config}),
    jenkinsCreateJobAction({config: env.config}),
    jenkinsRunJobAction({config: env.config})

  ];

  return await createRouter({
    actions,
    logger: env.logger,
    config: env.config,
    database: env.database,
    reader: env.reader,
    catalogClient,
    identity: env.identity,
    permissions: env.permissions,
  });
}
