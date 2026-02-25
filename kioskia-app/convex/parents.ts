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
        walletType: v.optional(v.union(v.literal("general"), v.literal("healthy"))),
    },
    handler: async (ctx, args) => {
        const student = await ctx.db.get(args.studentId);
        if (!student) throw new Error("Estudiante no encontrado");

        const isHealthy = args.walletType === "healthy";
        const newBalance = isHealthy
            ? student.healthyBalance + args.amount
            : student.generalBalance + args.amount;

        if (isHealthy) {
            await ctx.db.patch(args.studentId, { healthyBalance: newBalance });
        } else {
            await ctx.db.patch(args.studentId, { generalBalance: newBalance });
        }

        await ctx.db.insert("transactions", {
            studentId: args.studentId,
            type: "recarga",
            description: `Recarga de saldo ${isHealthy ? "saludable" : "general"}`,
            amount: args.amount,
            balanceAfter: isHealthy ? student.generalBalance : newBalance, // Representing general balance is standard
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
        walletType: v.optional(v.union(v.literal("general"), v.literal("healthy"))),
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

        const isHealthy = args.walletType === "healthy";
        const newBalance = isHealthy
            ? student.healthyBalance + args.amount
            : student.generalBalance + args.amount;

        if (isHealthy) {
            await ctx.db.patch(args.studentId, { healthyBalance: newBalance });
        } else {
            await ctx.db.patch(args.studentId, { generalBalance: newBalance });
        }

        await ctx.db.insert("transactions", {
            studentId: args.studentId,
            type: "recarga",
            description: `Depósito ${isHealthy ? "saludable" : "general"} - Ref: ${args.reference}`,
            amount: args.amount,
            balanceAfter: isHealthy ? student.generalBalance : newBalance,
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

// ─── GROUP 2: NEW QUERIES & MUTATIONS ───────────────────────────

/** Get savings goals for a specific child */
export const getChildSavingsGoals = query({
    args: { studentId: v.id("students") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("savingsGoals")
            .withIndex("by_studentId", (q) => q.eq("studentId", args.studentId))
            .order("desc")
            .collect();
    },
});

/** Approve or reject a savings goal */
export const approveGoal = mutation({
    args: {
        goalId: v.id("savingsGoals"),
        approved: v.boolean(),
    },
    handler: async (ctx, args) => {
        const goal = await ctx.db.get(args.goalId);
        if (!goal) throw new Error("Meta no encontrada");

        await ctx.db.patch(args.goalId, {
            active: args.approved,
        });

        return { success: true };
    },
});

/** Get monthly analysis for a specific child */
export const getMonthlyAnalysis = query({
    args: { studentId: v.id("students") },
    handler: async (ctx, args) => {
        const allTx = await ctx.db
            .query("transactions")
            .withIndex("by_studentId", (q) => q.eq("studentId", args.studentId))
            .order("desc")
            .take(200);

        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        const monthlyTx = allTx.filter((t) => {
            const d = new Date(t._creationTime);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        });

        const purchases = monthlyTx.filter((t) => t.type === "compra");
        const recharges = monthlyTx.filter((t) => t.type === "recarga");
        const savings = monthlyTx.filter((t) => t.type === "ahorro");

        const totalSpent = purchases.reduce((s, t) => s + Math.abs(t.amount), 0);
        const healthySpent = purchases.filter((t) => t.isHealthy === true).reduce((s, t) => s + Math.abs(t.amount), 0);
        const unhealthySpent = purchases.filter((t) => t.isHealthy === false).reduce((s, t) => s + Math.abs(t.amount), 0);
        const totalRecharged = recharges.reduce((s, t) => s + Math.abs(t.amount), 0);
        const totalSaved = savings.reduce((s, t) => s + Math.abs(t.amount), 0);

        const catMap: Record<string, number> = {};
        for (const p of purchases) {
            const cat = p.category ?? "Otros";
            catMap[cat] = (catMap[cat] ?? 0) + Math.abs(p.amount);
        }
        const byCategory = Object.entries(catMap)
            .map(([name, amount]) => ({ name, amount }))
            .sort((a, b) => b.amount - a.amount);

        // Weekly breakdown (last 4 weeks)
        const weeklySpending: number[] = [0, 0, 0, 0];
        for (const p of purchases) {
            const dayOfMonth = new Date(p._creationTime).getDate();
            const weekIndex = Math.min(3, Math.floor((dayOfMonth - 1) / 7));
            weeklySpending[weekIndex] += Math.abs(p.amount);
        }

        return {
            totalSpent,
            healthySpent,
            unhealthySpent,
            totalRecharged,
            totalSaved,
            healthyPercent: totalSpent > 0 ? Math.round((healthySpent / totalSpent) * 100) : 0,
            byCategory,
            weeklySpending,
            transactionCount: monthlyTx.length,
            monthName: now.toLocaleDateString("es-CL", { month: "long", year: "numeric" }),
        };
    },
});

/** Get notifications for the logged-in parent */
export const getNotifications = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), identity.email))
            .first();
        if (!user) return [];

        return await ctx.db
            .query("notifications")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .order("desc")
            .take(50);
    },
});

/** Mark a notification as read */
export const markNotificationRead = mutation({
    args: { notificationId: v.id("notifications") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.notificationId, { read: true });
    },
});

/** Mark all notifications as read */
export const markAllNotificationsRead = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("No autenticado");

        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), identity.email))
            .first();
        if (!user) throw new Error("Usuario no encontrado");

        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .collect();

        await Promise.all(
            notifications
                .filter((n) => !n.read)
                .map((n) => ctx.db.patch(n._id, { read: true }))
        );
    },
});

/** Get snack subscriptions for a specific child */
export const getSubscriptions = query({
    args: { studentId: v.id("students") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("subscriptions")
            .withIndex("by_studentId", (q) => q.eq("studentId", args.studentId))
            .order("desc")
            .collect();
    },
});

/** Create a new subscription */
export const createSubscription = mutation({
    args: {
        studentId: v.id("students"),
        planName: v.string(),
        price: v.number(),
        items: v.array(v.string()),
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

        const nextDelivery = new Date();
        nextDelivery.setDate(nextDelivery.getDate() + 1);

        await ctx.db.insert("subscriptions", {
            studentId: args.studentId,
            parentId: parent._id,
            planName: args.planName,
            price: args.price,
            status: "active",
            nextDeliveryDate: nextDelivery.getTime(),
            items: args.items,
        });

        return { success: true };
    },
});

/** Cancel a subscription */
export const cancelSubscription = mutation({
    args: { subscriptionId: v.id("subscriptions") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.subscriptionId, { status: "canceled" });
        return { success: true };
    },
});
