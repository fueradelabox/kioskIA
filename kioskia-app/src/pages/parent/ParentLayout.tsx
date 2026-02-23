import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useDarkMode } from '../../context/DarkModeContext'
import { useAuth } from '../../context/AuthContext'
import { useChildren } from '../../hooks/useParentData'

export interface ChildContext {
    activeChildId: string | null
    setActiveChildId: (id: string) => void
}

export default function ParentLayout() {
    const { darkMode } = useDarkMode()
    const { signOut } = useAuth()
    const navigate = useNavigate()
    const kids = useChildren()
    const loading = kids.length === 0
    const [activeChildId, setActiveChildId] = useState<string | null>(null)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // Set first child as active by default
    useEffect(() => {
        if (kids.length > 0 && !activeChildId && kids[0]) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActiveChildId(kids[0]?._id)
        }
    }, [kids, activeChildId])

    const handleSignOut = async () => {
        await signOut()
        navigate('/')
    }

    return (
        <div className={`min-h-screen flex ${darkMode ? 'dark' : ''}`}>
            {/* Sidebar (Desktop) */}
            <aside className="hidden lg:flex flex-col w-72 bg-white dark:bg-surface-dark border-r border-gray-100 dark:border-gray-800 p-6">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white">
                        <span className="material-icons-round text-xl">family_restroom</span>
                    </div>
                    <div>
                        <h1 className="font-extrabold text-lg text-gray-900 dark:text-white">Kiosk<span className="text-primary">IA</span></h1>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Panel Padres</p>
                    </div>
                </div>

                {/* Children Selector */}
                <div className="mb-6">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-3">Mis Hijos</p>
                    <div className="space-y-2">
                        {loading && <p className="text-xs text-gray-400">Cargando...</p>}
                        {kids.map((child) => {
                            if (!child) return null;
                            return (
                                <button
                                    key={child._id}
                                    onClick={() => setActiveChildId(child._id)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${activeChildId === child._id
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'
                                        }`}
                                >
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${activeChildId === child._id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                        }`}>
                                        {child.initials}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-semibold text-sm truncate ${activeChildId === child._id ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {child.fullName}
                                        </p>
                                        <p className="text-xs text-gray-400 truncate">{child.grade}</p>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Nav */}
                <nav className="space-y-1 flex-1">
                    <NavLink to="/padre" end className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                        <span className="material-icons-round text-xl">dashboard</span>
                        Dashboard
                    </NavLink>
                    <NavLink to="/padre/depositos" className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                        <span className="material-icons-round text-xl">account_balance</span>
                        Depósitos
                    </NavLink>
                    <NavLink to="/padre/limites" className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                        <span className="material-icons-round text-xl">tune</span>
                        Límites
                    </NavLink>
                </nav>

                <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-danger hover:bg-danger/5 rounded-xl transition-colors mt-auto">
                    <span className="material-icons-round text-xl">logout</span>
                    Cerrar Sesión
                </button>
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white">
                            <span className="material-icons-round text-sm">family_restroom</span>
                        </div>
                        <span className="font-extrabold text-gray-900 dark:text-white">Kiosk<span className="text-primary">IA</span></span>
                    </div>
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-500">
                        <span className="material-icons-round">{mobileMenuOpen ? 'close' : 'menu'}</span>
                    </button>
                </div>
                {mobileMenuOpen && (
                    <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-3 bg-white dark:bg-surface-dark">
                        {/* Mobile Children Selector */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {kids.map((child) => {
                                if (!child) return null;
                                return (
                                    <button key={child._id} onClick={() => { setActiveChildId(child._id); setMobileMenuOpen(false) }}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-all ${activeChildId === child._id ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                                        <span className="text-xs font-bold">{child.initials}</span>
                                        {child.fullName.split(' ')[0]}
                                    </button>
                                )
                            })}
                        </div>
                        <NavLink to="/padre" end onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                            <span className="material-icons-round">dashboard</span> Dashboard
                        </NavLink>
                        <NavLink to="/padre/depositos" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                            <span className="material-icons-round">account_balance</span> Depósitos
                        </NavLink>
                        <NavLink to="/padre/limites" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                            <span className="material-icons-round">tune</span> Límites
                        </NavLink>
                        <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-danger w-full">
                            <span className="material-icons-round">logout</span> Cerrar Sesión
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <main className="flex-1 bg-gray-50 dark:bg-gray-950 pt-16 lg:pt-0 min-h-screen overflow-y-auto">
                <Outlet context={{ activeChildId, setActiveChildId } satisfies ChildContext} />
            </main>
        </div>
    )
}
