import { Plus, Check, Leaf } from 'lucide-react'
import { useState } from 'react'

export default function HealthyPlanner() {
    const [selectedItems, setSelectedItems] = useState<number[]>([])

    const healthyProducts = [
        { id: 1, name: "Manzana Roja", price: 300, icon: "🍎", calories: 52 },
        { id: 2, name: "Plátano", price: 400, icon: "🍌", calories: 89 },
        { id: 3, name: "Barra de Cereal", price: 600, icon: "🌾", calories: 120 },
        { id: 4, name: "Jugo Natural", price: 800, icon: "🧃", calories: 90 },
        { id: 5, name: "Yogurt", price: 700, icon: "🥛", calories: 100 },
        { id: 6, name: "Uvas", price: 500, icon: "🍇", calories: 69 }
    ]

    const toggleItem = (id: number) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter(itemId => itemId !== id))
        } else {
            if (selectedItems.length < 3) {
                setSelectedItems([...selectedItems, id])
            }
        }
    }

    const totalCost = selectedItems.reduce((acc, itemId) => {
        const item = healthyProducts.find(p => p.id === itemId)
        return acc + (item?.price || 0)
    }, 0)

    const totalCalories = selectedItems.reduce((acc, itemId) => {
        const item = healthyProducts.find(p => p.id === itemId)
        return acc + (item?.calories || 0)
    }, 0)

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
            <header className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white">Arma tu Combo 🥗</h1>
                    <p className="text-gray-500 dark:text-gray-400">Planifica tu colación sana de mañana</p>
                </div>
            </header>

            {/* Combo Preview Area */}
            <div className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <p className="text-white/80 font-medium text-sm mb-1 uppercase tracking-wider">Tu Bandeja</p>
                        <h2 className="text-3xl font-black">${totalCost.toLocaleString('es-CL')}</h2>
                    </div>
                    <div className="text-right">
                        <p className="text-white/80 font-medium text-sm mb-1 uppercase tracking-wider">Energía</p>
                        <p className="text-xl font-bold">{totalCalories} kcal</p>
                    </div>
                </div>

                <div className="flex justify-around bg-black/10 rounded-2xl p-4 gap-2 backdrop-blur-sm">
                    {[0, 1, 2].map((slotIndex) => {
                        const itemId = selectedItems[slotIndex]
                        const item = healthyProducts.find(p => p.id === itemId)

                        return (
                            <div
                                key={slotIndex}
                                className="w-16 h-16 rounded-xl flex items-center justify-center bg-white/20 border-2 border-white/30 text-3xl shadow-inner relative"
                            >
                                {item ? (
                                    <span className="animate-in zoom-in">{item.icon}</span>
                                ) : (
                                    <Plus className="w-6 h-6 text-white/50" />
                                )}
                            </div>
                        )
                    })}
                </div>
                <p className="text-center text-xs text-white/70 mt-3">Máximo 3 productos por combo</p>
            </div>

            {/* Catalog */}
            <div className="space-y-4">
                <h3 className="font-bold text-gray-900 dark:text-white px-1 flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-green-500" /> Menú Saludable
                </h3>

                <div className="grid grid-cols-2 gap-4">
                    {healthyProducts.map(product => {
                        const isSelected = selectedItems.includes(product.id)
                        const isFull = selectedItems.length >= 3 && !isSelected

                        return (
                            <button
                                key={product.id}
                                onClick={() => toggleItem(product.id)}
                                disabled={isFull}
                                className={`p-4 rounded-3xl flex flex-col items-center text-center gap-2 transition-all border-2 relative overflow-hidden ${isSelected
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                    : isFull
                                        ? 'border-transparent bg-gray-50 dark:bg-gray-800 opacity-50 cursor-not-allowed'
                                        : 'border-transparent bg-white dark:bg-gray-800 shadow-sm hover:border-gray-200 dark:hover:border-gray-700'
                                    }`}
                            >
                                {isSelected && (
                                    <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1 text-white animate-in zoom-in">
                                        <Check className="w-4 h-4" />
                                    </div>
                                )}

                                <span className="text-4xl mb-1">{product.icon}</span>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">{product.name}</h4>
                                    <p className="text-primary font-black text-sm">${product.price}</p>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Floating Action Button */}
            {selectedItems.length > 0 && (
                <div className="fixed bottom-24 left-0 right-0 px-6 animate-in slide-in-from-bottom-8">
                    <button className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-2xl font-black text-lg shadow-xl shadow-gray-900/20 active:scale-95 transition-transform">
                        Guardar Combo Favorito
                    </button>
                </div>
            )}
        </div>
    )
}
