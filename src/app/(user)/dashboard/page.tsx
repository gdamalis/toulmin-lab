"use client";

import { ArgumentList, DeleteArgumentModal } from "@/components/dashboard";
import { PageHeader } from "@/components/layout/PageHeader";
import { useToulminArguments } from "@/hooks/useArguments";
import { ToulminArgument } from "@/types/client";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function ArgumentsPage() {
  const t = useTranslations("pages.argument");
  
  const { toulminArguments, isLoading, error, deleteArgument, isDeleting } =
    useToulminArguments();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [argumentToDelete, setArgumentToDelete] =
    useState<ToulminArgument | null>(null);

  const handleOpenDeleteModal = (arg: ToulminArgument) => {
    setArgumentToDelete(arg);
    setIsDeleteModalOpen(true);
  };
  
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setArgumentToDelete(null);
  };
  
  const handleDeleteArgument = async () => {
    if (!argumentToDelete?._id) return;
    const success = await deleteArgument(argumentToDelete._id.toString());
    if (success) handleCloseDeleteModal();
  };

  return (
    <>
      <PageHeader
        title={t("myArguments")}
        buttons={[
          {
            text: t("newArgument"),
            href: "/argument/create",
            variant: "primary",
          },
        ]}
      />
      
      <ArgumentList 
        arguments={toulminArguments}
        isLoading={isLoading}
        error={error}
        onDeleteArgument={handleOpenDeleteModal}
      />

      {/* Delete confirmation modal */}
      <DeleteArgumentModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onDelete={handleDeleteArgument}
        argumentName={argumentToDelete?.name || t("untitled")}
        isDeleting={isDeleting}
      />
    </>
  );
}
