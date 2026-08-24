import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

export default function CompletionBarChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-[#717973]">
        No assignment completion data available.
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.shortTitle || item.title,
    fullTitle: item.title,
    completion: Number(item.completion) || 0,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-[#191c1d] text-white px-3 py-2 rounded-xl text-xs shadow-lg">
          <p className="font-semibold">{dataPoint.fullTitle}</p>
          <p className="text-[#a5d0b9] font-bold mt-0.5">
            {dataPoint.completion}% Completed
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f5" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#717973"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#e1e3e4' }}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            stroke="#717973"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            unit="%"
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8f9fa' }} />
          <Bar dataKey="completion" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, index) => {
              const color =
                entry.completion >= 80
                  ? '#012d1d'
                  : entry.completion >= 50
                  ? '#1b4332'
                  : '#a5d0b9';
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
