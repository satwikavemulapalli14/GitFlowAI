import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function Navbar({ onToggleSidebar }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  const handleSignOut = async () => {
    try {
      if (isAuthenticated) {
        await api.post('/auth/logout');
      }
    } catch {
      // ignore network errors on logout
    }
    logout();
  };

  const initial = user?.displayName?.[0] || user?.username?.[0] || 'U';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link to="/dashboard" className="text-xl font-bold text-primary-600">
          GitFlowAI
        </Link>
      </div>

      <div className="relative flex items-center gap-4">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 rounded-lg p-1 hover:bg-gray-100"
        >
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.displayName || user.username}
              className="h-9 w-9 rounded-full"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
              {initial}
            </div>
          )}
          {user && (
            <span className="hidden text-sm font-medium text-gray-700 md:inline">
              {user.displayName || user.username}
            </span>
          )}
        </button>

        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
            <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <Link
                to="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setDropdownOpen(false)}
              >
                Profile
              </Link>
              <Link
                to="/settings"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setDropdownOpen(false)}
              >
                Settings
              </Link>
              <hr className="my-1 border-gray-200" />
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
              >
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
