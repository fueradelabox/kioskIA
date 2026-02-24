import { Trophy, Star, Target, Apple, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function YearlySummary() {
    const [showConfetti, setShowConfetti] = useState(false)

    useEffect(() => {
        // Simulamos un retraso para el efecto "wow"
        const timer = setTimeout(() => setShowConfetti(true), 500)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-700 relative overflow-hidden">

            {/* Background radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-yellow-300/20 via-transparent to-transparent"></div>

            <div className="relative z-10 w-full max-w-sm space-y-8">

                {/* Giant Trophy */}
                <div className={`relative mx-auto w-48 h-48 transition-all duration-1000 ${showConfetti ? 'scale-110' : 'scale-90 opacity-0'}`}>
                    <div className="absolute inset-0 bg-yellow-400/30 blur-3xl rounded-full animate-pulse"></div>
                    <Trophy className="w-full h-full text-yellow-500 drop-shadow-2xl relative z-20" />

                    {/* Sparkles */}
                    {showConfetti && (
                        <>
                            <Star className="absolute top-0 right-0 w-8 h-8 text-yellow-400 animate-spin-slow" />
                            <Star className="absolute bottom-4 left-0 w-6 h-6 text-yellow-300 animate-spin-slow" style={{ animationDirection: 'reverse' }} />
                        </>
                    )}
                </div>

                <div className={`space-y-2 transition-all duration-1000 delay-300 ${showConfetti ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">¡Año Épico!</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">Mira todo lo que lograste este año escolar.</p>
                </div>

                {/* Stats Grid */}
                <div className={`grid grid-cols-2 gap-4 transition-all duration-1000 delay-500 ${showConfetti ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-5 rounded-3xl text-left text-white shadow-lg shadow-green-500/20">
                        <Apple className="w-8 h-8 text-white/80 mb-2" />
                        <p className="text-3xl font-black">142</p>
                        <p className="text-xs font-bold uppercase tracking-wider text-green-100">Snacks Sanos</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-400 to-indigo-500 p-5 rounded-3xl text-left text-white shadow-lg shadow-blue-500/20">
                        <Target className="w-8 h-8 text-white/80 mb-2" />
                        <p className="text-3xl font-black">4</p>
                        <p className="text-xs font-bold uppercase tracking-wider text-blue-100">Metas Logradas</p>
                    </div>
                </div>

                {/* Action Button */}
                <div className={`transition-all duration-1000 delay-700 ${showConfetti ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <Link
                        to="/estudiante"
                        className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-2xl font-black text-lg shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <Play className="w-5 h-5 fill-current" /> Ver Repetición Completa
                    </Link>
                    <p className="text-sm text-gray-400 dark:text-gray-500 font-medium mt-4">
                        Comparte este resumen con tus padres.
                    </p>
                </div>

            </div>
        </div>
    )
}
