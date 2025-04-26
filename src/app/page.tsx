import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export default function Home() {
  return (
    <div className="bg-white">
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-blue-100/20">
        <div className="mx-auto max-w-7xl pt-10 pb-24 sm:pb-32 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-40">
          <div className="px-6 lg:px-0 lg:pt-4">
            <div className="mx-auto max-w-2xl">
              <div className="max-w-lg">
                <div className="mt-10 sm:mt-16 lg:mt-4">
                  <a href="#" className="inline-flex space-x-6">
                    <span className="rounded-full bg-blue-600/10 px-3 py-1 text-sm/6 font-semibold text-blue-600 ring-1 ring-blue-600/10 ring-inset">
                      New
                    </span>
                    <span className="inline-flex items-center space-x-2 text-sm/6 font-medium text-gray-600">
                      <span>Public beta now available</span>
                      <ArrowRightIcon className="size-5 text-gray-400" aria-hidden="true" />
                    </span>
                  </a>
                </div>
                <h1 className="mt-10 text-5xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-6xl">
                  Build stronger arguments visually
                </h1>
                <p className="mt-8 text-lg font-medium text-pretty text-gray-600 sm:text-xl/8">
                  Create, analyze, and share structured arguments using the Toulmin method. Make your reasoning clear, identify weak points, and persuade effectively.
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                  <Link
                    href="/auth"
                    className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    Get started
                  </Link>
                  <a href="#features" className="text-sm/6 font-semibold text-gray-900">
                    Learn more <span aria-hidden="true">→</span>
                  </a>
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
                    <div className="w-full overflow-hidden rounded-tl-xl bg-gray-50">
                      <div className="flex bg-gray-800/40 ring-1 ring-white/5">
                        <div className="-mb-px flex text-sm/6 font-medium text-gray-400">
                          <div className="border-b border-r border-b-white/20 border-r-white/10 bg-white/5 px-4 py-2 text-white">
                            Toulmin Diagram
                          </div>
                        </div>
                      </div>
                      <div className="px-6 pt-6 pb-14 relative bg-white">
                        {/* Placeholder for diagram screenshot */}
                        <div className="aspect-[16/10] w-full bg-gray-100 rounded-md overflow-hidden relative">
                          <div className="p-4 flex flex-col h-full">
                            <div className="bg-blue-100 rounded p-3 mb-3 w-2/3 mx-auto text-center">
                              Climate change is a serious threat
                            </div>
                            <div className="flex justify-center items-center space-x-4">
                              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                              </svg>
                            </div>
                            <div className="flex justify-between mt-3">
                              <div className="bg-green-100 rounded p-2 w-1/3 text-sm">
                                Rising temperatures
                              </div>
                              <div className="bg-purple-100 rounded p-2 w-1/3 text-sm">
                                Scientific consensus
                              </div>
                            </div>
                            <div className="flex justify-end mt-3">
                              <div className="bg-yellow-100 rounded p-2 w-1/2 text-sm">
                                Unless developing nations are exempt
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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

      <div id="features" className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Structured Argumentation</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Why use the Toulmin method?
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            The Toulmin model provides a framework for analyzing and constructing arguments, making complex reasoning more
            accessible and persuasive.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-gray-900">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                Clarity in reasoning
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600">
                Break down complex arguments into clear, connected components that anyone can follow and understand.
              </dd>
            </div>
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-gray-900">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                </div>
                Better persuasion
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600">
                Strengthen your arguments by anticipating rebuttals and providing solid backing for your claims.
              </dd>
            </div>
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-gray-900">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                  </svg>
                </div>
                Academic excellence
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600">
                Widely used in academic writing and critical thinking courses to develop and evaluate arguments.
              </dd>
            </div>
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-gray-900">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                  </svg>
                </div>
                Visualize and share
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600">
                Create beautiful diagrams that can be easily shared, exported, and embedded in presentations or documents.
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-blue-600">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to strengthen your arguments?
          </h2>
          <p className="mt-6 text-lg leading-8 text-blue-100">
            Join thousands of academics, students, and professionals who use our tool to build compelling arguments.
          </p>
          <div className="mt-10 flex items-center gap-x-6">
            <Link
              href="/auth"
              className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Get started
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
