import { useNavigate } from 'react-router-dom'

export default function VendorSuccess() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-primary/5 flex items-center justify-center p-4">
            <div className="w-full max-w-md text-center animate-slide-up">
                {/* Success Animation */}
                <div className="relative w-32 h-32 mx-auto mb-8">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                    <div className="absolute inset-0 bg-primary/30 rounded-full scale-90 animate-pulse" />
                    <div className="relative w-32 h-32 bg-gradient-to-br from-primary to-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-primary/30">
                        <span className="material-icons-round text-white text-6xl">check</span>
                    </div>
                </div>

                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                    ¡Pago Exitoso!
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                    La transacción se ha completado correctamente
                </p>

                {/* Receipt Card */}
                <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 text-left mb-6">
                    <div className="flex justify-between items-center pb-4 border-b border-dashed border-gray-200 dark:border-gray-700 mb-4">
                        <span className="text-sm text-gray-500">Total cobrado</span>
                        <span className="text-3xl font-extrabold text-primary">$4.600</span>
                    </div>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Estudiante</span>
                            <span className="font-medium text-gray-900 dark:text-white">Sofía Pérez M.</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Autenticación</span>
                            <span className="font-medium text-primary flex items-center gap-1">
                                <span className="material-icons-round text-xs">fingerprint</span>
                                Huella Digital
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Hora</span>
                            <span className="font-medium text-gray-900 dark:text-white">10:32 AM</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Nº Transacción</span>
                            <span className="font-mono text-gray-600 dark:text-gray-300">#KSK-20260210-0042</span>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 justify-center text-sm text-healthy">
                            <span className="material-icons-round text-sm">verified</span>
                            <span className="font-medium">75% consumo saludable</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <button
                        onClick={() => navigate('/vendedor')}
                        className="w-full bg-gradient-to-r from-primary to-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-icons-round text-sm">point_of_sale</span>
                        Nueva Venta
                    </button>
                    <button className="w-full py-3 text-gray-500 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors flex items-center justify-center gap-2">
                        <span className="material-icons-round text-sm">receipt_long</span>
                        Imprimir Boleta
                    </button>
                </div>
            </div>
        </div>
    )
}
