import { query } from "./_generated/server";

export const checkEnv = query({
    args: {},
    handler: async () => {
        return {
            SITE_URL: process.env.SITE_URL ?? "NOT SET",
            CONVEX_SITE_URL: process.env.CONVEX_SITE_URL ?? "NOT SET",
            AUTH_RESEND_KEY: process.env.AUTH_RESEND_KEY ? "SET (hidden)" : "NOT SET",
        };
    },
});
