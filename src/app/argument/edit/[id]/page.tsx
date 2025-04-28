"use client";

import AppShell from "@/components/layout/AppShell";
import ToulminDiagram from "@/components/ToulminDiagram";
import { ToulminForm } from "@/components/ToulminForm";
import { ToulminArgument } from "@/types/client";
import { use, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import useNotification from "@/hooks/useNotification";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";

export default function ToulminArgumentEditor({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [toulminArgument, setToulminArgument] = useState<ToulminArgument | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const router = useRouter();

  const unwrappedParams = use(params);
  const toulminArgumentId = unwrappedParams.id;

  useEffect(() => {
    const fetchArgument = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Get the current user's ID token
        const token = await user.getIdToken();

        const response = await fetch(`/api/argument/${toulminArgumentId}`, {
          headers: {
            "user-id": user.uid,
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch argument: ${response.statusText}`);
        }

        const data = await response.json();
        setToulminArgument(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        console.error("Error fetching argument:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArgument();
  }, [toulminArgumentId, user]);

  const handleFormChange = (data: ToulminArgument) => {
    setToulminArgument(data);
  };

  const handleSave = async () => {
    // Only save if user is logged in and argument is loaded
    if (!user) {
      showError(
        "Authentication Required",
        "Please sign in to save your diagram"
      );
      return;
    }

    if (!toulminArgument) {
      showError("Error", "No argument data to save");
      return;
    }

    try {
      setIsSaving(true);

      // Get the current user's ID token
      const token = await user.getIdToken();

      // Send to the API using PUT method
      const response = await fetch(`/api/argument/${toulminArgumentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(toulminArgument),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to update diagram");
      }

      showSuccess("Success", "Diagram updated successfully!");
      
      // Redirect to the view page
      router.push(`/argument/view/${toulminArgumentId}`);
    } catch (error) {
      console.error("Error updating diagram:", error);
      showError(
        "Update Failed",
        error instanceof Error ? error.message : "Failed to update diagram"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/argument/view/${toulminArgumentId}`);
  };

  // Function to render content based on state
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Typography textColor="muted">Loading diagram...</Typography>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 p-6 rounded-lg text-center text-red-600">
          <Typography>Error: {error}</Typography>
        </div>
      );
    }

    if (!toulminArgument) {
      return (
        <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
          <Typography textColor="muted">
            Diagram not found or you don&apos;t have permission to edit it.
          </Typography>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="md:overflow-y-auto">
          <ToulminForm
            onSubmit={handleSave}
            onChange={handleFormChange}
            initialData={toulminArgument}
            buttonText="Update & View"
          />
        </div>
        <div>
          <ToulminDiagram data={toulminArgument} />
        </div>
      </div>
    );
  };

  return (
    <AppShell title={toulminArgument?.name ? `Edit: ${toulminArgument.name}` : "Edit Toulmin Argument"}>
      <div className="-mt-32">
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white px-5 py-6 shadow-sm sm:px-6">
            <div className="space-y-4 md:space-y-0">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <Button variant="outline" onClick={handleCancel} className="mb-4">
                    ← Back to View
                  </Button>
                  <h2 className="text-xl font-semibold">
                    Edit Toulmin Argument
                  </h2>
                </div>
                <div className="flex space-x-3">
                  {isSaving && (
                    <span className="text-sm text-gray-500 self-center">
                      Saving...
                    </span>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={isSaving || isLoading || !toulminArgument}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Update & View
                  </button>
                </div>
              </div>

              {!user && (
                <p className="text-sm text-amber-600 mb-4">
                  Sign in to edit your diagrams
                </p>
              )}

              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
} 