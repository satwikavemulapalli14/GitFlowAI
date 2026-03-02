import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/ui/Loader';
import { ScoreCircle, IssueCard, categoryConfig, scoreColor } from '../components/pr/ReviewResults';

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

export default function ReviewDetailById() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [exporting, setExporting] = useState(null);

  const handleExport = useCallback(async (format) => {
    setExporting(format);
    try {
      const res = await api.get(`/reviews/${id}/export/${format}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `review-${id}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // download failed silently
    } finally {
      setExporting(null);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get(`/reviews/${id}`)
      .then((res) => setReview(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load review'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!review) return null;

  const categoryEntries = Object.entries(categoryConfig);
  const totalIssues =
    review.categoryCounts?.bugs +
    review.categoryCounts?.security +
    review.categoryCounts?.performance +
    review.categoryCounts?.readability +
    review.categoryCounts?.maintainability +
    review.categoryCounts?.codeSmells;

  const currentCategoryKey = categoryKeyMap[activeTab];
  const currentIssues = currentCategoryKey ? review.categories[currentCategoryKey] || [] : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/reviews')}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Review History
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting !== null}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {exporting === 'pdf' ? (
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
            PDF
          </button>
          <button
            onClick={() => handleExport('markdown')}
            disabled={exporting !== null}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {exporting === 'markdown' ? (
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            )}
            Markdown
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Review Details</h1>
            <p className="mt-1 text-sm text-gray-500">
              {review.repoFullName || `${review.repoOwner}/${review.repoName}`}
              {review.prNumber && <> &middot; PR #{review.prNumber}</>}
            </p>
            {review.prTitle && (
              <p className="mt-0.5 text-sm text-gray-600">{review.prTitle}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Score" value={review.score ?? '-'} color={scoreColor(review.score)} />
        <StatCard label="Total Issues" value={totalIssues} />
        {review.categoryCounts && (
          <>
            <StatCard label="Bugs" value={review.categoryCounts.bugs} color="text-red-600" />
            <StatCard label="Security" value={review.categoryCounts.security} color="text-orange-600" />
            <StatCard label="Performance" value={review.categoryCounts.performance} color="text-blue-600" />
            <StatCard label="Readability" value={review.categoryCounts.readability} color="text-purple-600" />
            <StatCard label="Maintainability" value={review.categoryCounts.maintainability} color="text-teal-600" />
            <StatCard label="Code Smells" value={review.categoryCounts.codeSmells} color="text-pink-600" />
          </>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="text-base font-semibold text-gray-900">AI Code Review</h3>
        </div>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <ScoreCircle score={review.score} />
            <div className="flex-1">
              <p className="text-sm text-gray-600 leading-relaxed">{review.summary}</p>
              <p className="mt-2 text-xs text-gray-400">
                {totalIssues} issue{totalIssues !== 1 ? 's' : ''} found
                {review.completedAt && (
                  <> &middot; {new Date(review.completedAt).toLocaleString()}</>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex gap-4 -mb-px overflow-x-auto">
          {TABS.map((tab) => {
            const catKey = categoryKeyMap[tab.key];
            const count = catKey ? review.categoryCounts?.[catKey] || 0 : 0;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`whitespace-nowrap px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary-600 text-primary-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className="ml-1.5 text-xs text-gray-400">({count})</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === 'Overview' ? (
        <div className="space-y-8">
          {categoryEntries.map(([key, config]) => {
            const items = review.categories[key];
            if (!items || items.length === 0) return null;

            return (
              <div key={key}>
                <div className="flex items-center gap-2 mb-3">
                  <h4 className={`text-sm font-semibold ${config.color}`}>{config.label}</h4>
                  <span className="text-xs text-gray-400">({items.length})</span>
                </div>
                <div className="space-y-2">
                  {items.map((issue, idx) => (
                    <IssueCard key={idx} issue={issue} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {currentIssues && currentIssues.length > 0 ? (
            currentIssues.map((issue, idx) => (
              <IssueCard key={idx} issue={issue} />
            ))
          ) : (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
              No issues found in this category.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
