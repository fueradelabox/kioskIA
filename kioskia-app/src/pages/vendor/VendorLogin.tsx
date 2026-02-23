import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthActions } from '@convex-dev/auth/react'

export default function VendorLogin() {
    const navigate = useNavigate()
    const { signIn } = useAuthActions()
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await signIn('resend', { email })
            setSent(true)
        } catch (err: any) {
            setError(err?.message || 'Error al enviar el enlace mágico')
        } finally {
            setLoading(false)
        }
    }

    if (sent) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-amber-900/10 flex flex-col items-center justify-center px-4 py-10">
                <div className="w-full max-w-md text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl shadow-amber-500/20 animate-scale-check">
                        <span className="material-icons-round text-white text-4xl">mark_email_read</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">¡Revisa tu correo! 📧</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-2">
                        Enviamos un enlace mágico a <strong className="text-amber-600">{email}</strong>
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                        Haz clic en el enlace del correo para iniciar tu turno
                    </p>
                    <button
                        onClick={() => setSent(false)}
                        className="mt-8 text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
                    >
                        Usar otro correo
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-amber-900/10 flex flex-col items-center justify-center px-4 py-10">
            <div className="w-full max-w-md">
                <div className="text-center mb-8 animate-slide-up">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl shadow-amber-500/20">
                        <span className="material-icons-round text-white text-3xl">storefront</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
                        Kiosk<span className="text-primary">IA</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Punto de Venta</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Inicio de Turno</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Te enviaremos un enlace mágico a tu correo
                    </p>

                    {error && (
                        <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm font-medium flex items-center gap-2">
                            <span className="material-icons-round text-sm">error</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Correo del Vendedor</label>
                            <div className="relative">
                                <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">email</span>
                                <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vendedor@ejemplo.cl"
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 dark:text-white placeholder-gray-400 transition-all outline-none" />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !email}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Enviando enlace...
                                </>
                            ) : (
                                <>
                                    <span className="material-icons-round text-sm">magic_button</span>
                                    Enviar enlace mágico
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-6 text-center">
                    <button onClick={() => navigate('/')} className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-1 mx-auto transition-colors">
                        <span className="material-icons-round text-sm">arrow_back</span>Volver al inicio
                    </button>
                </div>
            </div>
        </div>
    )
}
