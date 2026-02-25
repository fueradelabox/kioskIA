import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Security check helper
const checkAdmin = async (ctx: { auth: { getUserIdentity: () => Promise<unknown> }, db: { query: (table: string) => { collect: () => Promise<unknown[]> } } }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    // Check if the user is a KioskIA admin
    // For now, we will allow 'fvicencio@gmail.com' and 'fvp@live.cl' to perform admin actions 
    // or anyone with a specific admin role if we add one in the future.
    let authEmail = identity.email;
    if (!authEmail) {
        const authAccounts = await ctx.db.query("authAccounts").collect();
        for (const account of authAccounts) {
            if (String(account.userId) === identity.subject || identity.tokenIdentifier?.includes(String(account.userId))) {
                authEmail = account.providerAccountId;
                break;
            }
        }
    }

    if (authEmail !== "fvp@live.cl" && authEmail !== "fvicencio@gmail.com") {
        throw new Error("Unauthorized. Admin access required.");
    }

    return true;
};

// ======================================
// QUERIES
// ======================================

export const getDashboardStats = query({
    args: {},
    handler: async (ctx) => {
        await checkAdmin(ctx);
        const students = await ctx.db.query("students").collect();
        const parents = await ctx.db.query("parents").collect();
        const vendors = await ctx.db.query("vendors").collect();

        return {
            totalStudents: students.length,
            totalParents: parents.length,
            totalVendors: vendors.length
        };
    }
});

export const getUsers = query({
    args: { role: v.union(v.literal("student"), v.literal("parent"), v.literal("vendor")) },
    handler: async (ctx, args) => {
        await checkAdmin(ctx);

        if (args.role === "student") {
            return await ctx.db.query("students").order("desc").collect();
        } else if (args.role === "parent") {
            return await ctx.db.query("parents").order("desc").collect();
        } else if (args.role === "vendor") {
            return await ctx.db.query("vendors").order("desc").collect();
        }
        return [];
    }
});

export const getSchools = query({
    args: {},
    handler: async (ctx) => {
        await checkAdmin(ctx);
        const schools = await ctx.db.query("schools").collect();
        if (schools.length === 0) {
            // Seed a default school if none exists yet
            const schoolId = await ctx.db.insert("schools", {
                name: "Colegio KioskIA Default",
                address: "Santiago, Chile"
            });
            return [await ctx.db.get(schoolId)];
        }
        return schools;
    }
});

export const getStudentsList = query({
    args: {},
    handler: async (ctx) => {
        await checkAdmin(ctx);
        return await ctx.db.query("students").order("desc").collect();
    }
});

export const getParentsList = query({
    args: {},
    handler: async (ctx) => {
        await checkAdmin(ctx);
        return await ctx.db.query("parents").order("desc").collect();
    }
});


// ======================================
// MUTATIONS
// ======================================

export const createStudent = mutation({
    args: {
        fullName: v.string(),
        rut: v.string(),
        email: v.optional(v.string()),
        grade: v.string(),
        schoolId: v.id("schools"),
        generalBalance: v.number(),
        healthyBalance: v.number(),
        pin: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx);

        // Create Auth User record
        const userId = await ctx.db.insert("users", {
            email: args.email,
            role: "student",
            name: args.fullName
        });

        const initials = args.fullName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);

        // Generate QR code base string
        const qrCode = `KIOSK-${args.rut.replace(/[^0-9Kk]/g, "")}-${Date.now().toString().slice(-4)}`;

        // Create Student profile
        const studentId = await ctx.db.insert("students", {
            userId,
            fullName: args.fullName,
            rut: args.rut,
            email: args.email,
            grade: args.grade,
            schoolId: args.schoolId,
            generalBalance: args.generalBalance,
            healthyBalance: args.healthyBalance,
            balance: args.generalBalance + args.healthyBalance,
            avatarInitials: initials,
            qrCode,
            pin: args.pin
        });

        return studentId;
    }
});

export const createParent = mutation({
    args: {
        fullName: v.string(),
        email: v.string(),
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx);

        const userId = await ctx.db.insert("users", {
            email: args.email,
            role: "parent",
            name: args.fullName
        });

        const initials = args.fullName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);

        const parentId = await ctx.db.insert("parents", {
            userId,
            fullName: args.fullName,
            email: args.email,
            avatarInitials: initials
        });

        return parentId;
    }
});

export const createVendor = mutation({
    args: {
        businessName: v.string(),
        fullName: v.string(),
        email: v.string(),
        schoolId: v.id("schools"),
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx);

        const userId = await ctx.db.insert("users", {
            email: args.email,
            role: "vendor",
            name: args.fullName
        });

        const vendorCode = `VEND-${Date.now().toString().slice(-4)}`;

        const vendorId = await ctx.db.insert("vendors", {
            userId,
            businessName: args.businessName,
            fullName: args.fullName,
            vendorCode,
            schoolId: args.schoolId,
            isOnline: false
        });

        return vendorId;
    }
});

export const linkParentStudent = mutation({
    args: {
        parentId: v.id("parents"),
        studentId: v.id("students")
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx);

        // Check if link already exists
        const existing = await ctx.db
            .query("parentStudents")
            .withIndex("by_parentId", q => q.eq("parentId", args.parentId))
            .filter(q => q.eq(q.field("studentId"), args.studentId))
            .first();

        if (existing) {
            throw new Error("El enlace entre este apoderado y estudiante ya existe.");
        }

        const linkId = await ctx.db.insert("parentStudents", {
            parentId: args.parentId,
            studentId: args.studentId
        });

        return linkId;
    }
});
