import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/ui/Loader';

const stateFilters = ['all', 'open', 'closed'];

const stateColors = {
  open: 'bg-green-100 text-green-700',
  closed: 'bg-red-100 text-red-700',
  merged: 'bg-purple-100 text-purple-700',
};

export default function PullRequests() {
  const { owner, repo } = useParams();
  const navigate = useNavigate();
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [sort, setSort] = useState('updated');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const perPage = 10;

  const fetchPrs = useCallback(async () => {
    if (!owner || !repo) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/repositories/${owner}/${repo}/pullrequests`, {
        params: { state: stateFilter, page, perPage, sort, direction: 'desc' },
      });
      let data = res.data.pulls || [];
      if (search.trim()) {
        const q = search.toLowerCase();
        data = data.filter(
          (pr) =>
            pr.title.toLowerCase().includes(q) ||
            (pr.description && pr.description.toLowerCase().includes(q)) ||
            pr.author?.toLowerCase().includes(q)
        );
      }
      setPrs(data);
      setTotalCount(res.data.totalCount || data.length);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch pull requests');
      setPrs([]);
    } finally {
      setLoading(false);
    }
  }, [owner, repo, stateFilter, page, perPage, sort, search]);

  useEffect(() => {
    fetchPrs();
  }, [fetchPrs]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  if (!owner || !repo) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <svg className="h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">Select a Repository</h3>
        <p className="mt-1 text-sm text-gray-500">
          Choose a repository from the{' '}
          <button onClick={() => navigate('/repositories')} className="text-primary-600 underline">
            Repositories page
          </button>{' '}
          to view its pull requests.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pull Requests</h1>
          <p className="mt-1 text-sm text-gray-500">
            {owner}/{repo}
          </p>
        </div>
        <button
          onClick={() => navigate(`/repositories`)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to Repositories
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search pull requests..."
            value={search}
            onChange={handleSearch}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          >
            <option value="updated">Recently Updated</option>
            <option value="created">Newest</option>
            <option value="popularity">Most Comments</option>
          </select>

          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            {stateFilters.map((f) => (
              <button
                key={f}
                onClick={() => { setStateFilter(f); setPage(1); }}
                className={`px-3 py-2 text-xs font-medium transition-colors ${
                  stateFilter === f
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
          {error}
        </div>
      ) : prs.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No pull requests found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {search ? 'Try adjusting your search.' : 'There are no open or closed pull requests for this repository.'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {prs.map((pr) => (
              <div
                key={pr.id}
                onClick={() => navigate(`/pull-requests/${owner}/${repo}/${pr.number}`)}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-primary-200 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <svg className={`h-4 w-4 flex-shrink-0 ${pr.state === 'open' ? 'text-green-500' : pr.isMerged ? 'text-purple-500' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 16 16">
                        <path d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zM2.5 3.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM6 2.5a.75.75 0 000 1.5.75.75 0 000-1.5z" />
                        <path d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354z" />
                      </svg>
                      <h3 className="font-semibold text-gray-900 truncate">{pr.title}</h3>
                      <span className={`inline-flex flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${stateColors[pr.isMerged ? 'merged' : pr.state] || stateColors.closed}`}>
                        {pr.isMerged ? 'Merged' : pr.state.charAt(0).toUpperCase() + pr.state.slice(1)}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span>#{pr.number}</span>
                      <span>by {pr.author}</span>
                      <span className="flex items-center gap-1">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        {pr.comments}
                      </span>
                      {pr.changedFiles > 0 && (
                        <span>{pr.changedFiles} files changed</span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <span className="text-green-600">+{pr.additions}</span>
                        <span className="text-red-600">-{pr.deletions}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    {pr.labels?.length > 0 && (
                      <div className="flex flex-wrap gap-1 justify-end mb-2">
                        {pr.labels.slice(0, 3).map((l) => (
                          <span
                            key={l.name}
                            className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                            style={{ backgroundColor: `#${l.color}20`, color: `#${l.color}` }}
                          >
                            {l.name}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-400">
                      {pr.updatedAt ? new Date(pr.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-6 py-4">
            <p className="text-xs text-gray-500">
              Page {page} ({totalCount} total)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={prs.length < perPage}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
