import { Toaster } from "@/components/ui/sonner"
import Comparison from "@/components/blentera/comparison"
import Cta from "@/components/blentera/cta"
import Faqs from "@/components/blentera/faqs"
import Features from "@/components/blentera/features"
import Footer from "@/components/blentera/footer"
import Header from "@/components/blentera/header"
import Hero from "@/components/blentera/hero"
import HowItWorks from "@/components/blentera/how-it-works"
import Pricing from "@/components/blentera/pricing"

export default function BlenteraPage() {
  return (
    <div className="flex min-h-svh w-full flex-col bg-background text-foreground">
      <Toaster />
      <Header />
      <main className="flex w-full flex-col">
        <Hero />
        <Features />
        <HowItWorks />
        <Comparison />
        <Pricing />
        <Faqs />
        <Cta />
      </main>
      <div className="border-t border-border/50">
        <Footer />
      </div>
    </div>
  )
}
