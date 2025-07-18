import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef, detailsRouteRef } from './routes';

export const analyticsInternalPlugin = createPlugin({
  id: 'analytics-internal',
  routes: {
    root: rootRouteRef,
    details: detailsRouteRef,
  },
});

export const AnalyticsInternalPage = analyticsInternalPlugin.provide(
  createRoutableExtension({
    name: 'AnalyticsInternalPage',
    component: () =>
      import('./components/AnalyticsInternalPage/AnalyticsInternalTable').then(m => m.AnalyticsInternalPage),
    mountPoint: rootRouteRef,
  }),
);

export const ActivityInsightDetailsPage = analyticsInternalPlugin.provide(
  createRoutableExtension({
    name: 'ActivityInsightDetailsPage',
    component: () =>
      import('./components/AnalyticsInternalDetailsPage/AnalyticsInternalDetails').then(m => m.AnalyticsInternalDetails),
    mountPoint: detailsRouteRef,
  }),
);