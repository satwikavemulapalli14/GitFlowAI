import Card, { CardTitle, CardHeader, CardBody } from '../components/ui/Card';
import Table from '../components/ui/Table';

const columns = [
  { key: 'pr', label: 'Pull Request', sortable: true },
  { key: 'repo', label: 'Repository', sortable: true },
  { key: 'score', label: 'Score', sortable: true },
  { key: 'issues', label: 'Issues Found', sortable: true },
  { key: 'status', label: 'Status', sortable: false },
  { key: 'reviewedAt', label: 'Reviewed', sortable: true },
];

const data = [
  { id: 1, pr: 'Fix auth bug', repo: 'user/repo-a', score: '92/100', issues: 3, status: 'Approved', reviewedAt: '2 hours ago' },
  { id: 2, pr: 'Add dark mode', repo: 'user/repo-b', score: '78/100', issues: 8, status: 'Changes Needed', reviewedAt: '5 hours ago' },
  { id: 3, pr: 'Update API docs', repo: 'user/repo-c', score: '95/100', issues: 1, status: 'Approved', reviewedAt: '1 day ago' },
  { id: 4, pr: 'Refactor config', repo: 'user/repo-a', score: '88/100', issues: 5, status: 'Approved', reviewedAt: '2 days ago' },
  { id: 5, pr: 'Add unit tests', repo: 'user/repo-b', score: '85/100', issues: 4, status: 'Approved', reviewedAt: '3 days ago' },
  { id: 6, pr: 'Rate limiting', repo: 'user/repo-d', score: '70/100', issues: 12, status: 'Changes Needed', reviewedAt: '4 days ago' },
];

const summaryStats = [
  { label: 'Total Reviews', value: '156' },
  { label: 'Average Score', value: '85/100' },
  { label: 'Issues Found', value: '342' },
  { label: 'Approval Rate', value: '78%' },
];

export default function ReviewResults() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Review Results</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and analyze AI-generated code review results.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryStats.map((stat) => (
          <Card key={stat.label}>
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Reviews table */}
      <Card padding={false}>
        <div className="border-b border-gray-200 px-6 py-4">
          <CardTitle>Recent Reviews</CardTitle>
        </div>
        <Table columns={columns} data={data} />
      </Card>
    </div>
  );
}
