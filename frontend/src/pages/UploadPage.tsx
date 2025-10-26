import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { apiJson } from '../lib/api';

export default function UploadPage(): JSX.Element {
  const [file, setFile] = React.useState<File | null>(null);
  const [parsed, setParsed] = React.useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  async function parseFile() {
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    const resp = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:4000'}/api/upload/parse`, {
      method: 'POST',
      body: form,
    });
    const json = await resp.json();
    setParsed(json.text ?? '');
  }

  async function createFromParsed() {
    if (!user || !parsed) return;
    const initial = {
      summary: parsed.slice(0, 800),
      skills: [],
      experience: parsed.slice(0, 1200),
      education: '',
    };
    const created = await apiJson('/api/resumes', 'POST', { title: 'Imported Resume', data: initial }, { 'x-user-id': user.id });
    navigate(`/editor/${created.id}`);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Upload Resume (PDF/DOCX)</h1>
      <input type="file" accept=".pdf,.doc,.docx" onChange={e => setFile(e.target.files?.[0] ?? null)} />
      <button onClick={parseFile} disabled={!file} className="px-3 py-2 rounded bg-blue-600 text-white text-sm disabled:opacity-50">Parse</button>
      {parsed && (
        <>
          <div className="flex gap-2">
            <button onClick={createFromParsed} className="px-3 py-2 rounded bg-emerald-600 text-white text-sm">Create Resume</button>
          </div>
          <div className="border rounded p-4 whitespace-pre-wrap bg-white text-gray-900 mt-2">
            {parsed}
          </div>
        </>
      )}
    </div>
  );
}


