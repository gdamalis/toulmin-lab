"use client";

import { useState, ReactNode } from "react";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { PageHeader } from "./PageHeader";

interface AppShellProps {
  readonly children: ReactNode;
  readonly title: string;
}

export default function AppShell({ children, title }: Readonly<AppShellProps>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div>
      {/* Mobile navigation */}
      <MobileNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-58 lg:flex-col">
        <Sidebar />
      </div>

      <div className="lg:pl-58">
        {/* Top navigation */}
        <TopBar setSidebarOpen={setSidebarOpen} />

        {/* Main content */}
        <main className="py-10">
          <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
            {/* Page header */}
            <PageHeader title={title} />
            
            {/* Page content */}
            <div className="mt-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
