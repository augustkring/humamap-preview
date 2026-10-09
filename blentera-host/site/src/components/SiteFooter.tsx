import Link from "next/link";
import { site } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <Link href="/" className="wordmark">BLENTERA</Link>
          <p className="footer-tagline">Make company AI capability cumulative, not disposable.</p>
        </div>
        <div className="footer-nav">
          <span>Explore</span>
          {site.navigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
        </div>
        <div className="footer-nav">
          <span>Contact</span>
          <a href={site.contactHref}>Contact BLENTERA</a>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 BLENTERA</span>
        <span>Company AI foundation</span>
      </div>
    </footer>
  );
}
