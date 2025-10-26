import React from 'react';

type Props = {
  title: string;
  summary: string;
  skills: string[];
  experience: string;
  education: string;
};

export default function ModernTemplate({ title, summary, skills, experience, education }: Props): JSX.Element {
  return (
    <div className="text-gray-900 print:text-black">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-3xl font-bold tracking-tight">{title}</div>
          <div className="h-1 w-20 bg-indigo-600 mt-2" />
        </div>
        <div className="text-xs text-gray-500">Generated with AI</div>
      </div>
      <section className="mt-4 grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div>
            <div className="uppercase text-xs font-semibold text-gray-600">Summary</div>
            <p className="mt-1 whitespace-pre-wrap leading-relaxed">{summary}</p>
          </div>
          <div>
            <div className="uppercase text-xs font-semibold text-gray-600">Experience</div>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{experience}</p>
          </div>
          <div>
            <div className="uppercase text-xs font-semibold text-gray-600">Education</div>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{education}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <div className="uppercase text-xs font-semibold text-gray-600">Skills</div>
            <ul className="mt-1 text-sm list-disc ml-5">
              {skills.map((s, i) => (<li key={i}>{s}</li>))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}


