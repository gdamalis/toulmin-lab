"use client";

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  readonly heading: string;
  readonly subheading: string;
  readonly description?: string;
  readonly faqs: FAQItem[];
}

export function FAQSection({
  heading,
  subheading,
  description,
  faqs,
}: FAQSectionProps) {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-base font-semibold leading-7 text-primary-600">
            {heading}
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {subheading}
          </p>
          {description && (
            <p className="mt-6 text-lg leading-8 text-gray-600">{description}</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-16 max-w-3xl"
        >
          <dl className="divide-y divide-gray-200">
            {faqs.map((faq, index) => (
              <Disclosure key={index} as="div" className="py-6">
                {({ open }) => (
                  <>
                    <dt>
                      <DisclosureButton className="group flex w-full items-start justify-between text-left">
                        <span className="text-base font-semibold leading-7 text-gray-900 group-hover:text-primary-600 transition-colors">
                          {faq.question}
                        </span>
                        <span className="ml-6 flex h-7 items-center">
                          <ChevronDownIcon
                            className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                              open ? "rotate-180" : ""
                            }`}
                          />
                        </span>
                      </DisclosureButton>
                    </dt>
                    <AnimatePresence initial={false}>
                      {open && (
                        <DisclosurePanel static as="dd" className="mt-4">
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                          >
                            <p className="text-base leading-7 text-gray-600">
                              {faq.answer}
                            </p>
                          </motion.div>
                        </DisclosurePanel>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </Disclosure>
            ))}
          </dl>
        </motion.div>
      </div>
    </div>
  );
}
