import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';

interface TrendChartProps {
    data: any[];
    dataKey: string;
    xAxisKey: string;
    color?: string;
    name: string;
    aggregateByDay?: boolean;
    chartType?: 'line' | 'bar';
}

// Format date to short day name (Mon, Tue, etc.) or date (Jan 25)
function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 7) {
        // Within a week, show day name
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    // Older than a week, show month/day
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Aggregate data by day
function aggregateByDay(data: any[], xAxisKey: string, dataKey: string): any[] {
    const dayMap = new Map<string, { total: number; date: string }>();

    data.forEach(item => {
        const dateStr = item[xAxisKey];
        if (!dateStr) return;

        const date = new Date(dateStr);
        const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

        const existing = dayMap.get(dayKey);
        if (existing) {
            existing.total += item[dataKey] || 0;
        } else {
            dayMap.set(dayKey, { total: item[dataKey] || 0, date: dateStr });
        }
    });

    // Convert to array and sort by date
    return Array.from(dayMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([dayKey, { total, date }]) => ({
            day: formatDate(date),
            [dataKey]: total,
            fullDate: dayKey
        }));
}

export function TrendChart({
    data,
    dataKey,
    xAxisKey,
    color = '#8884d8',
    name,
    aggregateByDay: shouldAggregate = false,
    chartType = 'line'
}: TrendChartProps) {
    // Process data - aggregate by day if needed, otherwise just format dates
    const processedData = useMemo(() => {
        if (!data || data.length === 0) return [];

        if (shouldAggregate) {
            return aggregateByDay(data, xAxisKey, dataKey);
        }

        // Just format dates for display
        return data.map(item => ({
            ...item,
            formattedDate: formatDate(item[xAxisKey])
        }));
    }, [data, xAxisKey, dataKey, shouldAggregate]);

    const { t } = useTranslation('parent');

    if (!processedData || processedData.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg text-gray-400">
                {t('noChartData')}
            </div>
        );
    }

    const xKey = shouldAggregate ? 'day' : 'formattedDate';

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                    <BarChart data={processedData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis
                            dataKey={xKey}
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                border: 'none'
                            }}
                        />
                        <Legend />
                        <Bar
                            dataKey={dataKey}
                            name={name}
                            fill={color}
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                ) : (
                    <LineChart data={processedData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis
                            dataKey={xKey}
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                border: 'none'
                            }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey={dataKey}
                            name={name}
                            stroke={color}
                            strokeWidth={3}
                            dot={{ r: 4, fill: color, strokeWidth: 0 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                )}
            </ResponsiveContainer>
        </div>
    );
}
