import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiGet, apiJson } from '../lib/api';
import { useAuth } from '../store/auth';

export default function DashboardPage(): JSX.Element {
  const [resumes, setResumes] = React.useState<Array<{ id: string; title: string; updatedAt: string }>>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  async function load() {
    const json = await apiGet('/api/resumes', { 'x-user-id': user!.id });
    setResumes(json.resumes);
  }

  React.useEffect(() => {
    if (user) { void load(); }
  }, [user]);

  async function createNew() {
    const created = await apiJson('/api/resumes', 'POST', { title: 'Untitled Resume', data: {} }, { 'x-user-id': user!.id });
    navigate(`/editor/${created.id}`);
  }

  async function remove(id: string) {
    await apiJson(`/api/resumes/${id}`, 'DELETE', undefined, { 'x-user-id': user!.id });
    void load();
  }

  async function duplicate(id: string) {
    const original = resumes.find(r => r.id === id);
    if (!original) return;
    // Fetch full data from editor list endpoint if needed; here we reuse minimal fields
    const created = await apiJson('/api/resumes', 'POST', { title: `${original.title} Copy`, data: {} }, { 'x-user-id': user!.id });
    navigate(`/editor/${created.id}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Your Resumes</h1>
        <button onClick={createNew} className="px-3 py-2 rounded bg-blue-600 text-white text-sm">New Resume</button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {resumes.map(r => (
          <div key={r.id} className="border rounded p-4 hover:shadow">
            <Link to={`/editor/${r.id}`} className="font-medium block">{r.title}</Link>
            <div className="text-xs text-gray-500">Updated {new Date(r.updatedAt).toLocaleString()}</div>
            <div className="mt-2 flex gap-2">
              <Link to={`/editor/${r.id}`} className="text-xs px-2 py-1 rounded bg-gray-200">Edit</Link>
              <button onClick={() => duplicate(r.id)} className="text-xs px-2 py-1 rounded bg-indigo-600 text-white">Duplicate</button>
              <button onClick={() => remove(r.id)} className="text-xs px-2 py-1 rounded bg-red-600 text-white">Delete</button>
            </div>
          </div>
        ))}
        {resumes.length === 0 && (
          <div className="text-sm text-gray-500">No resumes yet. Create your first one.</div>
        )}
      </div>
    </div>
  );
}


