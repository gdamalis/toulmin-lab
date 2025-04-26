"use client";

import AppShell from "@/components/layout/AppShell";
import { 
  ChartBarIcon, 
  UsersIcon, 
  DocumentTextIcon 
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

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
            <Typography variant="h3" className="mb-6">Analytics Overview</Typography>
            
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* Total Diagrams Card */}
              <Card>
                <CardContent>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ChartBarIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <Typography variant="body2" textColor="muted" className="truncate">
                        Total Diagrams
                      </Typography>
                      <Typography variant="h3">
                        {mockStats.totalDiagrams}
                      </Typography>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link
                    href="/dashboard/diagrams"
                    className="font-medium text-indigo-600 hover:text-indigo-500 text-sm"
                  >
                    View all
                  </Link>
                </CardFooter>
              </Card>

              {/* Total Users Card */}
              <Card>
                <CardContent>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <UsersIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <Typography variant="body2" textColor="muted" className="truncate">
                        Active Users
                      </Typography>
                      <Typography variant="h3">
                        {mockStats.totalUsers}
                      </Typography>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link
                    href="/dashboard/users"
                    className="font-medium text-indigo-600 hover:text-indigo-500 text-sm"
                  >
                    View details
                  </Link>
                </CardFooter>
              </Card>

              {/* Highest Word Count Card */}
              <Card>
                <CardContent>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <DocumentTextIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <Typography variant="body2" textColor="muted" className="truncate">
                        Largest Diagram
                      </Typography>
                      <Typography variant="h3">
                        {mockStats.highestWordCountDiagram.wordCount} words
                      </Typography>
                      <Typography variant="body2" textColor="muted" className="mt-1">
                        {mockStats.highestWordCountDiagram.title}
                      </Typography>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link
                    href={`/dashboard/diagrams/${encodeURIComponent(mockStats.highestWordCountDiagram.title)}`}
                    className="font-medium text-indigo-600 hover:text-indigo-500 text-sm"
                  >
                    View diagram
                  </Link>
                </CardFooter>
              </Card>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between">
                <Typography variant="h3">Recent Activity</Typography>
                <Button 
                  href="/argument-builder"
                >
                  Create New Diagram
                </Button>
              </div>
              <div className="mt-4 bg-gray-50 p-6 rounded-lg text-center text-gray-500">
                <Typography textColor="muted">
                  No recent activity to display. Create your first diagram to get started.
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
