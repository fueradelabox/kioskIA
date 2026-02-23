import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStudentProfile, useSavingsGoal, useTransferToSavings } from '../../hooks/useStudentData'

export default function TransferToSavings() {
    const navigate = useNavigate()
    const student = useStudentProfile()
    const goal = useSavingsGoal()
    const transferToSavings = useTransferToSavings()
    const [amount, setAmount] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const currentBalance = student?.balance || 0
    const currentSavings = goal?.currentAmount || 0
    const goalAmount = goal?.targetAmount || 1

    const numAmount = Number(amount) || 0
    const remaining = currentBalance - numAmount
    const newSavings = currentSavings + numAmount
    const newProgress = Math.min((newSavings / goalAmount) * 100, 100)

    const handleTransfer = async () => {
        if (!goal || numAmount <= 0 || numAmount > currentBalance) return
        setSaving(true)
        setError('')
        try {
            await transferToSavings({ goalId: goal._id, amount: numAmount })
            navigate('/estudiante')
        } catch (err: any) {
            setError(err?.message || 'Error al transferir')
            setSaving(false)
        }
    }

    if (!goal) {
        return (
            <div className="max-w-2xl mx-auto p-5 md:p-10 text-center">
                <span className="text-5xl mb-4 block">🎯</span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No tienes una meta de ahorro</h2>
                <p className="text-gray-500 mb-4">Créala primero para empezar a ahorrar</p>
                <button onClick={() => navigate('/estudiante/ahorro/crear')} className="bg-primary text-white font-bold py-3 px-6 rounded-xl">
                    Crear Meta
                </button>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto p-5 md:p-10 space-y-6">
            <div className="animate-slide-up">
                <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-4 transition-colors">
                    <span className="material-icons-round text-sm">arrow_back</span>
                    Volver
                </button>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
                    Ahorrar Ahora 🐷
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Transfiere dinero a tu meta de ahorro
                </p>
            </div>

            {error && (
                <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm font-medium flex items-center gap-2">
                    <span className="material-icons-round text-sm">error</span>
                    {error}
                </div>
            )}

            {/* Current Goal Summary */}
            <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 flex items-center justify-center border border-gray-100 dark:border-gray-700">
                        <span className="text-3xl">{goal.icon}</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white">{goal.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-primary font-bold">${currentSavings.toLocaleString('es-CL')}</span>
                            <span className="text-gray-400 text-sm">/ ${goalAmount.toLocaleString('es-CL')}</span>
                        </div>
                    </div>
                    <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {Math.round((currentSavings / goalAmount) * 100)}%
                    </span>
                </div>
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-700"
                        style={{ width: `${(currentSavings / goalAmount) * 100}%` }}
                    />
                </div>
            </div>

            {/* Amount Input */}
            <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 animate-slide-up" style={{ animationDelay: '200ms' }}>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    ¿Cuánto quieres ahorrar hoy?
                </label>
                <div className="relative mb-4">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-2xl">$</span>
                    <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        placeholder="0"
                        className="w-full pl-12 pr-4 py-5 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 dark:text-white text-3xl font-bold text-center outline-none transition-all"
                        max={currentBalance}
                    />
                </div>

                {/* Quick amounts */}
                <div className="flex gap-2 mb-5">
                    {[500, 1000, 2000, 5000].map(preset => (
                        <button
                            key={preset}
                            onClick={() => setAmount(String(preset))}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${amount === String(preset)
                                ? 'bg-primary text-white shadow-md shadow-primary/30'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary'
                                }`}
                        >
                            ${preset.toLocaleString('es-CL')}
                        </button>
                    ))}
                </div>

                {/* Balance Info */}
                <div className="space-y-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Saldo actual</span>
                        <span className="font-bold text-gray-900 dark:text-white">${currentBalance.toLocaleString('es-CL')}</span>
                    </div>
                    {numAmount > 0 && (
                        <>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Monto a ahorrar</span>
                                <span className="font-bold text-primary">-${numAmount.toLocaleString('es-CL')}</span>
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between text-sm">
                                <span className="text-gray-500">Disponible después</span>
                                <span className={`font-bold ${remaining >= 0 ? 'text-gray-900 dark:text-white' : 'text-danger'}`}>
                                    ${remaining.toLocaleString('es-CL')}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Nuevo progreso</span>
                                <span className="font-bold text-primary">{newProgress.toFixed(1)}%</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Confirm Button */}
            <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
                <button
                    onClick={handleTransfer}
                    disabled={saving || numAmount <= 0 || numAmount > currentBalance}
                    className="w-full bg-gradient-to-r from-primary to-emerald-500 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 disabled:shadow-none hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                >
                    {saving ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Procesando...
                        </>
                    ) : (
                        <>
                            <span className="material-icons-round">savings</span>
                            Confirmar Ahorro
                        </>
                    )}
                </button>
            </div>

            {/* Motivational Message */}
            <div className="text-center animate-slide-up" style={{ animationDelay: '400ms' }}>
                <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 px-4 py-2 rounded-full text-sm font-medium">
                    <span className="text-lg">💪</span>
                    ¡Cada peso cuenta, sigue así!
                </div>
            </div>
        </div>
    )
}
