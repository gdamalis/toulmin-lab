"use client";

import { useAuth } from "@/contexts/AuthContext";
import { emptyToulminArgument, sampleToulminArgument } from "@/data/toulminTemplates";
import { ToulminArgument } from "@/types/client";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

interface ToulminFormProps {
  readonly onSubmit: (data: ToulminArgument) => void;
}

export function ToulminForm({ onSubmit }: Readonly<ToulminFormProps>) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ToulminArgument>(emptyToulminArgument);

  // Autopopulate author field with user's name when user data is available
  useEffect(() => {
    if (user && formData.author.name === "") {
      // Get user's display name or use email if name not available
      const userName = user.displayName ?? user.email?.split("@")[0] ?? "";
      setFormData((prev) => ({ 
        ...prev, 
        author: { 
          ...prev.author,
          name: userName, 
          userId: user.uid 
        } 
      }));
    }
  }, [user, formData.author.name]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === "name") {
      setFormData((prev) => ({ ...prev, name: value }));
    } else if (name === "author") {
      setFormData((prev) => ({ 
        ...prev, 
        author: { 
          ...prev.author,
          name: value 
        } 
      }));
    } else {
      // Handle parts structure
      setFormData((prev) => ({ 
        ...prev, 
        parts: { 
          ...prev.parts, 
          [name]: value 
        } 
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base/7 font-semibold text-gray-900">
                Diagram Details
              </h2>
              <p className="mt-1 text-sm/6 text-gray-600">
                Provide basic information about your argument diagram.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData(sampleToulminArgument)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              title="Load sample argument"
            >
              <DocumentDuplicateIcon className="w-4 h-4" />
              <span>Use Sample</span>
            </button>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label
                htmlFor="name"
                className="block text-sm/6 font-medium text-gray-900"
              >
                ToulminArgument Name
              </label>
              <div className="mt-2">
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Climate Change Policy ToulminArgument"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="author"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Author
              </label>
              <div className="mt-2">
                <input
                  id="author"
                  name="author"
                  type="text"
                  value={formData.author.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Your name"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base/7 font-semibold text-gray-900">
            Toulmin Argument Structure
          </h2>
          <p className="mt-1 text-sm/6 text-gray-600">
            Complete the fields below to build your logical argument using the
            Toulmin model.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full">
              <label
                htmlFor="claim"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Claim (Conclusion)
              </label>
              <div className="mt-2">
                <textarea
                  id="claim"
                  name="claim"
                  value={formData.parts.claim}
                  onChange={handleInputChange}
                  rows={2}
                  required
                  placeholder="What are you trying to prove?"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div className="col-span-full">
              <label
                htmlFor="grounds"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Grounds (Data)
              </label>
              <div className="mt-2">
                <textarea
                  id="grounds"
                  name="grounds"
                  value={formData.parts.grounds}
                  onChange={handleInputChange}
                  rows={2}
                  required
                  placeholder="What evidence supports your claim?"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div className="col-span-full">
              <label
                htmlFor="groundsBacking"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Backing for Grounds
              </label>
              <div className="mt-2">
                <textarea
                  id="groundsBacking"
                  name="groundsBacking"
                  value={formData.parts.groundsBacking}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Why is this evidence credible?"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base/7 font-semibold text-gray-900">
            Reasoning & Justification
          </h2>
          <p className="mt-1 text-sm/6 text-gray-600">
            Connect your evidence to your claim through logical reasoning.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full">
              <label
                htmlFor="warrant"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Warrant (Justification)
              </label>
              <div className="mt-2">
                <textarea
                  id="warrant"
                  name="warrant"
                  value={formData.parts.warrant}
                  onChange={handleInputChange}
                  rows={2}
                  required
                  placeholder="How does your evidence connect to your claim?"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div className="col-span-full">
              <label
                htmlFor="warrantBacking"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Backing for Warrant
              </label>
              <div className="mt-2">
                <textarea
                  id="warrantBacking"
                  name="warrantBacking"
                  value={formData.parts.warrantBacking}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Why is this logical connection valid?"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base/7 font-semibold text-gray-900">
            Limitations & Challenges
          </h2>
          <p className="mt-1 text-sm/6 text-gray-600">
            Acknowledge the scope and potential objections to your toulminArgument
          </p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label
                htmlFor="qualifier"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Qualifier (Modality)
              </label>
              <div className="mt-2">
                <textarea
                  id="qualifier"
                  name="qualifier"
                  value={formData.parts.qualifier}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Under what circumstances is your claim true? (e.g., 'usually', 'sometimes')"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="rebuttal"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Rebuttal (Objections)
              </label>
              <div className="mt-2">
                <textarea
                  id="rebuttal"
                  name="rebuttal"
                  value={formData.parts.rebuttal}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="When would your claim not hold true?"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="button"
          className="text-sm/6 font-semibold text-gray-900"
          onClick={() => setFormData(emptyToulminArgument)}
        >
          Clear
        </button>
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Generate Diagram
        </button>
      </div>
    </form>
  );
}
