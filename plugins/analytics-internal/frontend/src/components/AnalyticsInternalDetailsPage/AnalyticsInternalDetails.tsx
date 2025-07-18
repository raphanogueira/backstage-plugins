import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Grid, Typography } from '@mui/material';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { identityApiRef } from '@backstage/core-plugin-api';
import { Link, Table, InfoCard, Page, Header, Content, Progress, ResponseErrorPanel } from '@backstage/core-components';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ActivityInsightDetails {
    id: number,
    action: string,
    subject: string,
    access_count: number,
    created_at: string,
    updated_at: string,
    metrics: Array<AnalyticsMetricsUser>,
};

interface AnalyticsMetricsUser {
    id: string;
    name: string;
    namespace: string;
    analytics_id: string;
    created_at: string;
    updated_at: string;
}

export interface AnalyticsInternalPageDetailProps {
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

export const AnalyticsInternalDetails = ({ formatDateToShort = true }: AnalyticsInternalPageDetailProps
) => {
    const config = useApi(configApiRef)
    const { id } = useParams<{ id: string }>();
    const [insight, setInsight] = useState<ActivityInsightDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const baseUrl = config.getString('backend.baseUrl');

    const identityApi = useApi(identityApiRef);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { token } = await identityApi.getCredentials();

                const response = await fetch(`${baseUrl}/api/analytics-internal/analytics/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch details: ${response.statusText}`);
                }

                const data = await response.json();
                setInsight(data);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, identityApi]);

    if (loading) return <Progress />;
    if (error) return <ResponseErrorPanel error={error} />;

    return (
        <Page themeId="tool">
            <Header
                title=""
                subtitle="Estes são os detalhes da atividade selecionada">
                <Typography variant="h4">
                    Detalhes da Atividade:{' '}
                    <Box component="span" fontWeight="fontWeightBold">
                        {insight!.action}
                    </Box>
                </Typography>
            </Header>
            <Content>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <InfoCard title="Sobre">
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="textSecondary">Ação Executada</Typography>
                                    <Typography>{insight!.action}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="textSecondary">Caminho</Typography>
                                    <Typography component={Link} to={insight!.subject} color="primary">
                                        {insight!.subject}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="textSecondary">Total de Acessos</Typography>
                                    <Typography>{insight!.access_count}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="textSecondary">Usuários Distintos</Typography>
                                    <Typography>{insight!.metrics.length}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="textSecondary">Primeiro Acesso</Typography>
                                    <Typography>{formatDateToShort ? formatToShortDate(insight!.created_at) : formatToLongDate(insight!.created_at)}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="textSecondary">Último Acesso</Typography>
                                    <Typography>{formatDateToShort ? formatToShortDate(insight!.updated_at) : formatToLongDate(insight!.updated_at)}</Typography>
                                </Grid>
                            </Grid>
                        </InfoCard>

                    </Grid>

                    <Grid item xs={12}>
                        <InfoCard title="Histórico de Acessos por Usuário">
                            <Table
                                columns={[
                                    {
                                        title: 'Nome',
                                        field: 'name',
                                        render: rowData => (
                                            <Link to={`/catalog/${rowData.namespace}/user/${rowData.name}`}>
                                                {rowData.name}
                                            </Link>
                                        ),
                                    },
                                    {
                                        title: 'Último Acesso',
                                        field: 'updated_at',
                                        render: rowData =>
                                            formatDateToShort ? formatToShortDate(rowData.updated_at) : formatToLongDate(rowData.updated_at)
                                    },
                                ]}
                                data={insight!.metrics}
                                options={{
                                    search: true,
                                    paging: true,
                                }}
                            />
                        </InfoCard>
                    </Grid>
                </Grid>
            </Content>
        </Page>
    );
};