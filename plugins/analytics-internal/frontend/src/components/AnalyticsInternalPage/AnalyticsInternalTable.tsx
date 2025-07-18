import { useEffect, useState } from 'react';
import { InfoCard, Progress, ResponseErrorPanel, Table } from '@backstage/core-components';
import { Button, Card, CardContent } from '@mui/material';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { identityApiRef } from '@backstage/core-plugin-api';
import { MostAccessedScreensChart } from '../dashboard/MostAccessedScreensChart';
import { MostAccessedActionsChart } from '../dashboard/MostAccessedActionsChart';
import { Grid } from '@material-ui/core';
import { Link } from '@backstage/core-components';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AnalyticsInternal {
  id: number;
  action: string;
  subject: string;
  access_count: number;
  updated_at: string;
  created_at: string;
}

interface TopUsersActivity {
  name: string;
  access_count: number;
}

export interface AnalyticsInternalPageProps {
  formatDateToShort?: boolean; // Prop booleana opcional
}

const formatToShortDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }

    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  } catch (e) {
    console.error("Erro ao formatar data com date-fns:", e);
    return dateString;
  }
};

const formatToLongDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }

    return format(date, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR });
  } catch (e) {
    console.error("Erro ao formatar data com date-fns:", e);
    return dateString;
  }
};

export const AnalyticsInternalPage = ({ formatDateToShort = true }: AnalyticsInternalPageProps) => {
  const config = useApi(configApiRef);
  const identityApi = useApi(identityApiRef);
  const [insights, setInsights] = useState<AnalyticsInternal[]>([]);
  const [topUsers, setTopUsers] = useState<TopUsersActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const baseUrl = config.getString('backend.baseUrl');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { token } = await identityApi.getCredentials();

        const response = await fetch(`${baseUrl}/api/analytics-internal/analytics`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
          },
        });

        const topUsersResponse = await fetch(`${baseUrl}/api/analytics-internal/top-users`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        if (!topUsersResponse.ok) {
          throw new Error(`Failed to fetch: ${topUsersResponse.statusText}`);
        }
        const data = await response.json();
        const topUsersData = await topUsersResponse.json();

        setInsights(data);
        setTopUsers(topUsersData)
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Progress />;
  if (error) return <ResponseErrorPanel error={error} />;

  return (
    <Card>
      <CardContent>
        <Grid container spacing={3}>
          <Grid item lg={6}>
            <InfoCard title="Ações Realizadas (Total)">
              <MostAccessedActionsChart topUsers={topUsers} />
            </InfoCard>
          </Grid>
          <Grid item lg={6}>
            <InfoCard title="Telas Mais Visitadas">
              <MostAccessedScreensChart insights={insights} />
            </InfoCard>
          </Grid>
          <Grid item lg={12}>
            <InfoCard title="Registro de Atividades">
              <Table
                options={{
                  paging: true,
                  search: true,
                  rowStyle: {
                    height: 'auto',
                  }
                }}
                columns={[
                  { title: 'Ação Executada', field: 'action' },
                  {
                    title: 'Ação',
                    field: 'subject',
                    render: (rowData: any) => (
                      (
                        <Link to={rowData.subject}>
                          {rowData.subject}
                        </Link>
                      )
                    ),
                  },
                  { 
                    title: 'Total de Acessos', 
                    field: 'access_count' 
                  },
                  { 
                    title: 'Primeiro Acesso Em', 
                    field: 'created_at', 
                    render: (rowData: AnalyticsInternal) => 
                      formatDateToShort ? formatToShortDate(rowData.created_at) : formatToLongDate(rowData.created_at)
                  },
                  { 
                    title: 'Último Acesso Em', 
                    field: 'updated_at', 
                    render: (rowData: AnalyticsInternal) => 
                      formatDateToShort ? formatToShortDate(rowData.updated_at) : formatToLongDate(rowData.updated_at)
                  },
                  {
                    title: 'Detalhes',
                    field: 'details',
                    render: (rowData: AnalyticsInternal) => (
                      <Link to={`/analytics-internal/${rowData.id}`}>
                        <Button variant="outlined">Ver Detalhes</Button>
                      </Link>
                    ),
                  }
                ]}
                data={insights}
              />
            </InfoCard>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};