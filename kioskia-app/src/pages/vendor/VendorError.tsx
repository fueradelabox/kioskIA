import { useNavigate } from 'react-router-dom'

export default function VendorError() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-red-900/10 flex items-center justify-center p-4">
            <div className="w-full max-w-md text-center animate-slide-up">
                {/* Error Animation */}
                <div className="relative w-32 h-32 mx-auto mb-8">
                    <div className="absolute inset-0 bg-danger/20 rounded-full animate-pulse" />
                    <div className="relative w-32 h-32 bg-gradient-to-br from-danger to-red-600 rounded-full flex items-center justify-center shadow-xl shadow-danger/30">
                        <span className="material-icons-round text-white text-6xl">close</span>
                    </div>
                </div>

                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                    Pago Rechazado
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    No se pudo procesar la transacción
                </p>

                {/* Error Details */}
                <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 mb-6 text-left">
                    <div className="flex items-start gap-4 p-4 bg-danger/5 rounded-xl border border-danger/10 mb-4">
                        <span className="material-icons-round text-danger text-xl mt-0.5">warning</span>
                        <div>
                            <h3 className="font-bold text-danger text-sm mb-1">Saldo insuficiente</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                El estudiante no tiene saldo suficiente para completar esta compra.
                            </p>
                        </div>
                    </div>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Total intento</span>
                            <span className="font-bold text-danger">$8.500</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Saldo disponible</span>
                            <span className="font-bold text-gray-900 dark:text-white">$2.300</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Faltante</span>
                            <span className="font-bold text-danger">$6.200</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Estudiante</span>
                            <span className="font-medium text-gray-900 dark:text-white">Lucas Pérez M.</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <button
                        onClick={() => navigate('/vendedor')}
                        className="w-full bg-gradient-to-r from-primary to-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-icons-round text-sm">arrow_back</span>
                        Volver al POS
                    </button>
                    <button className="w-full py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                        <span className="material-icons-round text-sm">edit</span>
                        Modificar Carrito
                    </button>
                </div>
            </div>
        </div>
    )
}
