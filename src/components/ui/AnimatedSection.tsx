"use client";

import { cn } from "@/lib/utils";
import { motion, useReducedMotion, Variants } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedSectionProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly delay?: number;
  readonly direction?: "up" | "down" | "left" | "right";
}

const directionOffsets = {
  up: { y: 24, x: 0 },
  down: { y: -24, x: 0 },
  left: { x: 24, y: 0 },
  right: { x: -24, y: 0 },
};

export function AnimatedSection({
  children,
  className,
  delay = 0,
  direction = "up",
}: AnimatedSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const offset = directionOffsets[direction];

  const variants: Variants = prefersReducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { duration: 0.01 },
        },
      }
    : {
        hidden: {
          opacity: 0,
          ...offset,
        },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: {
            duration: 0.5,
            ease: "easeOut",
            delay,
          },
        },
      };

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={variants}
      className={cn(className)}
    >
      {children}
    </motion.section>
  );
}

interface StaggeredContainerProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly staggerDelay?: number;
}

export function StaggeredContainer({
  children,
  className,
  staggerDelay = 0.1,
}: StaggeredContainerProps) {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants: Variants = prefersReducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { duration: 0.01 },
        },
      }
    : {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

interface StaggeredItemProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function StaggeredItem({ children, className }: StaggeredItemProps) {
  const prefersReducedMotion = useReducedMotion();

  const itemVariants: Variants = prefersReducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { duration: 0.01 },
        },
      }
    : {
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: "easeOut",
          },
        },
      };

  return (
    <motion.div variants={itemVariants} className={cn(className)}>
      {children}
    </motion.div>
  );
}
