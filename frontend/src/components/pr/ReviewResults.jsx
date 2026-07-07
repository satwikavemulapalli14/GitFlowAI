const severityConfig = {
  critical: { class: 'bg-red-100 text-red-700 border-red-200', label: 'Critical' },
  major: { class: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Major' },
  minor: { class: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Minor' },
};

const categoryConfig = {
  bugs: { label: 'Bugs', color: 'text-red-600', bgColor: 'bg-red-50' },
  security: { label: 'Security', color: 'text-orange-600', bgColor: 'bg-orange-50' },
  performance: { label: 'Performance', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  readability: { label: 'Readability', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  maintainability: { label: 'Maintainability', color: 'text-teal-600', bgColor: 'bg-teal-50' },
  codeSmells: { label: 'Code Smells', color: 'text-pink-600', bgColor: 'bg-pink-50' },
};

function scoreColor(score) {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

function scoreRingColor(score) {
  if (score >= 80) return 'stroke-green-500';
  if (score >= 60) return 'stroke-yellow-500';
  return 'stroke-red-500';
}

function ScoreCircle({ score }) {
  const r = 54;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx="60" cy="60" r={r}
          fill="none"
          className={scoreRingColor(score)}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className={`absolute text-3xl font-bold ${scoreColor(score)}`}>{score}</span>
    </div>
  );
}

function IssueCard({ issue }) {
  const sev = severityConfig[issue.severity] || severityConfig.minor;
  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex rounded px-1.5 py-0.5 text-xs font-medium ${sev.class}`}>
              {sev.label}
            </span>
            {issue.file && (
              <span className="text-xs font-mono text-gray-500 truncate">{issue.file}</span>
            )}
            {issue.line && (
              <span className="text-xs text-gray-400">line {issue.line}</span>
            )}
          </div>
          <p className="text-sm text-gray-900">{issue.message}</p>
          {issue.suggestion && (
            <p className="mt-1 text-xs text-gray-500 italic">{issue.suggestion}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReviewResults({ data }) {
  if (!data) return null;

  const { review, categories } = data;
  const categoryEntries = Object.entries(categoryConfig);

  return (
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
              {review.totalIssues} issue{review.totalIssues !== 1 ? 's' : ''} found
              {review.completedAt && (
                <> &middot; {new Date(review.completedAt).toLocaleString()}</>
              )}
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {categoryEntries.map(([key, config]) => {
            const items = categories[key];
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
      </div>
    </div>
  );
}
