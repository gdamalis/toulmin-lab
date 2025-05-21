"use client";

import { DeleteUserModal, EditUserModal, UsersList } from "@/components/admin";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { useUsers } from "@/hooks/useUsers";
import { User } from "@/types/client";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
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

  return (
    <>
      <PageHeader
        title={t("title")}
        buttons={[
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

      <div className="mt-8">
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
    </>
  );
}
