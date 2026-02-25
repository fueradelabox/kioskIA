import { useOutletContext } from 'react-router-dom'
import type { ChildContext } from './ParentLayout'
import { useMonthlyAnalysis, useChildDashboard } from '../../hooks/useParentData'
import type { Id } from '../../../convex/_generated/dataModel'

export default function MonthlyAnalysis() {
    const { activeChildId } = useOutletContext<ChildContext>()
    const analysis = useMonthlyAnalysis(activeChildId as Id<"students"> | null)
    const dashboardData = useChildDashboard(activeChildId as Id<"students"> | null)
    const student = dashboardData?.student
    const loading = analysis === undefined

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-5 md:p-10 flex items-center justify-center min-h-[50vh]">
                <div className="w-10 h-10 border-3 border-gray-900 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!analysis) {
        return (
            <div className="max-w-4xl mx-auto p-5 md:p-10 text-center py-20">
                <span className="material-icons-round text-6xl text-gray-200 mb-4 block">analytics</span>
                <p className="text-gray-400 font-medium">Selecciona un hijo para ver el análisis</p>
            </div>
        )
    }

    const maxCategoryAmount = analysis.byCategory.length > 0
        ? Math.max(...analysis.byCategory.map(c => c.amount))
        : 1

    const maxWeekly = Math.max(...analysis.weeklySpending, 1)

    const summaryCards = [
        { label: 'Gastado', value: analysis.totalSpent, icon: 'trending_down', color: 'text-red-500' },
        { label: 'Ahorrado', value: analysis.totalSaved, icon: 'savings', color: 'text-green-500' },
        { label: 'Recargado', value: analysis.totalRecharged, icon: 'add_card', color: 'text-blue-500' },
        { label: 'Transacciones', value: analysis.transactionCount, icon: 'receipt_long', color: 'text-gray-500', isCurrency: false },
    ]

    return (
        <div className="max-w-4xl mx-auto p-5 md:p-10 space-y-6">
            <div className="animate-slide-up">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
                    Análisis Mensual 📊
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    {analysis.monthName}{student ? ` — ${student.fullName.split(' ')[0]}` : ''}
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
                {summaryCards.map(card => (
                    <div key={card.label} className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-700 p-5 text-center shadow-sm">
                        <span className={`material-icons-round text-2xl mb-2 block ${card.color}`}>{card.icon}</span>
                        <p className="text-xs text-gray-400 font-semibold uppercase">{card.label}</p>
                        <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
                            {card.isCurrency !== false ? `$${card.value.toLocaleString('es-CL')}` : card.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Health Ratio */}
            <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm animate-slide-up" style={{ animationDelay: '200ms' }}>
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <span className="material-icons-round text-gray-400">monitor_heart</span>
                    Ratio de Alimentación
                </h3>
                {analysis.totalSpent > 0 ? (
                    <>
                        <div className="flex rounded-xl overflow-hidden h-8 mb-3">
                            <div
                                className="bg-gray-900 dark:bg-white flex items-center justify-center text-xs font-bold text-white dark:text-gray-900 transition-all"
                                style={{ width: `${analysis.healthyPercent}%` }}
                            >
                                {analysis.healthyPercent > 10 && `${analysis.healthyPercent}%`}
                            </div>
                            <div
                                className="bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 transition-all"
                                style={{ width: `${100 - analysis.healthyPercent}%` }}
                            >
                                {(100 - analysis.healthyPercent) > 10 && `${100 - analysis.healthyPercent}%`}
                            </div>
                        </div>
                        <div className="flex gap-6 text-sm text-gray-500">
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-gray-900 dark:bg-white rounded-sm" />
                                Saludable: ${analysis.healthySpent.toLocaleString('es-CL')}
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-sm" />
                                No Saludable: ${analysis.unhealthySpent.toLocaleString('es-CL')}
                            </span>
                        </div>
                    </>
                ) : (
                    <p className="text-center text-gray-400 py-4">Sin datos de compras este mes</p>
                )}
            </div>

            {/* Category Breakdown */}
            <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm animate-slide-up" style={{ animationDelay: '300ms' }}>
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <span className="material-icons-round text-gray-400">category</span>
                    Gasto por Categoría
                </h3>
                {analysis.byCategory.length > 0 ? (
                    <div className="space-y-3">
                        {analysis.byCategory.map(cat => (
                            <div key={cat.name} className="flex items-center gap-4">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-24 truncate">{cat.name}</span>
                                <div className="flex-1 h-6 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
                                    <div
                                        className="h-full bg-gray-900 dark:bg-white rounded-lg transition-all duration-500"
                                        style={{ width: `${(cat.amount / maxCategoryAmount) * 100}%` }}
                                    />
                                </div>
                                <span className="text-sm font-bold text-gray-900 dark:text-white w-24 text-right">
                                    ${cat.amount.toLocaleString('es-CL')}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-400 py-4">Sin categorías registradas</p>
                )}
            </div>

            {/* Weekly Trend */}
            <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm animate-slide-up" style={{ animationDelay: '400ms' }}>
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <span className="material-icons-round text-gray-400">show_chart</span>
                    Gasto Semanal
                </h3>
                <div className="flex items-end gap-3 h-32">
                    {analysis.weeklySpending.map((amount, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-500">
                                ${amount > 0 ? amount.toLocaleString('es-CL') : '0'}
                            </span>
                            <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-t-lg relative" style={{ height: '80px' }}>
                                <div
                                    className="absolute bottom-0 left-0 right-0 bg-gray-900 dark:bg-white rounded-t-lg transition-all duration-700"
                                    style={{ height: `${(amount / maxWeekly) * 100}%` }}
                                />
                            </div>
                            <span className="text-[10px] text-gray-400 font-medium">Sem {i + 1}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
