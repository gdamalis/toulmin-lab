"use client";

import { cn } from "@/lib/utils";
import {
  ArrowLongRightIcon,
  ArrowRightCircleIcon,
  PencilSquareIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Step {
  number: number;
  title: string;
  description: string;
  icon: ReactNode;
}

interface HowItWorksSectionProps {
  readonly heading: string;
  readonly subheading: string;
  readonly steps: Step[];
}

export function HowItWorksSection({
  heading,
  subheading,
  steps,
}: HowItWorksSectionProps) {
  return (
    <div className="bg-gray-50 py-24 sm:py-32">
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

        <div className="mx-auto mt-16 max-w-5xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative"
              >
                {/* Connector line - only on desktop and not for last item */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5">
                    <div className="w-full h-full bg-gradient-to-r from-primary-300 to-primary-100" />
                    <ArrowLongRightIcon className="absolute -right-2 -top-2.5 h-6 w-6 text-primary-300" />
                  </div>
                )}

                <div className="flex flex-col items-center text-center">
                  {/* Number badge */}
                  <div className="relative">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-600 shadow-lg shadow-primary-600/30">
                      <span className="text-white">{step.icon}</span>
                    </div>
                    <span className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-primary-600 shadow-md ring-2 ring-primary-600">
                      {step.number}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="mt-6 text-lg font-semibold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-base text-gray-600 max-w-xs">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Pre-built icons for common use
export const HowItWorksIcons = {
  signIn: <ArrowRightCircleIcon className="h-10 w-10" />,
  build: <PencilSquareIcon className="h-10 w-10" />,
  share: <ShareIcon className="h-10 w-10" />,
};
