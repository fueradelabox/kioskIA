import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import type { ChildContext } from './ParentLayout'
import { useChildDashboard, useUpdateConsumptionLimit } from '../../hooks/useParentData'
import type { Id } from '../../../convex/_generated/dataModel'

export default function ParentLimits() {
    const { activeChildId } = useOutletContext<ChildContext>()
    const dashboardData = useChildDashboard(activeChildId as Id<"students"> | null)
    const student = dashboardData?.student
    const dbLimit = dashboardData?.limit
    const loading = dashboardData === undefined
    const updateLimit = useUpdateConsumptionLimit()
    const [enabled, setEnabled] = useState(true)
    const [limitPercent, setLimitPercent] = useState(30)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        if (dbLimit) {
            setEnabled(dbLimit.enabled)
            setLimitPercent(dbLimit.unhealthyPercent)
        }
    }, [dbLimit])

    const handleSave = async () => {
        if (!activeChildId) return
        setSaving(true)
        try {
            await updateLimit({
                studentId: activeChildId as Id<"students">,
                enabled,
                unhealthyPercent: limitPercent
            })
        } catch (err) {
            console.error(err)
        }
        setSaving(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto p-5 md:p-10 flex items-center justify-center min-h-[50vh]">
                <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    const balance = student?.balance || 0
    const maxUnhealthy = Math.round(balance * limitPercent / 100)

    const exampleProducts = [
        { name: 'Bebida azucarada', icon: '🥤' },
        { name: 'Papas fritas', icon: '🍟' },
        { name: 'Galletas', icon: '🍪' },
        { name: 'Chocolates', icon: '🍫' },
    ]

    return (
        <div className="max-w-3xl mx-auto p-5 md:p-10 space-y-6">
            <div className="animate-slide-up">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
                    Límites de Consumo 🛡️
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Configura restricciones en productos no saludables{student ? ` para ${student.fullName.split(' ')[0]}` : ''}
                </p>
            </div>

            {/* Toggle Card */}
            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${enabled ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                            <span className="material-icons-round text-2xl">{enabled ? 'shield' : 'shield_outlined'}</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Limitar productos no saludables</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Restringe el gasto en dulces, snacks, y bebidas azucaradas</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setEnabled(!enabled)}
                        className={`relative w-14 h-8 rounded-full transition-colors ${enabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${enabled ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>

            {/* Limit Slider */}
            {enabled && (
                <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-5 animate-slide-up" style={{ animationDelay: '200ms' }}>
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="material-icons-round text-amber-500">tune</span>
                            Porcentaje Máximo
                        </h3>
                        <span className="text-2xl font-extrabold text-primary">{limitPercent}%</span>
                    </div>

                    <input
                        type="range"
                        min="0" max="100" step="5"
                        value={limitPercent}
                        onChange={e => setLimitPercent(Number(e.target.value))}
                        className="w-full accent-primary h-2 bg-gray-100 dark:bg-gray-700 rounded-full cursor-pointer"
                    />

                    <div className="flex justify-between text-xs text-gray-400">
                        <span>0% (bloquear todo)</span>
                        <span>100% (sin límite)</span>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 space-y-2">
                        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                            Con el saldo actual de <strong>${balance.toLocaleString('es-CL')}</strong>, tu hijo puede gastar hasta:
                        </p>
                        <p className="text-2xl font-extrabold text-blue-700 dark:text-blue-300">
                            ${maxUnhealthy.toLocaleString('es-CL')} <span className="text-sm font-normal text-blue-500">en no saludables</span>
                        </p>
                    </div>
                </div>
            )}

            {/* Affected Products */}
            {enabled && (
                <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                        <span className="material-icons-round text-red-400">block</span>
                        Productos Afectados
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {exampleProducts.map(p => (
                            <div key={p.name} className="flex items-center gap-3 p-3 bg-red-50/50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-800/30">
                                <span className="text-2xl">{p.icon}</span>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{p.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Save Button */}
            <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                    {saving ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Guardando...
                        </>
                    ) : saved ? (
                        <>
                            <span className="material-icons-round">check_circle</span>
                            ¡Guardado!
                        </>
                    ) : (
                        <>
                            <span className="material-icons-round">save</span>
                            Guardar Configuración
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
