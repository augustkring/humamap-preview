import Link from "next/link";
import { site } from "@/content/site";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link href="/" className="wordmark" aria-label="BLENTERA home">
          BLENTERA
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {site.navigation.map((item) => (
            <Link key={item.href} href={item.href}>{item.label}</Link>
          ))}
        </nav>

        <div className="header-actions">
          <a className="text-link desktop-only" href={site.contactHref}>Contact</a>
          <details className="mobile-menu">
            <summary aria-label="Open navigation">Menu</summary>
            <nav aria-label="Mobile navigation">
              {site.navigation.map((item) => (
                <Link key={item.href} href={item.href}>{item.label}</Link>
              ))}
              <a href={site.contactHref}>Contact</a>
            </nav>
          </details>
          <a className="button button-dark" href={site.primaryCta.href}>{site.primaryCta.label}</a>
        </div>
      </div>
    </header>
  );
}
