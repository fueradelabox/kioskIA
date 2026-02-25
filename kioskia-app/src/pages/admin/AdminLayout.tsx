import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuthActions } from '@convex-dev/auth/react'

export default function AdminLayout() {
    const location = useLocation()
    const { signOut } = useAuthActions()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const navLinks = [
        { path: '/admin', label: 'Dashboard', icon: 'dashboard' },
        { path: '/admin/usuarios', label: 'Gestión de Usuarios', icon: 'people' },
    ]

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden bg-gray-900 text-white p-4 flex items-center justify-between sticky top-0 z-50">
                <Link to="/admin" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                        <span className="material-icons-round text-white text-lg">admin_panel_settings</span>
                    </div>
                    <span className="font-bold text-xl tracking-tight">KioskIA Admin</span>
                </Link>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                >
                    <span className="material-icons-round">{isMobileMenuOpen ? 'close' : 'menu'}</span>
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-gray-300 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:w-72 flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 hidden md:flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
                        <span className="material-icons-round text-white">admin_panel_settings</span>
                    </div>
                    <div>
                        <h2 className="font-bold text-xl text-white tracking-tight">KioskIA Admin</h2>
                        <p className="text-xs text-emerald-400 font-medium">Panel de Control</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.path
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-emerald-500/10 text-emerald-400 font-semibold border-l-2 border-emerald-500'
                                    : 'hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                <span className={`material-icons-round ${isActive ? 'text-emerald-400' : 'text-gray-400'}`}>
                                    {link.icon}
                                </span>
                                {link.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={() => void signOut()}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors font-medium"
                    >
                        <span className="material-icons-round">logout</span>
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-screen overflow-y-auto w-full relative">
                <div className="opacity-5 absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 10px 10px, black 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                <div className="relative">
                    {/* Dark gradient fade at top like the vendor layout to contrast light pages */}
                    <div className="h-48 bg-gradient-to-b from-gray-900 via-gray-900/40 to-transparent absolute top-0 inset-x-0 pointer-events-none" />
                    <Outlet />
                </div>
            </main>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden animate-fade-in"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    )
}
