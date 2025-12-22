import { useState } from 'react';
import api from '../api/axios';

export default function HealthCheck() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/health');
      setData(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">API Health Check</h2>

      <button
        onClick={fetchHealth}
        disabled={loading}
        className="mt-3 inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Checking…' : 'Check Health'}
      </button>

      {error && (
        <p className="mt-3 text-sm text-red-600">
          Error: {error}
        </p>
      )}

      {data && (
        <pre className="mt-4 rounded-lg bg-gray-50 p-4 text-left text-xs text-gray-700 overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
