'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ToulminForm } from '@/components/ToulminForm';
import { ToulminDiagram } from '@/components/ToulminDiagram';
import type { ToulminArgument } from '@/types/toulmin';
import { useAuth } from '@/contexts/AuthContext';

// Sample data for initial demo
const sampleArgument: ToulminArgument = {
  claim: 'We should implement renewable energy sources',
  grounds: 'Fossil fuels are depleting and causing climate change',
  groundsBacking: 'Scientific studies show global temperature rising due to CO2 emissions',
  warrant: 'Renewable energy is sustainable and reduces carbon emissions',
  warrantBacking: 'Wind and solar power produce zero emissions during operation',
  qualifier: 'In most developed countries',
  rebuttal: 'Unless the infrastructure costs prove prohibitively expensive',
};

export default function Dashboard() {
  const [argument, setArgument] = useState<ToulminArgument>(sampleArgument);
  const [showDiagram, setShowDiagram] = useState(false);
  const { signOutUser } = useAuth();
  const router = useRouter();

  const handleFormSubmit = (data: ToulminArgument) => {
    setArgument(data);
    setShowDiagram(true);
  };

  const handleNewDiagram = () => {
    setShowDiagram(false);
  };

  const handleSignOut = async () => {
    await signOutUser();
    router.push('/');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Toulmin Diagram Builder</h1>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!showDiagram ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Create Your Toulmin Argument</h2>
              <ToulminForm onSubmit={handleFormSubmit} initialData={argument} />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Your Toulmin Diagram</h2>
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
        </main>
      </div>
    </ProtectedRoute>
  );
} 