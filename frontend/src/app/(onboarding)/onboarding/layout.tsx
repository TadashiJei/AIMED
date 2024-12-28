'use client';

import { type ReactElement, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const steps = [
  { id: 'profile', name: 'Profile Setup', href: '/onboarding/profile' },
  { id: 'metrics', name: 'Health Metrics', href: '/onboarding/metrics' },
  { id: 'preferences', name: 'Preferences', href: '/onboarding/preferences' },
] as const;

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}): ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const stepIndex = steps.findIndex((step) => step.href === pathname);
    if (stepIndex !== -1) {
      setCurrentStep(stepIndex);
    }
  }, [pathname]);

  return (
    <div className="min-h-full bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-full flex-col justify-center py-12">
          <div className="mx-auto w-full max-w-2xl">
            {/* Progress bar */}
            <nav aria-label="Progress">
              <ol
                role="list"
                className="divide-y divide-gray-300 rounded-md border border-gray-300 md:flex md:divide-y-0"
              >
                {steps.map((step, stepIdx) => (
                  <li key={step.name} className="relative md:flex md:flex-1">
                    {stepIdx < currentStep ? (
                      <div className="group flex w-full items-center">
                        <span className="flex items-center px-6 py-4 text-sm font-medium">
                          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600">
                            <svg
                              className="h-6 w-6 text-white"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                          <span className="ml-4 text-sm font-medium text-gray-900">
                            {step.name}
                          </span>
                        </span>
                      </div>
                    ) : stepIdx === currentStep ? (
                      <div
                        className="flex items-center px-6 py-4 text-sm font-medium"
                        aria-current="step"
                      >
                        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-indigo-600">
                          <span className="text-indigo-600">{stepIdx + 1}</span>
                        </span>
                        <span className="ml-4 text-sm font-medium text-indigo-600">
                          {step.name}
                        </span>
                      </div>
                    ) : (
                      <div className="group flex items-center">
                        <span className="flex items-center px-6 py-4 text-sm font-medium">
                          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300">
                            <span className="text-gray-500">{stepIdx + 1}</span>
                          </span>
                          <span className="ml-4 text-sm font-medium text-gray-500">
                            {step.name}
                          </span>
                        </span>
                      </div>
                    )}

                    {stepIdx !== steps.length - 1 ? (
                      <div
                        className="absolute right-0 top-0 hidden h-full w-5 md:block"
                        aria-hidden="true"
                      >
                        <svg
                          className="h-full w-full text-gray-300"
                          viewBox="0 0 22 80"
                          fill="none"
                          preserveAspectRatio="none"
                        >
                          <path
                            d="M0 -2L20 40L0 82"
                            vectorEffect="non-scaling-stroke"
                            stroke="currentcolor"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ol>
            </nav>

            {/* Content */}
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
