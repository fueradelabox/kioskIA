import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/** Get all children linked to the logged-in parent */
export const getChildren = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), identity.email))
            .first();
        if (!user) return [];

        const parent = await ctx.db
            .query("parents")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .first();
        if (!parent) return [];

        const links = await ctx.db
            .query("parentStudents")
            .withIndex("by_parentId", (q) => q.eq("parentId", parent._id))
            .collect();

        const children = await Promise.all(
            links.map(async (link) => {
                const student = await ctx.db.get(link.studentId);
                if (!student) return null;
                return {
                    ...student,
                    initials: student.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase(),
                };
            })
        );

        return children.filter(Boolean);
    },
});

/** Get dashboard data for a specific child */
export const getChildDashboard = query({
    args: { studentId: v.id("students") },
    handler: async (ctx, args) => {
        const student = await ctx.db.get(args.studentId);

        const transactions = await ctx.db
            .query("transactions")
            .withIndex("by_studentId", (q) => q.eq("studentId", args.studentId))
            .order("desc")
            .take(10);

        const goals = await ctx.db
            .query("savingsGoals")
            .withIndex("by_studentId", (q) => q.eq("studentId", args.studentId))
            .order("desc")
            .take(1);

        const limits = await ctx.db
            .query("consumptionLimits")
            .withIndex("by_studentId", (q) => q.eq("studentId", args.studentId))
            .first();

        return {
            student,
            transactions,
            savingsGoal: goals[0] ?? null,
            limit: limits,
        };
    },
});

/** Get child spending summary */
export const getChildSpendingSummary = query({
    args: { studentId: v.id("students") },
    handler: async (ctx, args) => {
        const transactions = await ctx.db
            .query("transactions")
            .withIndex("by_studentId", (q) => q.eq("studentId", args.studentId))
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
            byCategory,
            healthyPercent: totalSpent > 0 ? Math.round((healthySpent / totalSpent) * 100) : 0,
        };
    },
});

/** Get parent profile */
export const getProfile = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), identity.email))
            .first();
        if (!user) return null;

        return await ctx.db
            .query("parents")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .first();
    },
});

/** Update consumption limits for a child */
export const updateConsumptionLimit = mutation({
    args: {
        studentId: v.id("students"),
        enabled: v.boolean(),
        unhealthyPercent: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("No autenticado");

        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), identity.email))
            .first();
        if (!user) throw new Error("Usuario no encontrado");

        const parent = await ctx.db
            .query("parents")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .first();
        if (!parent) throw new Error("Perfil de padre no encontrado");

        const existing = await ctx.db
            .query("consumptionLimits")
            .withIndex("by_studentId", (q) => q.eq("studentId", args.studentId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                enabled: args.enabled,
                unhealthyPercent: args.unhealthyPercent,
                setBy: parent._id,
            });
        } else {
            await ctx.db.insert("consumptionLimits", {
                studentId: args.studentId,
                enabled: args.enabled,
                unhealthyPercent: args.unhealthyPercent,
                setBy: parent._id,
            });
        }
    },
});

/** Recharge student balance */
export const rechargeBalance = mutation({
    args: {
        studentId: v.id("students"),
        amount: v.number(),
    },
    handler: async (ctx, args) => {
        const student = await ctx.db.get(args.studentId);
        if (!student) throw new Error("Estudiante no encontrado");

        const newBalance = student.balance + args.amount;
        await ctx.db.patch(args.studentId, { balance: newBalance });

        await ctx.db.insert("transactions", {
            studentId: args.studentId,
            type: "recarga",
            description: "Recarga de saldo",
            amount: args.amount,
            balanceAfter: newBalance,
            icon: "account_balance_wallet",
            category: "Recarga",
        });
    },
});

/** Create a deposit (bank transfer) */
export const createDeposit = mutation({
    args: {
        studentId: v.id("students"),
        amount: v.number(),
        reference: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("No autenticado");

        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), identity.email))
            .first();
        if (!user) throw new Error("Usuario no encontrado");

        const parent = await ctx.db
            .query("parents")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .first();
        if (!parent) throw new Error("Perfil de padre no encontrado");

        // Create the deposit record
        await ctx.db.insert("deposits", {
            parentId: parent._id,
            studentId: args.studentId,
            amount: args.amount,
            method: "transfer",
            reference: args.reference,
            status: "pending",
        });

        // For now, auto-confirm and add balance immediately
        const student = await ctx.db.get(args.studentId);
        if (!student) throw new Error("Estudiante no encontrado");

        const newBalance = student.balance + args.amount;
        await ctx.db.patch(args.studentId, { balance: newBalance });

        await ctx.db.insert("transactions", {
            studentId: args.studentId,
            type: "recarga",
            description: `Depósito transferencia - Ref: ${args.reference}`,
            amount: args.amount,
            balanceAfter: newBalance,
            icon: "account_balance",
            category: "Recarga",
        });

        return { success: true };
    },
});

/** Get deposits for the logged-in parent */
export const getDeposits = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), identity.email))
            .first();
        if (!user) return [];

        const parent = await ctx.db
            .query("parents")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .first();
        if (!parent) return [];

        return await ctx.db
            .query("deposits")
            .withIndex("by_parentId", (q) => q.eq("parentId", parent._id))
            .order("desc")
            .take(50);
    },
});

/** Reward savings — parent adds a bonus to child's savings goal */
export const rewardSavings = mutation({
    args: {
        studentId: v.id("students"),
        goalId: v.id("savingsGoals"),
        amount: v.number(),
        message: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const goal = await ctx.db.get(args.goalId);
        if (!goal) throw new Error("Meta de ahorro no encontrada");

        await ctx.db.patch(args.goalId, {
            currentAmount: goal.currentAmount + args.amount,
        });

        await ctx.db.insert("transactions", {
            studentId: args.studentId,
            type: "premio",
            description: args.message || "Premio de ahorro",
            amount: args.amount,
            balanceAfter: 0,
            icon: "stars",
            category: "Premio",
        });
    },
});
