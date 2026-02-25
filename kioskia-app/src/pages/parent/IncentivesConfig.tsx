import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import type { ChildContext } from './ParentLayout'
import { useChildDashboard, useSaveIncentiveConfig } from '../../hooks/useParentData'
import type { Id } from '../../../convex/_generated/dataModel'

export default function IncentivesConfig() {
    const { activeChildId } = useOutletContext<ChildContext>()
    const dashboardData = useChildDashboard(activeChildId as Id<"students"> | null)
    const saveIncentiveConfig = useSaveIncentiveConfig()
    const student = dashboardData?.student
    const savingsGoal = dashboardData?.savingsGoal
    const loading = dashboardData === undefined
    const [matchPercent, setMatchPercent] = useState(50)
    const [saved, setSaved] = useState(false)
    const [saving, setSaving] = useState(false)

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto p-5 md:p-10 flex items-center justify-center min-h-[50vh]">
                <div className="w-10 h-10 border-3 border-gray-900 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    const handleSave = async () => {
        if (!activeChildId) return
        setSaving(true)
        try {
            await saveIncentiveConfig({
                studentId: activeChildId as Id<"students">,
                matchPercent,
            })
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        } catch (err) {
            console.error('Error guardando configuración:', err)
        }
        setSaving(false)
    }

    const currentSaved = savingsGoal?.currentAmount ?? 0
    const projectedBonus = Math.round(currentSaved * matchPercent / 100)

    const presets = [
        { label: '25%', value: 25, desc: 'Conservador' },
        { label: '50%', value: 50, desc: 'Equilibrado' },
        { label: '75%', value: 75, desc: 'Generoso' },
        { label: '100%', value: 100, desc: 'Match total' },
    ]

    return (
        <div className="max-w-3xl mx-auto p-5 md:p-10 space-y-6">
            <div className="animate-slide-up">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
                    Configurar Incentivos 🏆
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Define bonos de ahorro{student ? ` para ${student.fullName.split(' ')[0]}` : ''} — cuando tu hijo ahorre, tú aportas un porcentaje extra
                </p>
            </div>

            {/* Match Config Card */}
            <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm space-y-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="material-icons-round text-gray-400">handshake</span>
                        Porcentaje de Match
                    </h3>
                    <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{matchPercent}%</span>
                </div>

                <input
                    type="range"
                    min="0" max="100" step="5"
                    value={matchPercent}
                    onChange={e => setMatchPercent(Number(e.target.value))}
                    className="w-full accent-gray-900 dark:accent-white h-2 bg-gray-100 dark:bg-gray-700 rounded-full cursor-pointer"
                />

                <div className="grid grid-cols-4 gap-2">
                    {presets.map(p => (
                        <button
                            key={p.value}
                            onClick={() => setMatchPercent(p.value)}
                            className={`py-3 rounded-xl text-center transition-all ${matchPercent === p.value
                                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold shadow-sm'
                                : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            <p className="text-lg font-bold">{p.label}</p>
                            <p className="text-[10px] mt-0.5">{p.desc}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* How it Works */}
            <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm animate-slide-up" style={{ animationDelay: '200ms' }}>
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <span className="material-icons-round text-gray-400">info</span>
                    ¿Cómo funciona?
                </h3>
                <div className="space-y-3">
                    {[
                        { icon: 'savings', text: 'Tu hijo ahorra una cantidad hacia su meta' },
                        { icon: 'add_circle', text: `Tú aportas automáticamente el ${matchPercent}% de lo ahorrado` },
                        { icon: 'emoji_events', text: '¡La meta se alcanza más rápido y tu hijo aprende a ahorrar!' },
                    ].map((step, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <div className="w-10 h-10 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center shrink-0">
                                <span className="material-icons-round text-white dark:text-gray-900 text-lg">{step.icon}</span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{step.text}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Impact Preview */}
            {savingsGoal && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                        <span className="material-icons-round text-gray-400">analytics</span>
                        Proyección con Meta Actual
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Ahorrado</p>
                            <p className="text-xl font-extrabold text-gray-900 dark:text-white">${currentSaved.toLocaleString('es-CL')}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Tu Bono</p>
                            <p className="text-xl font-extrabold text-green-600">+${projectedBonus.toLocaleString('es-CL')}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Total</p>
                            <p className="text-xl font-extrabold text-gray-900 dark:text-white">${(currentSaved + projectedBonus).toLocaleString('es-CL')}</p>
                        </div>
                    </div>
                    <div className="mt-4 text-center">
                        <p className="text-xs text-gray-400">
                            Meta: <strong className="text-gray-700 dark:text-gray-300">{savingsGoal.icon} {savingsGoal.name}</strong> — ${savingsGoal.targetAmount.toLocaleString('es-CL')}
                        </p>
                    </div>
                </div>
            )}

            {/* Save */}
            <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
                <button
                    onClick={handleSave}
                    disabled={saving || !activeChildId}
                    className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-4 rounded-2xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                    {saved ? (
                        <><span className="material-icons-round">check_circle</span> ¡Guardado!</>
                    ) : saving ? (
                        <><span className="material-icons-round animate-spin">sync</span> Guardando...</>
                    ) : (
                        <><span className="material-icons-round">save</span> Guardar Configuración</>
                    )}
                </button>
            </div>
        </div>
    )
}
