import { useState } from 'react';
import MonacoDiffEditor from './MonacoDiffEditor';

const statusBadge = {
  added: { label: 'A', class: 'bg-green-100 text-green-700' },
  removed: { label: 'D', class: 'bg-red-100 text-red-700' },
  modified: { label: 'M', class: 'bg-yellow-100 text-yellow-700' },
  renamed: { label: 'R', class: 'bg-blue-100 text-blue-700' },
  copied: { label: 'C', class: 'bg-purple-100 text-purple-700' },
};

export default function DiffView({ file }) {
  const [expanded, setExpanded] = useState(false);
  const badge = statusBadge[file.status] || statusBadge.modified;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <svg
            className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${badge.class}`}>
            {badge.label}
          </span>
          <span className="text-sm font-medium text-gray-900 truncate font-mono">{file.filename}</span>
          {file.previousFilename && (
            <span className="text-xs text-gray-400">from {file.previousFilename}</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs flex-shrink-0">
          <span className="text-green-600 font-medium">+{file.additions}</span>
          <span className="text-red-600 font-medium">-{file.deletions}</span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-200">
          {file.patch ? (
            <MonacoDiffEditor file={file} />
          ) : (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              {file.status === 'removed' ? 'File was deleted' : 'No diff available (binary file or too large)'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
