import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getAuthEmail(ctx: any, identity: any) {
    let email = identity.email;
    if (!email) {
        const authAccounts = await ctx.db.query("authAccounts").collect();
        for (const account of authAccounts) {
            if (String(account.userId) === identity.subject || identity.tokenIdentifier?.includes(String(account.userId))) {
                email = account.providerAccountId;
                break;
            }
        }
    }
    return email;
}

/** Get the active product catalog */
export const getProducts = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("products")
            .withIndex("by_active", (q) => q.eq("active", true))
            .collect();
    },
});

/** Find a product by barcode */
export const findProductByBarcode = query({
    args: { barcode: v.string() },
    handler: async (ctx, args) => {
        if (!args.barcode) return null;
        const product = await ctx.db
            .query("products")
            .withIndex("by_barcode", (q) => q.eq("barcode", args.barcode))
            .first();
        return product && product.active ? product : null;
    },
});

/** Find a student by RUT (for vendor POS lookup) */
export const findStudentByRut = query({
    args: { rut: v.string() },
    handler: async (ctx, args) => {
        const student = await ctx.db
            .query("students")
            .withIndex("by_rut", (q) => q.eq("rut", args.rut))
            .first();

        if (!student) return null;

        return {
            _id: student._id,
            fullName: student.fullName,
            generalBalance: student.generalBalance,
            healthyBalance: student.healthyBalance,
            avatarInitials: student.avatarInitials,
            grade: student.grade,
        };
    },
});

/** Find a student by QR code */
export const findStudentByQR = query({
    args: { qrCode: v.string() },
    handler: async (ctx, args) => {
        const student = await ctx.db
            .query("students")
            .withIndex("by_qrCode", (q) => q.eq("qrCode", args.qrCode))
            .first();

        if (!student) return null;

        return {
            _id: student._id,
            fullName: student.fullName,
            generalBalance: student.generalBalance,
            healthyBalance: student.healthyBalance,
            avatarInitials: student.avatarInitials,
            grade: student.grade,
        };
    },
});

export const findStudentByBiometric = query({
    args: { biometricId: v.string() },
    handler: async (ctx, args) => {
        const student = await ctx.db
            .query("students")
            .withIndex("by_biometricId", (q) => q.eq("biometricId", args.biometricId))
            .first();

        if (!student) {
            throw new Error("Estudiante no encontrado");
        }

        return {
            _id: student._id,
            fullName: student.fullName,
            generalBalance: student.generalBalance,
            healthyBalance: student.healthyBalance,
            avatarInitials: student.avatarInitials,
            grade: student.grade,
        };
    },
});

/** Get vendor profile */
export const getProfile = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const email = await getAuthEmail(ctx, identity);
        if (!email) return null;

        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), email))
            .first();
        if (!user) return null;

        return await ctx.db
            .query("vendors")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .first();
    },
});

/** Get vendor sales summary */
export const getVendorSales = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { sales: [], todayTotal: 0, todayCount: 0, todayHealthy: 0, todayUnhealthy: 0, todayLibrary: 0 };

        const email = await getAuthEmail(ctx, identity);
        if (!email) return { sales: [], todayTotal: 0, todayCount: 0, todayHealthy: 0, todayUnhealthy: 0, todayLibrary: 0 };

        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), email))
            .first();
        if (!user) return { sales: [], todayTotal: 0, todayCount: 0, todayHealthy: 0, todayUnhealthy: 0, todayLibrary: 0 };

        const vendor = await ctx.db
            .query("vendors")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .first();
        if (!vendor) return { sales: [], todayTotal: 0, todayCount: 0, todayHealthy: 0, todayUnhealthy: 0, todayLibrary: 0 };

        const sales = await ctx.db
            .query("transactions")
            .withIndex("by_vendorId", (q) => q.eq("vendorId", vendor._id))
            .order("desc")
            .take(50);

        // Calculate today's totals
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const todaySales = sales.filter((s) => s._creationTime >= todayStart);

        const todayTotal = todaySales.reduce((sum, s) => sum + Math.abs(s.amount), 0);
        const todayCount = todaySales.length;
        const todayHealthy = todaySales
            .filter((s) => s.isHealthy === true)
            .reduce((sum, s) => sum + Math.abs(s.amount), 0);
        const todayUnhealthy = todaySales
            .filter((s) => s.isHealthy === false && s.category !== "Librería")
            .reduce((sum, s) => sum + Math.abs(s.amount), 0);
        const todayLibrary = todaySales
            .filter((s) => s.category === "Librería")
            .reduce((sum, s) => sum + Math.abs(s.amount), 0);

        return { sales, todayTotal, todayCount, todayHealthy, todayUnhealthy, todayLibrary };
    },
});

/** Add a quick product (fruit without barcode) */
export const addQuickProduct = mutation({
    args: {
        name: v.string(),
        price: v.number(),
        icon: v.optional(v.string()),
        category: v.optional(v.string()),
        isHealthy: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("products", {
            name: args.name,
            price: args.price,
            icon: args.icon ?? "🍎",
            category: args.category ?? "Frutas",
            isHealthy: args.isHealthy ?? true,
            active: true,
        });
    },
});

/** Process a POS payment */
export const processPayment = mutation({
    args: {
        studentRut: v.string(),
        items: v.array(
            v.object({
                productId: v.optional(v.id("products")),
                name: v.optional(v.string()),
                price: v.optional(v.number()),
                qty: v.number(),
                isHealthy: v.optional(v.boolean()),
            })
        ),
    },
    handler: async (ctx, args) => {
        // Get vendor identity
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("No autenticado");

        const email = await getAuthEmail(ctx, identity);
        if (!email) throw new Error("Usuario sin email configurado");

        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), email))
            .first();
        if (!user) throw new Error("Usuario no encontrado");

        const vendor = await ctx.db
            .query("vendors")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .first();
        if (!vendor) throw new Error("Perfil de vendedor no encontrado");

        // Find student by RUT
        const student = await ctx.db
            .query("students")
            .withIndex("by_rut", (q) => q.eq("rut", args.studentRut))
            .first();
        if (!student) throw new Error("Estudiante no encontrado");

        // Resolve products and calculate totals
        const resolvedItems = await Promise.all(
            args.items.map(async (item) => {
                if (item.productId) {
                    const product = await ctx.db.get(item.productId);
                    if (!product) throw new Error(`Producto no encontrado: ${item.productId}`);
                    return {
                        name: product.name,
                        price: product.price,
                        qty: item.qty,
                        isHealthy: product.isHealthy,
                        category: product.category,
                        icon: product.icon,
                        productId: product._id,
                    };
                }
                // Manual product (fruit without barcode)
                return {
                    name: item.name ?? "Producto",
                    price: item.price ?? 0,
                    qty: item.qty,
                    isHealthy: item.isHealthy ?? true,
                    category: "Frutas",
                    icon: "🍎",
                    productId: undefined,
                };
            })
        );

        const total = resolvedItems.reduce((s, i) => s + i.price * i.qty, 0);

        const healthyItemsTotal = resolvedItems
            .filter((i) => i.isHealthy)
            .reduce((s, i) => s + i.price * i.qty, 0);

        const unhealthyItemsTotal = resolvedItems
            .filter((i) => !i.isHealthy)
            .reduce((s, i) => s + i.price * i.qty, 0);

        // Calculate minimum required general balance
        // We use healthyBalance to pay for healthy items first.
        const healthyCoveredByHealthyBalance = Math.min(student.healthyBalance, healthyItemsTotal);
        const healthyRemainingToPay = healthyItemsTotal - healthyCoveredByHealthyBalance;

        const requiredGeneralBalance = unhealthyItemsTotal + healthyRemainingToPay;

        if (student.generalBalance < requiredGeneralBalance) {
            if (student.generalBalance + student.healthyBalance >= total) {
                throw new Error("Saldo insuficiente: Los productos no saludables solo pueden pagarse con el Saldo General Libre.");
            } else {
                throw new Error("Saldo insuficiente");
            }
        }

        // Check consumption limits
        const limit = await ctx.db
            .query("consumptionLimits")
            .withIndex("by_studentId", (q) => q.eq("studentId", student._id))
            .first();

        if (limit?.enabled && unhealthyItemsTotal > 0) {
            const maxUnhealthy = Math.round(
                (student.generalBalance * limit.unhealthyPercent) / 100
            );
            if (unhealthyItemsTotal > maxUnhealthy) {
                throw new Error(`Supera el límite de $${maxUnhealthy.toLocaleString('es-CL')} para productos no saludables.`);
            }
        }

        // Update balance
        const newHealthyBalance = student.healthyBalance - healthyCoveredByHealthyBalance;
        const newGeneralBalance = student.generalBalance - requiredGeneralBalance;

        await ctx.db.patch(student._id, {
            generalBalance: newGeneralBalance,
            healthyBalance: newHealthyBalance,
        });

        // Create transaction records
        let currentGeneral = student.generalBalance;
        let currentHealthy = student.healthyBalance;

        for (let i = 0; i < resolvedItems.length; i++) {
            const item = resolvedItems[i];
            const itemCost = item.price * item.qty;
            let displayBalanceAfter = 0;

            if (item.isHealthy) {
                const debitFromHealthy = Math.min(currentHealthy, itemCost);
                const debitFromGeneral = itemCost - debitFromHealthy;
                currentHealthy -= debitFromHealthy;
                currentGeneral -= debitFromGeneral;
                displayBalanceAfter = currentGeneral + currentHealthy;
            } else {
                currentGeneral -= itemCost;
                displayBalanceAfter = currentGeneral + currentHealthy;
            }

            await ctx.db.insert("transactions", {
                studentId: student._id,
                vendorId: vendor._id,
                type: "compra",
                description: item.name,
                amount: -itemCost,
                balanceAfter: displayBalanceAfter,
                isHealthy: item.isHealthy,
                category: item.category,
                icon: item.icon,
                productId: item.productId,
            });
        }

        return { success: true, studentName: student.fullName };
    },
});
