import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './styles.css';
import AppShell from './shell/AppShell';
import AuthPage from './pages/AuthPage';
import { useAuth } from './store/auth';
import { isSupabaseConfigured } from './lib/supabaseClient';
import DashboardPage from './pages/DashboardPage';
import EditorPage from './pages/EditorPage';
import UploadPage from './pages/UploadPage';
import PricingPage from './pages/PricingPage';

function withAuth(element: JSX.Element): JSX.Element {
  // Simple route guard wrapper
  const Guard = () => {
    const { user, loading, init } = useAuth();
    React.useEffect(() => { if (isSupabaseConfigured()) init(); else { /* no auth gating */ } }, [init]);
    if (!isSupabaseConfigured()) return element;
    if (loading) return <div>Loading...</div>;
    if (!user) return <AuthPage />;
    return element;
  };
  return <Guard />;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: withAuth(<DashboardPage />) },
      { path: 'editor/:id?', element: withAuth(<EditorPage />) },
      { path: 'upload', element: withAuth(<UploadPage />) },
      { path: 'pricing', element: <PricingPage /> },
    ],
  },
]);

const root = createRoot(document.getElementById('root')!);
root.render(<RouterProvider router={router} />);


