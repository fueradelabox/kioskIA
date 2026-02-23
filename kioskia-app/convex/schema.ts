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
    balance: v.optional(v.number()),
    generalBalance: v.optional(v.number()),
    healthyBalance: v.optional(v.number()),
    avatarInitials: v.optional(v.string()),
    qrCode: v.optional(v.string()),
    biometricId: v.optional(v.string()), // Lector de huella o hash biométrico
    pin: v.optional(v.string()),         // Fallback code o pin seguro
  })
    .index("by_userId", ["userId"])
    .index("by_rut", ["rut"])
    .index("by_qrCode", ["qrCode"])
    .index("by_biometricId", ["biometricId"]),

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

  // Phase 3 Extensions
  achievements: defineTable({
    studentId: v.id("students"),
    title: v.string(),
    description: v.string(),
    icon: v.string(),
    type: v.union(v.literal("medal"), v.literal("pin"), v.literal("trophy")),
    earnedAt: v.number(),
  }).index("by_studentId", ["studentId"]),

  educationalContent: defineTable({
    title: v.string(),
    content: v.string(),
    type: v.union(v.literal("lesson"), v.literal("quiz")),
    options: v.optional(v.array(v.string())),
    correctOptionIndex: v.optional(v.number()),
    points: v.number(),
    order: v.number(),
  }),

  studentProgress: defineTable({
    studentId: v.id("students"),
    contentId: v.id("educationalContent"),
    completed: v.boolean(),
    score: v.optional(v.number()),
  })
    .index("by_studentId", ["studentId"])
    .index("by_contentId", ["contentId"]),

  subscriptions: defineTable({
    studentId: v.id("students"),
    parentId: v.id("parents"),
    planName: v.string(),
    price: v.number(),
    status: v.union(v.literal("active"), v.literal("canceled")),
    nextDeliveryDate: v.number(),
    items: v.array(v.string()),
  })
    .index("by_studentId", ["studentId"])
    .index("by_parentId", ["parentId"]),

  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    read: v.boolean(),
    type: v.string(),
    link: v.optional(v.string()),
  }).index("by_userId", ["userId"]),
});
