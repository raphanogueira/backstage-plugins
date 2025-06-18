import {
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
  ScmAuth,
} from '@backstage/integration-react';
import {
  analyticsApiRef,
  AnyApiFactory,
  configApiRef,
  createApiFactory,
  discoveryApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';
import { AnalyticsInternalApi } from '@raphanogueira/plugin-analytics-internal-module'

export const apis: AnyApiFactory[] = [
  createApiFactory({
    api: scmIntegrationsApiRef,
    deps: { configApi: configApiRef },
    factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
  }),
  ScmAuth.createDefaultApiFactory(),
  createApiFactory({
    api: analyticsApiRef,
    deps: { configApi: configApiRef, identityApi: identityApiRef, discoveryApi: discoveryApiRef },
    factory: ({ configApi, identityApi, discoveryApi }) => AnalyticsInternalApi.fromConfig(configApi, { identityApi, discoveryApi}),
  })
];
