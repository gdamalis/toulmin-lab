import Link from 'next/link';

interface CTASectionProps {
  readonly title: string;
  readonly description: string;
  readonly buttonText: string;
  readonly buttonHref: string;
  readonly backgroundColor?: string;
  readonly textColor?: string;
  readonly buttonColor?: string;
  readonly buttonTextColor?: string;
}

export function CTASection({
  title,
  description,
  buttonText,
  buttonHref,
  backgroundColor = 'bg-blue-600',
  textColor = 'text-white',
  buttonColor = 'bg-white',
  buttonTextColor = 'text-blue-600',
}: CTASectionProps) {
  return (
    <div className={backgroundColor}>
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <h2 className={`text-3xl font-bold tracking-tight ${textColor} sm:text-4xl`}>
          {title}
        </h2>
        <p className={`mt-6 text-lg leading-8 ${textColor === 'text-white' ? 'text-blue-100' : 'text-gray-600'}`}>
          {description}
        </p>
        <div className="mt-10 flex items-center gap-x-6">
          <Link
            href={buttonHref}
            className={`rounded-md ${buttonColor} px-3.5 py-2.5 text-sm font-semibold ${buttonTextColor} shadow-sm hover:bg-opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
          >
            {buttonText}
          </Link>
        </div>
      </div>
    </div>
  );
} 