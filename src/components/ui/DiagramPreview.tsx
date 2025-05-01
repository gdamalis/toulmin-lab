import {
  sampleToulminArgument,
  sampleToulminArgumentES,
} from "@/data/toulminTemplates";
import { useLocale } from "next-intl";
import ToulminDiagram from "../ToulminDiagram";

export function DiagramPreview() {
  const locale = useLocale();

  const sampleData =
    locale === "es" ? sampleToulminArgumentES : sampleToulminArgument;

  return (
    <div className="w-full overflow-hidden rounded-tl-xl bg-gray-50">
      <div className="flex bg-gray-800/40 ring-1 ring-white/5">
        <div className="-mb-px flex text-sm/6 font-medium text-gray-400">
          <div className="border-b border-r border-b-white/20 border-r-white/10 bg-white/5 px-4 py-2 text-white">
            {sampleData.name}
          </div>
        </div>
      </div>
      <div className="px-6 pt-6 pb-14 relative bg-white">
        <div className="aspect-[16/10] w-full bg-gray-100 rounded-md overflow-hidden relative">
          <div className="p-4 flex flex-col h-full">
            <ToulminDiagram
              data={sampleData}
              showExportButtons={false}
              showTitle={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
