"use client";

import { GuidedArgumentCreator } from "@/components/chat/GuidedArgumentCreator";

interface QuickArgumentGeneratorProps {
  className?: string;
}

export function QuickArgumentGenerator({
  className = "",
}: Readonly<QuickArgumentGeneratorProps>) {
  return <GuidedArgumentCreator className={className} />;
}
