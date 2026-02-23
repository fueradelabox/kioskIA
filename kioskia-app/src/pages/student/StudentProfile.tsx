import { useState, useEffect } from 'react'
import { useDarkMode } from '../../context/DarkModeContext'
import { useAuth } from '../../context/AuthContext'
import { useStudentProfile, useUpdateProfile } from '../../hooks/useStudentData'

export default function StudentProfile() {
    const { darkMode, toggleDarkMode } = useDarkMode()
    const { signOut } = useAuth()
    const student = useStudentProfile()
    const loading = student === undefined
    const updateProfile = useUpdateProfile()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (student) {
            setName(student.fullName)
            setEmail(student.email || '')
        }
    }, [student])

    const handleSave = async () => {
        if (!student) return
        setSaving(true)
        try {
            await updateProfile({ fullName: name, email })
        } catch (err) {
            console.error(err)
        }
        setSaving(false)
        setEditing(false)
    }

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto p-5 md:p-10 flex items-center justify-center min-h-[50vh]">
                <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    const s = student

    return (
        <div className="max-w-2xl mx-auto p-5 md:p-10 space-y-6">
            <div className="animate-slide-up">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
                    Mi Perfil 👤
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Administra tu cuenta y preferencias
                </p>
            </div>

            {/* Profile Card */}
            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
                {/* Banner */}
                <div className="h-24 bg-gradient-to-r from-primary via-emerald-500 to-teal-400 relative">
                    <div className="absolute -bottom-10 left-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-white text-2xl font-bold border-4 border-white dark:border-surface-dark shadow-lg">
                            {s?.avatarInitials || s?.fullName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U'}
                        </div>
                    </div>
                </div>
                <div className="pt-14 pb-6 px-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{name}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Estudiante · {s?.grade || ''}</p>
                        </div>
                        <button
                            onClick={() => editing ? handleSave() : setEditing(true)}
                            disabled={saving}
                            className="px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-60"
                        >
                            {saving ? 'Guardando...' : editing ? 'Guardar' : 'Editar'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Info Fields */}
            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-5 animate-slide-up" style={{ animationDelay: '200ms' }}>
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="material-icons-round text-primary">info</span>
                    Información Personal
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Nombre Completo</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            disabled={!editing}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            disabled={!editing}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">RUT</label>
                        <input type="text" value={s?.rut || ''} disabled className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 disabled:cursor-not-allowed" />
                    </div>
                </div>
            </div>

            {/* Preferences */}
            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-4 animate-slide-up" style={{ animationDelay: '300ms' }}>
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="material-icons-round text-primary">settings</span>
                    Preferencias
                </h3>

                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="flex items-center gap-3">
                        <span className="material-icons-round text-gray-500 dark:text-gray-400">
                            {darkMode ? 'dark_mode' : 'light_mode'}
                        </span>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">Modo Oscuro</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Cambia la apariencia de la app</p>
                        </div>
                    </div>
                    <button
                        onClick={toggleDarkMode}
                        className={`relative w-12 h-7 rounded-full transition-colors ${darkMode ? 'bg-primary' : 'bg-gray-300'}`}
                    >
                        <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${darkMode ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
                    </button>
                </div>

                {/* Notifications */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="flex items-center gap-3">
                        <span className="material-icons-round text-gray-500 dark:text-gray-400">notifications</span>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">Notificaciones</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Recibe alertas de compras y metas</p>
                        </div>
                    </div>
                    <div className="relative w-12 h-7 rounded-full bg-primary">
                        <div className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-sm translate-x-5.5" />
                    </div>
                </div>
            </div>

            {/* Logout */}
            <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
                <button
                    onClick={signOut}
                    className="w-full py-3 text-danger font-medium bg-danger/5 hover:bg-danger/10 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    <span className="material-icons-round text-sm">logout</span>
                    Cerrar Sesión
                </button>
            </div>
        </div>
    )
}
