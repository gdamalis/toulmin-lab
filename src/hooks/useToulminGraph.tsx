import { nodeTypes } from "@/components/diagram/nodes";
import { ToulminArgument } from "@/types/client";
import { createToulminEdges, createToulminNodes } from "@/utils/diagram";
import { useMemo } from "react";
import { useTranslations } from "next-intl";

/**
 * Hook for creating Toulmin diagram nodes and edges
 */
export function useToulminGraph(data: ToulminArgument) {
  const t = useTranslations("pages.argument");
  
  // Create translations object for node titles
  const translations = useMemo(() => ({
    evidenceBacking: t("evidenceBacking"),
    evidence: t("evidence"),
    backing: t("backing"),
    warrant: t("warrant"),
    qualifier: t("qualifier"),
    claim: t("claim"),
    rebuttal: t("rebuttal"),
  }), [t]);

  // Create nodes and edges
  const initialNodes = useMemo(() => 
    createToulminNodes(data, translations), 
    [data, translations]
  );

  const initialEdges = useMemo(() => 
    createToulminEdges(data), 
    [data]
  );

  return { initialNodes, initialEdges, nodeTypes };
}
