import { Trophy, Award, Lock, Star, Zap } from 'lucide-react'

export default function Achievements() {
    const achievements = [
        {
            id: 1,
            title: "Primera Compra Sana",
            description: "Elegiste una colación saludable por primera vez.",
            icon: <Star className="w-10 h-10 text-yellow-500" />,
            color: "from-yellow-200 to-orange-300 dark:from-yellow-600 dark:to-orange-800",
            unlocked: true,
            date: "Hace 2 días"
        },
        {
            id: 2,
            title: "Ahorrador Experto",
            description: "Alcanzaste tu primera meta de ahorro.",
            icon: <Trophy className="w-10 h-10 text-blue-500" />,
            color: "from-blue-200 to-indigo-300 dark:from-blue-600 dark:to-indigo-800",
            unlocked: true,
            date: "Hace 1 semana"
        },
        {
            id: 3,
            title: "Sabio Financiero",
            description: "¡Puntaje perfecto en el Test de Sabiduría!",
            icon: <Award className="w-10 h-10 text-purple-500" />,
            color: "from-purple-200 to-pink-300 dark:from-purple-600 dark:to-pink-800",
            unlocked: false,
            date: null
        },
        {
            id: 4,
            title: "Racha de Energía",
            description: "Siete días seguidos comiendo saludable.",
            icon: <Zap className="w-10 h-10 text-emerald-500" />,
            color: "from-emerald-200 to-green-300 dark:from-emerald-600 dark:to-green-800",
            unlocked: false,
            date: null
        }
    ]

    const unlockedCount = achievements.filter(a => a.unlocked).length
    const totalCount = achievements.length

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <header className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white">Mis Medallas 🏆</h1>
                    <p className="text-gray-500 dark:text-gray-400">Colecciona tus logros</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Progreso</p>
                    <p className="text-xl font-black text-primary">{unlockedCount} / {totalCount}</p>
                </div>
            </header>

            {/* Hero Showcase (3D style pedestal) */}
            <div className="bg-gradient-to-b from-primary/10 to-transparent p-8 rounded-3xl flex flex-col items-center justify-center min-h-[200px] relative overflow-hidden">
                <div className="absolute inset-0 bg-white/40 dark:bg-gray-900/40 backdrop-blur-3xl"></div>

                {/* Pedestal */}
                <div className="w-40 h-12 bg-gray-200 dark:bg-gray-700 rounded-full mt-20 relative z-10 mx-auto opacity-50 shadow-inner"></div>

                {/* Featured Trophy overlay */}
                <div className="absolute z-20 flex flex-col items-center pb-8 animate-bounce" style={{ animationDuration: '3s' }}>
                    <div className="w-32 h-32 bg-yellow-300 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(253,224,71,0.6)] border-4 border-yellow-100">
                        <Trophy className="w-16 h-16 text-yellow-600" />
                    </div>
                </div>
            </div>

            {/* Grid de Medallas */}
            <h3 className="font-bold text-gray-900 dark:text-white px-1">Tu Colección</h3>
            <div className="grid grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                    <div
                        key={achievement.id}
                        className={`relative p-5 rounded-3xl flex flex-col items-center text-center gap-3 transition-all ${achievement.unlocked
                                ? 'bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:-translate-y-1'
                                : 'bg-gray-50 dark:bg-gray-900 opacity-60 border border-dashed border-gray-300 dark:border-gray-700'
                            }`}
                    >
                        {achievement.unlocked ? (
                            <>
                                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${achievement.color} flex items-center justify-center shadow-inner`}>
                                    <div className="bg-white/40 p-3 rounded-xl backdrop-blur-md">
                                        {achievement.icon}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{achievement.title}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{achievement.date}</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-20 h-20 rounded-2xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-600">
                                    <Lock className="w-8 h-8" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-400 dark:text-gray-500 text-sm mb-1">Misterio</h4>
                                    <p className="text-xs text-gray-400 dark:text-gray-600 line-clamp-2">{achievement.description}</p>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
