import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { users: _authUsers, ...restAuthTables } = authTables;

export default defineSchema({
  ...restAuthTables,

  // Override users table to add role
  users: defineTable({
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.float64()),
    image: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.float64()),
    role: v.optional(v.string()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),

  schools: defineTable({
    name: v.string(),
    address: v.optional(v.string()),
  }),

  students: defineTable({
    userId: v.id("users"),
    rut: v.string(),
    fullName: v.string(),
    email: v.optional(v.string()),
    grade: v.optional(v.string()),
    schoolId: v.optional(v.id("schools")),
    balance: v.number(),
    healthyBalance: v.number(),
    avatarInitials: v.optional(v.string()),
    qrCode: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_rut", ["rut"])
    .index("by_qrCode", ["qrCode"]),

  parents: defineTable({
    userId: v.id("users"),
    fullName: v.string(),
    email: v.optional(v.string()),
    avatarInitials: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  parentStudents: defineTable({
    parentId: v.id("parents"),
    studentId: v.id("students"),
  })
    .index("by_parentId", ["parentId"])
    .index("by_studentId", ["studentId"]),

  vendors: defineTable({
    userId: v.id("users"),
    businessName: v.optional(v.string()),
    fullName: v.optional(v.string()),
    vendorCode: v.string(),
    schoolId: v.optional(v.id("schools")),
    isOnline: v.boolean(),
  })
    .index("by_userId", ["userId"])
    .index("by_vendorCode", ["vendorCode"]),

  products: defineTable({
    name: v.string(),
    price: v.number(),
    icon: v.string(),
    category: v.string(),
    subcategory: v.optional(v.string()),
    isHealthy: v.boolean(),
    barcode: v.optional(v.string()),
    schoolId: v.optional(v.id("schools")),
    active: v.boolean(),
  })
    .index("by_active", ["active"])
    .index("by_category", ["category"])
    .index("by_barcode", ["barcode"]),

  savingsGoals: defineTable({
    studentId: v.id("students"),
    name: v.string(),
    targetAmount: v.number(),
    currentAmount: v.number(),
    icon: v.string(),
    imageUrl: v.optional(v.string()),
    active: v.optional(v.boolean()),
  }).index("by_studentId", ["studentId"]),

  transactions: defineTable({
    studentId: v.id("students"),
    vendorId: v.optional(v.id("vendors")),
    type: v.union(
      v.literal("compra"),
      v.literal("recarga"),
      v.literal("ahorro"),
      v.literal("premio")
    ),
    description: v.string(),
    amount: v.number(),
    balanceAfter: v.number(),
    isHealthy: v.optional(v.boolean()),
    category: v.optional(v.string()),
    icon: v.optional(v.string()),
    productId: v.optional(v.id("products")),
  })
    .index("by_studentId", ["studentId"])
    .index("by_vendorId", ["vendorId"]),

  consumptionLimits: defineTable({
    studentId: v.id("students"),
    enabled: v.boolean(),
    unhealthyPercent: v.number(),
    setBy: v.optional(v.id("parents")),
  }).index("by_studentId", ["studentId"]),

  deposits: defineTable({
    parentId: v.id("parents"),
    studentId: v.id("students"),
    amount: v.number(),
    method: v.string(),
    reference: v.string(),
    status: v.string(),
  })
    .index("by_parentId", ["parentId"])
    .index("by_studentId", ["studentId"]),
});
