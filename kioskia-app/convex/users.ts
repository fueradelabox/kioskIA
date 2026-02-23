import { query } from "./_generated/server";

export type UserRole = "student" | "parent" | "vendor" | null;

/** Detect user role by checking which profile table has the user */
export const getRole = query({
    args: {},
    handler: async (ctx): Promise<{ role: UserRole; profileId: string | null }> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { role: null, profileId: null };

        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), identity.email))
            .first();
        if (!user) return { role: null, profileId: null };

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

        return { role: null, profileId: null };
    },
});
