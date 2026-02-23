import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

/** Fetch parent's children */
export function useChildren() {
    return useQuery(api.parents.getChildren) ?? []
}

/** Fetch child dashboard */
export function useChildDashboard(studentId: Id<"students"> | null) {
    return useQuery(
        api.parents.getChildDashboard,
        studentId ? { studentId } : "skip"
    )
}

/** Fetch child spending summary */
export function useChildSpendingSummary(studentId: Id<"students"> | null) {
    return useQuery(
        api.parents.getChildSpendingSummary,
        studentId ? { studentId } : "skip"
    )
}

/** Fetch parent profile */
export function useParentProfile() {
    return useQuery(api.parents.getProfile)
}

/** Update consumption limit */
export function useUpdateConsumptionLimit() {
    return useMutation(api.parents.updateConsumptionLimit)
}

/** Recharge balance */
export function useRechargeBalance() {
    return useMutation(api.parents.rechargeBalance)
}

/** Create deposit */
export function useCreateDeposit() {
    return useMutation(api.parents.createDeposit)
}

/** Get deposits */
export function useDeposits() {
    return useQuery(api.parents.getDeposits) ?? []
}

/** Reward savings */
export function useRewardSavings() {
    return useMutation(api.parents.rewardSavings)
}
