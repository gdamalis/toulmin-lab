"use client";

import { ToulminDiagram } from "@/components/diagram";
import {
  sampleArguments,
  sampleArgumentsES,
} from "@/data/toulminTemplates";
import { ToulminArgument } from "@/types/client";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale } from "next-intl";
import { useCallback, useEffect, useState } from "react";

interface DiagramPreviewProps {
  readonly samples?: ToulminArgument[];
  readonly autoPlayInterval?: number;
}

export function DiagramPreview({
  samples,
  autoPlayInterval = 6000,
}: DiagramPreviewProps) {
  const locale = useLocale();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const defaultSamples = locale === "es" ? sampleArgumentsES : sampleArguments;
  const displaySamples = samples ?? defaultSamples;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % displaySamples.length);
  }, [displaySamples.length]);

  useEffect(() => {
    if (isPaused || displaySamples.length <= 1) return;

    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isPaused, displaySamples.length, autoPlayInterval, nextSlide]);

  const currentSample = displaySamples[currentIndex];

  return (
    <div
      className="w-full overflow-hidden rounded-tl-xl bg-gray-50"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center justify-between bg-gray-800/40 ring-1 ring-white/5">
        <div className="-mb-px flex text-sm/6 font-medium text-gray-400">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSample.name}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="border-b border-r border-b-white/20 border-r-white/10 bg-white/5 px-4 py-2 text-white"
            >
              {currentSample.name}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot indicators */}
        {displaySamples.length > 1 && (
          <div className="flex items-center gap-1.5 px-4">
            {displaySamples.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-white scale-110"
                    : "bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`View diagram ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
      <div className="px-4 pt-4 pb-4 relative bg-white">
        <div className="aspect-[16/10] w-full bg-gray-100 rounded-md overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSample.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="p-4 flex flex-col absolute inset-0"
            >
              <ToulminDiagram
                data={currentSample}
                showExportButtons={false}
                showTitle={false}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
