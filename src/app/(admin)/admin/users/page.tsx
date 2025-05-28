"use client";

import {
  AddUserModal,
  DeleteUserModal,
  EditUserModal,
  UsersList,
} from "@/components/admin";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { useUsers } from "@/hooks/useUsers";
import { User, UserFormData } from "@/types/client";
import {
  ArrowPathIcon,
  ClipboardDocumentIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function UsersManagement() {
  const t = useTranslations("admin.users");

  const {
    users,
    isLoading,
    error,
    deleteUser,
    updateUser,
    isDeleting,
    isUpdating,
    refreshUsers,
  } = useUsers();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // State for tracking temporary password from user creation
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [newUser, setNewUser] = useState<UserFormData | null>(null);

  // Delete user handlers
  const handleOpenDeleteModal = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete?.userId) return;
    const success = await deleteUser(userToDelete.userId);
    if (success) handleCloseDeleteModal();
  };

  // Edit user handlers
  const handleOpenEditModal = (user: User) => {
    setUserToEdit(user);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setUserToEdit(null);
  };

  const handleUpdateUser = async (userData: Partial<User>) => {
    if (!userToEdit?.userId) return false;
    return await updateUser(userToEdit.userId, userData);
  };

  // Add user handlers
  const handleOpenAddModal = () => {
    // Clear any existing temp password when opening modal
    setTempPassword(null);
    setNewUser(null);
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  // Handler for user creation success
  const handleUserCreated = (user: UserFormData, password: string | null) => {
    setNewUser(user);
    setTempPassword(password);
    refreshUsers();
    handleCloseAddModal();
  };

  // Handler for copying password to clipboard
  const handleCopyPassword = () => {
    if (tempPassword) {
      navigator.clipboard.writeText(tempPassword);
      // Show a notification that password was copied
      alert("Password copied to clipboard!");
    }
  };

  // Handler to dismiss the success message
  const dismissSuccessMessage = () => {
    setTempPassword(null);
    setNewUser(null);
  };

  return (
    <>
      <PageHeader
        title={t("title")}
        buttons={[
          {
            text: t("addUser"),
            variant: "primary",
            onClick: handleOpenAddModal,
            icon: PlusIcon,
          },
          {
            text: t("refreshUsers"),
            variant: "secondary",
            onClick: refreshUsers,
            icon: ArrowPathIcon,
          },
        ]}
      >
        <p className="mt-2 max-w-2xl text-gray-500">{t("description")}</p>
      </PageHeader>

      {/* Success message with temporary password */}
      {tempPassword && newUser && (
        <Alert
          variant="success"
          className="mt-4 mb-4"
          title={t("userCreatedSuccess")}
          onDismiss={dismissSuccessMessage}
          description={t("userCreatedDescription", { name: newUser.name })}
        >
          <Typography variant="body-sm" textColor="inherit" className="py-1">
            {t("userEmail")} {newUser.email}
          </Typography>
          <div className="flex gap-1 items-center">
            <Typography variant="body-sm" textColor="inherit">
              {t("temporaryPassword")}
            </Typography>
            <Typography variant="code" textColor="inherit" className="bg-green-200">
             {tempPassword}
            </Typography>
            <Button variant="ghost" size="sm" onClick={handleCopyPassword}>
              <ClipboardDocumentIcon className="size-4 text-inherit" />
            </Button>
          </div>
        </Alert>
      )}

      <div className="mt-4">
        {error ? (
          <Card className="p-6 bg-red-50 border-red-200">
            <h3 className="text-lg font-medium text-red-800 mb-2">
              {t("connectionError")}
            </h3>
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={refreshUsers}
              className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {t("tryAgain")}
            </button>
          </Card>
        ) : (
          <UsersList
            users={users}
            isLoading={isLoading}
            error={null}
            onEditUser={handleOpenEditModal}
            onDeleteUser={handleOpenDeleteModal}
          />
        )}
      </div>

      {/* Delete user modal */}
      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onDelete={handleDeleteUser}
        userName={userToDelete?.name || t("unknownUser")}
        isDeleting={isDeleting}
      />

      {/* Edit user modal */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleUpdateUser}
        user={userToEdit}
        isUpdating={isUpdating}
      />

      {/* Add user modal */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSuccess={handleUserCreated}
      />
    </>
  );
}
