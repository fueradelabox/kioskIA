import { useVendorSales, useVendorProfile } from '../../hooks/useVendorData'

export default function VendorDashboard() {
    const profile = useVendorProfile()
    const { sales, todayTotal, todayCount, todayHealthy, todayUnhealthy, todayLibrary } = useVendorSales()

    const statCards = [
        { label: 'Ventas Hoy', value: `$${todayTotal.toLocaleString('es-CL')}`, icon: 'payments', color: 'from-amber-500 to-orange-600', sublabel: `${todayCount} transacciones` },
        { label: 'Saludable', value: `$${todayHealthy.toLocaleString('es-CL')}`, icon: 'eco', color: 'from-green-500 to-emerald-600', sublabel: todayTotal > 0 ? `${Math.round((todayHealthy / todayTotal) * 100)}% del total` : '0%' },
        { label: 'No Saludable', value: `$${todayUnhealthy.toLocaleString('es-CL')}`, icon: 'warning', color: 'from-amber-400 to-yellow-500', sublabel: todayTotal > 0 ? `${Math.round((todayUnhealthy / todayTotal) * 100)}% del total` : '0%' },
        { label: 'Librería', value: `$${todayLibrary.toLocaleString('es-CL')}`, icon: 'menu_book', color: 'from-blue-500 to-indigo-600', sublabel: todayTotal > 0 ? `${Math.round((todayLibrary / todayTotal) * 100)}% del total` : '0%' },
    ]

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 lg:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                    Dashboard de Ventas
                </h1>
                <p className="text-gray-500 mt-1">
                    {profile?.businessName ?? 'Mi Kiosco'} · Resumen del día
                </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map(card => (
                    <div key={card.label} className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
                            <span className="material-icons-round text-white text-xl">{card.icon}</span>
                        </div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{card.label}</p>
                        <p className="text-xl font-extrabold text-gray-900 dark:text-white mt-1">{card.value}</p>
                        <p className="text-xs text-gray-400 mt-1">{card.sublabel}</p>
                    </div>
                ))}
            </div>

            {/* Sales Breakdown Bar */}
            {todayTotal > 0 && (
                <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Distribución de Ventas</h3>
                    <div className="flex rounded-xl overflow-hidden h-6">
                        {todayHealthy > 0 && (
                            <div
                                className="bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center text-[10px] font-bold text-white"
                                style={{ width: `${(todayHealthy / todayTotal) * 100}%` }}
                            >
                                {Math.round((todayHealthy / todayTotal) * 100)}%
                            </div>
                        )}
                        {todayUnhealthy > 0 && (
                            <div
                                className="bg-gradient-to-r from-amber-400 to-amber-500 flex items-center justify-center text-[10px] font-bold text-white"
                                style={{ width: `${(todayUnhealthy / todayTotal) * 100}%` }}
                            >
                                {Math.round((todayUnhealthy / todayTotal) * 100)}%
                            </div>
                        )}
                        {todayLibrary > 0 && (
                            <div
                                className="bg-gradient-to-r from-blue-400 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white"
                                style={{ width: `${(todayLibrary / todayTotal) * 100}%` }}
                            >
                                {Math.round((todayLibrary / todayTotal) * 100)}%
                            </div>
                        )}
                    </div>
                    <div className="flex gap-4 mt-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded-sm" /> Saludable</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-500 rounded-sm" /> No Saludable</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded-sm" /> Librería</span>
                    </div>
                </div>
            )}

            {/* Recent Sales */}
            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-gray-900 dark:text-white">Últimas Ventas</h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {sales.length === 0 && (
                        <div className="p-8 text-center text-gray-400">
                            <span className="material-icons-round text-4xl mb-2 block">receipt_long</span>
                            <p>No hay ventas registradas aún</p>
                        </div>
                    )}
                    {sales.slice(0, 20).map((sale) => (
                        <div key={sale._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{sale.icon || '🛒'}</span>
                                <div>
                                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{sale.description}</p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(sale._creationTime).toLocaleString('es-CL', {
                                            day: '2-digit',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-900 dark:text-white">${Math.abs(sale.amount).toLocaleString('es-CL')}</p>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${sale.isHealthy
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                    : sale.category === 'Librería'
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                    }`}>
                                    {sale.isHealthy ? 'Saludable' : sale.category === 'Librería' ? 'Librería' : 'No Saludable'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
