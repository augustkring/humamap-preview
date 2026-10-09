import { Separator } from "@/components/ui/separator"

const columns = [
  {
    title: "Product",
    links: [
      { label: "Foundation", href: "#product" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Control", href: "#control" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      {
        label: "Early access",
        href: "mailto:ak@augustkring.com?subject=BLENTERA%20early%20access",
      },
      {
        label: "Contact",
        href: "mailto:ak@augustkring.com?subject=BLENTERA",
      },
    ],
  },
  {
    title: "Principles",
    links: [
      { label: "Shared context", href: "#product" },
      { label: "Governed memory", href: "#product" },
      { label: "Provider portability", href: "#control" },
    ],
  },
]

export default function Footer() {
  return (
    <section className="flex w-full flex-col">
      <footer className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="max-w-sm">
            <a href="/" className="flex items-center">
              <span className="text-sm font-bold tracking-[0.16em]">
                BLENTERA
              </span>
            </a>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              The company AI foundation that keeps knowledge, work, governance
              and learning usable as people and technology change.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="font-heading text-sm font-bold tracking-tight">
                  {column.title}
                </h3>
                <ul className="mt-3 flex flex-col gap-2">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <Separator className="mt-10" />

        <div className="flex flex-col items-start gap-2 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 BLENTERA. All rights reserved.</p>
          <p>Company AI foundation</p>
        </div>
      </footer>
    </section>
  )
}
