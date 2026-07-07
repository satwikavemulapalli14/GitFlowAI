import { useState, useEffect } from 'react';
import api from '../api/axios';
import Loader from '../components/ui/Loader';
import { ScoreCircle, IssueCard, categoryConfig, severityConfig, scoreColor } from '../components/pr/ReviewResults';

const TABS = [
  { key: 'Overview', label: 'Overview' },
  { key: 'Security', label: 'Security' },
  { key: 'Performance', label: 'Performance' },
  { key: 'Readability', label: 'Readability' },
  { key: 'Maintainability', label: 'Maintainability' },
  { key: 'CodeSmells', label: 'Code Smells' },
];

const categoryKeyMap = {
  Security: 'security',
  Performance: 'performance',
  Readability: 'readability',
  Maintainability: 'maintainability',
  CodeSmells: 'codeSmells',
};

function StatCard({ label, value, color }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color || 'text-gray-900'}`}>{value}</p>
    </div>
  );
}

function CategoryStatCard({ categoryKey, count, config }) {
  return (
    <div className={`rounded-xl border p-4 ${config.bgColor} border-${config.color.replace('text-', '')}/20`}>
      <div className="flex items-center justify-between">
        <p className={`text-sm font-semibold ${config.color}`}>{config.label}</p>
        <span className={`text-lg font-bold ${config.color}`}>{count}</span>
      </div>
      <p className="mt-1 text-xs text-gray-500">{count === 1 ? 'issue' : 'issues'} found</p>
    </div>
  );
}

function SeverityBadge({ severity }) {
  const sev = severityConfig[severity] || severityConfig.minor;
  return (
    <span className={`inline-flex rounded px-1.5 py-0.5 text-xs font-medium ${sev.class}`}>
      {sev.label}
    </span>
  );
}

export default function ReviewResults() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .get('/reviews')
      .then((res) => {
        const result = res.data.data;
        setData(result);
        if (result.reviews?.length > 0) {
          setSelectedReviewId(result.reviews[0].id);
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load review dashboard');
      })
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

  if (!data || !data.reviews || data.reviews.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of AI-generated code reviews across your pull requests.
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-16 text-center">
          <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No reviews yet</h3>
          <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
            Run an AI review on a pull request to see results here. Navigate to a pull request and click "Review with AI".
          </p>
        </div>
      </div>
    );
  }

  const { reviews, stats } = data;
  const selectedReview = reviews.find((r) => r.id === selectedReviewId) || reviews[0];
  const categories = selectedReview?.categories || {};
  const categoryCounts = selectedReview?.categoryCounts || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Review Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of AI-generated code reviews across your pull requests.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Reviews" value={stats.totalReviews} />
        <StatCard label="Average Score" value={`${stats.averageScore}/100`} color={scoreColor(stats.averageScore)} />
        <StatCard label="Total Issues Found" value={stats.totalIssues} />
        <StatCard label="Reviews This Session" value={reviews.length} />
      </div>

      {/* Review Selector */}
      {reviews.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Select Review:</span>
          <div className="flex flex-wrap gap-1.5">
            {reviews.map((r) => (
              <button
                key={r.id}
                onClick={() => { setSelectedReviewId(r.id); setActiveTab('Overview'); }}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedReviewId === r.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {r.completedAt ? new Date(r.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Unknown'}
                <span className={`ml-1.5 ${scoreColor(r.score)}`}>{r.score}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Review */}
      {selectedReview && (
        <>
          {/* Review Header Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <ScoreCircle score={selectedReview.score} />
              <div className="flex-1">
                <p className="text-sm text-gray-600 leading-relaxed">{selectedReview.summary}</p>
                <p className="mt-2 text-xs text-gray-400">
                  {selectedReview.completedAt && (
                    <>Reviewed {new Date(selectedReview.completedAt).toLocaleString()}</>
                  )}
                  {' '}&middot; {selectedReview.totalIssues} issue{selectedReview.totalIssues !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>
          </div>

          {/* Category cards row */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(categoryConfig).map(([key, config]) => (
              <CategoryStatCard
                key={key}
                categoryKey={key}
                count={categoryCounts[key] || 0}
                config={config}
              />
            ))}
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex gap-6 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.key !== 'Overview' && categoryCounts[categoryKeyMap[tab.key]] > 0 && (
                    <span className="ml-1.5 text-xs">({categoryCounts[categoryKeyMap[tab.key]]})</span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'Overview' && (
            <div className="space-y-6">
              {Object.entries(categoryConfig).map(([key, config]) => {
                const items = categories[key];
                if (!items || items.length === 0) return null;

                return (
                  <div key={key} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                    <div className={`px-5 py-3 border-b border-gray-100 ${config.bgColor}`}>
                      <h3 className={`text-sm font-semibold ${config.color}`}>
                        {config.label}
                        <span className="ml-2 text-xs text-gray-400 font-normal">({items.length})</span>
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {items.map((issue, idx) => (
                        <div key={idx} className="px-5 py-3">
                          <div className="flex items-center gap-2 mb-1">
                            <SeverityBadge severity={issue.severity} />
                            {issue.file && (
                              <span className="text-xs font-mono text-gray-500 truncate">{issue.file}</span>
                            )}
                            {issue.line && (
                              <span className="text-xs text-gray-400">line {issue.line}</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-900 mt-1">{issue.message}</p>
                          {issue.suggestion && (
                            <p className="mt-1 text-xs text-gray-500 italic">{issue.suggestion}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab !== 'Overview' && (
            <div className="space-y-2">
              {(() => {
                const key = categoryKeyMap[activeTab];
                const items = categories[key];
                if (!items || items.length === 0) {
                  return (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-12 text-center">
                      <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="mt-3 text-sm text-gray-500">No {activeTab.toLowerCase()} issues found.</p>
                    </div>
                  );
                }
                return items.map((issue, idx) => (
                  <IssueCard key={idx} issue={issue} />
                ));
              })()}
            </div>
          )}
        </>
      )}
    </div>
  );
}
