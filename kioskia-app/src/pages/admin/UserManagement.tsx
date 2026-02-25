import { useState } from 'react'
import {
    useUsers,
    useSchools,
    useStudentsList,
    useParentsList,
    useCreateStudent,
    useCreateParent,
    useCreateVendor,
    useLinkParentStudent
} from '../../hooks/useAdminData'
import type { Id } from '../../../convex/_generated/dataModel'

type RoleFilter = "student" | "parent" | "vendor"

export default function UserManagement() {
    const [activeTab, setActiveTab] = useState<'list' | 'create' | 'link'>('list')
    const [roleFilter, setRoleFilter] = useState<RoleFilter>('student')

    const users = useUsers(roleFilter)
    const schools = useSchools()
    const studentsAll = useStudentsList()
    const parentsAll = useParentsList()

    const createStudent = useCreateStudent()
    const createParent = useCreateParent()
    const createVendor = useCreateVendor()
    const linkParentStudent = useLinkParentStudent()

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    // Form states
    const [createRole, setCreateRole] = useState<RoleFilter>('student')
    const [formData, setFormData] = useState({
        fullName: '',
        rut: '',
        email: '',
        grade: '',
        schoolId: '',
        generalBalance: 0,
        healthyBalance: 0,
        pin: '',
        businessName: ''
    })

    // Link state
    const [linkParentId, setLinkParentId] = useState('')
    const [linkStudentId, setLinkStudentId] = useState('')

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setSuccessMessage('')
        setErrorMessage('')

        try {
            if (createRole === 'student') {
                if (!formData.schoolId) throw new Error("Debe seleccionar un colegio")
                await createStudent({
                    fullName: formData.fullName,
                    rut: formData.rut,
                    email: formData.email,
                    grade: formData.grade,
                    schoolId: formData.schoolId as Id<"schools">,
                    generalBalance: Number(formData.generalBalance),
                    healthyBalance: Number(formData.healthyBalance),
                    pin: formData.pin
                })
            } else if (createRole === 'parent') {
                await createParent({
                    fullName: formData.fullName,
                    email: formData.email
                })
            } else if (createRole === 'vendor') {
                if (!formData.schoolId) throw new Error("Debe seleccionar un colegio")
                await createVendor({
                    businessName: formData.businessName,
                    fullName: formData.fullName,
                    email: formData.email,
                    schoolId: formData.schoolId as Id<"schools">
                })
            }

            setSuccessMessage(`¡${createRole} creado exitosamente!`)
            setFormData({ fullName: '', rut: '', email: '', grade: '', schoolId: schools?.[0]?._id || '', generalBalance: 0, healthyBalance: 0, pin: '', businessName: '' })
        } catch (error: unknown) {
            setErrorMessage((error as Error).message || "Error al crear usuario")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleLink = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setSuccessMessage('')
        setErrorMessage('')

        try {
            if (!linkParentId || !linkStudentId) throw new Error("Debe seleccionar un apoderado y un estudiante")

            await linkParentStudent({
                parentId: linkParentId as Id<"parents">,
                studentId: linkStudentId as Id<"students">
            })

            setSuccessMessage('¡Enlace creado exitosamente!')
            setLinkParentId('')
            setLinkStudentId('')
        } catch (error: unknown) {
            setErrorMessage((error as Error).message || "Error al enlazar usuarios")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-6">
            <div className="animate-slide-up">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
                    Gestión de Usuarios
                </h1>
                <p className="text-gray-500">
                    Crea, enlista y asocia cuentas de la plataforma.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1 animate-slide-up max-w-fit">
                <button
                    onClick={() => setActiveTab('list')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Listado
                </button>
                <button
                    onClick={() => setActiveTab('create')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'create' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Crear Nuevo
                </button>
                <button
                    onClick={() => setActiveTab('link')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'link' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Enlazar Familia
                </button>
            </div>

            {/* Alerts */}
            {successMessage && (
                <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl border border-emerald-100 flex items-center gap-3 animate-fade-in">
                    <span className="material-icons-round">check_circle</span>
                    <p className="font-medium">{successMessage}</p>
                </div>
            )}

            {errorMessage && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3 animate-fade-in">
                    <span className="material-icons-round">error</span>
                    <p className="font-medium">{errorMessage}</p>
                </div>
            )}

            {/* List Tab */}
            {activeTab === 'list' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-slide-up">
                    <div className="flex gap-2 mb-6 border-b border-gray-100 pb-4">
                        <button onClick={() => setRoleFilter('student')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${roleFilter === 'student' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Estudiantes</button>
                        <button onClick={() => setRoleFilter('parent')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${roleFilter === 'parent' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Apoderados</button>
                        <button onClick={() => setRoleFilter('vendor')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${roleFilter === 'vendor' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Vendedores</button>
                    </div>

                    {users === undefined ? (
                        <div className="py-12 flex justify-center"><div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-gray-900 uppercase text-xs font-bold border-b border-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 rounded-tl-lg">Nombre</th>
                                        <th className="px-4 py-3">Email</th>
                                        {roleFilter === 'student' && <th className="px-4 py-3">RUT</th>}
                                        {roleFilter === 'student' && <th className="px-4 py-3 text-right">Saldo</th>}
                                        {roleFilter === 'vendor' && <th className="px-4 py-3">Negocio</th>}
                                        <th className="px-4 py-3 text-right rounded-tr-lg">Creado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u: Record<string, unknown> & { _id: string; fullName: string; email?: string; rut?: string; balance?: number; businessName?: string; _creationTime: number }) => (
                                        <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-gray-900">{u.fullName}</td>
                                            <td className="px-4 py-3">{u.email || '-'}</td>
                                            {roleFilter === 'student' && <td className="px-4 py-3">{u.rut}</td>}
                                            {roleFilter === 'student' && <td className="px-4 py-3 text-right font-medium text-emerald-600">${u.balance?.toLocaleString('es-CL') || 0}</td>}
                                            {roleFilter === 'vendor' && <td className="px-4 py-3">{u.businessName}</td>}
                                            <td className="px-4 py-3 text-right text-xs">{new Date(u._creationTime).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-gray-400">No se encontraron usuarios</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Create Tab */}
            {activeTab === 'create' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 animate-slide-up max-w-3xl">
                    <div className="flex gap-4 mb-8">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" checked={createRole === 'student'} onChange={() => setCreateRole('student')} className="text-emerald-500 focus:ring-emerald-500" />
                            <span className="font-medium text-gray-900">Estudiante</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" checked={createRole === 'parent'} onChange={() => setCreateRole('parent')} className="text-emerald-500 focus:ring-emerald-500" />
                            <span className="font-medium text-gray-900">Apoderado</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" checked={createRole === 'vendor'} onChange={() => setCreateRole('vendor')} className="text-emerald-500 focus:ring-emerald-500" />
                            <span className="font-medium text-gray-900">Vendedor</span>
                        </label>
                    </div>

                    <form onSubmit={handleCreate} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Nombre Completo</label>
                                <input required type="text" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" placeholder="Ej: Juan Pérez" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Email <span className="text-gray-400 font-normal">(Recomendado)</span></label>
                                <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" placeholder="correo@ejemplo.com" />
                            </div>

                            {createRole === 'student' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-1">RUT</label>
                                        <input required type="text" value={formData.rut} onChange={e => setFormData({ ...formData, rut: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" placeholder="12.345.678-9" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-1">Curso</label>
                                        <input required type="text" value={formData.grade} onChange={e => setFormData({ ...formData, grade: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" placeholder="Ej: 5° Básico" />
                                    </div>
                                </>
                            )}

                            {createRole === 'vendor' && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-1">Nombre del Negocio</label>
                                    <input required type="text" value={formData.businessName} onChange={e => setFormData({ ...formData, businessName: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" placeholder="Ej: Kiosko Don Pedro" />
                                </div>
                            )}

                            {(createRole === 'student' || createRole === 'vendor') && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-900 mb-1">Colegio</label>
                                    <select required value={formData.schoolId} onChange={e => setFormData({ ...formData, schoolId: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none">
                                        <option value="">Seleccione un colegio...</option>
                                        {schools?.map(s => (
                                            <option key={s._id} value={s._id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {createRole === 'student' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-1">Saldo Libre Inicial ($)</label>
                                        <input type="number" min="0" value={formData.generalBalance} onChange={e => setFormData({ ...formData, generalBalance: Number(e.target.value) })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-emerald-600 mb-1">Saldo Saludable Inicial ($)</label>
                                        <input type="number" min="0" value={formData.healthyBalance} onChange={e => setFormData({ ...formData, healthyBalance: Number(e.target.value) })} className="w-full bg-emerald-50/50 border border-emerald-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-1">PIN <span className="text-gray-400 font-normal">(Opcional)</span></label>
                                        <input type="password" maxLength={4} value={formData.pin} onChange={e => setFormData({ ...formData, pin: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" placeholder="****" />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                {isSubmitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Crear Usuario'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Link Tab */}
            {activeTab === 'link' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 animate-slide-up max-w-3xl">
                    <div className="mb-8">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                            <span className="material-icons-round">cable</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Enlazar Familia</h2>
                        <p className="text-gray-500 mt-1">Conecta a un apoderado con su estudiante para que pueda administrarlo y enviarle mesadas.</p>
                    </div>

                    <form onSubmit={handleLink} className="space-y-6">
                        <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl">
                            <label className="block text-sm font-bold text-gray-900 mb-2">1. Seleccionar Apoderado</label>
                            <select required value={linkParentId} onChange={e => setLinkParentId(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none">
                                <option value="">Buscar apoderado...</option>
                                {parentsAll?.map(p => (
                                    <option key={p._id} value={p._id}>{p.fullName} - {p.email}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-center -my-2 relative z-10">
                            <div className="bg-white border text-gray-400 border-gray-200 w-8 h-8 rounded-full flex items-center justify-center shadow-sm">
                                <span className="material-icons-round text-sm">link</span>
                            </div>
                        </div>

                        <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl">
                            <label className="block text-sm font-bold text-gray-900 mb-2">2. Seleccionar Estudiante</label>
                            <select required value={linkStudentId} onChange={e => setLinkStudentId(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none">
                                <option value="">Buscar estudiante...</option>
                                {studentsAll?.map(s => (
                                    <option key={s._id} value={s._id}>{s.fullName} - {s.rut}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {isSubmitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Crear Enlace'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    )
}
