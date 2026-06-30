// Optional local preview server for the blog. Run with Bun:
//
//     bun serve.js            # serves this folder at http://127.0.0.1:8731/
//     PORT=3000 bun serve.js  # on a different port
//
// (Needed because the blog reads files with fetch(), which browsers block over
// file://. Any static server works — this is just a zero-config convenience.)
const ROOT = import.meta.dir;
const PORT = Number(Bun.env.PORT) || 8731;

Bun.serve({
  port: PORT,
  hostname: "127.0.0.1",
  async fetch(req) {
    let pathname = decodeURIComponent(new URL(req.url).pathname);
    if (pathname.endsWith("/")) pathname += "index.html";
    const file = Bun.file(ROOT + pathname);
    if (await file.exists()) {
      return new Response(file, { headers: { "Cache-Control": "no-cache" } });
    }
    return new Response("404 Not Found: " + pathname, { status: 404 });
  },
});

console.log("Serving " + ROOT + " on http://127.0.0.1:" + PORT + "/");
