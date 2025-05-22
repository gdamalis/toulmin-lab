"use client";

import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useAddUser } from "@/hooks/useAddUser";
import { UserFormData } from "@/types/client";
import { Role, getAllRoles } from "@/types/roles";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserFormData, password: string | null) => void;
}

export function AddUserModal({
  isOpen,
  onClose,
  onSuccess,
}: Readonly<AddUserModalProps>) {
  const t = useTranslations("admin.users");
  const commonT = useTranslations("common");
  const cancelButtonRef = useRef(null);
  const { addUser, isAdding } = useAddUser();

  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    password: string;
    role: Role;
  }>({
    name: "",
    email: "",
    password: "",
    role: Role.USER,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: Role.USER,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert the empty password string to undefined so a random one will be generated
    const userData = {
      ...formData,
      password: formData.password.trim() || undefined
    };
    
    const result = await addUser(userData);
    if (result.success) {
      // Pass the user data and temporary password to parent component
      onSuccess(formData, result.temporaryPassword);
      resetForm();
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const roles = getAllRoles();

  // Get input class names for consistent styling
  const getInputClasses = () => {
    return "block w-full rounded-md bg-white px-3 py-1.5 text-base outline-1 -outline-offset-1 sm:text-sm/6 text-gray-900 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-primary-600";
  };

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
                onClick={handleClose}
                className="rounded-md bg-white text-gray-400 cursor-pointer hover:text-gray-500 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:outline-hidden"
                disabled={isAdding}
              >
                <span className="sr-only">{commonT("close")}</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>
            
            <div className="sm:flex sm:items-start">
              <div className="mt-3 w-full sm:mt-0 sm:text-left">
                <DialogTitle
                  as="h3"
                  className="text-base font-semibold leading-6 text-gray-900"
                >
                  {t("addUser")}
                </DialogTitle>
                
                <form onSubmit={handleSubmit} className="mt-6">
                  <div className="space-y-5">
                    <div>
                      <label htmlFor="name" className="block text-sm/6 font-medium text-gray-900">
                        <Typography variant="body-sm" className="font-medium">
                          {t("name")}
                          <span className="text-red-500 ml-1">*</span>
                        </Typography>
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={getInputClasses()}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                        <Typography variant="body-sm" className="font-medium">
                          {t("email")}
                          <span className="text-red-500 ml-1">*</span>
                        </Typography>
                      </label>
                      <div className="mt-2">
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={getInputClasses()}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                        <Typography variant="body-sm" className="font-medium">
                          {t("password")}
                          <span className="text-gray-500 text-xs ml-2">({t("passwordHint")})</span>
                        </Typography>
                      </label>
                      <div className="mt-2">
                        <input
                          type="password"
                          name="password"
                          id="password"
                          value={formData.password}
                          onChange={handleChange}
                          className={getInputClasses()}
                          placeholder={t("passwordPlaceholder")}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="role" className="block text-sm/6 font-medium text-gray-900">
                        <Typography variant="body-sm" className="font-medium">
                          {t("role")}
                        </Typography>
                      </label>
                      <div className="mt-2">
                        <select
                          id="role"
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          className={getInputClasses()}
                        >
                          {roles.map((role) => (
                            <option key={role} value={role}>
                              {t(`roles.${role}`)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 sm:flex sm:flex-row-reverse">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isAdding}
                      isLoading={isAdding}
                      className="sm:ml-3 sm:w-auto w-full"
                    >
                      {t("add")}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleClose}
                      disabled={isAdding}
                      className="mt-3 sm:mt-0 sm:w-auto w-full"
                      ref={cancelButtonRef}
                    >
                      {commonT("cancel")}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
} 