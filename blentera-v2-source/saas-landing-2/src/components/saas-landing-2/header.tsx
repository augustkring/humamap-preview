"use client"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ArrowRight, Menu } from "lucide-react"

const navLinks = [
  { label: "Products", href: "#" },
  { label: "Solutions", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "Docs", href: "#" },
  { label: "Blog", href: "#" },
]

export default function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center border-b border-border bg-background/80 px-6 backdrop-blur">
      <a href="#" className="flex shrink-0 items-center gap-2.5">
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className="size-6 shrink-0 text-primary"
        >
          <rect x="3" y="3" width="8" height="8" transform="rotate(-6 7 7)" />
          <rect x="3" y="13" width="8" height="8" transform="rotate(5 7 17)" />
          <rect
            x="13"
            y="13"
            width="8"
            height="8"
            transform="rotate(-4 17 17)"
          />
          <rect x="13" y="3" width="8" height="8" transform="rotate(15 17 7)" />
        </svg>
        <span className="text-base font-bold tracking-tight">Acme</span>
      </a>

      <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
        {navLinks.map((link) => (
          <Button
            key={link.label}
            render={<a href={link.href} />}
            nativeButton={false}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            {link.label}
          </Button>
        ))}
      </nav>

      <div className="ml-auto flex shrink-0 items-center gap-3">
        <Button
          render={<a href="#" />}
          nativeButton={false}
          variant="ghost"
          className="hidden text-muted-foreground hover:text-foreground sm:inline-flex"
        >
          Sign In
        </Button>
        <Separator orientation="vertical" className="hidden h-5 sm:block" />
        <Button
          render={<a href="#" />}
          nativeButton={false}
          className="hidden sm:inline-flex"
        >
          Start Free Trial
          <ArrowRight data-icon="inline-end" aria-hidden="true" />
        </Button>

        <Sheet>
          <SheetTrigger
            render={
              <Button variant="outline" size="icon" className="md:hidden" />
            }
            aria-label="Open menu"
          >
            <Menu aria-hidden="true" />
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-xs">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2.5">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                  className="size-5 shrink-0 text-primary"
                >
                  <rect
                    x="3"
                    y="3"
                    width="8"
                    height="8"
                    transform="rotate(-6 7 7)"
                  />
                  <rect
                    x="3"
                    y="13"
                    width="8"
                    height="8"
                    transform="rotate(5 7 17)"
                  />
                  <rect
                    x="13"
                    y="13"
                    width="8"
                    height="8"
                    transform="rotate(-4 17 17)"
                  />
                  <rect
                    x="13"
                    y="3"
                    width="8"
                    height="8"
                    transform="rotate(15 17 7)"
                  />
                </svg>
                Acme
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col px-2">
              {navLinks.map((link) => (
                <SheetClose
                  key={link.label}
                  render={<a href={link.href} />}
                  nativeButton={false}
                  className="rounded-md px-2 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {link.label}
                </SheetClose>
              ))}
            </nav>
            <SheetFooter>
              <Button
                render={<a href="#" />}
                nativeButton={false}
                variant="ghost"
                className="w-full"
              >
                Sign In
              </Button>
              <Button
                render={<a href="#" />}
                nativeButton={false}
                className="w-full"
              >
                Start Free Trial
                <ArrowRight data-icon="inline-end" aria-hidden="true" />
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
