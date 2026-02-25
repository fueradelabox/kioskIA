import { useDashboardStats } from '../../hooks/useAdminData'

export default function AdminDashboard() {
    const stats = useDashboardStats()

    if (stats === undefined) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium">Cargando sistema...</p>
            </div>
        )
    }

    if (stats === null) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <span className="material-icons-round text-6xl text-red-500 mb-4">error_outline</span>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
                <p className="text-gray-500">No tienes permisos para acceder a esta sección.</p>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8 relative z-10 pt-24 md:pt-10">
            <div className="animate-slide-up">
                <h1 className="text-4xl font-extrabold text-white mb-2">
                    Panel de Control
                </h1>
                <p className="text-gray-300 text-lg">
                    Vista general de la plataforma.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <span className="material-icons-round text-blue-600 text-2xl">school</span>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Estudiantes Activos</p>
                        <p className="text-3xl font-black text-gray-900">{stats.totalStudents}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                        <span className="material-icons-round text-orange-600 text-2xl">family_restroom</span>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Apoderados Registrados</p>
                        <p className="text-3xl font-black text-gray-900">{stats.totalParents}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                        <span className="material-icons-round text-purple-600 text-2xl">storefront</span>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Vendedores</p>
                        <p className="text-3xl font-black text-gray-900">{stats.totalVendors}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center animate-slide-up" style={{ animationDelay: '200ms' }}>
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-icons-round text-4xl text-gray-400">tune</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Atajos de Administración</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                    Ve a la pestaña de "Gestión de Usuarios" en el menú para registrar nuevas cuentas y enlazar estudiantes a sus apoderados.
                </p>
            </div>
        </div>
    )
}
