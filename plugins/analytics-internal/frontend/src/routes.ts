// src/routes.ts (Versão Correta)
import { createRouteRef } from '@backstage/core-plugin-api';

// Apenas um identificador único para a rota raiz do plugin.
export const rootRouteRef = createRouteRef({
  id: 'analytics-internal.root',
});

// Apenas um identificador único para a rota de detalhes.
export const detailsRouteRef = createRouteRef({
  id: 'analytics-internal.details',
});