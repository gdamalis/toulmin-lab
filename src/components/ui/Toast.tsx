"use client";

import { Transition } from "@headlessui/react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import type {
  Notification,
  NotificationType,
} from "@/contexts/NotificationContext";

interface ToastProps {
  notification: Notification;
  onClose: () => void;
}

export default function Toast({ notification, onClose }: Readonly<ToastProps>) {
  const [show, setShow] = useState(true);

  const handleClose = () => {
    setShow(false);

    // Give time for transition to complete
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "success":
        return (
          <CheckCircleIcon
            aria-hidden="true"
            className="h-6 w-6 text-green-400"
          />
        );
      case "error":
        return (
          <ExclamationCircleIcon
            aria-hidden="true"
            className="h-6 w-6 text-red-400"
          />
        );
      case "warning":
        return (
          <ExclamationTriangleIcon
            aria-hidden="true"
            className="h-6 w-6 text-amber-400"
          />
        );
      case "info":
        return (
          <InformationCircleIcon
            aria-hidden="true"
            className="h-6 w-6 text-blue-400"
          />
        );
    }
  };

  return (
    <Transition
      show={show}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5">
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">{getIcon(notification.type)}</div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium text-gray-900">
                {notification.title}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {notification.message}
              </p>
            </div>
            <div className="ml-4 flex flex-shrink-0">
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span className="sr-only">Close</span>
                <XMarkIcon aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
}
