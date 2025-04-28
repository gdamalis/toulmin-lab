import { ToulminArgument } from "@/types/client";
import { Panel } from "@xyflow/react";

interface TitlePanelProps {
  readonly data: Pick<ToulminArgument, "name" | "author">;
  readonly className?: string;
}

export function TitlePanel({
  data,
  className = "",
}: Readonly<TitlePanelProps>) {
  return (
    <Panel
      position="top-left"
      className={`bg-white/90 p-2 rounded shadow-sm m-2 max-w-xs ${className}`}
      data-export-include="true"
    >
      <h3 className="text-sm font-semibold text-gray-900 truncate">
        {data.name ?? "Untitled ToulminArgument"}
      </h3>
      {data.author && (
        <p className="text-xs text-gray-500 mt-0.5 truncate">
          by {data.author.name}
        </p>
      )}
    </Panel>
  );
}
