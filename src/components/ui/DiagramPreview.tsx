import { ArrowDownIcon } from "./Icon";

interface DiagramPreviewProps {
  readonly title?: string;
  readonly claim?: string;
  readonly grounds?: string[];
  readonly warrant?: string;
  readonly qualifier?: string;
  readonly rebuttal?: string;
}

export function DiagramPreview({
  title = "Toulmin Diagram",
  claim = "Climate change is a serious threat",
  grounds = ["Rising temperatures"],
  warrant = "Scientific consensus",
  qualifier = "",
  rebuttal = "Unless developing nations are exempt",
}: DiagramPreviewProps) {
  return (
    <div className="w-full overflow-hidden rounded-tl-xl bg-gray-50">
      <div className="flex bg-gray-800/40 ring-1 ring-white/5">
        <div className="-mb-px flex text-sm/6 font-medium text-gray-400">
          <div className="border-b border-r border-b-white/20 border-r-white/10 bg-white/5 px-4 py-2 text-white">
            {title}
          </div>
        </div>
      </div>
      <div className="px-6 pt-6 pb-14 relative bg-white">
        <div className="aspect-[16/10] w-full bg-gray-100 rounded-md overflow-hidden relative">
          <div className="p-4 flex flex-col h-full">
            <div className="bg-blue-100 rounded p-3 mb-3 w-2/3 mx-auto text-center">
              {claim}
            </div>
            <div className="flex justify-center items-center space-x-4">
              <ArrowDownIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex justify-between mt-3">
              {grounds.map((ground, index) => (
                <div
                  key={`${ground}-${index}`}
                  className="bg-green-100 rounded p-2 w-1/3 text-sm"
                >
                  {ground}
                </div>
              ))}
              {warrant && (
                <div className="bg-purple-100 rounded p-2 w-1/3 text-sm">
                  {warrant}
                </div>
              )}
            </div>
            {rebuttal && (
              <div className="flex justify-end mt-3">
                <div className="bg-yellow-100 rounded p-2 w-1/2 text-sm">
                  {rebuttal}
                </div>
              </div>
            )}
            {qualifier && (
              <div className="flex justify-center mt-3">
                <div className="bg-orange-100 rounded p-2 w-1/3 text-sm">
                  {qualifier}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
