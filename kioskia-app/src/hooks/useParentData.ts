import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

/** Fetch parent's children */
export function useChildren() {
    return useQuery(api.parents.getChildren)
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
    return useQuery(api.parents.getDeposits)
}

/** Reward savings */
export function useRewardSavings() {
    return useMutation(api.parents.rewardSavings)
}

// ─── GROUP 2: NEW HOOKS ───────────────────────────

/** Fetch child savings goals */
export function useChildSavingsGoals(studentId: Id<"students"> | null) {
    return useQuery(
        api.parents.getChildSavingsGoals,
        studentId ? { studentId } : "skip"
    )
}

/** Approve or reject a savings goal */
export function useApproveGoal() {
    return useMutation(api.parents.approveGoal)
}

/** Fetch monthly analysis for a child */
export function useMonthlyAnalysis(studentId: Id<"students"> | null) {
    return useQuery(
        api.parents.getMonthlyAnalysis,
        studentId ? { studentId } : "skip"
    )
}

/** Fetch notifications for parent */
export function useNotifications() {
    return useQuery(api.parents.getNotifications)
}

/** Mark notification as read */
export function useMarkNotificationRead() {
    return useMutation(api.parents.markNotificationRead)
}

/** Mark all notifications as read */
export function useMarkAllNotificationsRead() {
    return useMutation(api.parents.markAllNotificationsRead)
}

/** Fetch subscriptions for a child */
export function useSubscriptions(studentId: Id<"students"> | null) {
    return useQuery(
        api.parents.getSubscriptions,
        studentId ? { studentId } : "skip"
    )
}

/** Create a subscription */
export function useCreateSubscription() {
    return useMutation(api.parents.createSubscription)
}

/** Cancel a subscription */
export function useCancelSubscription() {
    return useMutation(api.parents.cancelSubscription)
}

/** Save incentive config */
export function useSaveIncentiveConfig() {
    return useMutation(api.parents.saveIncentiveConfig)
}
