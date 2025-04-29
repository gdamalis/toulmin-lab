"use client";

import useNotification from "@/hooks/useNotification";

export default function NotificationExample() {
  const { showSuccess, showError, showInfo, showWarning } = useNotification();

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <button
        onClick={() =>
          showSuccess("Success", "Your action was completed successfully.")
        }
        className="rounded-md bg-green-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
      >
        Show Success
      </button>

      <button
        onClick={() =>
          showError("Error", "There was a problem processing your request.")
        }
        className="rounded-md bg-red-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
      >
        Show Error
      </button>

      <button
        onClick={() =>
          showInfo("Information", "Here's something you might want to know.")
        }
        className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
      >
        Show Info
      </button>

      <button
        onClick={() =>
          showWarning("Warning", "Be careful, this action has consequences.")
        }
        className="rounded-md bg-amber-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
      >
        Show Warning
      </button>
    </div>
  );
}
