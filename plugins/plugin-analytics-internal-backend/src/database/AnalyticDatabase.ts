import { LoggerService } from '@backstage/backend-plugin-api';
import { AnalyticsWithMetrics } from '../types/analytics';
import { AuthDatabase } from '../database/AuthDatabase';
import { Knex } from 'knex';

export class AnalyticDatabase {
  constructor(private readonly client: Knex, private readonly logger: LoggerService) {}

  async trackEvent(action: string, subject: string, userName: string, namespace: string): Promise<void> {
    try {
      // Find or create analytics record
      let analytics = await this.client('analytics')
        .where({ subject })
        .first();

      if (!analytics) {
        const [newAnalytics] = await this.client('analytics')
          .insert({
            action,
            subject,
            access_count: 1,
          })
          .returning('*');
        analytics = newAnalytics;
      }

      // Increment access count
      const [updatedAnalytics] = await this.client('analytics')
        .where({ id: analytics.id })
        .increment('access_count', 1)
        .update({
          updated_at: this.client.fn.now(),
        })
        .returning('*');

      // Find or create user metrics
      let userMetrics = await this.client('analytics_metrics_users')
        .where({
          analytics_id: updatedAnalytics.id,
          name: userName,
          namespace: namespace
        })
        .first();

      if (!userMetrics) {
        await this.client('analytics_metrics_users').insert({
          analytics_id: updatedAnalytics.id,
          name: userName,
          namespace: namespace
        });
      } else {
        await this.client('analytics_metrics_users')
          .where({ id: userMetrics.id })
          .update({
            updated_at: this.client.fn.now(),
          });
      }
    } catch (error) {
      this.logger.error('Failed to track analytics event', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  async getAnalytics(subject?: string): Promise<AnalyticsWithMetrics[]> {
    const query = this.client('analytics')
      .select(
        'analytics.*',
        'analytics_metrics_users.id as metric_id',
        'analytics_metrics_users.name as metric_name',
        'analytics_metrics_users.analytics_id as metric_analytics_id',
        'analytics_metrics_users.created_at as metric_created_at',
        'analytics_metrics_users.updated_at as metric_updated_at',
        'analytics.path as path'
      )
      .leftJoin('analytics_metrics_users', 'analytics.id', 'analytics_metrics_users.analytics_id');

    if (subject) {
      query.where('analytics.subject', subject);
    }

    const results = await query;
    const analyticsMap = new Map<number, AnalyticsWithMetrics>();

    results.forEach((row: any) => {
      // Use o ID principal (da tabela analytics) como chave
      if (!analyticsMap.has(row.id)) {
        analyticsMap.set(row.id, {
          id: row.id,
          action: row.action,
          subject: row.subject,
          access_count: row.access_count,
          created_at: row.created_at,
          updated_at: row.updated_at,
          path: row.path,
          metrics: []
        });
      }

      // Adicione a métrica se ela existir (vinda do LEFT JOIN)
      if (row.metric_id) {
        const analytics = analyticsMap.get(row.id)!;
        analytics.metrics.push({
          // Use os nomes dos aliases que definimos na query
          id: row.metric_id,
          name: row.metric_name,
          namespace: row.namespace,
          analytics_id: row.metric_analytics_id,
          created_at: row.metric_created_at,
          updated_at: row.metric_updated_at,
        });
      }
    });

    return Array.from(analyticsMap.values());
  }

  async getAnalyticsById(id: string): Promise<AnalyticsWithMetrics | null> {
    const subquery = this.client('analytics_metrics_users')
      .select(
        this.client.raw(
          `json_agg(
            json_build_object(
              'id', analytics_metrics_users.id,
              'name', analytics_metrics_users.name,
              'analytics_id', analytics_metrics_users.analytics_id,
              'created_at', analytics_metrics_users.created_at,
              'updated_at', analytics_metrics_users.updated_at,
              'namespace', analytics_metrics_users.namespace
            )
          )`
        )
      )
      .whereRaw('analytics_metrics_users.analytics_id = analytics.id')
      .as('metrics');
  
    const result = await this.client('analytics')
      .select(
        'analytics.*',
        subquery
      )
      .where('analytics.id', id)
      .first(); 
  
    if (!result) {
      return null;
    }
  
    if (!result.metrics) {
      result.metrics = [];
    }
  
    return result as AnalyticsWithMetrics;
  }

  async getTopUsers(): Promise<{ name: string; access_count: number }[]> {
    try {
      const results = await this.client('analytics_metrics_users')
        .select('name')
        .count('* as access_count')
        .groupBy('name')
        .orderBy('access_count', 'desc')
        .limit(10);

      return results.map(row => ({
        name: String(row.name),
        access_count: Number(row.access_count)
      }));
    } catch (error) {
      this.logger.error('Failed to fetch top users', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  static async create(database: AuthDatabase, logger: LoggerService){
    const client = await database.get();
    return new AnalyticDatabase(client, logger);
  }
} 