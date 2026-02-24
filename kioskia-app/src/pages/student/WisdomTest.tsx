import { useState } from 'react'
import { Trophy, CheckCircle2, XCircle, ChevronRight, Award } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function WisdomTest() {
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [score, setScore] = useState(0)
    const [showResult, setShowResult] = useState(false)
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
    const [isAnswered, setIsAnswered] = useState(false)

    const questions = [
        {
            question: "Si tienes \$1.000 y compras una manzana por \$300, ¿cuánto te sobra para ahorrar?",
            options: ["\$500", "\$700", "\$300"],
            correctAnswer: 1, // index 1 = $700
            explanation: "¡Correcto! \$1.000 menos \$300 es igual a \$700."
        },
        {
            question: "¿Cuál de estas opciones es una NECESIDAD?",
            options: ["Un videojuego nuevo", "Zapatillas luminosas", "Almuerzo saludable"],
            correctAnswer: 2, // index 2 = Almuerzo
            explanation: "¡Exacto! La comida nutritiva es una necesidad básica para crecer fuerte."
        },
        {
            question: "¿Qué es un Presupuesto?",
            options: ["Un tipo de sándwich", "Un plan para usar tu dinero", "Un banco"],
            correctAnswer: 1,
            explanation: "¡Muy bien! Un presupuesto te ayuda a planificar en qué vas a gastar y cuánto vas a ahorrar."
        }
    ]

    const handleAnswer = (index: number) => {
        if (isAnswered) return;

        setSelectedAnswer(index)
        setIsAnswered(true)

        if (index === questions[currentQuestion].correctAnswer) {
            setScore(score + 100)
        }
    }

    const nextQuestion = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1)
            setSelectedAnswer(null)
            setIsAnswered(false)
        } else {
            setShowResult(true)
        }
    }

    if (showResult) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in zoom-in duration-500 p-6 text-center space-y-6">
                <div className="w-32 h-32 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-4 relative">
                    <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full animate-pulse"></div>
                    <Award className="w-20 h-20 text-yellow-500 relative z-10" />
                </div>

                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">¡Nivel Completado!</h2>
                    <p className="text-xl text-gray-500 dark:text-gray-400">
                        Obtuviste <span className="text-primary font-bold">{score} Puntos</span>
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 w-full max-w-sm">
                    <p className="text-gray-600 dark:text-gray-300 font-medium mb-4">
                        ¡Felicidades! Has demostrado gran sabiduría financiera. Tu nueva medalla te espera en el estante de trofeos.
                    </p>
                    <Link
                        to="/estudiante/logros"
                        className="w-full inline-flex justify-center items-center gap-2 bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-95 transition-all"
                    >
                        Ver mis Medallas <Trophy className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        )
    }

    const q = questions[currentQuestion]

    return (
        <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-right-4">
            {/* Progress Bar */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                <p className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">
                    Pregunta {currentQuestion + 1} de {questions.length}
                </p>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                        className="bg-primary h-3 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Question Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8 text-center leading-tight">
                    {q.question}
                </h2>

                <div className="space-y-3">
                    {q.options.map((opt, index) => {
                        let buttonClass = "w-full p-4 rounded-2xl font-bold text-lg text-left transition-all border-2 "

                        if (!isAnswered) {
                            buttonClass += "bg-gray-50 dark:bg-gray-900 border-transparent hover:border-primary/30 text-gray-700 dark:text-gray-200"
                        } else if (index === q.correctAnswer) {
                            buttonClass += "bg-green-50 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400"
                        } else if (index === selectedAnswer) {
                            buttonClass += "bg-red-50 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-400"
                        } else {
                            buttonClass += "bg-gray-50 dark:bg-gray-900 border-transparent opacity-50 text-gray-700 dark:text-gray-200"
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => handleAnswer(index)}
                                disabled={isAnswered}
                                className={buttonClass}
                            >
                                <div className="flex justify-between items-center">
                                    <span>{opt}</span>
                                    {isAnswered && index === q.correctAnswer && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                                    {isAnswered && index === selectedAnswer && index !== q.correctAnswer && <XCircle className="w-6 h-6 text-red-500" />}
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Feedback & Next Button */}
            {isAnswered && (
                <div className="animate-in slide-in-from-bottom-4 duration-300">
                    <div className={`p-4 rounded-2xl mb-4 text-center font-medium ${selectedAnswer === q.correctAnswer
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300'
                        }`}>
                        {selectedAnswer === q.correctAnswer ? q.explanation : "Ups, piénsalo de nuevo. " + q.explanation}
                    </div>

                    <button
                        onClick={nextQuestion}
                        className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 flex justify-center items-center gap-2 active:scale-95 transition-transform"
                    >
                        Siguiente <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            )}
        </div>
    )
}
