import { query } from "./_generated/server";

export type UserRole = "student" | "parent" | "vendor" | null;

/** Detect user role by checking which profile table has the user */
export const getRole = query({
    args: {},
    handler: async (ctx): Promise<{ role: UserRole; profileId: string | null }> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { role: null, profileId: null };

        const tokenIdentifier = identity.tokenIdentifier;
        const subject = identity.subject;

        const authAccounts = await ctx.db.query("authAccounts").collect();
        let authEmail: string | undefined;

        for (const account of authAccounts) {
            if (String(account.userId) === subject || tokenIdentifier?.includes(String(account.userId))) {
                authEmail = account.providerAccountId; // This is the email for resend provider
                break;
            }
        }

        const email = identity.email ?? authEmail;
        if (!email) return { role: null, profileId: null };

        const users = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), email))
            .collect();

        if (users.length === 0) return { role: null, profileId: null };

        for (const user of users) {
            const student = await ctx.db
                .query("students")
                .withIndex("by_userId", (q) => q.eq("userId", user._id))
                .first();
            if (student) return { role: "student", profileId: student._id };

            const parent = await ctx.db
                .query("parents")
                .withIndex("by_userId", (q) => q.eq("userId", user._id))
                .first();
            if (parent) return { role: "parent", profileId: parent._id };

            const vendor = await ctx.db
                .query("vendors")
                .withIndex("by_userId", (q) => q.eq("userId", user._id))
                .first();
            if (vendor) return { role: "vendor", profileId: vendor._id };
        }

        return { role: null, profileId: null };
    },
});
