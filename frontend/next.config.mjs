import { withSentryConfig } from "@sentry/nextjs";
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config, { isServer }) => {
    // Only exclude from client-side bundle
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        heapdump: false,
      };
    }

    // For server-side, mark as external to avoid bundling
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push("heapdump");
    }

    return config;
  },
};

// Check if Sentry should be enabled
const shouldEnableSentry =
  process.env.ENV === "prod" &&
  !!process.env.SENTRY_ORG &&
  !!process.env.SENTRY_PROJECT;

// Only wrap with Sentry config if conditions are met
const configWithSentry = shouldEnableSentry
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,

      // Auth token is optional - only used if available
      // authToken: process.env.SENTRY_AUTH_TOKEN,

      silent: !process.env.CI,
      widenClientFileUpload: true,
      tunnelRoute: "/monitoring",
      disableLogger: true,
      automaticVercelMonitors: true,
    })
  : nextConfig;

export default configWithSentry;
