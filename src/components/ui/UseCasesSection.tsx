"use client";

import { cn } from "@/lib/utils";
import {
  AcademicCapIcon,
  BeakerIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import { track } from "@vercel/analytics";
import { motion } from "framer-motion";
import Image from "next/image";
import { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";

interface UseCase {
  id: string;
  icon: ReactNode;
  title: string;
  headline: string;
  description: string;
  features: string[];
  imageSrc: string;
  imageAlt: string;
}

interface UseCasesSectionProps {
  readonly heading: string;
  readonly subheading: string;
  readonly useCases: UseCase[];
}

export function UseCasesSection({
  heading,
  subheading,
  useCases,
}: UseCasesSectionProps) {
  const handleTabChange = (value: string) => {
    track("use_case_tab_clicked", { tab: value });
  };

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-base font-semibold leading-7 text-primary-600">
            {heading}
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {subheading}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16"
        >
          <Tabs
            defaultValue={useCases[0]?.id ?? "universities"}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <div className="flex justify-center">
              <TabsList className="grid w-full max-w-lg grid-cols-3 gap-1">
                {useCases.map((useCase) => (
                  <TabsTrigger
                    key={useCase.id}
                    value={useCase.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span className="hidden sm:inline-flex">{useCase.icon}</span>
                    {useCase.title}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {useCases.map((useCase) => (
              <TabsContent key={useCase.id} value={useCase.id} className="mt-10">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16 items-center">
                  {/* Content */}
                  <div className="lg:order-1">
                    <h3 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                      {useCase.headline}
                    </h3>
                    <p className="mt-4 text-lg text-gray-600">
                      {useCase.description}
                    </p>
                    <ul className="mt-8 space-y-3">
                      {useCase.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <svg
                            className="h-6 w-6 flex-shrink-0 text-primary-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Image placeholder */}
                  <div className="lg:order-2">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100 shadow-xl ring-1 ring-gray-200">
                      {/* Placeholder with icon until real images are added */}
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
                        <div className="text-center">
                          <div className="mx-auto h-16 w-16 text-primary-400">
                            {useCase.icon}
                          </div>
                          <p className="mt-4 text-sm text-primary-600 font-medium">
                            {useCase.imageAlt}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

// Pre-built icons for common use cases
export const UseCaseIcons = {
  universities: <AcademicCapIcon className="h-5 w-5" />,
  bibleInstitutes: <BookOpenIcon className="h-5 w-5" />,
  researchers: <BeakerIcon className="h-5 w-5" />,
};
