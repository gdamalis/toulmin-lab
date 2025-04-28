"use client";

import AppShell from "@/components/layout/AppShell";
import ToulminDiagram from "@/components/ToulminDiagram";
import { ToulminForm } from "@/components/ToulminForm";
import { sampleToulminArgument } from "@/data/toulminTemplates";
import { ToulminArgument } from "@/types/client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import useNotification from "@/hooks/useNotification";

export default function ToulminArgumentBuilder() {
  const [toulminArgument, setToulminArgument] = useState<ToulminArgument>(sampleToulminArgument);
  const [showDiagram, setShowDiagram] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const handleFormSubmit = async (data: ToulminArgument) => {
    setToulminArgument(data);
    setShowDiagram(true);

    // If user is logged in, save to database
    if (user) {
      try {
        setIsSaving(true);

        // Get the current user's ID token
        const token = await user.getIdToken();

        // Send to the API
        const response = await fetch("/api/argument/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error ?? "Failed to save diagram");
        }

        showSuccess("Success", "Diagram saved successfully!");
      } catch (error) {
        console.error("Error saving diagram:", error);
        showError(
          "Save Failed",
          error instanceof Error ? error.message : "Failed to save diagram"
        );
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleNewDiagram = () => {
    setShowDiagram(false);
  };

  return (
    <AppShell title="ToulminArgument Builder">
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
                        {toulminArgument.name ?? "Untitled ToulminArgument"}
                      </h2>
                      {toulminArgument.author && (
                        <p className="text-sm text-gray-500 mt-1">
                          by {toulminArgument.author.name}
                        </p>
                      )}
                      {!user && (
                        <p className="text-sm text-amber-600 mt-2">
                          Sign in to save your diagrams
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-3">
                      {isSaving && (
                        <span className="text-sm text-gray-500 self-center">
                          Saving...
                        </span>
                      )}
                      <button
                        onClick={handleNewDiagram}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Edit ToulminArgument
                      </button>
                    </div>
                  </div>
                  <ToulminDiagram data={toulminArgument} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
