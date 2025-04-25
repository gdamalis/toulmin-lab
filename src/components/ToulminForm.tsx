'use client';

import { useState } from 'react';
import type { ToulminArgument } from '@/types/toulmin';

interface ToulminFormProps {
  readonly onSubmit: (data: ToulminArgument) => void;
  readonly initialData?: ToulminArgument;
}

const emptyArgument: ToulminArgument = {
  claim: '',
  grounds: '',
  groundsBacking: '',
  warrant: '',
  warrantBacking: '',
  qualifier: '',
  rebuttal: '',
};

export function ToulminForm({ onSubmit, initialData = emptyArgument }: ToulminFormProps) {
  const [formData, setFormData] = useState<ToulminArgument>(initialData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="claim" className="block text-sm font-medium">
          Claim (Conclusion)
        </label>
        <textarea
          id="claim"
          name="claim"
          value={formData.claim}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="What are you trying to prove?"
          rows={2}
          required
        />
      </div>

      <div>
        <label htmlFor="grounds" className="block text-sm font-medium">
          Grounds (Data)
        </label>
        <textarea
          id="grounds"
          name="grounds"
          value={formData.grounds}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="What evidence supports your claim?"
          rows={2}
          required
        />
      </div>

      <div>
        <label htmlFor="groundsBacking" className="block text-sm font-medium">
          Backing for Grounds
        </label>
        <textarea
          id="groundsBacking"
          name="groundsBacking"
          value={formData.groundsBacking}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Why is this evidence credible?"
          rows={2}
        />
      </div>

      <div>
        <label htmlFor="warrant" className="block text-sm font-medium">
          Warrant (Justification)
        </label>
        <textarea
          id="warrant"
          name="warrant"
          value={formData.warrant}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="How does your evidence connect to your claim?"
          rows={2}
          required
        />
      </div>

      <div>
        <label htmlFor="warrantBacking" className="block text-sm font-medium">
          Backing for Warrant
        </label>
        <textarea
          id="warrantBacking"
          name="warrantBacking"
          value={formData.warrantBacking}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Why is this logical connection valid?"
          rows={2}
        />
      </div>

      <div>
        <label htmlFor="qualifier" className="block text-sm font-medium">
          Qualifier (Modality)
        </label>
        <textarea
          id="qualifier"
          name="qualifier"
          value={formData.qualifier}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Under what circumstances is your claim true? (e.g., 'usually', 'sometimes')"
          rows={2}
        />
      </div>

      <div>
        <label htmlFor="rebuttal" className="block text-sm font-medium">
          Rebuttal (Objections)
        </label>
        <textarea
          id="rebuttal"
          name="rebuttal"
          value={formData.rebuttal}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="When would your claim not hold true?"
          rows={2}
        />
      </div>

      <div>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Generate Diagram
        </button>
      </div>
    </form>
  );
} 