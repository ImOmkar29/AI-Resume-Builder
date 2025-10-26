import React from 'react';

type Props = {
  title: string;
  summary: string;
  skills: string[];
  experience: string;
  education: string;
};

export default function ClassicTemplate({ title, summary, skills, experience, education }: Props): JSX.Element {
  return (
    <div className="text-gray-900 print:text-black">
      <div className="text-2xl font-semibold tracking-tight">{title}</div>
      <hr className="my-3" />
      <section className="mb-4">
        <div className="uppercase text-xs font-semibold text-gray-600">Professional Summary</div>
        <p className="mt-1 whitespace-pre-wrap leading-relaxed">{summary}</p>
      </section>
      <section className="mb-4">
        <div className="uppercase text-xs font-semibold text-gray-600">Skills</div>
        <div className="mt-1 text-sm">{skills.join(', ')}</div>
      </section>
      <section className="mb-4">
        <div className="uppercase text-xs font-semibold text-gray-600">Experience</div>
        <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{experience}</p>
      </section>
      <section className="mb-4">
        <div className="uppercase text-xs font-semibold text-gray-600">Education</div>
        <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{education}</p>
      </section>
    </div>
  );
}


