import { ButtonLink } from '@/components/button-link'
import { notFound } from '@/content/not-found'
import { createMetadata } from '@/lib/metadata'

// Its own title and description; Next already sends noindex for a 404, so the robots tag is left to it.
export const metadata = {
  ...createMetadata({
    title: notFound.title,
    description: notFound.description,
    noIndex: true,
  }),
  robots: null,
}

export default function NotFound() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col items-start gap-5 px-4 py-24 sm:px-6 sm:py-32">
      <h1 className="font-heading text-4xl font-bold tracking-tight">{notFound.title}</h1>
      <p className="max-w-xl text-lg text-pretty text-muted-foreground">{notFound.description}</p>
      <ButtonLink href={notFound.action.href} size="lg">
        {notFound.action.label}
      </ButtonLink>
    </section>
  )
}
