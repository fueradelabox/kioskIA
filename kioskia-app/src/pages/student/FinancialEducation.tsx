import { Map, Star, BookOpen, ChevronRight, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function FinancialEducation() {
    const [activeLesson, setActiveLesson] = useState<{ title: string, content: string, points: number } | null>(null)

    const lessons = [
        {
            id: 1,
            title: "El Valor del Ahorro",
            description: "¿Por qué es importante guardar moneditas?",
            icon: <Star className="w-8 h-8 text-yellow-400" />,
            color: "from-yellow-400 to-orange-500",
            content: "Ahorrar significa guardar una parte de tu dinero hoy para poder comprar algo más grande mañana. ¡Es como tener un superpoder para el futuro! Cada moneda que guardas es un paso más cerca de tu meta.",
            points: 50,
            locked: false
        },
        {
            id: 2,
            title: "Necesidades vs Deseos",
            description: "Aprende a elegir qué comprar primero",
            icon: <BookOpen className="w-8 h-8 text-blue-400" />,
            color: "from-blue-400 to-indigo-500",
            content: "Las necesidades son cosas que DEBEMOS tener para vivir (como comida, ropa y una casa). Los deseos son cosas que QUEREMOS tener (como el juguete de moda o un videojuego). ¡Siempre debemos cubrir las necesidades primero!",
            points: 100,
            locked: false
        },
        {
            id: 3,
            title: "Presupuesto Inteligente",
            description: "Organiza tu dinero como un experto",
            icon: <Map className="w-8 h-8 text-green-400" />,
            color: "from-green-400 to-emerald-500",
            content: "Un presupuesto es un plan para tu dinero. Te dice cuánto puedes gastar y cuánto debes guardar. La regla de oro es: no gastes más de lo que tienes.",
            points: 150,
            locked: true
        }
    ]

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <header className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white">Aventura Financiera 🧭</h1>
                    <p className="text-gray-500 dark:text-gray-400">Aprende y gana puntos</p>
                </div>
            </header>

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-primary to-accent rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                <div className="relative z-10">
                    <h2 className="text-xl font-bold mb-2">¡Desafío de la Semana!</h2>
                    <p className="opacity-90 mb-4 text-sm">Completa el "Test de Sabiduría" para ganar tu primera medalla dorada.</p>
                    <Link
                        to="/estudiante/test"
                        className="inline-flex items-center gap-2 bg-white text-primary px-4 py-2 rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-transform"
                    >
                        Ir al Test <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Lesson Carousel */}
            <div className="space-y-4">
                <h3 className="font-bold text-gray-900 dark:text-white px-1">Lecciones Disponibles</h3>

                <div className="flex overflow-x-auto pb-4 -mx-4 px-4 gap-4 snap-x">
                    {lessons.map((lesson) => (
                        <button
                            key={lesson.id}
                            onClick={() => !lesson.locked && setActiveLesson(lesson)}
                            className={`min-w-[260px] snap-center p-5 rounded-3xl flex flex-col items-start gap-4 transition-all relative overflow-hidden ${lesson.locked
                                    ? 'bg-gray-100 dark:bg-gray-800 opacity-70 cursor-not-allowed'
                                    : `bg-gradient-to-br ${lesson.color} shadow-md hover:-translate-y-1`
                                }`}
                        >
                            {lesson.locked ? (
                                <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-2xl">
                                    <Lock className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                                </div>
                            ) : (
                                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                                    {lesson.icon}
                                </div>
                            )}

                            <div className="text-left">
                                <h4 className={`font-bold text-lg mb-1 ${lesson.locked ? 'text-gray-600 dark:text-gray-300' : 'text-white'}`}>
                                    {lesson.title}
                                </h4>
                                <p className={`text-sm ${lesson.locked ? 'text-gray-500 dark:text-gray-400' : 'text-white/80'}`}>
                                    {lesson.description}
                                </p>
                            </div>

                            {!lesson.locked && (
                                <div className="absolute top-4 right-4 bg-white/20 px-3 py-1 rounded-full text-xs font-bold text-white backdrop-blur-sm">
                                    +{lesson.points} pts
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Modal / Lesson Detail (Simulated for now) */}
            {activeLesson && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-8">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4">{activeLesson.title}</h2>
                        <div className="prose dark:prose-invert mb-6">
                            <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                                {activeLesson.content}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setActiveLesson(null)}
                                className="flex-1 px-4 py-3 rounded-xl font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                            >
                                Cerrar
                            </button>
                            <button
                                onClick={() => setActiveLesson(null)}
                                className="flex-1 px-4 py-3 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/30"
                            >
                                ¡Entendido! (+{activeLesson.points})
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
