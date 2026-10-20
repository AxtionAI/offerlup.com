import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Cache Components requires every dynamic data access (cookies, session
  // reads) to be wrapped in Suspense or explicitly opted in per route. This
  // app is a fully session-gated multi-portal app (seller/investor/admin),
  // so nearly every route is dynamic by nature — disabled in favor of the
  // traditional dynamic-rendering model.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
