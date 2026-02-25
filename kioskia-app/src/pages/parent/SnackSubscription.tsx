import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import type { ChildContext } from './ParentLayout'
import { useSubscriptions, useCreateSubscription, useCancelSubscription, useChildDashboard } from '../../hooks/useParentData'
import type { Id } from '../../../convex/_generated/dataModel'

const availablePlans = [
    {
        name: 'Básico Saludable',
        price: 25000,
        items: ['Fruta del día', 'Jugo natural', 'Barra de cereal'],
        icon: '🍎',
        desc: 'Plan económico con alimentos saludables',
    },
    {
        name: 'Completo Equilibrado',
        price: 45000,
        items: ['Sándwich integral', 'Fruta', 'Jugo natural', 'Yogurt', 'Galleta casera'],
        icon: '🥪',
        desc: 'Colación completa y balanceada',
    },
    {
        name: 'Premium Energético',
        price: 65000,
        items: ['Wrap proteico', 'Mix de frutos secos', 'Smoothie', 'Fruta', 'Postre saludable', 'Agua mineral'],
        icon: '⚡',
        desc: 'Máxima nutrición para alto rendimiento',
    },
]

export default function SnackSubscription() {
    const { activeChildId } = useOutletContext<ChildContext>()
    const subscriptions = useSubscriptions(activeChildId as Id<"students"> | null)
    const dashboardData = useChildDashboard(activeChildId as Id<"students"> | null)
    const student = dashboardData?.student
    const createSubscription = useCreateSubscription()
    const cancelSubscription = useCancelSubscription()
    const [processing, setProcessing] = useState(false)
    const [showPlans, setShowPlans] = useState(false)

    const loading = subscriptions === undefined

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto p-5 md:p-10 flex items-center justify-center min-h-[50vh]">
                <div className="w-10 h-10 border-3 border-gray-900 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    const activeSubscriptions = subscriptions?.filter(s => s.status === 'active') ?? []
    const pastSubscriptions = subscriptions?.filter(s => s.status === 'canceled') ?? []

    const handleCreate = async (plan: typeof availablePlans[0]) => {
        if (!activeChildId) return
        setProcessing(true)
        try {
            await createSubscription({
                studentId: activeChildId as Id<"students">,
                planName: plan.name,
                price: plan.price,
                items: plan.items,
            })
            setShowPlans(false)
        } catch (err) {
            console.error(err)
        }
        setProcessing(false)
    }

    const handleCancel = async (subscriptionId: Id<"subscriptions">) => {
        setProcessing(true)
        try {
            await cancelSubscription({ subscriptionId })
        } catch (err) {
            console.error(err)
        }
        setProcessing(false)
    }

    return (
        <div className="max-w-3xl mx-auto p-5 md:p-10 space-y-6">
            <div className="flex items-center justify-between animate-slide-up">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
                        Suscripción Colaciones 🥗
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Planes de alimentación{student ? ` para ${student.fullName.split(' ')[0]}` : ''}
                    </p>
                </div>
                <button
                    onClick={() => setShowPlans(!showPlans)}
                    className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-2.5 px-5 rounded-xl shadow-sm flex items-center gap-2 text-sm hover:opacity-90 transition-opacity"
                >
                    <span className="material-icons-round text-sm">add</span>
                    Nuevo Plan
                </button>
            </div>

            {/* Plan Selection */}
            {showPlans && (
                <div className="space-y-3 animate-slide-up">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="material-icons-round text-gray-400">restaurant_menu</span>
                        Elige un Plan
                    </h3>
                    {availablePlans.map((plan, i) => (
                        <div
                            key={plan.name}
                            className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{plan.icon}</span>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">{plan.name}</h4>
                                        <p className="text-xs text-gray-500">{plan.desc}</p>
                                    </div>
                                </div>
                                <span className="text-xl font-extrabold text-gray-900 dark:text-white">
                                    ${plan.price.toLocaleString('es-CL')}<span className="text-xs font-normal text-gray-400">/mes</span>
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mb-4">
                                {plan.items.map(item => (
                                    <span key={item} className="px-2.5 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400">
                                        {item}
                                    </span>
                                ))}
                            </div>
                            <button
                                onClick={() => handleCreate(plan)}
                                disabled={processing}
                                className="w-full py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {processing ? 'Procesando...' : 'Suscribirse'}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Active Subscriptions */}
            <div className="space-y-3">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="material-icons-round text-gray-400">check_circle</span>
                    Planes Activos ({activeSubscriptions.length})
                </h3>
                {activeSubscriptions.length === 0 && (
                    <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-700 p-8 text-center">
                        <span className="material-icons-round text-4xl text-gray-200 dark:text-gray-700 mb-2 block">no_meals</span>
                        <p className="text-gray-400 text-sm">No hay planes activos</p>
                    </div>
                )}
                {activeSubscriptions.map(sub => (
                    <div key={sub._id} className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">{sub.planName}</h4>
                                <p className="text-xs text-gray-400">
                                    Próxima entrega: {new Date(sub.nextDeliveryDate).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'short' })}
                                </p>
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                Activo
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {sub.items.map(item => (
                                <span key={item} className="px-2 py-0.5 bg-gray-50 dark:bg-gray-800 rounded text-[10px] font-medium text-gray-500">
                                    {item}
                                </span>
                            ))}
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-extrabold text-gray-900 dark:text-white">${sub.price.toLocaleString('es-CL')}/mes</span>
                            <button
                                onClick={() => handleCancel(sub._id)}
                                disabled={processing}
                                className="text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Past Subscriptions */}
            {pastSubscriptions.length > 0 && (
                <div className="space-y-3">
                    <h3 className="font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2 text-sm">
                        <span className="material-icons-round text-gray-300">history</span>
                        Planes Anteriores
                    </h3>
                    {pastSubscriptions.map(sub => (
                        <div key={sub._id} className="bg-white dark:bg-surface-dark rounded-xl border border-gray-100 dark:border-gray-800 p-4 opacity-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-sm text-gray-600 dark:text-gray-400">{sub.planName}</p>
                                    <p className="text-xs text-gray-400">${sub.price.toLocaleString('es-CL')}/mes</p>
                                </div>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-400">
                                    Cancelado
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
