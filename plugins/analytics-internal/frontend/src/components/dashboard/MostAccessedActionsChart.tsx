import { darken, useTheme } from '@material-ui/core';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Rectangle
} from 'recharts';

interface MostAccessedActionsChart {
    topUsers: {
        name: string;
        access_count: number;
    }[];
}

export const MostAccessedActionsChart = ({ topUsers }: MostAccessedActionsChart) => {
    const { palette } = useTheme();

    const chartData = topUsers
        .sort(a => a.access_count)
        .slice(0, 5)
        .map(item => ({
            name: item.name,
            accessCount: item.access_count,
        }));

    return (
        <ResponsiveContainer width="100%" height={500}>
            <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 50 }}
            >
                <CartesianGrid strokeDasharray="1 1" />
                <XAxis dataKey="name" interval={0} height={60} />
                <YAxis />
                <Tooltip />
                <Bar
                    dataKey="accessCount"
                    fill={palette.primary.main}
                    activeBar={
                        <Rectangle
                            fill={darken(palette.primary.dark, 0.5)}
                            stroke={palette.primary.dark}
                        />
                    }
                />
            </BarChart>
        </ResponsiveContainer>
    );
};