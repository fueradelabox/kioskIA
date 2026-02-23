import { useNavigate } from 'react-router-dom'
import { useDarkMode } from '../context/DarkModeContext'

export default function LandingPage() {
    const navigate = useNavigate()
    const { darkMode, toggleDarkMode } = useDarkMode()

    const portals = [
        {
            title: 'Estudiante',
            subtitle: 'Consulta tu saldo, ahorra y revisa tus compras',
            icon: 'school',
            color: 'from-primary to-emerald-600',
            path: '/estudiante/login',
            emoji: '🎒'
        },
        {
            title: 'Padre / Apoderado',
            subtitle: 'Recarga saldo, configura límites y monitorea gastos',
            icon: 'family_restroom',
            color: 'from-blue-600 to-indigo-700',
            path: '/padre/login',
            emoji: '👨‍👩‍👧'
        },
        {
            title: 'Vendedor',
            subtitle: 'Procesa pagos y gestiona ventas del almacén',
            icon: 'storefront',
            color: 'from-amber-500 to-orange-600',
            path: '/vendedor/login',
            emoji: '🏪'
        }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5 dark:from-gray-950 dark:via-gray-900 dark:to-primary/10 flex flex-col">
            {/* Header */}
            <header className="w-full px-6 py-4 flex justify-between items-center max-w-6xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/30">
                        K
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Kiosk<span className="text-primary">IA</span>
                    </span>
                </div>
                <button
                    onClick={toggleDarkMode}
                    className="p-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                >
                    <span className="material-icons-round text-xl">
                        {darkMode ? 'light_mode' : 'dark_mode'}
                    </span>
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                {/* Hero */}
                <div className="text-center mb-12 max-w-2xl animate-slide-up">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                        <span className="material-icons-round text-sm">verified</span>
                        Plataforma de pagos escolares #1 en Chile
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
                        Pagos escolares<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">
                            sin efectivo
                        </span>
                    </h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
                        Autenticación biométrica, educación financiera y hábitos saludables para estudiantes de 6 a 18 años
                    </p>
                </div>

                {/* Portal Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                    {portals.map((portal, i) => (
                        <button
                            key={portal.title}
                            onClick={() => navigate(portal.path)}
                            className="group relative bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-xl hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 text-left animate-slide-up"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative">
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${portal.color} flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                                    <span className="material-icons-round text-2xl">{portal.icon}</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                    {portal.title}
                                    <span className="text-lg">{portal.emoji}</span>
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {portal.subtitle}
                                </p>
                                <div className="mt-5 flex items-center gap-1 text-primary font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                    Ingresar
                                    <span className="material-icons-round text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">
                <p>© 2026 KioskIA · Educación financiera y alimentación consciente</p>
            </footer>
        </div>
    )
}
