import { useState, useMemo } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'

type FilterType = 'all' | 'compras' | 'recargas' | 'ahorros'

export default function TransactionHistory() {
    const [filter, setFilter] = useState<FilterType>('all')
    const [expandedId, setExpandedId] = useState<string | null>(null)

    const filterMap: Record<FilterType, 'compra' | 'recarga' | 'ahorro' | undefined> = {
        all: undefined,
        compras: 'compra',
        recargas: 'recarga',
        ahorros: 'ahorro',
    }

    const rawTransactions = useQuery(api.students.getTransactions, { filterType: filterMap[filter], limit: 50 })
    const loading = rawTransactions === undefined
    const transactions = useMemo(() => rawTransactions ?? [], [rawTransactions])

    const filters: { key: FilterType; label: string }[] = [
        { key: 'all', label: 'Todas' },
        { key: 'compras', label: 'Compras' },
        { key: 'recargas', label: 'Recargas' },
        { key: 'ahorros', label: 'Ahorros' },
    ]

    // Group transactions by date
    const grouped = useMemo(() => {
        const groups: Record<string, typeof transactions> = {}
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        for (const tx of transactions) {
            const txDate = new Date(tx._creationTime)
            let groupLabel: string

            if (txDate.toDateString() === today.toDateString()) {
                groupLabel = 'Hoy'
            } else if (txDate.toDateString() === yesterday.toDateString()) {
                groupLabel = 'Ayer'
            } else {
                groupLabel = txDate.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })
            }

            if (!groups[groupLabel]) groups[groupLabel] = []
            groups[groupLabel].push(tx)
        }
        return groups
    }, [transactions])

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto p-5 md:p-10 flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Cargando historial...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto p-5 md:p-10 space-y-6">
            <div className="animate-slide-up">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
                    Historial 📋
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Revisa todas tus transacciones
                </p>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-1 animate-slide-up" style={{ animationDelay: '100ms' }}>
                {filters.map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${filter === f.key
                            ? 'bg-primary text-white shadow-md shadow-primary/30'
                            : 'bg-white dark:bg-surface-dark text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:text-primary'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Transaction Groups */}
            <div className="space-y-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
                {Object.keys(grouped).length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <span className="material-icons-round text-5xl mb-3 block">receipt_long</span>
                        <p className="font-medium">No hay transacciones</p>
                    </div>
                )}
                {Object.entries(grouped).map(([group, txs]) => (
                    <div key={group}>
                        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-1">
                            {group}
                        </h3>
                        <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 divide-y divide-gray-50 dark:divide-gray-700/50">
                            {txs.map(tx => (
                                <div key={tx._id}>
                                    <button
                                        onClick={() => setExpandedId(expandedId === tx._id ? null : tx._id)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${tx.amount > 0
                                                ? 'bg-primary/10 text-primary'
                                                : tx.isHealthy === true ? 'bg-healthy/10 text-healthy'
                                                    : tx.isHealthy === false ? 'bg-unhealthy/10 text-unhealthy'
                                                        : tx.type === 'ahorro' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                                                }`}>
                                                <span className="material-icons-round">{tx.icon || 'receipt'}</span>
                                            </div>
                                            <div className="text-left">
                                                <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{tx.description}</h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                                                    {tx.isHealthy !== null && tx.isHealthy !== undefined && (
                                                        <span className={`w-1.5 h-1.5 rounded-full ${tx.isHealthy ? 'bg-healthy' : 'bg-unhealthy'}`} />
                                                    )}
                                                    {tx.category || tx.type} • {new Date(tx._creationTime).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold text-sm ${tx.amount > 0 ? 'text-primary' : 'text-danger'}`}>
                                                {tx.amount > 0 ? '+' : ''}{tx.amount < 0 ? '-' : ''}${Math.abs(tx.amount).toLocaleString('es-CL')}
                                            </p>
                                        </div>
                                    </button>
                                    {/* Expanded Detail */}
                                    {expandedId === tx._id && (
                                        <div className="px-4 pb-4 animate-fade-in">
                                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Tipo</span>
                                                    <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">{tx.type}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Categoría</span>
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">{tx.category || '-'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Saldo después</span>
                                                    <span className="font-bold text-gray-900 dark:text-white">${tx.balanceAfter.toLocaleString('es-CL')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
