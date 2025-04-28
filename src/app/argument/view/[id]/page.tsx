"use client";

import AppShell from "@/components/layout/AppShell";
import ToulminDiagram from "@/components/ToulminDiagram";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useAuth } from "@/contexts/AuthContext";
import { ToulminArgument } from "@/types/client";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

export default function ToulminArgumentViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [toulminArgument, setToulminArgument] =
    useState<ToulminArgument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const unwrappedParams = use(params);
  const toulminArgumentId = unwrappedParams.id;

  useEffect(() => {
    const fetchDiagram = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/argument/${toulminArgumentId}`, {
          headers: {
            "user-id": user.uid,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch diagram: ${response.statusText}`);
        }

        const data = await response.json();
        setToulminArgument(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        console.error("Error fetching diagram:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiagram();
  }, [toulminArgumentId, user]);

  const handleEdit = () => {
    router.push(`/argument-builder/${toulminArgumentId}`);
  };

  const handleBack = () => {
    router.push("/dashboard");
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

    if (toulminArgument) {
      return (
        <div className="mt-6">
          <ToulminDiagram data={toulminArgument} />
        </div>
      );
    }

    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
        <Typography textColor="muted">
          Diagram not found or you don&apos;t have permission to view it.
        </Typography>
      </div>
    );
  };

  return (
    <AppShell title={toulminArgument?.name || "ToulminArgument Diagram"}>
      <div className="-mt-32">
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white px-5 py-6 shadow-sm sm:px-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <Button variant="outline" onClick={handleBack} className="mb-4">
                  ← Back to Dashboard
                </Button>
                <Typography variant="h2">
                  {toulminArgument?.name ||
                    `Diagram ${toulminArgumentId.substring(0, 8)}`}
                </Typography>
                {toulminArgument && (
                  <Typography textColor="muted" className="mt-1">
                    Last updated:{" "}
                    {new Date(toulminArgument.updatedAt).toLocaleString()}
                  </Typography>
                )}
              </div>
              <Button onClick={handleEdit}>Edit Diagram</Button>
            </div>

            {renderContent()}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
