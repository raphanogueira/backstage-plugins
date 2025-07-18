import express from 'express';
import Router from 'express-promise-router';
import { Analytic } from './types/analytic-type';

export async function createRouter({}): Promise<express.Router> {
  const router = Router();

  router.use(express.json());

  router.get('/events', async (req, res) => {
    const request = req.body;

    const actionMatch = request.subject.match(/^\/([^\/]+)\//);

    const user = request.user.split('/').slice(-1)[0];

    const analytic: Analytic = {
      action: actionMatch[1],
      subject: request.subject,
      analyticUser: user
    };
    
    res.json(analytic);
  });

  return router;
}
