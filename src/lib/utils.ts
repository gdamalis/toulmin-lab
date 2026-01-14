import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ToulminArgument } from '@/types/client';
import { ClientArgumentDraft } from '@/types/coach';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a stable hash key from ToulminArgument data for React key prop.
 * Forces component remount when argument content meaningfully changes.
 * 
 * @param data - ToulminArgument or ClientArgumentDraft to generate key from
 * @returns Stable string key that changes only when content changes
 */
export function getToulminDiagramKey(data: ToulminArgument | ClientArgumentDraft): string {
  // For drafts with version, use that for optimal stability
  if ('version' in data && typeof data.version === 'number') {
    const draftId = 'id' in data ? data.id : (data as ToulminArgument)._id;
    return `draft-${draftId ?? 'new'}-v${data.version}`;
  }
  
  // For regular arguments, create content-based identifier
  const draft = data as ClientArgumentDraft;
  const contentString = JSON.stringify({
    name: data.name,
    parts: 'parts' in data ? data.parts : {
      claim: draft.claim,
      grounds: draft.grounds,
      warrant: draft.warrant,
      groundsBacking: draft.groundsBacking,
      warrantBacking: draft.warrantBacking,
      qualifier: draft.qualifier,
      rebuttal: draft.rebuttal,
    },
  });
  
  // Simple hash function (djb2 variant)
  let hash = 0;
  for (let i = 0; i < contentString.length; i++) {
    const char = contentString.codePointAt(i) ?? 0;
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const argId = '_id' in data ? data._id : (data as ClientArgumentDraft).id;
  return `arg-${argId ?? 'new'}-${hash}`;
} 