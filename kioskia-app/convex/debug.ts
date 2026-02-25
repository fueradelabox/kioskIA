import { query } from "./_generated/server";

/** Check env vars from QUERY runtime (V8) */
export const checkEnvQuery = query({
    args: {},
    handler: async () => {
        return {
            runtime: "query (V8)",
            JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY ? `SET (${process.env.JWT_PRIVATE_KEY.length} chars)` : "NOT SET",
            JWKS: process.env.JWKS ? `SET (${process.env.JWKS.length} chars)` : "NOT SET",
            SITE_URL: process.env.SITE_URL ?? "NOT SET",
            AUTH_RESEND_KEY: process.env.AUTH_RESEND_KEY ? "SET" : "NOT SET",
            CONVEX_SITE_URL: process.env.CONVEX_SITE_URL ?? "NOT SET",
        };
    },
});

/** Inspect all auth-related data */
export const inspectAll = query({
    args: {},
    handler: async (ctx) => {
        // Get all users
        const users = await ctx.db.query("users").collect();

        // Get all students
        const students = await ctx.db.query("students").collect();

        // Get all parents
        const parents = await ctx.db.query("parents").collect();

        // Get all vendors
        const vendors = await ctx.db.query("vendors").collect();

        // Get auth sessions
        let sessions: Record<string, unknown>[] = [];
        try {
            sessions = await ctx.db.query("authSessions").collect();
        } catch {
            // table might not exist
        }

        // Get auth accounts
        let accounts: Record<string, unknown>[] = [];
        try {
            accounts = await ctx.db.query("authAccounts").collect();
        } catch {
            // table might not exist
        }

        // Get current identity
        const identity = await ctx.auth.getUserIdentity();

        return {
            identity: identity ? {
                subject: identity.subject,
                email: identity.email,
                name: identity.name,
                tokenIdentifier: identity.tokenIdentifier,
            } : null,
            users: users.map(u => ({
                id: u._id,
                email: u.email,
                name: u.name,
            })),
            students: students.map(s => ({
                id: s._id,
                userId: s.userId,
                email: s.email,
                fullName: s.fullName,
            })),
            parents: parents.map(p => ({
                id: p._id,
                userId: p.userId,
                fullName: p.fullName,
            })),
            vendors: vendors.map(v => ({
                id: v._id,
                userId: v.userId,
                businessName: v.businessName,
            })),
            sessions: sessions.length,
            accounts: accounts.map(a => ({
                id: a._id,
                provider: a.provider,
                providerAccountId: a.providerAccountId,
                userId: a.userId,
            })),
        };
    },
});
