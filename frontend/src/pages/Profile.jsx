import Card, { CardHeader, CardTitle, CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';

const stats = [
  { label: 'Reviews Given', value: '156' },
  { label: 'Repositories', value: '12' },
  { label: 'Issues Caught', value: '342' },
  { label: 'Approval Rate', value: '85%' },
];

const activity = [
  { action: 'Reviewed PR #42 in user/repo-a', time: '2 hours ago' },
  { action: 'Added repository user/repo-d', time: '1 day ago' },
  { action: 'Approved PR #15 in user/repo-b', time: '2 days ago' },
  { action: 'Updated OpenAI API key', time: '3 days ago' },
  { action: 'Changed notification preferences', time: '1 week ago' },
];

export default function Profile() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your personal information and activity summary.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* User info card */}
        <Card className="lg:col-span-1">
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-700">
              U
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900">User</h2>
            <p className="text-sm text-gray-500">user@example.com</p>
            <p className="mt-1 text-sm text-gray-500">
              Joined December 2025
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <Button variant="outline" size="sm" className="w-full">
              Edit Profile
            </Button>
            <Button variant="secondary" size="sm" className="w-full">
              Change Avatar
            </Button>
          </div>
        </Card>

        {/* Stats and activity */}
        <div className="space-y-6 lg:col-span-2">
          {/* Stats grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
              </Card>
            ))}
          </div>

          {/* Recent activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardBody>
              <ul className="divide-y divide-gray-100">
                {activity.map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between py-3">
                    <span className="text-sm text-gray-700">{item.action}</span>
                    <span className="text-xs text-gray-500">{item.time}</span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
