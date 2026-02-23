import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

interface DarkModeContextType {
    darkMode: boolean
    toggleDarkMode: () => void
}

const DarkModeContext = createContext<DarkModeContextType>({
    darkMode: false,
    toggleDarkMode: () => { },
})

export function DarkModeProvider({ children }: { children: ReactNode }) {
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('kioskia-dark-mode')
        if (saved !== null) return saved === 'true'
        return window.matchMedia('(prefers-color-scheme: dark)').matches
    })

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode)
        localStorage.setItem('kioskia-dark-mode', String(darkMode))
    }, [darkMode])

    const toggleDarkMode = () => setDarkMode(prev => !prev)

    return (
        <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
            {children}
        </DarkModeContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useDarkMode = () => useContext(DarkModeContext)
