import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/ui/Loader';

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-primary-600' : 'bg-gray-300'
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </button>
  );
}

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [slackIntegration, setSlackIntegration] = useState(false);
  const [reviewReminders, setReviewReminders] = useState('daily');
  const [openaiApiKey, setOpenaiApiKey] = useState('');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    api.get('/profile/settings')
      .then((res) => {
        const s = res.data.data;
        setSettings(s);
        setEmailNotifications(s.email_notifications ?? true);
        setSlackIntegration(s.slack_integration ?? false);
        setReviewReminders(s.review_reminders || 'daily');
        setOpenaiApiKey(s.openai_api_key || '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await api.put('/profile/settings', {
        dark_mode: darkMode,
        email_notifications: emailNotifications,
        slack_integration: slackIntegration,
        review_reminders: reviewReminders,
        openai_api_key: openaiApiKey,
      });
      setSettings(res.data.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account settings and preferences.</p>
      </div>

      {saved && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Settings saved successfully.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 mb-1">Appearance</h3>
        <p className="text-sm text-gray-500 mb-4">Toggle dark mode for the interface.</p>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Dark Mode</label>
          <Toggle enabled={darkMode} onChange={setDarkMode} />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 mb-1">Notification Preferences</h3>
        <p className="text-sm text-gray-500 mb-4">Configure how you receive review notifications.</p>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Email Notifications</label>
            <Toggle enabled={emailNotifications} onChange={setEmailNotifications} />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Slack Integration</label>
            <Toggle enabled={slackIntegration} onChange={setSlackIntegration} />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Review Reminders</label>
            <select
              value={reviewReminders}
              onChange={(e) => setReviewReminders(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none"
            >
              <option value="never">Never</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 mb-1">API Key Settings</h3>
        <p className="text-sm text-gray-500 mb-4">Manage your API keys for external AI integrations.</p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">OpenAI API Key</label>
          <input
            type="password"
            value={openaiApiKey}
            onChange={(e) => setOpenaiApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <p className="mt-1 text-xs text-gray-400">Used for AI-powered code reviews. Stored securely.</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-base font-semibold text-gray-900 mb-1">Logout</h3>
        <p className="text-sm text-gray-500 mb-4">Sign out of your account.</p>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-red-300 px-5 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
