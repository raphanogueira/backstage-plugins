import { AnalyticsEvent, ConfigApi, DiscoveryApi, IdentityApi } from '@backstage/core-plugin-api';
import { AnalyticsApi } from '@backstage/core-plugin-api';

export interface AnalyticsInternalApiOptions {
  identityApi: IdentityApi;
  discoveryApi: DiscoveryApi;
}

export class AnalyticsInternalApi implements AnalyticsApi {
  private readonly identityApi: IdentityApi;
  private readonly discoveryApi: DiscoveryApi
  private readonly config: ConfigApi;
  private host?: string;
  private debug: boolean = false;
  private actions: string[] = [];

  constructor(config: ConfigApi, options: AnalyticsInternalApiOptions) {
    this.identityApi = options.identityApi;
    this.discoveryApi = options.discoveryApi;
    this.config = config;

    try {
      const configx = this.config.getConfig('app.analytics.internal');
      console.log("host configuração: ", configx.getOptionalString('host'));
      console.log("debug configuração: ", configx.getOptionalBoolean('debug'));
      console.log("actions configuração: ", configx.getOptionalStringArray('actions'));
      this.host = configx.getOptionalString('host');
      this.debug = configx.getOptionalBoolean('debug') ?? false;
      this.actions = configx.getOptionalStringArray('actions') ?? ["*"];
    } catch (e) {
      console.error("Erro ao acessar config:", e);
    }

    if (this.debug) {
      console.log("Debug mode is enabled.");
    }
  }

  async captureEvent(event: AnalyticsEvent) {
    try {
      if (!this.isActionAllowed(event.action, this.actions)) {
        if (this.debug) {
          console.log(`Action ${event.action} is not allowed.`);
        }
        return;
      }

      if(!this.isSubjectAllowed(event.subject)) {
        if (this.debug) {
          console.log(`Subject ${event.subject} is not allowed.`);
        }
        return;
      }


      if (!this.host)
        this.host = `${(await this.discoveryApi.getBaseUrl('analytics-internal'))}/events`;

      const userAuthenticated = (await this.identityApi.getBackstageIdentity()).userEntityRef;

      const e = {
        ...event,
        user: userAuthenticated
      };

      const token = (await this.identityApi.getCredentials()).token;

      await fetch(`${this.host}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(e),
      });
    } catch (error) {
      console.error('Error capturing event:', error);
    }
  }

  static fromConfig(config: ConfigApi, options: AnalyticsInternalApiOptions) {
    return new AnalyticsInternalApi(config, options);
  }

  private isActionAllowed(action: string, allowedActions: string[]): boolean {
    return allowedActions.includes("*") || allowedActions.includes(action);
  }

  private isSubjectAllowed(subject: string) {
    return !(subject.includes('analytics-internal') || !(/^\/[^\/]+\//.test(subject)))
  }
} 