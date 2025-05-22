"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import {
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
  userName: string;
  isDeleting: boolean;
}

export function DeleteUserModal({
  isOpen,
  onClose,
  onDelete,
  userName,
  isDeleting,
}: Readonly<DeleteUserModalProps>) {
  const t = useTranslations("admin.users");
  const commonT = useTranslations("common");

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md bg-white text-gray-400 cursor-pointer hover:text-gray-500 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:outline-hidden"
                disabled={isDeleting}
              >
                <span className="sr-only">{commonT("close")}</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
                <ExclamationTriangleIcon
                  aria-hidden="true"
                  className="size-6 text-red-600"
                />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <DialogTitle
                  as="h3"
                  className="text-base font-semibold text-gray-900"
                >
                  {t("deleteUser")}
                </DialogTitle>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {t("deleteUserConfirmation", { userName })}
                  </p>
                  <p className="mt-2 text-sm text-gray-500 font-semibold">
                    {t("deleteUserWarning")}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <Button
                variant="danger"
                onClick={onDelete}
                disabled={isDeleting}
                isLoading={isDeleting}
                className="sm:ml-3 sm:w-auto w-full"
              >
                {commonT("delete")}
              </Button>
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isDeleting}
                className="mt-3 sm:mt-0 sm:w-auto w-full"
              >
                {commonT("cancel")}
              </Button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
} 