# HumaMap Product V2 Cloudflare preview

This branch hosts a read-only static Cloudflare Pages snapshot of the isolated
Product V2 render fixture. It does not connect to production data, accept writes,
or modify the active `product-v2` implementation branch.

The static snapshot:

- opens directly at the project root;
- contains only fixture/example data;
- contains no login or editing controls;
- has no backend, authentication, database or write operations; and
- is served with `noindex` and restrictive security headers.

The snapshot has no runtime dependency on Vercel. Updating the Product V2 branch
does not change this preview source.
