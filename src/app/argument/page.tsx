"use client";

import { DeleteArgumentModal } from "@/components/dashboard/DeleteArgumentModal";
import AppShell from "@/components/layout/AppShell";
import { Typography } from "@/components/ui/Typography";
import { useAuth } from "@/contexts/AuthContext";
import { useToulminArguments } from "@/hooks/useArguments";
import { ToulminArgument } from "@/types/client";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { useState } from "react";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function ArgumentsPage() {
  const t = useTranslations('pages.argument');
  const commonT = useTranslations('common');
  
  const { toulminArguments, isLoading, error, deleteArgument, isDeleting } = useToulminArguments();
  const { user } = useAuth();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [argumentToDelete, setArgumentToDelete] = useState<ToulminArgument | null>(null);
  
  // Helper function to format dates
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  // Handler for opening the delete modal
  const handleOpenDeleteModal = (toulminArgument: ToulminArgument) => {
    setArgumentToDelete(toulminArgument);
    setIsDeleteModalOpen(true);
  };

  // Handler for closing the delete modal
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setArgumentToDelete(null);
  };

  // Handler for deleting the argument
  const handleDeleteArgument = async () => {
    if (!argumentToDelete?._id) return;
    
    const success = await deleteArgument(argumentToDelete._id.toString());
    
    if (success) {
      handleCloseDeleteModal();
    }
  };

  // Function to render arguments content based on state
  const renderArgumentsContent = () => {
    if (isLoading) {
      return (
        <div className="mt-4 py-8 flex justify-center">
          <Typography textColor="muted">{commonT('loading')}</Typography>
        </div>
      );
    }

    if (error) {
      return (
        <div className="mt-4 bg-red-50 p-6 rounded-lg text-center text-red-600">
          <Typography>{commonT('error')} {error}</Typography>
        </div>
      );
    }

    if (toulminArguments.length > 0) {
      return (
        <ul className="mt-4 divide-y divide-gray-100">
          {toulminArguments.map((toulminArgument: ToulminArgument) => (
            <li
              key={toulminArgument._id?.toString() ?? ''}
              className="flex items-center justify-between gap-x-6 py-5"
            >
              <div className="min-w-0">
                <div className="flex items-start gap-x-3">
                  <p className="text-sm font-semibold leading-6 text-gray-900">
                    {toulminArgument.name || `${t('diagram')} ${toulminArgument._id?.toString()?.substring(0, 8) ?? ''}`}
                  </p>
                </div>
                <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                  <p className="whitespace-nowrap">
                    {t('createdOn')}{" "}
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
                    {t('updatedOn')}{" "}
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
                    {t('author')}: {toulminArgument.author?.name ?? user?.displayName ?? t('anonymous')}
                  </p>
                </div>
              </div>
              <div className="flex flex-none items-center gap-x-4">
                <a
                  href={`/argument/view/${toulminArgument._id}`}
                  className="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block"
                >
                  <span>{t('viewDiagram')}</span>
                  <span className="sr-only">, {toulminArgument.name || ''}</span>
                </a>
                <Menu as="div" className="relative flex-none">
                  <MenuButton className="-m-2.5 block p-2.5 text-gray-500 hover:text-gray-900">
                    <span className="sr-only">{commonT('openOptions')}</span>
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
                          <span>{commonT('edit')}</span>
                          <span className="sr-only">
                            , {toulminArgument.name || `${t('diagram')} ${toulminArgument._id?.toString()?.substring(0, 8) ?? ''}`}
                          </span>
                        </a>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ active }) => (
                        <button
                          onClick={() => handleOpenDeleteModal(toulminArgument)}
                          className={classNames(
                            active ? "bg-gray-50" : "",
                            "block w-full text-left px-3 py-1 text-sm leading-6 text-gray-900"
                          )}
                        >
                          <span>{commonT('delete')}</span>
                          <span className="sr-only">
                            , {toulminArgument.name || `${t('diagram')} ${toulminArgument._id?.toString()?.substring(0, 8) ?? ''}`}
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
          {t('noArguments')}
        </Typography>
      </div>
    );
  };

  return (
    <AppShell title={t('myArguments')}>
      <div className="-mt-32">
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white px-5 py-6 shadow-sm sm:px-6">
            <div className="flex items-center justify-between">
              <Typography variant="h3">{t('myArguments')}</Typography>
            </div>
            
            {renderArgumentsContent()}
            
            {/* Delete confirmation modal */}
            <DeleteArgumentModal
              isOpen={isDeleteModalOpen}
              onClose={handleCloseDeleteModal}
              onDelete={handleDeleteArgument}
              argumentName={argumentToDelete?.name || t('untitled')}
              isDeleting={isDeleting}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
