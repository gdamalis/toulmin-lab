'use client';

interface FormDividerProps {
  readonly text: string;
}

export function FormDivider({ text }: FormDividerProps) {
  return (
    <div className="relative mt-10">
      <div aria-hidden="true" className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200" />
      </div>
      <div className="relative flex justify-center text-sm/6 font-medium">
        <span className="bg-white px-6 text-gray-900">{text}</span>
      </div>
    </div>
  );
} 