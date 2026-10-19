import type { Config } from "@react-router/dev/config";

// Static, pre-rendered build: real HTML for every v1 page, hydrated on the client.
// /404 is pre-rendered from the splat route and copied to 404.html by scripts/postbuild.mjs.
export default {
  ssr: false,
  prerender: ["/", "/developers", "/404"],
} satisfies Config;
