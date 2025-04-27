"use client";

import { useState } from "react";
import { ToulminForm } from "@/components/ToulminForm";
import ToulminDiagram from "@/components/ToulminDiagram";
import type { ToulminArgument } from "@/types/toulmin";
import AppShell from "@/components/layout/AppShell";

// Sample data for initial demo
const sampleArgument: ToulminArgument = {
  claim: "We should implement renewable energy sources",
  grounds: "Fossil fuels are depleting and causing climate change",
  groundsBacking:
    "Scientific studies show global temperature rising due to CO2 emissions",
  warrant: "Renewable energy is sustainable and reduces carbon emissions",
  warrantBacking:
    "Wind and solar power produce zero emissions during operation",
  qualifier: "In most developed countries",
  rebuttal: "Unless the infrastructure costs prove prohibitively expensive",
};

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
                <ToulminForm onSubmit={handleFormSubmit} initialData={argument} />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="overflow-hidden p-2">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">
                      Your Toulmin Diagram
                    </h2>
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