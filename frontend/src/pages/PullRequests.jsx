import { useState } from 'react';
import Card, { CardHeader, CardTitle, CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';

const statusFilters = ['All', 'Open', 'Approved', 'Changes Requested', 'Pending'];

const prs = [
  { id: 1, title: 'Fix authentication bug in OAuth flow', repo: 'user/repo-a', author: '@alice', status: 'Open', comments: 5, updated: '2 hours ago' },
  { id: 2, title: 'Add dark mode support', repo: 'user/repo-b', author: '@bob', status: 'Changes Requested', comments: 12, updated: '5 hours ago' },
  { id: 3, title: 'Update API documentation', repo: 'user/repo-c', author: '@carol', status: 'Approved', comments: 3, updated: '1 day ago' },
  { id: 4, title: 'Refactor config module', repo: 'user/repo-a', author: '@alice', status: 'Open', comments: 8, updated: '2 days ago' },
  { id: 5, title: 'Add unit tests for health endpoint', repo: 'user/repo-b', author: '@bob', status: 'Pending', comments: 0, updated: '3 days ago' },
  { id: 6, title: 'Implement rate limiting', repo: 'user/repo-d', author: '@dave', status: 'Open', comments: 15, updated: '4 days ago' },
];

const statusColors = {
  Open: 'bg-green-100 text-green-700',
  Approved: 'bg-purple-100 text-purple-700',
  'Changes Requested': 'bg-red-100 text-red-700',
  Pending: 'bg-yellow-100 text-yellow-700',
};

export default function PullRequests() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = activeFilter === 'All'
    ? prs
    : prs.filter((pr) => pr.status === activeFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pull Requests</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and manage pull requests across your repositories.
          </p>
        </div>
        <Button>New Review</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeFilter === filter
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* PR cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-gray-500">No pull requests found.</p>
          </Card>
        ) : (
          filtered.map((pr) => (
            <Card key={pr.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{pr.title}</h3>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[pr.status]}`}>
                      {pr.status}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span>{pr.repo}</span>
                    <span>{pr.author}</span>
                    <span>{pr.comments} comments</span>
                    <span>Updated {pr.updated}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">Review</Button>
                  <Button variant="ghost" size="sm">View</Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
