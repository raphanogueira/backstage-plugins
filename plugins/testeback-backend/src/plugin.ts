import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import { createTodoListService } from './services/TodoListService';

/**
 * testebackPlugin backend plugin
 *
 * @public
 */
export const testebackPlugin = createBackendPlugin({
  pluginId: 'testeback',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        httpAuth: coreServices.httpAuth,
        httpRouter: coreServices.httpRouter,
        catalog: catalogServiceRef,
      },
      async init({ logger, httpAuth, httpRouter, catalog }) {
        const todoListService = await createTodoListService({
          logger,
          catalog,
        });

        httpRouter.use(
          await createRouter({
            httpAuth,
            todoListService,
          }),
        );
      },
    });
  },
});
