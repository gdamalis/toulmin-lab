"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  emptyToulminArgument,
  sampleToulminArgument,
  sampleToulminArgumentES,
} from "@/data/toulminTemplates";
import { ToulminArgument } from "@/types/client";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

interface ToulminFormProps {
  readonly onSubmit: (data: ToulminArgument) => void;
  readonly onChange?: (data: ToulminArgument) => void;
  readonly initialData?: ToulminArgument;
}

export function ToulminForm({
  onSubmit,
  onChange,
  initialData = emptyToulminArgument,
}: Readonly<ToulminFormProps>) {
  const t = useTranslations("pages.argument");
  const commonT = useTranslations("common");
  const locale = useLocale();
  const { user } = useAuth();
  const [formData, setFormData] = useState<ToulminArgument>(initialData);

  // Get the appropriate sample data based on the current locale
  const getSampleData = () => {
    return locale === "es" ? sampleToulminArgumentES : sampleToulminArgument;
  };

  // Update form data if initialData changes externally
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  // Autopopulate author field with user's name when user data is available
  useEffect(() => {
    if (user && formData.author.name === "") {
      // Get user's display name or use email if name not available
      const userName = user.displayName ?? user.email?.split("@")[0] ?? "";
      const updatedData = {
        ...formData,
        author: {
          ...formData.author,
          name: userName,
          userId: user.uid,
        },
      };
      setFormData(updatedData);
      onChange?.(updatedData);
    }
  }, [user, formData.author.name, onChange]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    let updatedData: ToulminArgument;

    if (name === "name") {
      updatedData = { ...formData, name: value };
    } else if (name === "author") {
      updatedData = {
        ...formData,
        author: {
          ...formData.author,
          name: value,
        },
      };
    } else {
      // Handle parts structure
      updatedData = {
        ...formData,
        parts: {
          ...formData.parts,
          [name]: value,
        },
      };
    }

    setFormData(updatedData);
    // Call onChange handler if provided to update parent's state
    onChange?.(updatedData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className="p-2" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-8">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              const sampleData = getSampleData();
              setFormData(sampleData);
              onChange?.(sampleData);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            title={t("loadSampleTooltip")}
          >
            <DocumentDuplicateIcon className="w-4 h-4" />
            <span>{t("useSample")}</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={() => {
              const emptyData = emptyToulminArgument;
              setFormData(emptyData);
              onChange?.(emptyData);
            }}
          >
            <span>{commonT("clear")}</span>
          </button>
        </div>
        <div className="border-b border-gray-900/10 pb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base/7 font-semibold text-gray-900">
                {t("diagramDetails")}
              </h2>
              <p className="mt-1 text-sm/6 text-gray-600">
                {t("basicInfoDescription")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label
                htmlFor="name"
                className="block text-sm/6 font-medium text-gray-900"
              >
                {t("argumentName")}
              </label>
              <div className="mt-2">
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder={t("argumentNamePlaceholder")}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-primary-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="author"
                className="block text-sm/6 font-medium text-gray-900"
              >
                {t("author")}
              </label>
              <div className="mt-2">
                <input
                  id="author"
                  name="author"
                  type="text"
                  value={formData.author.name}
                  onChange={handleInputChange}
                  required
                  placeholder={t("authorPlaceholder")}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-primary-600 sm:text-sm/6"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-900/10 pb-8">
          <h2 className="text-base/7 font-semibold text-gray-900">
            {t("argumentStructure")}
          </h2>
          <p className="mt-1 text-sm/6 text-gray-600">
            {t("argumentStructureDescription")}
          </p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full">
              <label
                htmlFor="claim"
                className="block text-sm/6 font-medium text-gray-900"
              >
                {t("claim")}
              </label>
              <div className="mt-2">
                <textarea
                  id="claim"
                  name="claim"
                  value={formData.parts.claim}
                  onChange={handleInputChange}
                  rows={2}
                  required
                  placeholder={t("claimPlaceholder")}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-primary-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div className="col-span-full">
              <label
                htmlFor="grounds"
                className="block text-sm/6 font-medium text-gray-900"
              >
                {t("evidence")}
              </label>
              <div className="mt-2">
                <textarea
                  id="grounds"
                  name="grounds"
                  value={formData.parts.grounds}
                  onChange={handleInputChange}
                  rows={2}
                  required
                  placeholder={t("evidencePlaceholder")}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-primary-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div className="col-span-full">
              <label
                htmlFor="groundsBacking"
                className="block text-sm/6 font-medium text-gray-900"
              >
                {t("evidenceBacking")}
              </label>
              <div className="mt-2">
                <textarea
                  id="groundsBacking"
                  name="groundsBacking"
                  value={formData.parts.groundsBacking}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder={t("evidenceBackingPlaceholder")}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-primary-600 sm:text-sm/6"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-900/10 pb-8">
          <h2 className="text-base/7 font-semibold text-gray-900">
            {t("reasoningSection")}
          </h2>
          <p className="mt-1 text-sm/6 text-gray-600">
            {t("reasoningSectionDescription")}
          </p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full">
              <label
                htmlFor="warrant"
                className="block text-sm/6 font-medium text-gray-900"
              >
                {t("warrant")}
              </label>
              <div className="mt-2">
                <textarea
                  id="warrant"
                  name="warrant"
                  value={formData.parts.warrant}
                  onChange={handleInputChange}
                  rows={2}
                  required
                  placeholder={t("warrantPlaceholder")}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-primary-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div className="col-span-full">
              <label
                htmlFor="warrantBacking"
                className="block text-sm/6 font-medium text-gray-900"
              >
                {t("backing")}
              </label>
              <div className="mt-2">
                <textarea
                  id="warrantBacking"
                  name="warrantBacking"
                  value={formData.parts.warrantBacking}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder={t("backingPlaceholder")}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-primary-600 sm:text-sm/6"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-900/10 pb-8">
          <h2 className="text-base/7 font-semibold text-gray-900">
            {t("limitationsSection")}
          </h2>
          <p className="mt-1 text-sm/6 text-gray-600">
            {t("limitationsSectionDescription")}
          </p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label
                htmlFor="qualifier"
                className="block text-sm/6 font-medium text-gray-900"
              >
                {t("qualifier")}
              </label>
              <div className="mt-2">
                <textarea
                  id="qualifier"
                  name="qualifier"
                  value={formData.parts.qualifier}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder={t("qualifierPlaceholder")}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-primary-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="rebuttal"
                className="block text-sm/6 font-medium text-gray-900"
              >
                {t("rebuttal")}
              </label>
              <div className="mt-2">
                <textarea
                  id="rebuttal"
                  name="rebuttal"
                  value={formData.parts.rebuttal}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder={t("rebuttalPlaceholder")}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-primary-600 sm:text-sm/6"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
      </div>
    </form>
  );
}
