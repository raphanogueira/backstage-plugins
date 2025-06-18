import { darken, useTheme } from '@material-ui/core';
import React from 'react';
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

interface MostAccessedScreensChartProps {
    insights: {
        subject: string;
        access_count: number;
    }[];
}

export const MostAccessedScreensChart = ({ insights }: MostAccessedScreensChartProps) => {
    const { palette } = useTheme();

    const chartData = insights
        .sort((a, b) => b.access_count - a.access_count)
        .slice(0, 5)
        .map(item => ({
            subject: item.subject,
            accessCount: item.access_count,
        }));


    return (
        <ResponsiveContainer width="100%" height={500}>
            <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 50 }}
            >
                <CartesianGrid strokeDasharray="1 1" />
                <XAxis
                    dataKey="subject"
                    interval={0}
                    height={80}
                    tick={({ x, y, payload }) => {
                        const lines = payload.value.split('/').filter(Boolean); // quebra por "/"
                        return (
                            <g transform={`translate(${x},${y + 10})`}>
                                <text textAnchor="middle" fontSize={12} fill="#666">
                                    {lines.map((line: any, index: any) => (
                                        <tspan key={index} x={0} dy={index === 0 ? 0 : 14}>
                                            /{line}
                                        </tspan>
                                    ))}
                                </text>
                            </g>
                        );
                    }}
                />
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