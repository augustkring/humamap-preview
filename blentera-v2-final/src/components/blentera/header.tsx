"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
  { label: "Product", href: "#product" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Control", href: "#control" },
  { label: "Pricing", href: "#pricing" },
]

const earlyAccess =
  "mailto:ak@augustkring.com?subject=BLENTERA%20early%20access"

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-6">
        <a href="/" className="flex shrink-0 items-center">
          <span className="text-sm font-bold tracking-[0.16em]">BLENTERA</span>
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <Button
            render={<a href="mailto:ak@augustkring.com?subject=BLENTERA" />}
            nativeButton={false}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            Contact
          </Button>
          <Button render={<a href={earlyAccess} />} nativeButton={false}>
            Join early access
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                aria-label="Open menu"
                className="ml-auto md:hidden"
              />
            }
          >
            <Menu aria-hidden="true" />
          </SheetTrigger>
          <SheetContent side="right" className="w-3/4 max-w-xs">
            <SheetHeader>
              <SheetTitle className="text-sm font-bold tracking-[0.16em]">
                BLENTERA
              </SheetTitle>
            </SheetHeader>

            <nav className="flex flex-col px-4">
              {navLinks.map((link) => (
                <SheetClose
                  key={link.label}
                  nativeButton={false}
                  render={
                    <a
                      href={link.href}
                      className="border-b border-border py-3 text-sm font-medium text-muted-foreground transition-colors last:border-b-0 hover:text-foreground"
                    />
                  }
                >
                  {link.label}
                </SheetClose>
              ))}
            </nav>

            <SheetFooter>
              <SheetClose
                nativeButton={false}
                render={
                  <Button
                    render={<a href="mailto:ak@augustkring.com?subject=BLENTERA" />}
                    nativeButton={false}
                    variant="outline"
                    className="w-full"
                  />
                }
              >
                Contact
              </SheetClose>
              <SheetClose
                nativeButton={false}
                render={
                  <Button
                    render={<a href={earlyAccess} />}
                    nativeButton={false}
                    className="w-full"
                  />
                }
              >
                Join early access
                <ArrowRight data-icon="inline-end" aria-hidden="true" />
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
