const SNAPSHOT = "https://raw.githubusercontent.com/augustkring/humamap-preview/95feacbc8eaf45fe0b2aa93161daaf33803c2980/augustkring";

function fileForPath(pathname) {
  if (pathname === "/") return "/index.html";
  if (pathname.endsWith("/")) return pathname + "index.html";
  return pathname;
}

function contentType(pathname) {
  if (pathname.endsWith(".html") || pathname.endsWith("/")) return "text/html; charset=utf-8";
  if (pathname.endsWith(".css")) return "text/css; charset=utf-8";
  if (pathname.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (pathname.endsWith(".woff2")) return "font/woff2";
  if (pathname.endsWith(".webp")) return "image/webp";
  if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg")) return "image/jpeg";
  if (pathname.endsWith(".png")) return "image/png";
  if (pathname.endsWith(".ico")) return "image/x-icon";
  if (pathname.endsWith(".svg")) return "image/svg+xml";
  return "application/octet-stream";
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = fileForPath(url.pathname);
    const upstream = await fetch(SNAPSHOT + path, {
      headers: { "User-Agent": "AugustKring-Cloudflare-Preview" }
    });

    if (!upstream.ok) {
      return new Response("Not found", { status: 404, headers: { "X-Robots-Tag": "noindex" } });
    }

    const headers = new Headers();
    headers.set("Content-Type", contentType(path));
    headers.set("Cache-Control", "no-store, max-age=0");
    headers.set("X-Robots-Tag", "noindex, nofollow");

    if (path.endsWith(".html")) {
      let body = await upstream.text();
      body = body.replace(
        /<base href="[^"]*">/i,
        '<base href="/">'
      );
      return new Response(body, { status: 200, headers });
    }

    return new Response(upstream.body, { status: 200, headers });
  }
};
