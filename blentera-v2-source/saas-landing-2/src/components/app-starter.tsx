import { CheckIcon, ChevronRightIcon } from 'lucide-react'
import Image from 'next/image'

import { ButtonLink } from '@/components/button-link'
import { Eyebrow } from '@/components/eyebrow'
import { Section, SectionDescription, SectionTitle } from '@/components/section'
import { appStarter } from '@/content/app-starter'

export function AppStarter() {
  return (
    <Section id="vite-starter">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        {/* On phones the link follows the description; on large screens it sits right under the title. */}
        <div className="grid reveal items-start justify-items-start gap-4 lg:grid-cols-2 lg:gap-x-16">
          <div className="contents lg:flex lg:flex-col lg:items-start lg:gap-6">
            <div className="flex flex-col items-start gap-4">
              <Eyebrow {...appStarter.eyebrow} />
              <SectionTitle sectionId="vite-starter">{appStarter.title}</SectionTitle>
            </div>
            <div className="mt-2 max-lg:order-last lg:mt-0">
              <ButtonLink href={appStarter.action.href} size="lg">
                {appStarter.action.label}
                <ChevronRightIcon data-icon="inline-end" />
              </ButtonLink>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <SectionDescription>{appStarter.description}</SectionDescription>
            <ul className="flex flex-col gap-2.5">
              {appStarter.highlights.map((highlight) => (
                <li key={highlight} className="flex items-center gap-2 text-sm font-medium">
                  <CheckIcon aria-hidden="true" className="size-5 shrink-0" />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* The Vite Starter's real Home screen, one capture per theme; both stay lazy, so only the shown one loads. */}
        <div aria-hidden="true" data-nosnippet className="relative isolate reveal">
          <div className="pointer-events-none absolute inset-x-0 -top-16 -z-10 h-80 bg-glow blur-2xl" />
          <div className="relative overflow-hidden rounded-2xl border bg-card mask-b-from-60% p-1.5 shadow-xl ring-1 ring-foreground/10">
            <div className="relative h-72 overflow-hidden rounded-xl ring-1 ring-foreground/10 ring-inset sm:h-112">
              <Image
                src={appStarter.images.light}
                alt=""
                fill
                sizes="(min-width: 72rem) 72rem, 100vw"
                className="object-cover object-left-top dark:hidden"
              />
              <Image
                src={appStarter.images.dark}
                alt=""
                fill
                sizes="(min-width: 72rem) 72rem, 100vw"
                className="hidden object-cover object-left-top dark:block"
              />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-foreground/25 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
