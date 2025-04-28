"use client";

import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { ToulminArgument } from "@/types/client";
import { useToulminArguments } from "@/hooks/useArguments";

interface RecentDiagramsProps {
  limit?: number;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export function RecentDiagrams({ limit = 4 }: Readonly<RecentDiagramsProps>) {
  const { toulminArguments, isLoading, error } = useToulminArguments();
  const { user } = useAuth();
  
  // Take only the most recent diagrams up to the limit
  const recentToulminArguments = toulminArguments.slice(0, limit);

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  // Function to render diagram content based on state
  const renderDiagramContent = () => {
    if (isLoading) {
      return (
        <div className="mt-4 py-8 flex justify-center">
          <Typography textColor="muted">Loading diagrams...</Typography>
        </div>
      );
    }

    if (error) {
      return (
        <div className="mt-4 bg-red-50 p-6 rounded-lg text-center text-red-600">
          <Typography>Error loading diagrams: {error}</Typography>
        </div>
      );
    }

    if (recentToulminArguments.length > 0) {
      return (
        <ul className="mt-4 divide-y divide-gray-100">
          {recentToulminArguments.map((toulminArgument: ToulminArgument) => (
            <li
              key={toulminArgument._id?.toString() ?? ''}
              className="flex items-center justify-between gap-x-6 py-5"
            >
              <div className="min-w-0">
                <div className="flex items-start gap-x-3">
                  <p className="text-sm font-semibold leading-6 text-gray-900">
                    {toulminArgument.name || `Diagram ${toulminArgument._id?.toString()?.substring(0, 8) ?? ''}`}
                  </p>
                </div>
                <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                  <p className="whitespace-nowrap">
                    Created on{" "}
                    <time dateTime={toulminArgument.createdAt.toString()}>
                      {formatDate(toulminArgument.createdAt.toString())}
                    </time>
                  </p>
                  <svg
                    viewBox="0 0 2 2"
                    className="h-0.5 w-0.5 fill-current"
                  >
                    <circle cx={1} cy={1} r={1} />
                  </svg>
                  <p className="whitespace-nowrap">
                    Updated on{" "}
                    <time dateTime={toulminArgument.updatedAt.toString()}>
                      {formatDate(toulminArgument.updatedAt.toString())}
                    </time>
                  </p>
                  <svg
                    viewBox="0 0 2 2"
                    className="h-0.5 w-0.5 fill-current"
                  >
                    <circle cx={1} cy={1} r={1} />
                  </svg>
                  <p className="truncate">
                    Author: {toulminArgument.author?.name ?? user?.displayName ?? 'Anonymous'}
                  </p>
                </div>
              </div>
              <div className="flex flex-none items-center gap-x-4">
                <a
                  href={`/argument/view/${toulminArgument._id}`}
                  className="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block"
                >
                  <span>View diagram</span>
                  <span className="sr-only">, {toulminArgument.name || ''}</span>
                </a>
                <Menu as="div" className="relative flex-none">
                  <MenuButton className="-m-2.5 block p-2.5 text-gray-500 hover:text-gray-900">
                    <span className="sr-only">Open options</span>
                    <EllipsisVerticalIcon
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </MenuButton>
                  <MenuItems className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                    <MenuItem>
                      {({ active }) => (
                        <a
                          href={`/argument/edit/${toulminArgument._id}`}
                          className={classNames(
                            active ? "bg-gray-50" : "",
                            "block px-3 py-1 text-sm leading-6 text-gray-900"
                          )}
                        >
                          <span>Edit</span>
                          <span className="sr-only">
                            , {toulminArgument.name || `Diagram ${toulminArgument._id?.toString()?.substring(0, 8) ?? ''}`}
                          </span>
                        </a>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ active }) => (
                        <button
                          onClick={() => {
                            // Handle delete logic
                            console.log(`Delete diagram ${toulminArgument._id}`);
                          }}
                          className={classNames(
                            active ? "bg-gray-50" : "",
                            "block w-full text-left px-3 py-1 text-sm leading-6 text-gray-900"
                          )}
                        >
                          <span>Delete</span>
                          <span className="sr-only">
                            , {toulminArgument.name || `Diagram ${toulminArgument._id?.toString()?.substring(0, 8) ?? ''}`}
                          </span>
                        </button>
                      )}
                    </MenuItem>
                  </MenuItems>
                </Menu>
              </div>
            </li>
          ))}
        </ul>
      );
    }

    return (
      <div className="mt-4 bg-gray-50 p-6 rounded-lg text-center text-gray-500">
        <Typography textColor="muted">
          No recent activity to display. Create your first diagram to
          get started.
        </Typography>
      </div>
    );
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <Typography variant="h3">Recent Activity</Typography>
        <Button href="/argument/create">Create New Diagram</Button>
      </div>
      
      {renderDiagramContent()}
    </div>
  );
} 