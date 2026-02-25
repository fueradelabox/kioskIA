import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useStudentProfile, useSavingsGoal, useTransactions, useSpendingSummary } from '../../hooks/useStudentData'

export default function StudentDashboard() {
    const profile = useStudentProfile()
    const savingsGoal = useSavingsGoal()
    const transactions = useTransactions({ limit: 8 })
    const summary = useSpendingSummary()
    const [showError, setShowError] = useState(false)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Delay showing the "not found" error to avoid flash during auth initialization
    useEffect(() => {
        if (profile === null) {
            timerRef.current = setTimeout(() => setShowError(true), 3000)
            return () => { if (timerRef.current) clearTimeout(timerRef.current) }
        }
        // Profile loaded successfully — no error to show
        timerRef.current = null
        return undefined
    }, [profile])

    // Show spinner while loading or during auth initialization grace period
    if (profile === undefined || (profile === null && !showError)) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <span className="material-icons-round text-5xl text-amber-500 mb-4">warning</span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No se encontró tu perfil de estudiante</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Tu cuenta está autenticada pero no tiene un perfil de estudiante vinculado.</p>
                <p className="text-xs text-gray-400 font-mono">Contacta al administrador para resolver este problema.</p>
            </div>
        )
    }

    const totalBalance = profile.generalBalance + profile.healthyBalance
    const savingsPercent = savingsGoal ? Math.min(100, Math.round((savingsGoal.currentAmount / savingsGoal.targetAmount) * 100)) : 0

    return (
        <div className="p-4 lg:p-6 space-y-6 pb-24">
            {/* Welcome & QR */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                        ¡Hola, {profile.fullName.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-sm text-gray-500">{profile.grade}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/20">
                    <span className="text-white font-bold text-sm">{profile.avatarInitials}</span>
                </div>
            </div>

            {/* Balance Card */}
            <div className="bg-gradient-to-br from-primary via-primary-dark to-navy rounded-2xl p-6 text-white shadow-xl shadow-primary/20">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-1">Mi Saldo Total</p>
                <p className="text-4xl font-extrabold tracking-tight">${totalBalance.toLocaleString('es-CL')}</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2.5 h-2.5 bg-green-400 rounded-full" />
                            <p className="text-[11px] font-semibold text-white/80">Saludable</p>
                        </div>
                        <p className="text-lg font-extrabold">${profile.healthyBalance.toLocaleString('es-CL')}</p>
                    </div>
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2.5 h-2.5 bg-amber-400 rounded-full" />
                            <p className="text-[11px] font-semibold text-white/80">General Libre</p>
                        </div>
                        <p className="text-lg font-extrabold">${profile.generalBalance.toLocaleString('es-CL')}</p>
                    </div>
                </div>
                <p className="mt-3 text-[10px] text-white/50 flex items-center gap-1">
                    <span className="material-icons-round text-xs">info</span>
                    Puedes usar tu saldo general libre para cualquier tipo de compra
                </p>
            </div>

            {/* Spending Summary */}
            {summary && summary.totalSpent > 0 && (
                <div className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <span className="material-icons-round text-primary text-xl">pie_chart</span>
                        Mis Gastos
                    </h3>
                    {/* Health bar */}
                    <div className="flex rounded-xl overflow-hidden h-5 mb-3">
                        <div
                            className="bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center text-[9px] font-bold text-white"
                            style={{ width: `${summary.healthyPercent}%` }}
                        >
                            {summary.healthyPercent}%
                        </div>
                        <div
                            className="bg-gradient-to-r from-amber-400 to-amber-500 flex items-center justify-center text-[9px] font-bold text-white"
                            style={{ width: `${100 - summary.healthyPercent}%` }}
                        >
                            {100 - summary.healthyPercent}%
                        </div>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-500 mb-4">
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-green-500 rounded-sm" /> Saludable: ${summary.healthySpent.toLocaleString('es-CL')}</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-500 rounded-sm" /> No Saludable: ${summary.unhealthySpent.toLocaleString('es-CL')}</span>
                    </div>

                    {/* Category chips */}
                    <div className="flex flex-wrap gap-2">
                        {summary.byCategory.map(cat => (
                            <span key={cat.name} className="bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300">
                                {cat.name}: ${cat.amount.toLocaleString('es-CL')}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Savings Goal */}
            {savingsGoal && (
                <div className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="text-2xl">{savingsGoal.icon}</span>
                            {savingsGoal.name}
                        </h3>
                        <span className="text-sm font-extrabold text-primary">{savingsPercent}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-4 mb-2 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-green-400 rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-1"
                            style={{ width: `${savingsPercent}%` }}
                        >
                            {savingsPercent > 15 && <span className="text-[9px] font-bold text-white">{savingsPercent}%</span>}
                        </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>${savingsGoal.currentAmount.toLocaleString('es-CL')} ahorrado</span>
                        <span>Meta: ${savingsGoal.targetAmount.toLocaleString('es-CL')}</span>
                    </div>
                </div>
            )}

            {/* Quick Stats */}
            {summary && (
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white dark:bg-surface-dark rounded-xl p-4 text-center shadow-sm border border-gray-100 dark:border-gray-800">
                        <span className="material-icons-round text-primary text-2xl mb-1 block">trending_down</span>
                        <p className="text-xs text-gray-400 font-semibold">Gastado</p>
                        <p className="font-extrabold text-gray-900 dark:text-white">${summary.totalSpent.toLocaleString('es-CL')}</p>
                    </div>
                    <div className="bg-white dark:bg-surface-dark rounded-xl p-4 text-center shadow-sm border border-gray-100 dark:border-gray-800">
                        <span className="material-icons-round text-green-500 text-2xl mb-1 block">savings</span>
                        <p className="text-xs text-gray-400 font-semibold">Ahorrado</p>
                        <p className="font-extrabold text-gray-900 dark:text-white">${summary.totalSaved.toLocaleString('es-CL')}</p>
                    </div>
                    <div className="bg-white dark:bg-surface-dark rounded-xl p-4 text-center shadow-sm border border-gray-100 dark:border-gray-800">
                        <span className="material-icons-round text-blue-500 text-2xl mb-1 block">add_card</span>
                        <p className="text-xs text-gray-400 font-semibold">Recargas</p>
                        <p className="font-extrabold text-gray-900 dark:text-white">${summary.totalRecharges.toLocaleString('es-CL')}</p>
                    </div>
                </div>
            )}

            {/* Explora tu Mundo (Phase 3 Links) */}
            <div className="space-y-3">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="material-icons-round text-primary text-xl">explore</span>
                    Explora tu Mundo
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <Link to="/estudiante/educacion" className="bg-gradient-to-br from-yellow-300 to-orange-400 p-4 rounded-2xl text-white shadow-sm hover:-translate-y-1 transition-transform relative overflow-hidden">
                        <div className="absolute -right-2 -top-2 text-white/20">
                            <span className="material-icons-round" style={{ fontSize: '4rem' }}>school</span>
                        </div>
                        <p className="font-black text-lg leading-tight relative z-10">Aventura<br />Financiera</p>
                    </Link>

                    <Link to="/estudiante/planificador" className="bg-gradient-to-br from-green-400 to-emerald-500 p-4 rounded-2xl text-white shadow-sm hover:-translate-y-1 transition-transform relative overflow-hidden">
                        <div className="absolute -right-2 -top-2 text-white/20">
                            <span className="material-icons-round" style={{ fontSize: '4rem' }}>restaurant</span>
                        </div>
                        <p className="font-black text-lg leading-tight relative z-10">Arma tu<br />Combo</p>
                    </Link>

                    <Link to="/estudiante/logros" className="bg-gradient-to-br from-purple-400 to-pink-500 p-4 rounded-2xl text-white shadow-sm hover:-translate-y-1 transition-transform relative overflow-hidden">
                        <div className="absolute -right-2 -top-2 text-white/20">
                            <span className="material-icons-round" style={{ fontSize: '4rem' }}>emoji_events</span>
                        </div>
                        <p className="font-black text-lg leading-tight relative z-10">Mis<br />Medallas</p>
                    </Link>

                    <Link to="/estudiante/resumen" className="bg-gradient-to-br from-blue-400 to-indigo-500 p-4 rounded-2xl text-white shadow-sm hover:-translate-y-1 transition-transform relative overflow-hidden">
                        <div className="absolute -right-2 -top-2 text-white/20">
                            <span className="material-icons-round" style={{ fontSize: '4rem' }}>auto_awesome</span>
                        </div>
                        <p className="font-black text-lg leading-tight relative z-10">Año<br />Épico</p>
                    </Link>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="material-icons-round text-primary text-xl">receipt_long</span>
                        Últimos Movimientos
                    </h3>
                    <Link to="/estudiante/historial" className="text-xs font-bold text-primary hover:text-primary-dark transition-colors">
                        Ver todo →
                    </Link>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {transactions.length === 0 && (
                        <div className="p-8 text-center text-gray-400">
                            <span className="material-icons-round text-4xl mb-2 block">receipt_long</span>
                            <p className="text-sm">No hay movimientos aún</p>
                        </div>
                    )}
                    {transactions.map(tx => {
                        const isPositive = tx.amount > 0
                        const typeIcons: Record<string, string> = {
                            compra: tx.icon || '🛒',
                            recarga: '💰',
                            ahorro: '🐖',
                            premio: '⭐',
                        }
                        const typeColors: Record<string, string> = {
                            compra: 'text-danger',
                            recarga: 'text-green-600',
                            ahorro: 'text-blue-600',
                            premio: 'text-amber-500',
                        }
                        return (
                            <div key={tx._id} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{typeIcons[tx.type]}</span>
                                    <div>
                                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{tx.description}</p>
                                        <p className="text-[10px] text-gray-400">
                                            {new Date(tx._creationTime).toLocaleString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <span className={`font-bold text-sm ${typeColors[tx.type]}`}>
                                    {isPositive ? '+' : ''}${Math.abs(tx.amount).toLocaleString('es-CL')}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
