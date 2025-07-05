"use client";

import { ArgumentList, DeleteArgumentModal, QuickArgumentGenerator } from "@/components/dashboard";
import { PageHeader } from "@/components/layout/PageHeader";
import { useArguments } from "@/hooks/useArguments";
import { ToulminArgument } from "@/types/client";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function ArgumentsPage() {
  const t = useTranslations("pages.argument");
  
  const { toulminArguments, isLoading, error, deleteArgument, isDeleting } =
    useArguments();
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
    <div className="space-y-8">
      {/* Quick AI Generator Section */}
      <div className="max-w-4xl mx-auto">
        <QuickArgumentGenerator />
      </div>

      {/* My Arguments Section */}
      <div>
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
      </div>

      {/* Delete confirmation modal */}
      <DeleteArgumentModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onDelete={handleDeleteArgument}
        argumentName={argumentToDelete?.name || t("untitled")}
        isDeleting={isDeleting}
      />
    </div>
  );
}
