import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/** Get the logged-in student's profile */
export const getProfile = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        // Find users by email, iterate to find one with a student profile
        const email = identity.email;
        if (!email) return null;

        const users = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), email))
            .collect();

        for (const user of users) {
            const student = await ctx.db
                .query("students")
                .withIndex("by_userId", (q) => q.eq("userId", user._id))
                .first();
            if (student) {
                return {
                    ...student,
                    generalBalance: student.generalBalance ?? (student as any).balance ?? 0,
                    healthyBalance: student.healthyBalance ?? 0,
                    avatarInitials: student.avatarInitials ?? student.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
                };
            }
        }

        // Fallback: look up student directly by email
        const studentByEmail = await ctx.db
            .query("students")
            .filter((q) => q.eq(q.field("email"), email))
            .first();
        if (studentByEmail) {
            return {
                ...studentByEmail,
                generalBalance: studentByEmail.generalBalance ?? (studentByEmail as any).balance ?? 0,
                healthyBalance: studentByEmail.healthyBalance ?? 0,
                avatarInitials: studentByEmail.avatarInitials ?? studentByEmail.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
            };
        }
        return null;
    },
});

/** Get the student's latest savings goal */
export const getSavingsGoal = query({
    args: { studentId: v.optional(v.id("students")) },
    handler: async (ctx, args) => {
        let studentId = args.studentId;
        if (!studentId) {
            const identity = await ctx.auth.getUserIdentity();
            if (!identity) return null;
            const user = await ctx.db
                .query("users")
                .filter((q) => q.eq(q.field("email"), identity.email))
                .first();
            if (!user) return null;
            const student = await ctx.db
                .query("students")
                .withIndex("by_userId", (q) => q.eq("userId", user._id))
                .first();
            if (!student) return null;
            studentId = student._id;
        }

        const goals = await ctx.db
            .query("savingsGoals")
            .withIndex("by_studentId", (q) => q.eq("studentId", studentId!))
            .order("desc")
            .take(1);
        return goals[0] ?? null;
    },
});

/** Get student transactions with optional type filter */
export const getTransactions = query({
    args: {
        studentId: v.optional(v.id("students")),
        filterType: v.optional(
            v.union(
                v.literal("compra"),
                v.literal("recarga"),
                v.literal("ahorro"),
                v.literal("premio")
            )
        ),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        let studentId = args.studentId;
        if (!studentId) {
            const identity = await ctx.auth.getUserIdentity();
            if (!identity) return [];
            const user = await ctx.db
                .query("users")
                .filter((q) => q.eq(q.field("email"), identity.email))
                .first();
            if (!user) return [];
            const student = await ctx.db
                .query("students")
                .withIndex("by_userId", (q) => q.eq("userId", user._id))
                .first();
            if (!student) return [];
            studentId = student._id;
        }

        const txQuery = ctx.db
            .query("transactions")
            .withIndex("by_studentId", (q) => q.eq("studentId", studentId!))
            .order("desc");

        const all = await txQuery.take(args.limit ?? 20);

        if (args.filterType) {
            return all.filter((t) => t.type === args.filterType);
        }
        return all;
    },
});

/** Get spending summary by category */
export const getSpendingSummary = query({
    args: { studentId: v.optional(v.id("students")) },
    handler: async (ctx, args) => {
        let studentId = args.studentId;
        if (!studentId) {
            const identity = await ctx.auth.getUserIdentity();
            if (!identity) return null;
            const user = await ctx.db
                .query("users")
                .filter((q) => q.eq(q.field("email"), identity.email))
                .first();
            if (!user) return null;
            const student = await ctx.db
                .query("students")
                .withIndex("by_userId", (q) => q.eq("userId", user._id))
                .first();
            if (!student) return null;
            studentId = student._id;
        }

        const transactions = await ctx.db
            .query("transactions")
            .withIndex("by_studentId", (q) => q.eq("studentId", studentId!))
            .order("desc")
            .take(100);

        const purchases = transactions.filter((t) => t.type === "compra");
        const totalSpent = purchases.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const healthySpent = purchases
            .filter((t) => t.isHealthy === true)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const unhealthySpent = purchases
            .filter((t) => t.isHealthy === false)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const totalSaved = transactions
            .filter((t) => t.type === "ahorro")
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const totalRecharges = transactions
            .filter((t) => t.type === "recarga")
            .reduce((sum, t) => sum + t.amount, 0);

        // Group by category
        const categoryMap: Record<string, number> = {};
        for (const p of purchases) {
            const cat = p.category ?? "Otros";
            categoryMap[cat] = (categoryMap[cat] ?? 0) + Math.abs(p.amount);
        }
        const byCategory = Object.entries(categoryMap).map(([name, amount]) => ({
            name,
            amount,
        }));

        return {
            totalSpent,
            healthySpent,
            unhealthySpent,
            totalSaved,
            totalRecharges,
            byCategory,
            healthyPercent: totalSpent > 0 ? Math.round((healthySpent / totalSpent) * 100) : 0,
        };
    },
});

/** Create a new savings goal */
export const createSavingsGoal = mutation({
    args: {
        name: v.string(),
        targetAmount: v.number(),
        icon: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("No autenticado");

        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), identity.email))
            .first();
        if (!user) throw new Error("Usuario no encontrado");

        const student = await ctx.db
            .query("students")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .first();
        if (!student) throw new Error("Perfil de estudiante no encontrado");

        return await ctx.db.insert("savingsGoals", {
            studentId: student._id,
            name: args.name,
            targetAmount: args.targetAmount,
            currentAmount: 0,
            icon: args.icon ?? "🎯",
            imageUrl: args.imageUrl,
        });
    },
});

/** Transfer balance to savings goal */
export const transferToSavings = mutation({
    args: {
        goalId: v.id("savingsGoals"),
        amount: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("No autenticado");

        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), identity.email))
            .first();
        if (!user) throw new Error("Usuario no encontrado");

        const student = await ctx.db
            .query("students")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .first();
        if (!student) throw new Error("Perfil no encontrado");

        if (student.generalBalance < args.amount) {
            throw new Error("Saldo insuficiente");
        }

        const newBalance = student.generalBalance - args.amount;

        // Update student balance
        await ctx.db.patch(student._id, { generalBalance: newBalance });

        // Update savings goal
        const goal = await ctx.db.get(args.goalId);
        if (!goal) throw new Error("Meta de ahorro no encontrada");
        await ctx.db.patch(args.goalId, {
            currentAmount: goal.currentAmount + args.amount,
        });

        // Create transaction record
        await ctx.db.insert("transactions", {
            studentId: student._id,
            type: "ahorro",
            description: "Transferencia a meta de ahorro",
            amount: -args.amount,
            balanceAfter: newBalance,
            icon: "savings",
            category: "Ahorro",
        });
    },
});

/** Update student profile */
export const updateProfile = mutation({
    args: {
        fullName: v.optional(v.string()),
        email: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("No autenticado");

        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), identity.email))
            .first();
        if (!user) throw new Error("Usuario no encontrado");

        const student = await ctx.db
            .query("students")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .first();
        if (!student) throw new Error("Perfil no encontrado");

        const updates: Record<string, string> = {};
        if (args.fullName) updates.fullName = args.fullName;
        if (args.email) updates.email = args.email;

        await ctx.db.patch(student._id, updates);
    },
});
