import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChildren, useCreateDeposit, useDeposits } from '../../hooks/useParentData'
import type { Id } from '../../../convex/_generated/dataModel'

export default function ParentDeposit() {
    const navigate = useNavigate()
    const children = useChildren()
    const createDeposit = useCreateDeposit()
    const deposits = useDeposits()
    const [selectedChild, setSelectedChild] = useState<Id<"students"> | null>(null)
    const [amount, setAmount] = useState('')
    const [reference, setReference] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const QUICK_AMOUNTS = [5000, 10000, 15000, 20000, 30000, 50000]

    const handleDeposit = async () => {
        if (!selectedChild || !amount || !reference) return
        setLoading(true)
        setError('')
        try {
            await createDeposit({
                studentId: selectedChild,
                amount: parseInt(amount),
                reference,
            })
            setSuccess(true)
            setAmount('')
            setReference('')
        } catch (err: unknown) {
            setError((err as Error)?.message || 'Error al registrar el depósito')
        }
        setLoading(false)
    }

    if (success) {
        return (
            <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-green-500/20 animate-scale-check">
                    <span className="material-icons-round text-white text-4xl">check_circle</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">¡Depósito Registrado! 🎉</h2>
                <p className="text-gray-500 mb-2 text-center">El saldo se ha actualizado correctamente.</p>
                <p className="text-2xl font-extrabold text-primary mb-6">${parseInt(amount || '0').toLocaleString('es-CL')}</p>
                <button
                    onClick={() => { setSuccess(false); setSelectedChild(null) }}
                    className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg transition-all hover:shadow-xl"
                >
                    Realizar otro depósito
                </button>
                <button
                    onClick={() => navigate('/padre')}
                    className="mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                    Volver al Dashboard
                </button>
            </div>
        )
    }

    return (
        <div className="p-4 lg:p-6 space-y-6 pb-24">
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Depositar Saldo</h1>
                <p className="text-sm text-gray-500 mt-1">Transferencia bancaria</p>
            </div>

            {/* Select Child */}
            <div className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">Seleccionar Hijo/a</h3>
                <div className="grid grid-cols-2 gap-3">
                    {children.map((child) => {
                        if (!child) return null;
                        return (
                            <button
                                key={child._id}
                                onClick={() => setSelectedChild(child._id)}
                                className={`p-4 rounded-xl border-2 transition-all text-left ${selectedChild === child._id
                                    ? 'border-primary bg-primary/5 shadow-md'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-sm">
                                        {child.initials}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-900 dark:text-white">{child.fullName}</p>
                                        <p className="text-xs text-gray-400">{child.grade}</p>
                                        <p className="text-xs font-bold text-primary">Saldo: ${child.balance.toLocaleString('es-CL')}</p>
                                    </div>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>

            {selectedChild && (
                <>
                    {/* Amount */}
                    <div className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-3">Monto a Depositar</h3>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            {QUICK_AMOUNTS.map(qa => (
                                <button
                                    key={qa}
                                    onClick={() => setAmount(String(qa))}
                                    className={`py-3 rounded-xl text-sm font-bold transition-all ${amount === String(qa)
                                        ? 'bg-primary text-white shadow-md shadow-primary/30'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary/10'
                                        }`}
                                >
                                    ${qa.toLocaleString('es-CL')}
                                </button>
                            ))}
                        </div>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">$</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                placeholder="Otro monto..."
                                className="w-full pl-10 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-lg font-bold outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    {/* Bank Transfer Info */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-5 border border-blue-200 dark:border-blue-800">
                        <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                            <span className="material-icons-round">account_balance</span>
                            Datos para Transferencia
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-blue-700/70 dark:text-blue-400">Banco</span>
                                <span className="font-bold text-blue-900 dark:text-blue-200">Banco Estado</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-blue-700/70 dark:text-blue-400">Tipo Cuenta</span>
                                <span className="font-bold text-blue-900 dark:text-blue-200">Cuenta Corriente</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-blue-700/70 dark:text-blue-400">RUT</span>
                                <span className="font-bold text-blue-900 dark:text-blue-200">76.543.210-K</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-blue-700/70 dark:text-blue-400">N° Cuenta</span>
                                <span className="font-bold text-blue-900 dark:text-blue-200">0012345678</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-blue-700/70 dark:text-blue-400">Nombre</span>
                                <span className="font-bold text-blue-900 dark:text-blue-200">Colegio KioskIA SpA</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-blue-700/70 dark:text-blue-400">Email</span>
                                <span className="font-bold text-blue-900 dark:text-blue-200">pagos@kioskia.cl</span>
                            </div>
                        </div>
                    </div>

                    {/* Reference */}
                    <div className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-3">Referencia de Transferencia</h3>
                        <input
                            type="text"
                            value={reference}
                            onChange={e => setReference(e.target.value)}
                            placeholder="Ej: Transferencia BancoEstado 22/02/2026"
                            className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                        />
                        <p className="text-xs text-gray-400 mt-2">Ingresa el número de comprobante o descripción de la transferencia</p>
                    </div>

                    {error && (
                        <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm font-medium flex items-center gap-2">
                            <span className="material-icons-round text-sm">error</span>
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        onClick={handleDeposit}
                        disabled={loading || !amount || !reference}
                        className="w-full bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 disabled:opacity-60 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Registrando...
                            </>
                        ) : (
                            <>
                                <span className="material-icons-round">send</span>
                                Confirmar Depósito de ${parseInt(amount || '0').toLocaleString('es-CL')}
                            </>
                        )}
                    </button>
                </>
            )}

            {/* Deposit History */}
            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="material-icons-round text-primary text-xl">history</span>
                        Historial de Depósitos
                    </h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {deposits.length === 0 && (
                        <div className="p-8 text-center text-gray-400">
                            <span className="material-icons-round text-4xl mb-2 block">account_balance</span>
                            <p className="text-sm">No hay depósitos registrados</p>
                        </div>
                    )}
                    {deposits.map((deposit) => {
                        if (!deposit) return null;
                        return (
                            <div key={deposit._id} className="px-5 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${deposit.status === 'confirmed'
                                        ? 'bg-green-100 dark:bg-green-900/30'
                                        : 'bg-amber-100 dark:bg-amber-900/30'
                                        }`}>
                                        <span className={`material-icons-round ${deposit.status === 'confirmed' ? 'text-green-600' : 'text-amber-600'}`}>
                                            {deposit.status === 'confirmed' ? 'check_circle' : 'pending'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">${deposit.amount.toLocaleString('es-CL')}</p>
                                        <p className="text-xs text-gray-400">Ref: {deposit.reference}</p>
                                        <p className="text-[10px] text-gray-400">
                                            {new Date(deposit._creationTime).toLocaleString('es-CL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${deposit.status === 'confirmed'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                    }`}>
                                    {deposit.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
