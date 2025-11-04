'use client';

import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface StatusPieChartProps {
  data: Record<string, number>;
}

const STATUS_COLORS: Record<string, string> = {
  draft: '#6B7280',
  confirmed: '#3B82F6',
  paid: '#10B981',
  preparing: '#F59E0B',
  out_for_delivery: '#8B5CF6',
  delivered: '#10B981',
  cancelled: '#EF4444',
};

export default function StatusPieChart({ data }: StatusPieChartProps) {
  const labels = Object.keys(data);
  const values = Object.values(data);

  const chartData = {
    labels: labels.map(l => l.replace('_', ' ')),
    datasets: [
      {
        data: values,
        backgroundColor: labels.map(l => STATUS_COLORS[l] || '#6B7280'),
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="h-[300px]">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}


