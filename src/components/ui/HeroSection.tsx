import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { DiagramPreview } from './DiagramPreview';

interface HeroSectionProps {
  readonly title: string;
  readonly description: string;
  readonly badgeText?: string;
  readonly badgeLabel?: string;
  readonly primaryCta: {
    readonly text: string;
    readonly href: string;
  };
  readonly secondaryCta?: {
    readonly text: string;
    readonly href: string;
  };
}

export function HeroSection({
  title,
  description,
  badgeText = 'New',
  badgeLabel = 'Public beta now available',
  primaryCta,
  secondaryCta,
}: HeroSectionProps) {
  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-b from-blue-100/20">
      <div className="mx-auto max-w-7xl pt-10 pb-24 sm:pb-32 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-40">
        <div className="px-6 lg:px-0 lg:pt-4">
          <div className="mx-auto max-w-2xl">
            <div className="max-w-lg">
              <div className="mt-10 sm:mt-16 lg:mt-4">
                <a href="#" className="inline-flex space-x-6">
                  <span className="rounded-full bg-blue-600/10 px-3 py-1 text-sm/6 font-semibold text-blue-600 ring-1 ring-blue-600/10 ring-inset">
                    {badgeText}
                  </span>
                  <span className="inline-flex items-center space-x-2 text-sm/6 font-medium text-gray-600">
                    <span>{badgeLabel}</span>
                    <ArrowRightIcon className="size-5 text-gray-400" aria-hidden="true" />
                  </span>
                </a>
              </div>
              <h1 className="mt-10 text-5xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-6xl">
                {title}
              </h1>
              <p className="mt-8 text-lg font-medium text-pretty text-gray-600 sm:text-xl/8">
                {description}
              </p>
              <div className="mt-10 flex items-center gap-x-6">
                <Link
                  href={primaryCta.href}
                  className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  {primaryCta.text}
                </Link>
                {secondaryCta && (
                  <a href={secondaryCta.href} className="text-sm/6 font-semibold text-gray-900">
                    {secondaryCta.text} <span aria-hidden="true">→</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-20 sm:mt-24 md:mx-auto md:max-w-2xl lg:mx-0 lg:mt-0 lg:w-screen">
          <div
            className="absolute inset-y-0 right-1/2 -z-10 -mr-10 w-[200%] skew-x-[-30deg] bg-white shadow-xl shadow-blue-600/10 ring-1 ring-blue-50 md:-mr-20 lg:-mr-36"
            aria-hidden="true"
          />
          <div className="shadow-lg md:rounded-3xl">
            <div className="bg-blue-500 [clip-path:inset(0)] md:[clip-path:inset(0_round_theme(borderRadius.3xl))]">
              <div
                className="absolute -inset-y-px left-1/2 -z-10 ml-10 w-[200%] skew-x-[-30deg] bg-blue-100 opacity-20 ring-1 ring-inset ring-white md:ml-20 lg:ml-36"
                aria-hidden="true"
              />
              <div className="relative px-6 pt-8 sm:pt-16 md:pl-16 md:pr-0">
                <div className="mx-auto max-w-2xl md:mx-0 md:max-w-none">
                  <DiagramPreview />
                </div>
                <div
                  className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/10 md:rounded-3xl"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-white sm:h-32" />
    </div>
  );
} 