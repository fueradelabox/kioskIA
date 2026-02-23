import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateSavingsGoal } from '../../hooks/useStudentData'

export default function CreateSavingsGoal() {
    const navigate = useNavigate()
    const createSavingsGoal = useCreateSavingsGoal()
    const [goalName, setGoalName] = useState('')
    const [goalAmount, setGoalAmount] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!goalName || !goalAmount) return
        setSaving(true)
        setError('')
        try {
            await createSavingsGoal({ name: goalName, targetAmount: Number(goalAmount), icon: '🎯' })
            navigate('/estudiante')
        } catch (err: any) {
            setError(err?.message || 'Error al crear meta')
            setSaving(false)
        }
    }

    return (
        <div className="max-w-5xl mx-auto p-5 md:p-10">
            {/* Header */}
            <div className="mb-8 text-center max-w-2xl mx-auto animate-slide-up">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                    Crear Nueva Meta 🎯
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                    Define tu próximo objetivo y comienza a ahorrar hoy mismo
                </p>
            </div>

            {error && (
                <div className="max-w-2xl mx-auto mb-4 p-3 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm font-medium flex items-center gap-2">
                    <span className="material-icons-round text-sm">error</span>
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form */}
                <div className="lg:col-span-7 animate-slide-up" style={{ animationDelay: '100ms' }}>
                    <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Goal Name */}
                            <div>
                                <label htmlFor="goalName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    ¿Qué quieres comprar?
                                </label>
                                <div className="relative">
                                    <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        shopping_bag
                                    </span>
                                    <input
                                        id="goalName"
                                        type="text"
                                        value={goalName}
                                        onChange={e => setGoalName(e.target.value)}
                                        placeholder="Ej: Bicicleta Nueva, Entradas al Cine..."
                                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 dark:text-white placeholder-gray-400 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            {/* Amount */}
                            <div>
                                <label htmlFor="goalAmount" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    ¿Cuánto cuesta?
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">$</span>
                                    <input
                                        id="goalAmount"
                                        type="number"
                                        value={goalAmount}
                                        onChange={e => setGoalAmount(e.target.value)}
                                        placeholder="0"
                                        className="w-full pl-8 pr-16 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 dark:text-white placeholder-gray-400 transition-all outline-none font-mono text-lg"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">CLP</span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                                    Te recomendamos metas realistas para empezar.
                                </p>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Sube una foto de tu meta
                                </label>
                                <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-xl hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group">
                                    <div className="space-y-1 text-center">
                                        <span className="material-icons-round text-5xl text-gray-400 group-hover:text-primary transition-colors">
                                            add_photo_alternate
                                        </span>
                                        <div className="flex text-sm text-gray-600 dark:text-gray-300 justify-center">
                                            <span className="text-primary font-medium cursor-pointer">Sube un archivo</span>
                                            <p className="pl-1">o arrastra y suelta</p>
                                        </div>
                                        <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 5MB</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tip */}
                            <div className="bg-primary/10 dark:bg-primary/5 rounded-xl p-4 flex gap-3 border border-primary/20">
                                <span className="material-icons-round text-primary">lightbulb</span>
                                <div>
                                    <h4 className="font-semibold text-primary text-sm">Tip de Ahorro</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Es más fácil ahorrar cuando tienes una imagen clara de lo que quieres. ¡Visualiza tu éxito!
                                    </p>
                                </div>
                            </div>

                            {/* Mobile Actions */}
                            <div className="flex flex-col gap-3 pt-2 lg:hidden">
                                <button
                                    type="submit"
                                    disabled={saving || !goalName || !goalAmount}
                                    className="w-full bg-gradient-to-r from-primary to-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-60"
                                >
                                    {saving ? 'Guardando...' : 'Crear Mi Meta'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="w-full py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Preview */}
                <div className="lg:col-span-5 flex flex-col gap-5 lg:sticky lg:top-24 animate-slide-up" style={{ animationDelay: '200ms' }}>
                    <div className="flex items-center gap-2">
                        <span className="material-icons-round text-gray-400 text-sm">visibility</span>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Vista Previa</h3>
                    </div>

                    <div className="bg-white dark:bg-surface-dark rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 hover:scale-[1.02] transition-transform duration-300">
                        <div className="h-44 bg-gradient-to-br from-primary/10 to-blue-500/10 dark:from-primary/20 dark:to-blue-500/20 flex items-center justify-center">
                            {goalName ? (
                                <span className="text-6xl">🎯</span>
                            ) : (
                                <div className="text-center text-gray-300 dark:text-gray-600">
                                    <span className="material-icons-round text-6xl">image</span>
                                    <p className="text-sm font-medium mt-1">Tu imagen aparecerá aquí</p>
                                </div>
                            )}
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {goalName || 'Tu Meta...'}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Creada el {new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="bg-primary/10 p-2 rounded-lg">
                                    <span className="material-icons-round text-primary">flag</span>
                                </div>
                            </div>
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-gray-600 dark:text-gray-300">$0</span>
                                    <span className="text-gray-900 dark:text-white font-bold">
                                        ${goalAmount ? Number(goalAmount).toLocaleString('es-CL') : '0'}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                    <div className="bg-gradient-to-r from-primary to-emerald-400 h-3 rounded-full" style={{ width: '3%' }} />
                                </div>
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>0% completado</span>
                                    <span>¡Comienza ahora!</span>
                                </div>
                            </div>
                            <div className="bg-primary/5 rounded-lg p-3 text-center border border-dashed border-primary/20">
                                <p className="text-sm text-primary font-medium">✨ ¡Tú puedes lograrlo!</p>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden lg:flex flex-col gap-3">
                        <button
                            onClick={handleSubmit as any}
                            disabled={saving || !goalName || !goalAmount}
                            className="w-full bg-gradient-to-r from-primary to-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-60"
                        >
                            <span>{saving ? 'Guardando...' : 'Crear Mi Meta'}</span>
                            {!saving && <span className="material-icons-round text-sm">arrow_forward</span>}
                        </button>
                        <button
                            onClick={() => navigate(-1)}
                            className="w-full py-3 rounded-xl text-gray-500 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
