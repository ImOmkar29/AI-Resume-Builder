import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { useTheme } from '../store/theme';

export default function AppShell(): JSX.Element {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { dark, toggle } = useTheme();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-semibold">AI Resume Builder</Link>
          <nav className="flex gap-4 text-sm items-center">
            <Link to="/" className={location.pathname === '/' ? 'font-semibold' : ''}>Dashboard</Link>
            <Link to="/upload">Upload</Link>
            <Link to="/pricing">Pricing</Link>
            <button onClick={toggle} className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700">
              {dark ? 'Light' : 'Dark'}
            </button>
            <div className="ml-4 flex items-center gap-3">
              {user ? (
                <>
                  <span className="text-xs text-gray-500">{user.email}</span>
                  <button className="px-2 py-1 rounded bg-gray-800 text-white text-xs" onClick={signOut}>Sign out</button>
                </>
              ) : (
                <Link to="/">Sign in</Link>
              )}
            </div>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}


