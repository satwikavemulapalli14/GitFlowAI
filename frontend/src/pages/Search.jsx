import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/ui/Loader';

const TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'repositories', label: 'Repositories' },
  { value: 'pull_requests', label: 'Pull Requests' },
  { value: 'reviews', label: 'Reviews' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'Any Status' },
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
  { value: 'merged', label: 'Merged' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
];

function scoreColor(score) {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

function TypeBadge({ type }) {
  const styles = {
    repository: 'bg-blue-100 text-blue-700',
    pull_request: 'bg-purple-100 text-purple-700',
    review: 'bg-green-100 text-green-700',
  };
  const labels = {
    repository: 'Repo',
    pull_request: 'PR',
    review: 'Review',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[type] || 'bg-gray-100 text-gray-700'}`}>
      {labels[type] || type}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [repositoryId, setRepositoryId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [scoreMin, setScoreMin] = useState('');
  const [scoreMax, setScoreMax] = useState('');
  const [status, setStatus] = useState('');
  const [repositories, setRepositories] = useState([]);
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const perPage = 20;

  useEffect(() => {
    api.get('/search/repositories')
      .then((res) => setRepositories(res.data.data || []))
      .catch(() => {});
  }, []);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, perPage };
      if (query) params.q = query;
      if (type !== 'all') params.type = type;
      if (repositoryId) params.repository_id = repositoryId;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (scoreMin) params.scoreMin = scoreMin;
      if (scoreMax) params.scoreMax = scoreMax;
      if (status) params.status = status;

      const res = await api.get('/search', { params });
      setResults(res.data.data.results);
      setSummary(res.data.data.summary);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, type, repositoryId, dateFrom, dateTo, scoreMin, scoreMax, status, page, perPage]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const clearFilters = () => {
    setQuery('');
    setType('all');
    setRepositoryId('');
    setDateFrom('');
    setDateTo('');
    setScoreMin('');
    setScoreMax('');
    setStatus('');
    setPage(1);
  };

  const hasActiveFilters = query || type !== 'all' || repositoryId || dateFrom || dateTo || scoreMin || scoreMax || status;

  const handleResultClick = (item) => {
    if (item.type === 'repository') {
      navigate(`/pull-requests${item.repo_full_name ? '/' + item.repo_full_name : ''}`);
    } else if (item.type === 'pull_request') {
      const name = item.repo_full_name;
      if (name) {
        const [owner, repo] = name.split('/');
        navigate(`/pull-requests/${owner}/${repo}/${item.pr_number}`);
      }
    } else if (item.type === 'review') {
      navigate(`/reviews/${item.id}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Search</h1>
        <p className="mt-1 text-sm text-gray-500">Search across repositories, pull requests, and reviews.</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search repositories, pull requests, reviews..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          Search
        </button>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
            showFilters || hasActiveFilters
              ? 'border-primary-300 bg-primary-50 text-primary-700'
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <svg className="mr-1.5 inline-block h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
          {hasActiveFilters && <span className="ml-1.5 rounded-full bg-primary-500 px-1.5 py-0.5 text-xs text-white">!</span>}
        </button>
      </form>

      {showFilters && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => { setType(e.target.value); setPage(1); }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Repository</label>
              <select
                value={repositoryId}
                onChange={(e) => { setRepositoryId(e.target.value); setPage(1); }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              >
                <option value="">All Repositories</option>
                {repositories.map((repo) => (
                  <option key={repo.id} value={repo.id}>{repo.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Min Score</label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="0"
                value={scoreMin}
                onChange={(e) => { setScoreMin(e.target.value); setPage(1); }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Max Score</label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="100"
                value={scoreMax}
                onChange={(e) => { setScoreMax(e.target.value); setPage(1); }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {summary && !loading && (
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
          <span>{summary.all} total results</span>
          {summary.all > 0 && (
            <>
              <span className="text-gray-300">|</span>
              <span className="text-blue-600">{summary.repositories} repos</span>
              <span className="text-gray-300">|</span>
              <span className="text-purple-600">{summary.pullRequests} PRs</span>
              <span className="text-gray-300">|</span>
              <span className="text-green-600">{summary.reviews} reviews</span>
            </>
          )}
        </div>
      )}

      {loading ? (
        <Loader />
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
          {error}
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No results found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {query || hasActiveFilters ? 'Try adjusting your search or filters.' : 'Enter a search term to get started.'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {results.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                onClick={() => handleResultClick(item)}
                className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-gray-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <TypeBadge type={item.type} />
                      {item.repo_full_name && (
                        <span className="text-xs text-gray-400 truncate">{item.repo_full_name}</span>
                      )}
                      {item.pr_number && (
                        <span className="text-xs text-gray-400">#{item.pr_number}</span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {item.type === 'pull_request' && item.pr_number
                        ? `${item.repo_full_name ? item.repo_full_name.split('/')[1] + ' ' : ''}#${item.pr_number} - ${item.title}`
                        : item.title || item.repo_full_name}
                    </h3>
                    {item.description && (
                      <p className="mt-0.5 text-sm text-gray-500 line-clamp-2">{item.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                      {item.language && <span>{item.language}</span>}
                      {item.stars != null && <span>{item.stars} stars</span>}
                      {item.completed_at && <span>Reviewed {formatDate(item.completed_at)}</span>}
                      {item.created_at && !item.completed_at && <span>{formatDate(item.created_at)}</span>}
                      {item.status && (
                        <span className={`capitalize ${
                          item.status === 'open' || item.status === 'completed' ? 'text-green-600' :
                          item.status === 'closed' ? 'text-red-600' :
                          item.status === 'merged' ? 'text-purple-600' : ''
                        }`}>{item.status}</span>
                      )}
                    </div>
                  </div>
                  {item.score != null && (
                    <div className={`flex-shrink-0 text-right ${scoreColor(item.score)}`}>
                      <div className="text-lg font-bold">{item.score}</div>
                      <div className="text-xs">score</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-6 py-4">
              <p className="text-xs text-gray-500">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} results)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrev}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!pagination.hasNext}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
