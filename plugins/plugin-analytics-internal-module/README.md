# @raphanogueira/plugin-analytics-internal-module

A Backstage plugin module that provides analytics capabilities for internal Backstage plugins. This module allows you to track user interactions and system events in your Backstage plugins.

## Installation the plugin

```bash
# From your Backstage root directory
yarn --cwd packages/app add @raphanogueira/plugin-analytics-internal-module
```

## Configuration

First, configure the analytics module in your `app-config.yaml`:


| Field Name | Type | Required | Default | Description |
|---|---|---|---|---|
| host | string | No | `${backend.baseUrl}/api/analytics-internal/events` | The host: 'http://your-analytics-backend' field represents the base URL of the backend service that will receive analytics events in your plugin. The Default value is undefined. If not provided, the backend of the analytics-internal plugin will be used, which must be installed. |
| debug | boolean | No | `false` | If you are running in a local environment or want to see the logs, set this to true. The default value is false. |
| actions | list of string | No | `["*"]` | The default value is [ "*" ] to get all actions. We can use the following types: `navigate`, `click`, `create`, `search`, `discover`, `not-found`. For more information, see [Backstage Analytics Plugin Documentation](https://backstage.io/docs/plugins/analytics/). |


```yaml
app:
  analytics:
    internal:
      host: 'http://your-analytics-backend'
      debug: true
      actions: []
```

## How to Use

### 1. Add the API to Your Plugin

In your plugin's `index.ts`, add the analytics API:

```typescript
import { createApiFactory, analyticsApiRef, configApiRef, identityApiRef, discoveryApiRef, } from '@backstage/core-plugin-api';
import { AnalyticsInternalApi } from '@raphanogueira/plugin-analytics-internal-module';

export const apis: AnyApiFactory[] = [
  createApiFactory({
    api: analyticsApiRef,
    deps: { configApi: configApiRef, identityApi: identityApiRef, discoveryApi: discoveryApiRef },
    factory: ({ configApi, identityApi, discoveryApi }) => AnalyticsInternalApi.fromConfig(configApi, { identityApi, discoveryApi}),
  }),
];
```

### Event Structure

Each event you track should follow this structure:

```typescript
interface AnalyticsEvent {
  // Required: What happened (e.g., 'click', 'view', 'search')
  action: string;
  
  // Required: What was affected (e.g., 'button', 'page', 'search-box')
  subject: string;
  
  // Required: User entity ref
  user: string
}
```

### Common Use Cases

1. **Track Page Views**:
```typescript
analyticsApi.captureEvent({
  action: 'view',
  subject: 'page',
  user: 'user:default/raphanogueira'
});
```

2. **Track User Actions**:
```typescript
analyticsApi.captureEvent({
  action: 'click',
  subject: 'search',
  user: 'user:default/raphanogueira'
});
```

3. **Track Feature Usage**:
```typescript
analyticsApi.captureEvent({
  action: 'use',
  subject: 'feature',
  user: 'user:default/raphanogueira'
});
```

## License

This project is licensed under the Apache-2.0 License - see the [LICENSE](LICENSE) file for details. 