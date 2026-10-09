import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata = {
  title: "BLENTERA — Company AI foundation",
  description:
    "BLENTERA keeps company knowledge, work, governance and learning usable across people, agents, models and tools.",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("antialiased font-sans", geist.variable, mono.variable)}>
      <body>
        <ThemeProvider>
          <a href="#main" className="sr-only rounded-md bg-background text-sm font-medium shadow-md ring-2 ring-ring focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-3 focus:py-2">
            Skip to content
          </a>
          <div id="main">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  )
}
