import { Request } from 'express';
import { Router } from 'express';
import express from 'express';
import { AnalyticDatabase } from '../database/AnalyticDatabase';

interface AnalyticsEvent {
  action: string;
  subject: string;
  path?: string;
  user: string;
  namespace: string;
}

export async function createRouter({ analyticDatabase }: { analyticDatabase: AnalyticDatabase }): Promise<Router> {
  const router = Router();

  router.use(express.json());

  router.post('/events', async (req: Request, res) => {
    try {
      const user = req.body.user.split(':').slice(-1)[0].split('/');

      const path:string | undefined = req.body?.attribute?.to;

      const event: AnalyticsEvent = {
        action: req.body.action,
        subject: req.body.subject,
        path: path,
        user: user[1],
        namespace: user[0]
      }

      console.log('Received events:', event);

      await analyticDatabase.trackEvent(event.action, event.subject, event.user, event.namespace)

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error tracking events:', error);
      return res.status(500).json({ error: `${req.body} Failed to track events ${error}` });
    }
  });

  router.get('/top-users', async (_req: Request, res) => {
    try {
      const topUsers = await analyticDatabase.getTopUsers();
      return res.json(topUsers);
    } catch (error) {
      console.error('Error fetching top users:', error);
      return res.status(500).json({ error: 'Failed to fetch top users' });
    }
  });

  router.get('/analytics', async (_req: Request, res) => {
    try {
      const analytics = await analyticDatabase.getAnalytics();
      return res.json(analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  router.get('/analytics/:id', async (req: Request, res) => {
    try {
      const { id } = req.params;
      const analytics = await analyticDatabase.getAnalyticsById(id);
      
      if (!analytics) {
        return res.status(404).json({ error: 'Analytics not found' });
      }
      
      return res.json(analytics);
    } catch (error) {
      console.error('Error fetching analytics by ID:', error);
      return res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });
  
  return router;
} 