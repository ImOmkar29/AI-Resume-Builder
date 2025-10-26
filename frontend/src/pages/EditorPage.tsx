import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../store/auth';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ClassicTemplate from '../components/templates/Classic';
import ModernTemplate from '../components/templates/Modern';

type ResumeData = {
  summary: string;
  skills: string[];
  experience: string;
  education: string;
  projects?: string;
  certifications?: string;
};

export default function EditorPage(): JSX.Element {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = React.useState('Untitled Resume');
  const [data, setData] = React.useState<ResumeData>({
    summary: '',
    skills: [],
    experience: '',
    education: '',
  });
  const [jobDescription, setJobDescription] = React.useState('');
  const [ats, setAts] = React.useState<any | null>(null);
  const [template, setTemplate] = React.useState<'classic' | 'modern'>('classic');

  const { user } = useAuth();
  React.useEffect(() => {
    const local = JSON.parse(localStorage.getItem('resumes') ?? '[]');
    if (id) {
      const found = local.find((r: any) => r.id === id);
      if (found) {
        setTitle(found.title);
        setData(found.data);
      }
    }
  }, [id, user]);

  function saveLocal() {
    const local = JSON.parse(localStorage.getItem('resumes') ?? '[]');
    const resumeId = id ?? `r_${Date.now()}`;
    const updated = { id: resumeId, title, data, updatedAt: new Date().toISOString() };
    const idx = local.findIndex((r: any) => r.id === resumeId);
    if (idx >= 0) local[idx] = updated; else local.push(updated);
    localStorage.setItem('resumes', JSON.stringify(local));
    if (!id) navigate(`/editor/${resumeId}`, { replace: true });
  }

  async function calcATS() {
    const resp = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:4000'}/api/ai/ats-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary: data.summary, skills: data.skills, jobDescription }),
    });
    const json = await resp.json();
    setAts(json);
  }

  async function tailor() {
    const resp = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:4000'}/api/ai/tailor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary: data.summary, skills: data.skills, jobDescription }),
    });
    const json = await resp.json();
    setData((prev) => ({ ...prev, summary: json.summary ?? prev.summary, skills: json.skills ?? prev.skills }));
  }

  async function suggestSkills() {
    const resp = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:4000'}/api/ai/suggest-skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roleOrSummary: data.summary || title }),
    });
    const j = await resp.json();
    if (Array.isArray(j.skills)) setData((prev) => ({ ...prev, skills: Array.from(new Set([...(prev.skills || []), ...j.skills])) }));
  }

  async function downloadPDF() {
    const el = document.getElementById('resume-preview');
    if (!el) return;
    const canvas = await html2canvas(el);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
    const imgWidth = canvas.width * ratio;
    const imgHeight = canvas.height * ratio;
    const x = (pageWidth - imgWidth) / 2;
    const y = 20;
    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
    pdf.save(`${title.replace(/\s+/g, '_')}.pdf`);
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <input value={title} onChange={e => setTitle(e.target.value)} className="border rounded px-3 py-2 w-full" placeholder="Resume title" />
          <button onClick={saveLocal} className="px-3 py-2 rounded bg-blue-600 text-white text-sm">Save</button>
        </div>
        <label className="block text-sm">Summary</label>
        <textarea value={data.summary} onChange={e => setData({ ...data, summary: e.target.value })} className="border rounded p-3 w-full h-28" />
        <label className="block text-sm">Skills (comma separated)</label>
        <input value={data.skills.join(', ')} onChange={e => setData({ ...data, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className="border rounded px-3 py-2 w-full" />
        <label className="block text-sm">Experience</label>
        <textarea value={data.experience} onChange={e => setData({ ...data, experience: e.target.value })} className="border rounded p-3 w-full h-24" />
        <label className="block text-sm">Education</label>
        <textarea value={data.education} onChange={e => setData({ ...data, education: e.target.value })} className="border rounded p-3 w-full h-24" />

        <label className="block text-sm">Job Description</label>
        <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} className="border rounded p-3 w-full h-28" />
        <div className="flex gap-2">
          <button onClick={calcATS} className="px-3 py-2 rounded bg-emerald-600 text-white text-sm">Run ATS</button>
          <button onClick={tailor} className="px-3 py-2 rounded bg-indigo-600 text-white text-sm">Tailor</button>
        </div>
      </div>
      <div className="space-y-4">
        <h2 className="font-semibold">Preview</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm">Template</label>
          <select value={template} onChange={e => setTemplate(e.target.value as any)} className="border rounded px-2 py-1 text-sm">
            <option value="classic">Classic</option>
            <option value="modern">Modern</option>
          </select>
        </div>
        <div id="resume-preview" className="border rounded p-6 bg-white text-gray-900">
          {template === 'classic' ? (
            <ClassicTemplate title={title} summary={data.summary} skills={data.skills} experience={data.experience} education={data.education} />
          ) : (
            <ModernTemplate title={title} summary={data.summary} skills={data.skills} experience={data.experience} education={data.education} />
          )}
        </div>

        <div className="flex gap-2">
          <button onClick={suggestSkills} className="px-3 py-2 rounded bg-amber-600 text-white text-sm">Suggest Skills</button>
          <button onClick={downloadPDF} className="px-3 py-2 rounded bg-gray-900 text-white text-sm">Download PDF</button>
        </div>

        {ats && (
          <div className="border rounded p-4 bg-white text-gray-900">
            <div className="font-medium mb-2">ATS Result</div>
            <div className="text-sm">Score: {ats.atsScore} / 100</div>
            <div className="text-sm">Keyword Match: {ats.keywordMatchPercent}%</div>
            {Array.isArray(ats.missingSkills) && ats.missingSkills.length > 0 && (
              <div className="mt-2 text-sm">
                <div className="font-medium">Missing Skills</div>
                <div>{ats.missingSkills.join(', ')}</div>
              </div>
            )}
            {Array.isArray(ats.recommendations) && ats.recommendations.length > 0 && (
              <div className="mt-2 text-sm">
                <div className="font-medium">Recommendations</div>
                <ul className="list-disc ml-5">
                  {ats.recommendations.map((r: string, i: number) => (<li key={i}>{r}</li>))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


