import { createBackendPlugin } from '@backstage/backend-plugin-api';
import { createRouter } from './controllers/AnalyticsController';
import { AnalyticsService } from './services/AnalyticsService';
import knex from 'knex';
import config from '../knexfile';
import { coreServices } from '@backstage/backend-plugin-api';

export const analyticsPlugin = createBackendPlugin({
  pluginId: 'analytics-internal',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
      },
      async init({ httpRouter, logger }) {
        try {
          const environment = (process.env.NODE_ENV || 'development') as 'development' | 'production';
          const db = knex(config[environment]);
        
          // Run migrations
          logger.info('Running database migrations...');
          await db.migrate.latest();
          logger.info('Database migrations completed successfully');

          const analyticsService = new AnalyticsService(db, logger);
          const router = await createRouter({ analyticsService });
        httpRouter.use(router);
        } catch (error) {
          logger.error('Failed to initialize analytics plugin', { error: error instanceof Error ? error.message : String(error) });
          throw error;
        }
      },
    });
  },
});
