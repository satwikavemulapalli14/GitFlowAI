import { useState, useCallback } from 'react';
import MonacoCodeEditor from './MonacoCodeEditor';
import { languageFromFilename } from '../../utils/patchUtils';

export const severityConfig = {
  critical: { class: 'bg-red-100 text-red-700 border-red-200', label: 'Critical' },
  major: { class: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Major' },
  minor: { class: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Minor' },
};

export const categoryConfig = {
  bugs: { label: 'Bugs', color: 'text-red-600', bgColor: 'bg-red-50', icon: null },
  security: { label: 'Security', color: 'text-orange-600', bgColor: 'bg-orange-50', icon: null },
  performance: { label: 'Performance', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: null },
  readability: { label: 'Readability', color: 'text-purple-600', bgColor: 'bg-purple-50', icon: null },
  maintainability: { label: 'Maintainability', color: 'text-teal-600', bgColor: 'bg-teal-50', icon: null },
  codeSmells: { label: 'Code Smells', color: 'text-pink-600', bgColor: 'bg-pink-50', icon: null },
};

export function scoreColor(score) {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

function scoreRingColor(score) {
  if (score >= 80) return 'stroke-green-500';
  if (score >= 60) return 'stroke-yellow-500';
  return 'stroke-red-500';
}

export function ScoreCircle({ score }) {
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

export function IssueCard({ issue }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const sev = severityConfig[issue.severity] || severityConfig.minor;
  const hasImprovedCode = !!issue.improvedCode;

  const handleCopy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  }, []);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <svg
            className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className={`inline-flex rounded px-1.5 py-0.5 text-xs font-medium ${sev.class}`}>
            {sev.label}
          </span>
          {issue.file && (
            <span className="text-xs font-mono text-gray-500 truncate hidden sm:inline">{issue.file}</span>
          )}
          {issue.line && (
            <span className="text-xs text-gray-400 hidden sm:inline">line {issue.line}</span>
          )}
          <span className="text-sm font-medium text-gray-900 truncate">
            {issue.problem || issue.message}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {hasImprovedCode && (
            <span className="text-xs text-primary-600 font-medium">Fix</span>
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-200">
          <div className="px-4 py-3 space-y-3">
            <div>
              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Problem</h5>
              <p className="text-sm text-gray-900">{issue.message}</p>
            </div>

            {issue.explanation && (
              <div>
                <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Explanation</h5>
                <p className="text-sm text-gray-700">{issue.explanation}</p>
              </div>
            )}

            {issue.suggestedFix && (
              <div>
                <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Suggested Fix</h5>
                <p className="text-sm text-gray-700">{issue.suggestedFix}</p>
              </div>
            )}

            {issue.file && (
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="font-mono">{issue.file}</span>
                {issue.line && <span>line {issue.line}</span>}
              </div>
            )}
          </div>

          {hasImprovedCode && (
            <div className="relative">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200">
                <span className="text-xs font-medium text-gray-600">Improved Code</span>
                <button
                  onClick={() => handleCopy(issue.improvedCode)}
                  className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  {copied ? (
                    <>
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied
                    </>
                  ) : (
                    <>
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
              <MonacoCodeEditor
                code={issue.improvedCode}
                language={languageFromFilename(issue.file || '')}
              />
            </div>
          )}
        </div>
      )}
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
