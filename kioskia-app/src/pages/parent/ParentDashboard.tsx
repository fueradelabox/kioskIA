import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import type { ChildContext } from './ParentLayout'
import { useChildDashboard, useRechargeBalance, useRewardSavings } from '../../hooks/useParentData'
import type { Id } from '../../../convex/_generated/dataModel'

export default function ParentDashboard() {
    const { activeChildId } = useOutletContext<ChildContext>()
    const dashboardData = useChildDashboard(activeChildId as Id<"students"> | null)
    const loading = dashboardData === undefined
    const student = dashboardData?.student ?? null
    const transactions = dashboardData?.transactions ?? []
    const savingsGoal = dashboardData?.savingsGoal ?? null
    const rechargeBalance = useRechargeBalance()
    const rewardSavings = useRewardSavings()
    const [rechargeModalOpen, setRechargeModalOpen] = useState(false)
    const [rewardModalOpen, setRewardModalOpen] = useState(false)
    const [rechargeAmount, setRechargeAmount] = useState('')
    const [rechargeWalletType, setRechargeWalletType] = useState<'general' | 'healthy'>('general')
    const [rewardAmount, setRewardAmount] = useState('')
    const [processing, setProcessing] = useState(false)

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto p-5 md:p-10 flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Cargando datos de tu hijo...</p>
                </div>
            </div>
        )
    }

    if (!student) {
        return (
            <div className="max-w-5xl mx-auto p-5 md:p-10 text-center py-20">
                <span className="material-icons-round text-6xl text-gray-300 mb-4 block">child_care</span>
                <h2 className="text-xl font-bold text-gray-500">Selecciona un hijo para ver su dashboard</h2>
            </div>
        )
    }

    const totalBalance = student.generalBalance + student.healthyBalance

    const handleRecharge = async () => {
        const amount = Number(rechargeAmount)
        if (!amount || amount <= 0) return
        setProcessing(true)
        try {
            await rechargeBalance({ studentId: student._id, amount, walletType: rechargeWalletType })
        } catch (err) {
            console.error(err)
        }
        setProcessing(false)
        setRechargeModalOpen(false)
        setRechargeAmount('')
    }

    const handleReward = async () => {
        const amount = Number(rewardAmount)
        if (!amount || amount <= 0 || !savingsGoal) return
        setProcessing(true)
        try {
            await rewardSavings({ studentId: student._id, goalId: savingsGoal._id, amount })
        } catch (err) {
            console.error(err)
        }
        setProcessing(false)
        setRewardModalOpen(false)
        setRewardAmount('')
    }

    const goalProgress = savingsGoal ? Math.round((savingsGoal.currentAmount / savingsGoal.targetAmount) * 100) : 0

    return (
        <div className="max-w-5xl mx-auto p-5 md:p-10 space-y-7">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-slide-up">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
                        Dashboard de {student.fullName.split(' ')[0]}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{student.grade} · Hoy es {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setRechargeModalOpen(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2 text-sm hover:shadow-xl transition-all">
                        <span className="material-icons-round text-sm">add</span>Recargar
                    </button>
                    <button onClick={() => setRewardModalOpen(true)} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 text-sm hover:shadow-xl transition-all">
                        <span className="material-icons-round text-sm">stars</span>Premiar
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Balance Card */}
                <div className="lg:col-span-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 rounded-2xl p-6 md:p-8 text-white shadow-xl animate-slide-up relative overflow-hidden" style={{ animationDelay: '100ms' }}>
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-white/80 font-medium text-sm">Saldo Disponible (Total)</span>
                            <span className="material-icons-round text-white/70">account_balance_wallet</span>
                        </div>
                        <div className="flex items-baseline gap-2 mb-6">
                            <span className="text-4xl md:text-5xl font-extrabold">${totalBalance.toLocaleString('es-CL')}</span>
                            <span className="text-white/60 font-medium">CLP</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
                                <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Saludable</p>
                                <p className="text-xl font-bold">${student.healthyBalance.toLocaleString('es-CL')}</p>
                            </div>
                            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
                                <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold">General Libre</p>
                                <p className="text-xl font-bold">${student.generalBalance.toLocaleString('es-CL')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Savings Card */}
                <div className="lg:col-span-4 bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 animate-slide-up" style={{ animationDelay: '200ms' }}>
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                        <span className="material-icons-round text-amber-500">emoji_events</span>
                        Meta de Ahorro
                    </h3>
                    {savingsGoal ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">{savingsGoal.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 dark:text-white truncate">{savingsGoal.name}</p>
                                    <p className="text-xs text-gray-500">${savingsGoal.currentAmount.toLocaleString('es-CL')} / ${savingsGoal.targetAmount.toLocaleString('es-CL')}</p>
                                </div>
                            </div>
                            <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" style={{ width: `${goalProgress}%` }} />
                            </div>
                            <p className="text-xs text-center font-bold text-primary">{goalProgress}% completado</p>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 text-center py-4">No tiene meta activa</p>
                    )}
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-12 bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 animate-slide-up" style={{ animationDelay: '300ms' }}>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-icons-round text-blue-500">history</span>
                        Actividad Reciente
                    </h3>
                    {transactions.length === 0 && (
                        <p className="text-center text-gray-400 py-8 text-sm">No hay actividad reciente</p>
                    )}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left border-b border-gray-100 dark:border-gray-700">
                                    <th className="pb-3 font-semibold text-gray-500 text-xs uppercase">Transacción</th>
                                    <th className="pb-3 font-semibold text-gray-500 text-xs uppercase">Categoría</th>
                                    <th className="pb-3 font-semibold text-gray-500 text-xs uppercase">Fecha</th>
                                    <th className="pb-3 font-semibold text-gray-500 text-xs uppercase text-right">Monto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                {transactions.map(tx => (
                                    <tr key={tx._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="py-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${tx.amount > 0 ? 'bg-primary/10 text-primary' : tx.isHealthy ? 'bg-healthy/10 text-healthy' : 'bg-unhealthy/10 text-unhealthy'}`}>
                                                    <span className="material-icons-round text-lg">{tx.icon || 'receipt'}</span>
                                                </div>
                                                <span className="font-medium text-gray-800 dark:text-gray-200">{tx.description}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 text-gray-500">
                                            <span className="flex items-center gap-1.5">
                                                {tx.isHealthy !== null && tx.isHealthy !== undefined && (
                                                    <span className={`w-2 h-2 rounded-full ${tx.isHealthy ? 'bg-healthy' : 'bg-unhealthy'}`} />
                                                )}
                                                {tx.category || tx.type}
                                            </span>
                                        </td>
                                        <td className="py-3 text-gray-400 text-xs">
                                            {new Date(tx._creationTime).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                                        </td>
                                        <td className={`py-3 text-right font-bold ${tx.amount > 0 ? 'text-primary' : 'text-danger'}`}>
                                            {tx.amount > 0 ? '+' : ''}{tx.amount < 0 ? '-' : ''}${Math.abs(tx.amount).toLocaleString('es-CL')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Recharge Modal */}
            {rechargeModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setRechargeModalOpen(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-icons-round text-blue-500">account_balance_wallet</span>
                            Recargar Saldo
                        </h3>
                        <div className="relative mb-4">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">$</span>
                            <input type="number" value={rechargeAmount} onChange={e => setRechargeAmount(e.target.value)} placeholder="0"
                                className="w-full pl-10 pr-4 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-2xl font-bold text-center text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                        <div className="flex gap-2 mb-4 bg-gray-50 dark:bg-gray-800/50 p-1 rounded-xl">
                            <button
                                onClick={() => setRechargeWalletType('general')}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${rechargeWalletType === 'general' ? 'bg-white dark:bg-gray-600 shadow text-blue-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                General
                            </button>
                            <button
                                onClick={() => setRechargeWalletType('healthy')}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${rechargeWalletType === 'healthy' ? 'bg-green-50 dark:bg-green-900/30 shadow text-green-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                Saludable
                            </button>
                        </div>
                        <div className="flex gap-2 mb-4">
                            {[5000, 10000, 20000].map(v => (
                                <button key={v} onClick={() => setRechargeAmount(String(v))} className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                                    ${v.toLocaleString('es-CL')}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setRechargeModalOpen(false)} className="flex-1 py-3 border border-gray-200 dark:border-gray-600 rounded-xl font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                Cancelar
                            </button>
                            <button onClick={handleRecharge} disabled={processing || !rechargeAmount} className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg disabled:opacity-60 transition-all">
                                {processing ? 'Procesando...' : 'Recargar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reward Modal */}
            {rewardModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setRewardModalOpen(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-icons-round text-amber-500">stars</span>
                            Premiar Ahorro
                        </h3>
                        {savingsGoal ? (
                            <>
                                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mb-4 flex items-center gap-3">
                                    <span className="text-2xl">{savingsGoal.icon}</span>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{savingsGoal.name}</p>
                                        <p className="text-xs text-gray-500">${savingsGoal.currentAmount.toLocaleString('es-CL')} / ${savingsGoal.targetAmount.toLocaleString('es-CL')}</p>
                                    </div>
                                </div>
                                <div className="relative mb-4">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">$</span>
                                    <input type="number" value={rewardAmount} onChange={e => setRewardAmount(e.target.value)} placeholder="0"
                                        className="w-full pl-10 pr-4 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-2xl font-bold text-center text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setRewardModalOpen(false)} className="flex-1 py-3 border border-gray-200 dark:border-gray-600 rounded-xl font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 transition-colors">
                                        Cancelar
                                    </button>
                                    <button onClick={handleReward} disabled={processing || !rewardAmount} className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg disabled:opacity-60 transition-all">
                                        {processing ? 'Procesando...' : 'Premiar'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <p className="text-center text-gray-400 py-6">No tiene meta de ahorro activa</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
