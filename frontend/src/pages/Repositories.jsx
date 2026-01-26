import { useState } from 'react';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardTitle } from '../components/ui/Card';
import Table from '../components/ui/Table';

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'branch', label: 'Default Branch', sortable: true },
  { key: 'prs', label: 'Open PRs', sortable: true },
  { key: 'lastReview', label: 'Last Review', sortable: true },
  { key: 'status', label: 'Status', sortable: false },
];

const data = [
  { id: 1, name: 'user/repo-a', branch: 'main', prs: 5, lastReview: '2 hours ago', status: 'Active' },
  { id: 2, name: 'user/repo-b', branch: 'develop', prs: 3, lastReview: '1 day ago', status: 'Active' },
  { id: 3, name: 'user/repo-c', branch: 'main', prs: 0, lastReview: '1 week ago', status: 'Inactive' },
  { id: 4, name: 'user/repo-d', branch: 'master', prs: 8, lastReview: '3 days ago', status: 'Active' },
  { id: 5, name: 'user/repo-e', branch: 'main', prs: 1, lastReview: 'Just now', status: 'Active' },
];

export default function Repositories() {
  const [search, setSearch] = useState('');

  const filtered = data.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Repositories</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your connected GitHub repositories.
          </p>
        </div>
        <Button>Add Repository</Button>
      </div>

      <Card padding={false}>
        <div className="border-b border-gray-200 px-6 py-4">
          <input
            type="text"
            placeholder="Search repositories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <Table columns={columns} data={filtered} />
      </Card>
    </div>
  );
}
