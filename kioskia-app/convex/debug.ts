import { query } from "./_generated/server";
import { v } from "convex/values";

/** Check all users and students for a given email — NO auth required */
export const inspectEmail = query({
    args: { email: v.string() },
    handler: async (ctx, { email }) => {
        const users = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), email))
            .collect();

        const results = [];
        for (const user of users) {
            const student = await ctx.db
                .query("students")
                .withIndex("by_userId", (q) => q.eq("userId", user._id))
                .first();
            results.push({
                userId: user._id,
                userEmail: user.email,
                hasStudent: !!student,
                studentName: student?.fullName ?? null,
            });
        }
        return { email, totalUsers: users.length, records: results };
    },
});

/** Check auth session tables */
export const inspectAuth = query({
    args: {},
    handler: async (ctx) => {
        const sessions = await ctx.db.query("authSessions").collect();
        const accounts = await ctx.db.query("authAccounts").collect();
        const refreshTokens = await ctx.db.query("authRefreshTokens").collect();

        return {
            totalSessions: sessions.length,
            sessions: sessions.map(s => ({
                id: s._id,
                userId: s.userId,
                expirationTime: s.expirationTime,
                expired: s.expirationTime ? s.expirationTime < Date.now() : "no_expiry",
            })),
            totalAccounts: accounts.length,
            accounts: accounts.map(a => ({
                id: a._id,
                userId: a.userId,
                provider: a.provider,
                providerAccountId: a.providerAccountId,
            })),
            totalRefreshTokens: refreshTokens.length,
            refreshTokens: refreshTokens.map(t => ({
                id: t._id,
                sessionId: t.sessionId,
                expirationTime: t.expirationTime,
                expired: t.expirationTime ? t.expirationTime < Date.now() : "no_expiry",
            })),
        };
    },
});
