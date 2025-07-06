"use client";

import { QuickArgumentGenerator } from "@/components/dashboard";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Quick AI Generator Section */}
      <div className="max-w-4xl mx-auto">
        <QuickArgumentGenerator />
      </div>
    </div>
  );
}
