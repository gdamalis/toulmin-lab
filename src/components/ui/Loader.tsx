"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { HTMLAttributes } from "react";
import { Typography } from "./Typography";

interface LoaderProps extends HTMLAttributes<HTMLDivElement> {
  fullScreen?: boolean;
  size?: number;
  text?: string;
}

export function Loader({
  fullScreen = false,
  size = 100,
  text,
  className,
  ...props
}: Readonly<LoaderProps>) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        fullScreen && "fixed inset-0 z-50 bg-white",
        !fullScreen && "w-full h-full",
        className
      )}
      {...props}
    >
      <div className="relative animate-pulse-subtle">
        <Image
          src="/brain_animated.gif"
          alt="Loading"
          width={size}
          height={size}
          priority
          className="animate-spin-slow"
        />
      </div>
      {text && <Typography className="mt-4 text-sm">{text}</Typography>}
    </div>
  );
}
