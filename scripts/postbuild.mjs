// Vercel serves /404.html for unknown paths; the splat route was pre-rendered at /404.
import { copyFileSync, existsSync } from "node:fs";
const src = "build/client/404/index.html";
if (existsSync(src)) copyFileSync(src, "build/client/404.html");
