import { createBackendPlugin, coreServices } from '@backstage/backend-plugin-api';
import { createRouter } from './controllers/AnalyticsController';
import { AuthDatabase } from './database/AuthDatabase';
import { AnalyticDatabase } from './database/AnalyticDatabase';

export const analyticsPlugin = createBackendPlugin({
  pluginId: 'analytics-internal',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
        database: coreServices.database
      },
      async init({ httpRouter, logger, database }) {
        try {
          const db = AuthDatabase.create(database);
          const analyticDatabase = await AnalyticDatabase.create(db, logger);
          const router = await createRouter({ analyticDatabase });
        httpRouter.use(router);
        } catch (error) {
          logger.error('Failed to initialize analytics plugin', { error: error instanceof Error ? error.message : String(error) });
          throw error;
        }
      },
    });
  },
});