import { Agents } from '@/components/agents'
import { AppStarter } from '@/components/app-starter'
import { Cta } from '@/components/cta'
import { Faq } from '@/components/faq'
import { Features } from '@/components/features'
import { Hero } from '@/components/hero'
import { Stack } from '@/components/stack'
import { Steps } from '@/components/steps'
import { createMetadata } from '@/lib/metadata'

export const metadata = createMetadata({ path: '/' })

export default function Home() {
  return (
    <>
      <Hero />
      <Stack />
      <Features />
      <Steps />
      <Agents />
      <AppStarter />
      <Faq />
      <Cta />
    </>
  )
}
