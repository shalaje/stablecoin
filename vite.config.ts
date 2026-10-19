import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";
import { fileURLToPath } from "node:url";

// In dev, serve the Vercel function at /api/demo so the form works locally.
function devApi(): Plugin {
  return {
    name: "arcway-dev-api",
    configureServer(server) {
      server.middlewares.use("/api/demo", async (req, res) => {
        const mod = await server.ssrLoadModule("/api/demo.ts");
        const chunks: Buffer[] = [];
        for await (const c of req) chunks.push(c as Buffer);
        const request = new Request("http://localhost/api/demo", {
          method: req.method,
          headers: req.headers as Record<string, string>,
          body: req.method === "POST" ? Buffer.concat(chunks) : undefined,
        });
        const handler = req.method === "POST" ? mod.POST : mod.GET;
        const response: Response = handler ? await handler(request) : new Response(null, { status: 405 });
        res.statusCode = response.status;
        response.headers.forEach((v, k) => res.setHeader(k, v));
        res.end(await response.text());
      });
    },
  };
}

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), devApi()],
  resolve: { alias: { "~": fileURLToPath(new URL("./app", import.meta.url)) } },
  build: { target: "es2022" },
});
