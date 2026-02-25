import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useProducts, useProcessPayment, useFindStudentByRut, useFindStudentByBiometric } from '../../hooks/useVendorData'
import type { Id } from '../../../convex/_generated/dataModel'

interface CartItem {
    productId?: string
    name: string
    price: number
    qty: number
    icon: string
    isHealthy: boolean
    category: string
}

const FRUIT_MENU = [
    { name: 'Manzana', icon: '🍎', price: 500 },
    { name: 'Plátano', icon: '🍌', price: 400 },
    { name: 'Naranja', icon: '🍊', price: 500 },
    { name: 'Uvas', icon: '🍇', price: 600 },
    { name: 'Pera', icon: '🍐', price: 500 },
    { name: 'Frutilla', icon: '🍓', price: 700 },
    { name: 'Mandarina', icon: '🍊', price: 400 },
    { name: 'Kiwi', icon: '🥝', price: 500 },
    { name: 'Sandía', icon: '🍉', price: 800 },
    { name: 'Durazno', icon: '🍑', price: 500 },
]

export default function VendorPOS() {
    const navigate = useNavigate()
    const { signOut } = useAuth()
    const { products, loading } = useProducts()
    const processPayment = useProcessPayment()
    const [cart, setCart] = useState<CartItem[]>([])
    const [activeCategory, setActiveCategory] = useState('Todas')
    const [paying, setPaying] = useState(false)
    const [studentRut, setStudentRut] = useState('')
    const [showPayModal, setShowPayModal] = useState(false)
    const [payError, setPayError] = useState('')
    const [barcodeInput, setBarcodeInput] = useState('')
    const [showFruitMenu, setShowFruitMenu] = useState(false)
    const [barcodeFlash, setBarcodeFlash] = useState(false)
    const barcodeRef = useRef<HTMLInputElement>(null)

    const [biometricInput, setBiometricInput] = useState('')
    const [mockBiometricMode, setMockBiometricMode] = useState(false)

    // Either lookup by RUT or by Biometric ID
    const studentDataByRut = useFindStudentByRut(studentRut.length >= 10 ? studentRut : null)
    const studentDataByBio = useFindStudentByBiometric(biometricInput.length >= 5 ? biometricInput : null)
    const studentData = mockBiometricMode ? studentDataByBio : studentDataByRut

    const categories = useMemo(() => {
        const cats = ['Todas', ...new Set(products.map(p => p.category))]
        return cats
    }, [products])

    const filteredProducts = activeCategory === 'Todas'
        ? products
        : products.filter(p => p.category === activeCategory)

    // Auto-focus barcode input
    useEffect(() => {
        if (!showPayModal && !showFruitMenu && barcodeRef.current) {
            barcodeRef.current.focus()
        }
    }, [showPayModal, showFruitMenu])

    const addToCartByProduct = useCallback((product: { _id?: string; name: string; price: number; icon: string; isHealthy: boolean; category: string }) => {
        setCart(prev => {
            const key = product._id || product.name
            const existing = prev.find(i => (i.productId || i.name) === key)
            if (existing) {
                return prev.map(i =>
                    (i.productId || i.name) === key ? { ...i, qty: i.qty + 1 } : i
                )
            }
            return [...prev, {
                productId: product._id,
                name: product.name,
                price: product.price,
                qty: 1,
                icon: product.icon,
                isHealthy: product.isHealthy,
                category: product.category,
            }]
        })
    }, [])

    const addFruitToCart = (fruit: typeof FRUIT_MENU[0]) => {
        setCart(prev => {
            const existing = prev.find(i => i.name === fruit.name && !i.productId)
            if (existing) {
                return prev.map(i =>
                    i.name === fruit.name && !i.productId ? { ...i, qty: i.qty + 1 } : i
                )
            }
            // Check if there's a product in the catalog
            const catalogProduct = products.find(p => p.name === fruit.name)
            if (catalogProduct) {
                return [...prev, {
                    productId: catalogProduct._id,
                    name: catalogProduct.name,
                    price: catalogProduct.price,
                    qty: 1,
                    icon: catalogProduct.icon,
                    isHealthy: true,
                    category: 'Frutas',
                }]
            }
            return [...prev, {
                name: fruit.name,
                price: fruit.price,
                qty: 1,
                icon: fruit.icon,
                isHealthy: true,
                category: 'Frutas',
            }]
        })
        setShowFruitMenu(false)
    }

    const removeFromCart = (key: string) => {
        setCart(prev => {
            const existing = prev.find(i => (i.productId || i.name) === key)
            if (existing && existing.qty > 1) {
                return prev.map(i =>
                    (i.productId || i.name) === key ? { ...i, qty: i.qty - 1 } : i
                )
            }
            return prev.filter(i => (i.productId || i.name) !== key)
        })
    }

    const handleBarcodeSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!barcodeInput.trim()) return

        const product = products.find(p => (p as { barcode?: string }).barcode === barcodeInput.trim())
        if (product) {
            addToCartByProduct(product)
            setBarcodeFlash(true)
            setTimeout(() => setBarcodeFlash(false), 500)
        } else {
            // No product found — show fruit menu as fallback
            setShowFruitMenu(true)
        }
        setBarcodeInput('')
    }

    const total = cart.reduce((s, i) => s + i.price * i.qty, 0)
    const totalItems = cart.reduce((s, i) => s + i.qty, 0)
    const healthyTotal = cart.filter(i => i.isHealthy).reduce((s, i) => s + i.price * i.qty, 0)
    const unhealthyTotal = cart.filter(i => !i.isHealthy).reduce((s, i) => s + i.price * i.qty, 0)

    const handlePay = async () => {
        if (!studentRut) return
        setPaying(true)
        setPayError('')

        try {
            const items = cart.map(i => ({
                productId: i.productId as Id<"products">,
                name: i.name,
                price: i.price,
                qty: i.qty,
                isHealthy: i.isHealthy,
            }))
            await processPayment({ studentRut, items })
            setCart([])
            setShowPayModal(false)
            setStudentRut('')
            setBiometricInput('')
            navigate('/vendedor/exito')
        } catch (err: unknown) {
            setPayError((err as Error)?.message || 'Error en el pago')
        }
        setPaying(false)
    }

    const handleLogout = async () => {
        await signOut()
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-medium">Cargando catálogo...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Top Bar */}
            <header className="bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800 px-4 lg:px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                        <span className="material-icons-round text-white">storefront</span>
                    </div>
                    <div>
                        <h1 className="font-extrabold text-lg text-gray-900 dark:text-white">Kiosk<span className="text-primary">IA</span></h1>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Punto de Venta</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs font-bold text-green-700 dark:text-green-300">En línea</span>
                    </div>
                    <button onClick={() => navigate('/vendedor/dashboard')} className="p-2 text-gray-400 hover:text-amber-500 transition-colors" title="Dashboard">
                        <span className="material-icons-round">analytics</span>
                    </button>
                    <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-danger transition-colors">
                        <span className="material-icons-round">logout</span>
                    </button>
                </div>
            </header>

            {/* Barcode Scanner Bar */}
            <div className={`bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800 px-4 lg:px-6 py-3 transition-colors duration-300 ${barcodeFlash ? 'bg-green-50 dark:bg-green-900/20' : ''}`}>
                <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-3">
                    <div className="flex-1 relative">
                        <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-amber-500">qr_code_scanner</span>
                        <input
                            ref={barcodeRef}
                            type="text"
                            value={barcodeInput}
                            onChange={e => setBarcodeInput(e.target.value)}
                            placeholder="Escanear código de barras..."
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 text-lg font-mono"
                            autoFocus
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowFruitMenu(true)}
                        className="px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold flex items-center gap-2 transition-colors shadow-md shadow-green-500/20"
                    >
                        <span className="text-xl">🍎</span>
                        <span className="hidden sm:inline">Frutas</span>
                    </button>
                </form>
            </div>

            <div className="flex flex-col lg:flex-row gap-0 h-[calc(100vh-130px)]">
                {/* Product Catalog */}
                <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
                    {/* Category Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeCategory === cat
                                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                                    : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-amber-300 hover:text-amber-600'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                        {filteredProducts.map(product => {
                            const key = product._id
                            const inCart = cart.find(i => i.productId === product._id)
                            return (
                                <button
                                    key={key}
                                    onClick={() => addToCartByProduct(product)}
                                    className={`relative p-4 rounded-2xl text-center transition-all border-2 hover:scale-[1.02] active:scale-[0.98] ${inCart
                                        ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-400 shadow-md shadow-amber-200/50'
                                        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md'
                                        }`}
                                >
                                    {inCart && (
                                        <span className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 text-white rounded-full text-xs font-bold flex items-center justify-center shadow-md">
                                            {inCart.qty}
                                        </span>
                                    )}
                                    <span className="text-3xl mb-2 block">{product.icon}</span>
                                    <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-1 leading-tight">{product.name}</h4>
                                    <p className="text-xs text-gray-400 mb-1">{product.category}</p>
                                    <p className="font-extrabold text-primary">${product.price.toLocaleString('es-CL')}</p>
                                    {product.isHealthy && product.category !== 'Librería' && (
                                        <span className="inline-block mt-1 text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-bold">
                                            Saludable
                                        </span>
                                    )}
                                    {product.category === 'Librería' && (
                                        <span className="inline-block mt-1 text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">
                                            Librería
                                        </span>
                                    )}
                                    {!product.isHealthy && product.category !== 'Librería' && (
                                        <span className="inline-block mt-1 text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                                            No Saludable
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Cart Sidebar */}
                <div className="w-full lg:w-[380px] bg-white dark:bg-surface-dark border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-gray-800 flex flex-col">
                    <div className="p-4 lg:p-6 border-b border-gray-100 dark:border-gray-800">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="material-icons-round text-amber-500">shopping_cart</span>
                            Orden Actual
                            {totalItems > 0 && (
                                <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{totalItems}</span>
                            )}
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-3">
                        {cart.length === 0 && (
                            <div className="text-center py-10 text-gray-400">
                                <span className="material-icons-round text-5xl mb-2 block">shopping_basket</span>
                                <p className="text-sm font-medium">Escanea un producto o selecciona del catálogo</p>
                            </div>
                        )}
                        {cart.map(item => {
                            const key = item.productId || item.name
                            return (
                                <div key={key} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <span className="text-2xl">{item.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">{item.name}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs text-gray-400">${item.price.toLocaleString('es-CL')} c/u</p>
                                                {item.isHealthy && item.category !== 'Librería' && <span className="w-2 h-2 bg-green-500 rounded-full" />}
                                                {!item.isHealthy && <span className="w-2 h-2 bg-amber-500 rounded-full" />}
                                                {item.category === 'Librería' && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => removeFromCart(key)} className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition-colors">
                                            <span className="material-icons-round text-sm">remove</span>
                                        </button>
                                        <span className="font-bold text-sm w-5 text-center text-gray-800 dark:text-gray-200">{item.qty}</span>
                                        <button onClick={() => addToCartByProduct({ _id: item.productId, name: item.name, price: item.price, icon: item.icon, isHealthy: item.isHealthy, category: item.category })} className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-green-100 hover:text-green-500 transition-colors">
                                            <span className="material-icons-round text-sm">add</span>
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Total & Pay */}
                    <div className="p-4 lg:p-6 border-t border-gray-100 dark:border-gray-800 space-y-3">
                        {cart.length > 0 && (
                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-green-600 flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full" />Saludable</span>
                                    <span className="font-bold text-green-700">${healthyTotal.toLocaleString('es-CL')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-amber-600 flex items-center gap-1"><span className="w-2 h-2 bg-amber-500 rounded-full" />No Saludable</span>
                                    <span className="font-bold text-amber-700">${unhealthyTotal.toLocaleString('es-CL')}</span>
                                </div>
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 font-medium">Total</span>
                            <span className="text-2xl font-extrabold text-gray-900 dark:text-white">${total.toLocaleString('es-CL')}</span>
                        </div>
                        <button
                            disabled={cart.length === 0}
                            onClick={() => setShowPayModal(true)}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 rounded-2xl shadow-lg shadow-amber-500/20 disabled:shadow-none hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                        >
                            <span className="material-icons-round">fingerprint</span>
                            Cobrar
                        </button>
                    </div>
                </div>
            </div>

            {/* Pay Modal */}
            {showPayModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowPayModal(false); setPayError('') }}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-icons-round text-amber-500">fingerprint</span>
                            Identificar Estudiante
                        </h3>

                        {payError && (
                            <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm font-medium flex items-center gap-2">
                                <span className="material-icons-round text-sm">error</span>
                                {payError}
                            </div>
                        )}

                        <div className="flex gap-2 mb-4 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl">
                            <button
                                onClick={() => { setMockBiometricMode(false); setBiometricInput(''); setStudentRut('') }}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!mockBiometricMode ? 'bg-white dark:bg-gray-800 shadow text-gray-900 dark:text-white' : 'text-gray-500'}`}
                            >
                                Ingreso Manual / NFC
                            </button>
                            <button
                                onClick={() => { setMockBiometricMode(true); setBiometricInput(''); setStudentRut('') }}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mockBiometricMode ? 'bg-amber-500 shadow text-white' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                            >
                                Lector Biométrico
                            </button>
                        </div>

                        {!mockBiometricMode ? (
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">RUT del Estudiante</label>
                                <input
                                    type="text" value={studentRut} onChange={e => setStudentRut(e.target.value)}
                                    placeholder="12.345.678-9"
                                    className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                        ) : (
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Lector Biométrico (Mock)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text" value={biometricInput} onChange={e => setBiometricInput(e.target.value)}
                                        placeholder="Ej: MOCK-BIO-001"
                                        className="flex-1 px-4 py-3.5 bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-200 dark:border-amber-800/50 rounded-xl text-amber-900 dark:text-amber-100 outline-none focus:ring-amber-500 font-mono"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setBiometricInput('MOCK-BIO-001')}
                                        className="px-4 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-xl font-bold hover:bg-amber-200 transition-colors"
                                    >
                                        Auto-Fill
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    En un entorno real, este input estaría oculto y escucharía el evento del lector USB.
                                </p>
                            </div>
                        )}

                        {/* Student Info Preview */}
                        {studentData && (
                            <div className="mb-4 p-4 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                                        {studentData.avatarInitials}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{studentData.fullName}</p>
                                        <p className="text-xs text-gray-500">{studentData.grade}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
                                        <p className="text-xs text-gray-500">Saldo Total</p>
                                        <p className="font-bold text-gray-900 dark:text-white">${studentData.generalBalance.toLocaleString('es-CL')}</p>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
                                        <p className="text-xs text-green-600">Saludable</p>
                                        <p className="font-bold text-green-700">${studentData.healthyBalance.toLocaleString('es-CL')}</p>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
                                        <p className="text-xs text-amber-600">No Salud.</p>
                                        <p className="font-bold text-amber-700">${(studentData.generalBalance - studentData.healthyBalance).toLocaleString('es-CL')}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Productos</span>
                                <span className="font-bold text-gray-800 dark:text-gray-200">{totalItems} items</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-green-600">Saludable</span>
                                <span className="font-bold text-green-700">${healthyTotal.toLocaleString('es-CL')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-amber-600">No Saludable</span>
                                <span className="font-bold text-amber-700">${unhealthyTotal.toLocaleString('es-CL')}</span>
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-600 pt-2 flex justify-between text-sm">
                                <span className="text-gray-500">Total a cobrar</span>
                                <span className="font-extrabold text-lg text-gray-900 dark:text-white">${total.toLocaleString('es-CL')}</span>
                            </div>
                        </div>

                        {studentData && total > studentData.generalBalance && (
                            <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm font-medium flex items-center gap-2">
                                <span className="material-icons-round text-sm">warning</span>
                                Saldo insuficiente
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button onClick={() => { setShowPayModal(false); setPayError('') }} className="flex-1 py-3 border border-gray-200 dark:border-gray-600 rounded-xl font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 transition-colors">
                                Cancelar
                            </button>
                            <button onClick={handlePay} disabled={paying || (!studentRut && !biometricInput) || (studentData !== null && total > studentData.generalBalance)} className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl shadow-lg disabled:opacity-60 transition-all flex items-center justify-center gap-2">
                                {paying ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-icons-round text-sm">check</span>
                                        Confirmar Pago
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Fruit Quick Menu Modal */}
            {showFruitMenu && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowFruitMenu(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="text-2xl">🍎</span>
                            Seleccionar Fruta
                        </h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                            {FRUIT_MENU.map(fruit => (
                                <button
                                    key={fruit.name}
                                    onClick={() => addFruitToCart(fruit)}
                                    className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 hover:border-green-400 hover:shadow-md transition-all text-center active:scale-95"
                                >
                                    <span className="text-3xl block mb-1">{fruit.icon}</span>
                                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{fruit.name}</p>
                                    <p className="text-xs font-bold text-green-600">${fruit.price}</p>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setShowFruitMenu(false)} className="w-full py-3 border border-gray-200 dark:border-gray-600 rounded-xl font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 transition-colors">
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
