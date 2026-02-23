import { mutation } from './_generated/server'
import type { DataModel } from './_generated/dataModel'

/**
 * Clear all data from the database. For local dev only.
 * Run via: npx convex run seed:clearAll
 */
export const clearAll = mutation({
    args: {},
    handler: async (ctx) => {
        const tables = [
            'deposits', 'transactions', 'consumptionLimits', 'savingsGoals',
            'parentStudents', 'products', 'students', 'parents', 'vendors', 'users',
            'authAccounts', 'authSessions', 'authRefreshTokens',
            'authVerificationCodes', 'authVerifiers', 'authRateLimits',
        ] as const

        let total = 0
        for (const table of tables) {
            const docs = await ctx.db.query(table as keyof DataModel).collect()
            for (const doc of docs) {
                await ctx.db.delete(doc._id)
                total++
            }
        }

        return { message: `Cleared ${total} documents` }
    },
})
