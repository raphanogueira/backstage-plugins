export interface Analytics {
  id: number;
  action: string;
  subject: string;
  access_count: number;
  created_at: Date;
  updated_at: Date;
  path?: string;
}

export interface AnalyticsMetricsUser {
  id: number;
  name: string;
  namespace: string;
  analytics_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface AnalyticsWithMetrics extends Analytics {
  metrics: AnalyticsMetricsUser[];
} 