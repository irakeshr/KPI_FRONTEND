'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Pencil } from 'lucide-react';
import { classNames } from '@/lib/utils';

interface DataPoint {
  label: string;
  value: number;
  attainment: number;
  target?: number;
  hasRevision?: boolean;
}

interface TrendChartProps {
  title: string;
  subtitle?: string;
  data: DataPoint[];
  targetLine?: number;
  height?: number;
  showAttainment?: boolean;
  type?: 'area' | 'line';
  showRevisionIndicator?: boolean;
}

export function TrendChart({
  title,
  subtitle,
  data,
  targetLine = 100,
  height = 280,
  showAttainment = true,
  type = 'area',
  showRevisionIndicator = false
}: TrendChartProps) {
  const currentValue = data[data.length - 1]?.value || 0;
  const previousValue = data[data.length - 2]?.value || currentValue;

  const getTrend = () => {
    if (previousValue === 0) return { icon: <Minus className="w-4 h-4" />, color: 'text-gray-400', text: '0%' };
    if (currentValue > previousValue) return { 
      icon: <TrendingUp className="w-4 h-4" />, 
      color: 'text-green-500', 
      text: `+${((currentValue - previousValue) / previousValue * 100).toFixed(1)}%` 
    };
    if (currentValue < previousValue) return { 
      icon: <TrendingDown className="w-4 h-4" />, 
      color: 'text-red-500', 
      text: `${((currentValue - previousValue) / previousValue * 100).toFixed(1)}%` 
    };
    return { icon: <Minus className="w-4 h-4" />, color: 'text-gray-400', text: '0%' };
  };

  const trend = getTrend();

  const getPointColor = (attainment: number) => {
    if (attainment >= 90) return '#10b981';
    if (attainment >= 60) return '#f59e0b';
    return '#ef4444';
  };

  if (data.length === 0) {
    return (
      <Card>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        <div className="flex items-center justify-center h-48 text-gray-400">
          No data available
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {trend.icon}
          <span className={classNames('text-sm font-medium', trend.color)}>{trend.text}</span>
        </div>
      </div>

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {type === 'area' ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="label" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                domain={[0, 150]}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              {targetLine && (
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  strokeDasharray="5 5" 
                  dot={false}
                  name="target"
                />
              )}
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
                name="attainment"
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  return (
                    <circle 
                      cx={cx} 
                      cy={cy} 
                      r={5} 
                      fill={getPointColor(payload.attainment)} 
                      stroke="#fff" 
                      strokeWidth={2} 
                    />
                  );
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
                iconSize={8}
              />
            </AreaChart>
          ) : (
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="label" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                domain={[0, 150]}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  return (
                    <circle 
                      cx={cx} 
                      cy={cy} 
                      r={5} 
                      fill={getPointColor(payload.attainment)} 
                      stroke="#fff" 
                      strokeWidth={2} 
                    />
                  );
                }}
                activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff' }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span className="text-xs text-gray-500">On Track (≥90%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-500 rounded-full" />
          <span className="text-xs text-gray-500">Near Target (60-89%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <span className="text-xs text-gray-500">Needs Attention (&lt;60%)</span>
        </div>
      </div>

      {showRevisionIndicator && data.some(d => d.hasRevision) && (
        <div className="mt-4 flex items-center gap-2 text-sm text-amber-600">
          <Pencil className="w-4 h-4" />
          <span>Target revision occurred during some periods</span>
        </div>
      )}
    </Card>
  );
}
