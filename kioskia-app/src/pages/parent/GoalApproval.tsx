import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import type { ChildContext } from './ParentLayout'
import { useChildSavingsGoals, useApproveGoal, useChildDashboard } from '../../hooks/useParentData'
import type { Id } from '../../../convex/_generated/dataModel'

export default function GoalApproval() {
    const { activeChildId } = useOutletContext<ChildContext>()
    const goals = useChildSavingsGoals(activeChildId as Id<"students"> | null)
    const dashboardData = useChildDashboard(activeChildId as Id<"students"> | null)
    const student = dashboardData?.student
    const approveGoal = useApproveGoal()
    const [processing, setProcessing] = useState<string | null>(null)

    const loading = goals === undefined

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto p-5 md:p-10 flex items-center justify-center min-h-[50vh]">
                <div className="w-10 h-10 border-3 border-gray-900 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    const handleApprove = async (goalId: Id<"savingsGoals">, approved: boolean) => {
        setProcessing(goalId)
        try {
            await approveGoal({ goalId, approved })
        } catch (err) {
            console.error(err)
        }
        setProcessing(null)
    }

    return (
        <div className="max-w-3xl mx-auto p-5 md:p-10 space-y-6">
            <div className="animate-slide-up">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
                    Aprobación de Metas 🎯
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Revisa y aprueba las metas de ahorro{student ? ` de ${student.fullName.split(' ')[0]}` : ''}
                </p>
            </div>

            {(!goals || goals.length === 0) && (
                <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center animate-slide-up">
                    <span className="material-icons-round text-6xl text-gray-200 dark:text-gray-700 mb-4 block">flag</span>
                    <p className="text-gray-400 font-medium">No hay metas de ahorro pendientes</p>
                    <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Cuando tu hijo cree una meta, aparecerá aquí</p>
                </div>
            )}

            <div className="space-y-4">
                {goals?.map((goal, i) => {
                    const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
                    const isActive = goal.active === true
                    const isPending = goal.active === undefined || goal.active === null
                    const isRejected = goal.active === false

                    return (
                        <div
                            key={goal._id}
                            className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm animate-slide-up"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <span className="text-4xl">{goal.icon}</span>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{goal.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            Meta: ${goal.targetAmount.toLocaleString('es-CL')}
                                        </p>
                                    </div>
                                </div>
                                {/* Status Badge */}
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                        isRejected ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                    }`}>
                                    {isActive ? '✓ Aprobada' : isRejected ? '✗ Rechazada' : '⏳ Pendiente'}
                                </span>
                            </div>

                            {/* Progress */}
                            <div className="mb-4">
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>${goal.currentAmount.toLocaleString('es-CL')} ahorrado</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{progress}%</span>
                                </div>
                                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gray-900 dark:bg-white rounded-full transition-all duration-500"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            {(isPending || isRejected) && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleApprove(goal._id, true)}
                                        disabled={processing === goal._id}
                                        className="flex-1 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <span className="material-icons-round text-sm">check</span>
                                        Aprobar
                                    </button>
                                    {!isRejected && (
                                        <button
                                            onClick={() => handleApprove(goal._id, false)}
                                            disabled={processing === goal._id}
                                            className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-medium rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <span className="material-icons-round text-sm">close</span>
                                            Rechazar
                                        </button>
                                    )}
                                </div>
                            )}

                            {isActive && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleApprove(goal._id, false)}
                                        disabled={processing === goal._id}
                                        className="w-full py-2.5 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-medium rounded-xl text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <span className="material-icons-round text-sm">block</span>
                                        Desactivar Meta
                                    </button>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
