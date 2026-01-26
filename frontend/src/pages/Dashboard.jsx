import Card, { CardTitle } from '../components/ui/Card';

const stats = [
  { label: 'Total PRs', value: '24', color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Open', value: '8', color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Reviewed', value: '14', color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Pending', value: '2', color: 'text-yellow-600', bg: 'bg-yellow-50' },
];

const recentActivity = [
  { id: 1, repo: 'user/repo-a', pr: '#42 Fix auth bug', status: 'Approved', date: '2 hours ago' },
  { id: 2, repo: 'user/repo-b', pr: '#15 Add dark mode', status: 'Changes requested', date: '5 hours ago' },
  { id: 3, repo: 'user/repo-c', pr: '#8 Update API docs', status: 'Pending', date: '1 day ago' },
  { id: 4, repo: 'user/repo-a', pr: '#41 Refactor config', status: 'Approved', date: '2 days ago' },
];

const statusColors = {
  Approved: 'bg-green-100 text-green-700',
  'Changes requested': 'bg-red-100 text-red-700',
  Pending: 'bg-yellow-100 text-yellow-700',
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here is an overview of your pull request reviews.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bg}`}>
                <span className={`text-lg font-bold ${stat.color}`}>{stat.value}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent activity */}
      <Card>
        <CardTitle>Recent Activity</CardTitle>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                <th className="pb-3 pr-4">Repository</th>
                <th className="pb-3 pr-4">Pull Request</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentActivity.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-3 pr-4 text-sm font-medium text-gray-900">{item.repo}</td>
                  <td className="py-3 pr-4 text-sm text-gray-600">{item.pr}</td>
                  <td className="py-3 pr-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[item.status]}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-gray-500">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
