'use client';

import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, BarChart as RechartsBarChart, Bar, Cell
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { classNames } from '@/lib/utils';

interface ChartDataPoint {
  label: string;
  value: number;
  target?: number;
}

interface PerformanceChartProps {
  title: string;
  subtitle?: string;
  data: ChartDataPoint[];
  height?: number;
  showTarget?: boolean;
  valueLabel?: string;
  type?: 'area' | 'line';
  colors?: {
    primary?: string;
    secondary?: string;
  };
}

export function PerformanceChart({
  title,
  subtitle,
  data,
  height = 280,
  showTarget = true,
  valueLabel = '%',
  type = 'area',
  colors = { primary: '#3b82f6', secondary: '#10b981' }
}: PerformanceChartProps) {
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

  const ChartComponent = type === 'area' ? AreaChart : LineChart;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
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
          <ChartComponent data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.primary} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={colors.primary} stopOpacity={0}/>
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
              dx={-10}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [`${value}${valueLabel}`, 'Value']}
              labelStyle={{ fontWeight: 600, color: '#374151' }}
            />
            {showTarget && data[0]?.target && (
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke={colors.secondary} 
                strokeWidth={2} 
                strokeDasharray="5 5" 
                dot={false}
                name="Target"
              />
            )}
            {type === 'area' ? (
              <Area
                type="monotone"
                dataKey="value"
                stroke={colors.primary}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
                name="Attainment"
              />
            ) : (
              <Line
                type="monotone"
                dataKey="value"
                stroke={colors.primary}
                strokeWidth={2}
                dot={{ fill: colors.primary, strokeWidth: 2, stroke: '#fff', r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                name="Attainment"
              />
            )}
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              iconSize={8}
            />
          </ChartComponent>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between mt-2 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.primary }} />
            <span className="text-xs text-gray-500">Attainment</span>
          </div>
          {showTarget && data[0]?.target && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.secondary }} />
              <span className="text-xs text-gray-500">Target</span>
            </div>
          )}
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-gray-900">{currentValue}{valueLabel}</span>
        </div>
      </div>
    </div>
  );
}

interface BarChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  title: string;
  subtitle?: string;
  data: BarChartDataPoint[];
  height?: number;
  valueLabel?: string;
  showValue?: boolean;
  horizontal?: boolean;
  colors?: string[];
}

const DEFAULT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function BarChart({
  title,
  subtitle,
  data,
  height = 280,
  valueLabel = '%',
  showValue = true,
  horizontal = false,
  colors = DEFAULT_COLORS
}: BarChartProps) {
  const getBarColor = (value: number, index: number) => {
    if (value >= 90) return '#10b981';
    if (value >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart 
            data={data} 
            layout={horizontal ? 'vertical' : 'horizontal'}
            margin={{ top: 10, right: 10, left: horizontal ? 60 : -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={horizontal} stroke="#f3f4f6" />
            {horizontal ? (
              <>
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis type="category" dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} width={60} />
              </>
            ) : (
              <>
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dx={-10} />
              </>
            )}
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [`${value}${valueLabel}`, 'Value']}
              labelStyle={{ fontWeight: 600, color: '#374151' }}
              cursor={{ fill: '#f9fafb' }}
            />
            <Bar 
              dataKey="value" 
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color || getBarColor(entry.value, index)} 
                />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span className="text-xs text-gray-500">On Track (90%+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-500 rounded-full" />
          <span className="text-xs text-gray-500">Near Target (60-89%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <span className="text-xs text-gray-500">Below Target (&lt;60%)</span>
        </div>
      </div>
    </div>
  );
}

interface DonutChartProps {
  title: string;
  subtitle?: string;
  data: { name: string; value: number; color: string }[];
  height?: number;
  centerLabel?: string;
  centerValue?: string | number;
}

export function DonutChart({
  title,
  subtitle,
  data,
  height = 280,
  centerLabel,
  centerValue
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart 
            data={data} 
            layout="vertical"
            margin={{ top: 10, right: 30, left: 40, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <YAxis 
              type="category" 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#6b7280' }} 
              width={80}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [value, 'Count']}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <div className="flex flex-wrap gap-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-gray-500">{item.name}</span>
            </div>
          ))}
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-gray-900">{total}</span>
          <span className="text-sm text-gray-500 ml-1">total</span>
        </div>
      </div>
    </div>
  );
}
