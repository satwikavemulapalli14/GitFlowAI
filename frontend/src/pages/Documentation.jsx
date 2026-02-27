import Card, { CardTitle } from '../components/ui/Card';

const sections = [
  {
    title: 'Getting Started',
    items: [
      'Connect your GitHub account to start reviewing pull requests.',
      'Navigate to Repositories to select which repos to monitor.',
      'Create a review and get AI-powered feedback on your PRs.',
    ],
  },
  {
    title: 'Repositories',
    items: [
      'View and manage connected GitHub repositories.',
      'Select repositories to enable automated review tracking.',
      'Each repository shows its latest PRs and review status.',
    ],
  },
  {
    title: 'Pull Requests',
    items: [
      'Browse pull requests across all your repositories.',
      'Filter by repository, status, or search by PR number.',
      'Click a PR to view its AI-powered review results.',
    ],
  },
  {
    title: 'Review Results',
    items: [
      'AI-generated code reviews with category scores (Security, Performance, Readability, Maintainability).',
      'Each issue has a severity rating and suggested fix.',
      'Track score improvements across review iterations.',
    ],
  },
  {
    title: 'Review History',
    items: [
      'Complete history of all reviews you have performed.',
      'Search reviews by PR title, sort by date or score.',
      'Click any review to see full details and issues.',
    ],
  },
  {
    title: 'Analytics',
    items: [
      'Dashboard-wide metrics: total reviews, average scores, trends.',
      'Review distribution charts by category and severity.',
      'Score trends over time to track quality improvements.',
    ],
  },
  {
    title: 'Profile & Settings',
    items: [
      'View your GitHub profile and review statistics.',
      'Configure notification preferences (email, Slack).',
      'Manage your OpenAI API key for review generation.',
    ],
  },
  {
    title: 'Search',
    items: [
      'Global search across repositories, pull requests, and reviews.',
      'Filter by type, date range, score, and status.',
      'Paginated results with detailed previews.',
    ],
  },
];

export default function Documentation() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documentation</h1>
        <p className="mt-1 text-sm text-gray-500">
          Learn how to use GitFlowAI to streamline your code review workflow.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardTitle>{section.title}</CardTitle>
            <ul className="mt-3 space-y-2">
              {section.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
