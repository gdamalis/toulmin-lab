"use client";

import AppShell from "@/components/layout/AppShell";
import ToulminDiagram from "@/components/ToulminDiagram";
import { ToulminForm } from "@/components/ToulminForm";
import { sampleArgument } from "@/data/toulminTemplates";
import type { ToulminArgument } from "@/types/toulmin";
import { useState } from "react";

export default function ArgumentBuilder() {
  const [argument, setArgument] = useState<ToulminArgument>(sampleArgument);
  const [showDiagram, setShowDiagram] = useState(false);

  const handleFormSubmit = (data: ToulminArgument) => {
    setArgument(data);
    setShowDiagram(true);
  };

  const handleNewDiagram = () => {
    setShowDiagram(false);
  };

  return (
    <AppShell title="Argument Builder">
      <div className="-mt-32">
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white px-5 py-6 shadow-sm sm:px-6">
            {!showDiagram ? (
              <div className="overflow-hidden p-2">
                <h2 className="text-xl font-semibold mb-6">
                  Create Your Toulmin Argument
                </h2>
                <ToulminForm onSubmit={handleFormSubmit} />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="overflow-hidden p-2">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {argument.name ?? "Untitled Argument"}
                      </h2>
                      {argument.author && (
                        <p className="text-sm text-gray-500 mt-1">
                          by {argument.author}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleNewDiagram}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Edit Argument
                    </button>
                  </div>
                  <ToulminDiagram data={argument} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
