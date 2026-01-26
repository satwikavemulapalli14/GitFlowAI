import Card, { CardTitle, CardHeader, CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';

const sections = [
  {
    title: 'Profile',
    description: 'Update your personal information and preferences.',
    fields: [
      { label: 'Display Name', value: 'User', type: 'text' },
      { label: 'Email', value: 'user@example.com', type: 'email' },
      { label: 'Bio', value: 'Software developer', type: 'text' },
    ],
  },
  {
    title: 'Notifications',
    description: 'Configure how you receive review notifications.',
    fields: [
      { label: 'Email Notifications', value: 'Enabled', type: 'toggle' },
      { label: 'Slack Integration', value: 'Disabled', type: 'toggle' },
      { label: 'Review Reminders', value: 'Daily', type: 'select' },
    ],
  },
  {
    title: 'API Keys',
    description: 'Manage your API keys for external integrations.',
    fields: [
      { label: 'OpenAI API Key', value: '••••••••••••••••', type: 'password' },
      { label: 'GitHub Token', value: '••••••••••••••••', type: 'password' },
    ],
  },
];

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences.
        </p>
      </div>

      {sections.map((section) => (
        <Card key={section.title}>
          <CardHeader>
            <div>
              <CardTitle>{section.title}</CardTitle>
              <p className="mt-1 text-sm text-gray-500">{section.description}</p>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            {section.fields.map((field) => (
              <div key={field.label} className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                {field.type === 'toggle' ? (
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      field.value === 'Enabled'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {field.value}
                  </span>
                ) : (
                  <span className="text-sm text-gray-600">{field.value}</span>
                )}
              </div>
            ))}
          </CardBody>
          <div className="mt-4 flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Button variant="secondary">Cancel</Button>
            <Button>Save Changes</Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
