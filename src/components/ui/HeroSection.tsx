"use client";

import { track } from "@vercel/analytics";
import { motion } from "framer-motion";
import { Button } from "./Button";
import { DiagramPreview } from "./DiagramPreview";

interface HeroSectionProps {
  readonly title: string;
  readonly description: string;
  readonly badgeText?: string;
  readonly badgeLabel?: string;
  readonly ctaText?: string;
  readonly ctaHref?: string;
}

export function HeroSection({
  title,
  description,
  badgeText,
  badgeLabel,
  ctaText = "Get Started",
  ctaHref = "/auth",
}: HeroSectionProps) {
  const handleCtaClick = () => {
    track("cta_clicked", { location: "hero" });
  };

  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-b from-primary-100/20">
      <div className="mx-auto max-w-7xl pt-16 pb-12 sm:pb-24 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-16">
        <div className="px-6 lg:px-0 lg:pt-4">
          <div className="mx-auto max-w-2xl">
            <div className="max-w-lg flex flex-col gap-6">
              {badgeText && badgeLabel && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="mt-10 sm:mt-16 lg:mt-4"
                >
                  <div className="flex items-start space-x-2">
                    <span className="rounded-full bg-green-600/10 px-3 py-1 text-sm/6 text-nowrap font-semibold text-green-600 ring-1 ring-green-600/10 ring-inset">
                      {badgeText}
                    </span>
                    {/* <span className="inline-flex items-center space-x-2 text-sm/6 font-medium text-gray-600">
                      <span>{badgeLabel}</span>
                    </span> */}
                  </div>
                </motion.div>
              )}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-5xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-6xl"
              >
                {title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-lg font-medium text-pretty text-gray-600 sm:text-xl/8"
              >
                {description}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex items-center gap-4"
              >
                <Button href={ctaHref} size="lg" onClick={handleCtaClick}>
                  {ctaText}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 sm:mt-24 md:mx-auto md:max-w-2xl lg:mx-0 lg:mt-0 lg:w-screen"
        >
          {/* <div
            className="absolute inset-y-0 right-1/2 -z-10 -mr-10 w-[200%] skew-x-[-30deg] bg-white shadow-xl shadow-primary-600/10 ring-1 ring-primary-50 md:-mr-20 lg:-mr-36"
            aria-hidden="true"
          /> */}
          <div className="shadow-lg md:rounded-3xl">
            <div className="bg-primary-500 [clip-path:inset(0)] md:[clip-path:inset(0_round_theme(borderRadius.3xl))]">
              <div
                className="absolute -inset-y-px left-1/2 -z-10 ml-10 w-[200%] skew-x-[-30deg] bg-primary-100 opacity-20 ring-1 ring-inset ring-white md:ml-20 lg:ml-36"
                aria-hidden="true"
              />
              <div className="relative px-0 pt-0 sm:pt-8 md:pl-8 md:pr-0">
                <div className="mx-auto max-w-2xl md:mx-0 md:max-w-none">
                  <DiagramPreview />
                </div>
                <div
                  className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/10 md:rounded-3xl"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-white sm:h-32" />
    </div>
  );
}
