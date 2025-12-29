'use client';

import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { ToulminStep } from '@/types/coach';
import { Fragment } from 'react';
import { useTranslations } from 'next-intl';

interface ElementHelperProps {
  step: ToulminStep;
}

export function ElementHelper({ step }: ElementHelperProps) {
  const t = useTranslations('pages.coach');
  const name = t(`steps.${step}`);
  const description = t(`stepInfo.${step}.definition`);
  const example = t(`stepInfo.${step}.example`);

  return (
    <Popover className="relative">
      <PopoverButton className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded">
        <QuestionMarkCircleIcon className="h-4 w-4" />
        <span>{t('whatIs', { step: name })}</span>
      </PopoverButton>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <PopoverPanel className="absolute left-1/2 z-10 mt-2 w-80 -translate-x-1/2 transform">
          <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5">
            <div className="bg-white p-4">
              <h4 className="text-sm font-semibold text-gray-900">{name}</h4>
              <p className="mt-1 text-sm text-gray-600">{description}</p>
              
              <div className="mt-3 rounded-md bg-blue-50 p-3">
                <p className="text-xs font-medium text-blue-800">{t('exampleLabel')}</p>
                <p className="mt-1 text-xs text-blue-700 italic">&ldquo;{example}&rdquo;</p>
              </div>
            </div>
          </div>
        </PopoverPanel>
      </Transition>
    </Popover>
  );
}
