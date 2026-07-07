import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/ui/Loader';
import DiffView from '../components/pr/DiffView';
import ReviewResults from '../components/pr/ReviewResults';

const TABS = ['Overview', 'Files Changed', 'Commits'];

const reviewStatusConfig = {
  approved: { label: 'Approved', class: 'bg-green-100 text-green-700' },
  changes_requested: { label: 'Changes Requested', class: 'bg-red-100 text-red-700' },
  reviewed: { label: 'Reviewed', class: 'bg-blue-100 text-blue-700' },
  pending: { label: 'Awaiting Review', class: 'bg-yellow-100 text-yellow-700' },
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(dateStr);
}

function shortenSha(sha) {
  return sha ? sha.slice(0, 7) : '';
}

export default function PullRequestDetail() {
  const { owner, repo, prNumber } = useParams();
  const navigate = useNavigate();
  const [pr, setPr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [reviewData, setReviewData] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  useEffect(() => {
    if (!owner || !repo || !prNumber) return;
    setLoading(true);
    setError(null);
    api
      .get(`/repositories/${owner}/${repo}/pullrequests/${prNumber}`)
      .then((res) => {
        setPr(res.data);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to fetch pull request details');
      })
      .finally(() => setLoading(false));
  }, [owner, repo, prNumber]);

  const handleReview = async () => {
    setReviewLoading(true);
    setReviewError(null);
    setReviewData(null);
    try {
      const res = await api.post('/review', { owner, repo, prNumber: parseInt(prNumber, 10) });
      setReviewData(res.data.data);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to run AI review');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!pr) return null;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(`/pull-requests/${owner}/${repo}`)}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Pull Requests
      </button>

      {/* PR Header */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <svg className={`h-5 w-5 flex-shrink-0 ${pr.state === 'open' ? 'text-green-500' : pr.isMerged ? 'text-purple-500' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 16 16">
                <path d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zM2.5 3.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM6 2.5a.75.75 0 000 1.5.75.75 0 000-1.5z" />
                <path d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354z" />
              </svg>
              <h1 className="text-xl font-bold text-gray-900 truncate">{pr.title}</h1>
              <span
                className={`inline-flex flex-shrink-0 rounded-full px-3 py-0.5 text-xs font-medium ${
                  pr.isMerged
                    ? 'bg-purple-100 text-purple-700'
                    : pr.state === 'open'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {pr.isMerged ? 'Merged' : pr.state.charAt(0).toUpperCase() + pr.state.slice(1)}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
              <span>#{pr.number}</span>
              {pr.author && (
                <span className="inline-flex items-center gap-1.5">
                  {pr.authorAvatar && (
                    <img src={pr.authorAvatar} alt="" className="h-4 w-4 rounded-full" />
                  )}
                  {pr.author}
                </span>
              )}
              <span>opened {timeAgo(pr.createdAt)}</span>
              {pr.updatedAt && <span>updated {timeAgo(pr.updatedAt)}</span>}
            </div>

            {pr.labels?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {pr.labels.map((l) => (
                  <span
                    key={l.name}
                    className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: `#${l.color}20`, color: `#${l.color}` }}
                  >
                    {l.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex-shrink-0 flex items-center gap-2">
            <button
              onClick={handleReview}
              disabled={reviewLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary-300 bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700 hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {reviewLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Reviewing...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Review with AI
                </>
              )}
            </button>
            <a
              href={pr.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              View on GitHub
            </a>
          </div>
        </div>

        {/* PR Stats Bar */}
        <div className="mt-6 flex flex-wrap items-center gap-6 border-t border-gray-100 pt-5">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-900">{pr.changedFiles}</span>
            <span className="text-xs text-gray-500">files changed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-green-600">+{pr.additions}</span>
            <span className="text-xs text-gray-500">additions</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-red-600">-{pr.deletions}</span>
            <span className="text-xs text-gray-500">deletions</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-900">{pr.commitCount}</span>
            <span className="text-xs text-gray-500">commits</span>
          </div>
          {pr.reviewStatus && (
            <div className="flex items-center gap-2 ml-auto">
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${reviewStatusConfig[pr.reviewStatus]?.class || reviewStatusConfig.pending.class}`}>
                {reviewStatusConfig[pr.reviewStatus]?.label || 'Awaiting Review'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* AI Review Results */}
      {reviewError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {reviewError}
        </div>
      )}

      {reviewData && <ReviewResults data={reviewData} />}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
              {tab === 'Files Changed' && pr.files?.length > 0 && (
                <span className="ml-1.5 text-xs text-gray-400">({pr.files.length})</span>
              )}
              {tab === 'Commits' && pr.commits?.length > 0 && (
                <span className="ml-1.5 text-xs text-gray-400">({pr.commits.length})</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'Overview' && (
        <div className="space-y-6">
          {pr.description && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Description</h3>
              <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap">
                {pr.description}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Branch Information</h3>
            <div className="flex items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-1 font-mono text-xs text-gray-700">
                <span className="text-gray-400">{owner}:</span>{pr.baseBranch}
              </span>
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-1 font-mono text-xs text-gray-700">
                <span className="text-gray-400">{owner}:</span>{pr.headBranch}
              </span>
            </div>
          </div>

          {/* Reviews Section */}
          {pr.reviews?.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-6 py-4">
                <h3 className="text-sm font-semibold text-gray-900">Reviews ({pr.reviews.length})</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {pr.reviews.map((review) => (
                  <div key={review.id} className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm">
                      {review.authorAvatar && (
                        <img src={review.authorAvatar} alt="" className="h-5 w-5 rounded-full" />
                      )}
                      <span className="font-medium text-gray-900">{review.author}</span>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        review.state === 'approved' ? 'bg-green-100 text-green-700' :
                        review.state === 'changes_requested' ? 'bg-red-100 text-red-700' :
                        review.state === 'commented' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {review.state === 'changes_requested' ? 'Changes Requested' :
                         review.state.charAt(0).toUpperCase() + review.state.slice(1)}
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">{formatDate(review.submittedAt)}</span>
                    </div>
                    {review.body && (
                      <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">{review.body}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'Files Changed' && (
        <div className="space-y-3">
          {pr.files?.length > 0 ? (
            pr.files.map((file) => (
              <DiffView key={file.filename} file={file} />
            ))
          ) : (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No files changed</h3>
              <p className="mt-1 text-sm text-gray-500">This pull request has no file changes.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'Commits' && (
        <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
          {pr.commits?.length > 0 ? (
            pr.commits.map((commit) => (
              <div key={commit.sha} className="px-6 py-4">
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 flex-shrink-0 mt-0.5 text-gray-400" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm9 3a1 1 0 11-2 0 1 1 0 012 0zm-.25-6.25a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 whitespace-pre-wrap">
                      {commit.message?.split('\n')[0] || 'No message'}
                    </p>
                    {commit.message?.includes('\n') && (
                      <p className="mt-1 text-xs text-gray-500 whitespace-pre-wrap">
                        {commit.message.split('\n').slice(1).filter(Boolean).join('\n')}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1.5">
                        {commit.authorAvatar && (
                          <img src={commit.authorAvatar} alt="" className="h-4 w-4 rounded-full" />
                        )}
                        {commit.authorUsername || commit.authorName}
                      </span>
                      <span>{timeAgo(commit.date)}</span>
                      <a
                        href={commit.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-gray-400 hover:text-primary-600"
                      >
                        {shortenSha(commit.sha)}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No commits</h3>
              <p className="mt-1 text-sm text-gray-500">This pull request has no commits.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
