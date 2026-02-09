import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import api from '../api/axios';
import Loader from '../components/ui/Loader';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const categoryColors = {
  bugs: '#ef4444',
  security: '#f97316',
  performance: '#3b82f6',
  readability: '#8b5cf6',
  maintainability: '#14b8a6',
  codeSmells: '#ec4899',
};

const categoryLabels = {
  bugs: 'Bugs',
  security: 'Security',
  performance: 'Performance',
  readability: 'Readability',
  maintainability: 'Maintainability',
  codeSmells: 'Code Smells',
};

function ScoreTrendChart({ data }) {
  if (!data || data.length === 0) return null;

  const chartData = {
    labels: data.map((d) => {
      const [y, m] = d.month.split('-');
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return `${months[parseInt(m, 10) - 1]} ${y}`;
    }),
    datasets: [
      {
        label: 'Avg Score',
        data: data.map((d) => d.averageScore),
        borderColor: '#6366f1',
        backgroundColor: (ctx) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.2)');
          gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Reviews',
        data: data.map((d) => d.count),
        borderColor: '#94a3b8',
        backgroundColor: 'rgba(148, 163, 184, 0.1)',
        borderDash: [4, 4],
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: '#94a3b8',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleFont: { size: 12 },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: { color: '#94a3b8', font: { size: 11 } },
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
      },
      y1: {
        position: 'right',
        min: 0,
        ticks: { color: '#94a3b8', font: { size: 11 } },
        grid: { display: false },
      },
      x: {
        ticks: { color: '#94a3b8', font: { size: 11 } },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-1">Score Trend</h3>
      <p className="text-xs text-gray-500 mb-4">Average review score and volume over time</p>
      <div style={{ height: 260 }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

function IssuesByCategoryChart({ data }) {
  if (!data) return null;

  const total = Object.values(data).reduce((a, b) => a + b, 0);
  if (total === 0) return null;

  const chartData = {
    labels: Object.entries(data).map(([key]) => categoryLabels[key] || key),
    datasets: [
      {
        data: Object.values(data),
        backgroundColor: Object.keys(data).map((k) => categoryColors[k] || '#94a3b8'),
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 11 },
          color: '#64748b',
        },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => `${ctx.label}: ${ctx.parsed} issues (${Math.round((ctx.parsed / total) * 100)}%)`,
        },
      },
    },
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-1">Issues by Category</h3>
      <p className="text-xs text-gray-500 mb-4">{total} total issues</p>
      <div style={{ height: 260 }}>
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
}

function ReposReviewedChart({ data }) {
  if (!data || data.length === 0) return null;

  const top = data.slice(0, 10);
  const maxCount = Math.max(...top.map((d) => d.count), 1);

  const chartData = {
    labels: top.map((d) => {
      const parts = d.name.split('/');
      return parts[1] || d.name;
    }),
    datasets: [
      {
        label: 'Reviews',
        data: top.map((d) => d.count),
        backgroundColor: top.map((_, i) => {
          const alpha = 0.9 - (i / top.length) * 0.6;
          return `rgba(99, 102, 241, ${alpha})`;
        }),
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          title: (items) => {
            const item = items[0];
            return data[item.dataIndex]?.name || '';
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8', font: { size: 11 } },
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        max: Math.ceil(maxCount * 1.2),
      },
      y: {
        ticks: { color: '#94a3b8', font: { size: 11 } },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-1">Repositories Reviewed</h3>
      <p className="text-xs text-gray-500 mb-4">{data.length} repositories</p>
      <div style={{ height: Math.max(200, top.length * 32) }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

function MonthlyReviewsChart({ data }) {
  if (!data || data.length === 0) return null;

  const chartData = {
    labels: data.map((d) => {
      const [y, m] = d.month.split('-');
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return `${months[parseInt(m, 10) - 1]} ${y}`;
    }),
    datasets: [
      {
        label: 'Reviews',
        data: data.map((d) => d.count),
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        hoverBackgroundColor: 'rgba(99, 102, 241, 0.9)',
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        ticks: { color: '#94a3b8', font: { size: 11 }, stepSize: 1 },
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
      },
      x: {
        ticks: { color: '#94a3b8', font: { size: 11 } },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-1">Monthly Reviews</h3>
      <p className="text-xs text-gray-500 mb-4">Reviews completed per month</p>
      <div style={{ height: 260 }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

function CommonSmellsChart({ data }) {
  if (!data || data.length === 0) return null;

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const chartData = {
    labels: data.map((d) => d.message.length > 50 ? d.message.slice(0, 50) + '...' : d.message),
    datasets: [
      {
        label: 'Occurrences',
        data: data.map((d) => d.count),
        backgroundColor: data.map((_, i) => {
          const alpha = 0.9 - (i / data.length) * 0.6;
          return `rgba(236, 72, 153, ${alpha})`;
        }),
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          title: (items) => {
            const item = items[0];
            return data[item.dataIndex]?.message || '';
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8', font: { size: 11 } },
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        max: Math.ceil(maxCount * 1.2),
      },
      y: {
        ticks: { color: '#94a3b8', font: { size: 10 } },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-1">Most Common Code Smells</h3>
      <p className="text-xs text-gray-500 mb-4">Frequently detected code quality issues</p>
      <div style={{ height: Math.max(200, data.length * 36) }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .get('/analytics/stats')
      .then((res) => setData(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
        {error}
      </div>
    );
  }

  const hasData = data && data.monthlyReviews && data.monthlyReviews.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">Insights from your AI code reviews.</p>
      </div>

      {!hasData ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No analytics yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Run some AI reviews on pull requests to see analytics here.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Average Score</p>
              <p className={`mt-1 text-2xl font-bold ${data.averageScore >= 80 ? 'text-green-600' : data.averageScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {data.averageScore}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Reviews</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {data.monthlyReviews.reduce((s, m) => s + m.count, 0)}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Repositories</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {data.repositoriesReviewed?.length || 0}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Issues</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {Object.values(data.issuesByCategory || {}).reduce((a, b) => a + b, 0)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ScoreTrendChart data={data.scoreTrend} />
            <IssuesByCategoryChart data={data.issuesByCategory} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MonthlyReviewsChart data={data.monthlyReviews} />
            <ReposReviewedChart data={data.repositoriesReviewed} />
          </div>

          {data.commonCodeSmells && data.commonCodeSmells.length > 0 && (
            <CommonSmellsChart data={data.commonCodeSmells} />
          )}
        </>
      )}
    </div>
  );
}
