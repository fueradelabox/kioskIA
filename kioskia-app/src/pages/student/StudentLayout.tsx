import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { useDarkMode } from '../../context/DarkModeContext'
import { useStudentProfile } from '../../hooks/useStudentData'
import { useAuth } from '../../context/AuthContext'

const primaryNavItems = [
    { path: '/estudiante', icon: 'home', label: 'Inicio', end: true },
    { path: '/estudiante/ahorro/crear', icon: 'savings', label: 'Mi Ahorro', end: false },
    { path: '/estudiante/historial', icon: 'history', label: 'Historial', end: false },
    { path: '/estudiante/perfil', icon: 'person', label: 'Perfil', end: false },
]

const explorerNavItems = [
    { path: '/estudiante/educacion', icon: 'school', label: 'Educación', end: false },
    { path: '/estudiante/test', icon: 'quiz', label: 'Test', end: false },
    { path: '/estudiante/logros', icon: 'emoji_events', label: 'Logros', end: false },
    { path: '/estudiante/planificador', icon: 'restaurant', label: 'Planificador', end: false },
    { path: '/estudiante/resumen', icon: 'auto_awesome', label: 'Resumen', end: false },
]

export default function StudentLayout() {
    const { darkMode, toggleDarkMode } = useDarkMode()
    const { signOut } = useAuth()
    const student = useStudentProfile()
    const [moreMenuOpen, setMoreMenuOpen] = useState(false)

    // Dynamic student data with fallbacks
    const initials = student?.avatarInitials || student?.fullName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?'
    const displayName = student?.fullName
        ? student.fullName.split(' ')[0] + ' ' + (student.fullName.split(' ')[1]?.[0] || '') + '.'
        : 'Cargando...'
    const grade = student?.grade || ''

    return (
        <div className="h-screen flex overflow-hidden bg-bg-light dark:bg-bg-dark">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 h-full bg-white dark:bg-surface-dark border-r border-gray-200 dark:border-gray-700 shadow-sm z-20">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-xl shadow-md">
                        K
                    </div>
                    <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Kiosk<span className="text-primary">IA</span>
                    </span>
                </div>

                <nav className="flex-1 px-4 space-y-1.5 mt-4 overflow-y-auto">
                    {primaryNavItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`
                            }
                        >
                            <span className="material-icons-round">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                        </NavLink>
                    ))}

                    {/* Explorar Section */}
                    <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-700">
                        <p className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                            Explorar
                        </p>
                        {explorerNavItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.end}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${isActive
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`
                                }
                            >
                                <span className="material-icons-round text-[20px]">{item.icon}</span>
                                <span className="font-medium text-sm">{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                </nav>

                {/* Dark mode toggle */}
                <div className="px-4 mb-2">
                    <button
                        onClick={toggleDarkMode}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                        <span className="material-icons-round">{darkMode ? 'light_mode' : 'dark_mode'}</span>
                        <span className="font-medium">{darkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
                    </button>
                </div>

                {/* User info — dynamic */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 px-4 py-2">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                {initials}
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-healthy border-2 border-white dark:border-surface-dark rounded-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{displayName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{grade}</p>
                        </div>
                        <button
                            onClick={signOut}
                            title="Cerrar Sesión"
                            className="p-1.5 text-gray-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                        >
                            <span className="material-icons-round text-lg">logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-full overflow-y-auto relative">
                {/* Mobile Header */}
                <header className="md:hidden sticky top-0 z-30 bg-white/80 dark:bg-bg-dark/80 backdrop-blur-md px-5 py-3 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-lg shadow-sm">
                            K
                        </div>
                        <span className="font-bold text-lg text-gray-900 dark:text-white">
                            Kiosk<span className="text-primary">IA</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <span className="material-icons-round text-xl">{darkMode ? 'light_mode' : 'dark_mode'}</span>
                        </button>
                        <button
                            onClick={() => navigate('/estudiante/perfil')}
                            className="relative w-8 h-8 rounded-full bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-white font-bold text-xs shadow-sm"
                        >
                            {initials}
                        </button>
                    </div>
                </header>

                <div className="pb-24 md:pb-8">
                    <Outlet />
                </div>
            </main>

            {/* Mobile "More" Menu Overlay */}
            {moreMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/40 z-40 transition-opacity"
                    onClick={() => setMoreMenuOpen(false)}
                />
            )}
            {moreMenuOpen && (
                <div className="md:hidden fixed bottom-16 left-0 right-0 z-50 bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-gray-700 rounded-t-2xl shadow-xl animate-slide-up pb-safe">
                    <div className="flex justify-center pt-2 pb-1">
                        <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                    </div>
                    <p className="px-5 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        Explorar
                    </p>
                    <div className="grid grid-cols-3 gap-1 px-4 pb-4">
                        {explorerNavItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.end}
                                onClick={() => setMoreMenuOpen(false)}
                                className={({ isActive }) =>
                                    `flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`
                                }
                            >
                                <span className="material-icons-round text-2xl">{item.icon}</span>
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                </div>
            )}

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-gray-700 pb-safe z-40">
                <div className="flex justify-around items-center h-16">
                    {primaryNavItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            onClick={() => setMoreMenuOpen(false)}
                            className={({ isActive }) =>
                                `flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors ${isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                }`
                            }
                        >
                            <span className="material-icons-round text-xl">{item.icon}</span>
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </NavLink>
                    ))}
                    {/* More button */}
                    <button
                        onClick={() => setMoreMenuOpen(prev => !prev)}
                        className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors ${moreMenuOpen ? 'text-primary' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                    >
                        <span className="material-icons-round text-xl">{moreMenuOpen ? 'close' : 'apps'}</span>
                        <span className="text-[10px] font-medium">Más</span>
                    </button>
                </div>
            </nav>
        </div>
    )
}
