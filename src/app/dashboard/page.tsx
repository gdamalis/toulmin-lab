"use client";

import AppShell from "@/components/layout/AppShell";
import { 
  ChartBarIcon, 
  UsersIcon, 
  DocumentTextIcon 
} from '@heroicons/react/24/outline';

// Mock data for the dashboard
const mockStats = {
  totalDiagrams: 128,
  totalUsers: 42,
  highestWordCountDiagram: {
    title: "Climate Change Policy Analysis",
    wordCount: 872,
    author: "Jane Smith",
    date: "2023-05-15",
  }
};

export default function Dashboard() {
  return (
    <AppShell title="Dashboard">
      <div className="-mt-32">
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white px-5 py-6 shadow-sm sm:px-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Analytics Overview</h2>
            
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* Total Diagrams Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ChartBarIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Diagrams
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            {mockStats.totalDiagrams}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <a
                      href="/dashboard/diagrams"
                      className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      View all
                    </a>
                  </div>
                </div>
              </div>

              {/* Total Users Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <UsersIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Active Users
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            {mockStats.totalUsers}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <a
                      href="/dashboard/users"
                      className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      View details
                    </a>
                  </div>
                </div>
              </div>

              {/* Highest Word Count Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <DocumentTextIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Largest Diagram
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            {mockStats.highestWordCountDiagram.wordCount} words
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {mockStats.highestWordCountDiagram.title}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <a
                      href={`/dashboard/diagrams/${encodeURIComponent(mockStats.highestWordCountDiagram.title)}`}
                      className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      View diagram
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                <a 
                  href="/dashboard/argument-builder" 
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Create New Diagram
                </a>
              </div>
              <div className="mt-4 bg-gray-50 p-6 rounded-lg text-center text-gray-500">
                No recent activity to display. Create your first diagram to get started.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
