import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Loader from '../components/ui/Loader';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/profile')
      .then((res) => setProfile(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
        {error}
      </div>
    );
  }

  const u = profile?.user || user || {};
  const stats = profile?.stats || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-500">Your personal information and review statistics.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-1">
          <div className="text-center">
            {u.avatar_url ? (
              <img
                src={u.avatar_url}
                alt={u.username}
                className="mx-auto h-20 w-20 rounded-full"
              />
            ) : (
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-700">
                {(u.display_name || u.username || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <h2 className="mt-4 text-xl font-bold text-gray-900">{u.display_name || u.username}</h2>
            <p className="text-sm text-gray-500">@{u.username}</p>
            {u.email && <p className="mt-1 text-sm text-gray-500">{u.email}</p>}
            {u.bio && <p className="mt-2 text-sm text-gray-600">{u.bio}</p>}
            <p className="mt-3 text-xs text-gray-400">
              Joined {new Date(u.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Repositories Reviewed</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{stats.reviewsGiven ?? '-'}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Average Review Score</p>
              <p className={`mt-1 text-2xl font-bold ${
                (stats.averageScore || 0) >= 80 ? 'text-green-600' :
                (stats.averageScore || 0) >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {stats.averageScore != null ? stats.averageScore : '-'}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Account Details</h3>
            <dl className="divide-y divide-gray-100">
              <div className="flex justify-between py-3">
                <dt className="text-sm text-gray-500">Username</dt>
                <dd className="text-sm font-medium text-gray-900">{u.username}</dd>
              </div>
              {u.email && (
                <div className="flex justify-between py-3">
                  <dt className="text-sm text-gray-500">Email</dt>
                  <dd className="text-sm font-medium text-gray-900">{u.email}</dd>
                </div>
              )}
              <div className="flex justify-between py-3">
                <dt className="text-sm text-gray-500">Role</dt>
                <dd className="text-sm font-medium text-gray-900 capitalize">{u.role || 'user'}</dd>
              </div>
              <div className="flex justify-between py-3">
                <dt className="text-sm text-gray-500">GitHub ID</dt>
                <dd className="text-sm font-medium text-gray-900">{u.github_id || '-'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
