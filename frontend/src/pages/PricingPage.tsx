import React from 'react';

export default function PricingPage(): JSX.Element {
  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold mb-4">Pricing</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="border rounded p-4 bg-white text-gray-900">
          <div className="font-medium">Free</div>
          <ul className="text-sm list-disc ml-5 mt-2">
            <li>Basic editor</li>
            <li>AI summary and ATS checks</li>
            <li>Up to 2 PDF downloads</li>
          </ul>
        </div>
        <div className="border rounded p-4 bg-white text-gray-900">
          <div className="font-medium">Pro</div>
          <ul className="text-sm list-disc ml-5 mt-2">
            <li>Premium templates</li>
            <li>Unlimited downloads</li>
            <li>Advanced ATS tailoring</li>
          </ul>
          <button className="mt-3 px-3 py-2 rounded bg-indigo-600 text-white text-sm">Upgrade</button>
        </div>
      </div>
    </div>
  );
}


