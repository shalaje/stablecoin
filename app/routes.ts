import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [index("routes/home.tsx"), route("developers", "routes/developers.tsx"), route("*", "routes/not-found.tsx")] satisfies RouteConfig;
