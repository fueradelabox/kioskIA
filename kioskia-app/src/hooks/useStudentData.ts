import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

/** Fetch student profile */
export function useStudentProfile() {
    return useQuery(api.students.getProfile)
}

/** Fetch student savings goal */
export function useSavingsGoal(studentId?: Id<"students">) {
    return useQuery(api.students.getSavingsGoal, studentId ? { studentId } : "skip")
}

/** Fetch student transactions */
export function useTransactions(opts?: {
    studentId?: Id<"students">
    filterType?: "compra" | "recarga" | "ahorro" | "premio"
    limit?: number
}) {
    return useQuery(api.students.getTransactions, opts?.studentId ? {
        studentId: opts.studentId,
        filterType: opts.filterType,
        limit: opts.limit,
    } : "skip") ?? []
}

/** Create a savings goal */
export function useCreateSavingsGoal() {
    return useMutation(api.students.createSavingsGoal)
}

/** Transfer to savings */
export function useTransferToSavings() {
    return useMutation(api.students.transferToSavings)
}

/** Update student profile */
export function useUpdateProfile() {
    return useMutation(api.students.updateProfile)
}

/** Get spending summary */
export function useSpendingSummary(studentId?: Id<"students">) {
    return useQuery(api.students.getSpendingSummary, studentId ? { studentId } : "skip")
}
