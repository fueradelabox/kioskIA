import { createContext, useContext, type ReactNode } from 'react'
import { useQuery, useConvexAuth } from 'convex/react'
import { useAuthActions } from '@convex-dev/auth/react'
import { api } from '../../convex/_generated/api'

type UserRole = 'student' | 'parent' | 'vendor' | null

interface AuthState {
    isAuthenticated: boolean
    isLoading: boolean
    role: UserRole
    profileId: string | null
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading } = useConvexAuth()

    if (isLoading) {
        return (
            <AuthContext.Provider value={{
                isAuthenticated: false,
                isLoading: true,
                role: null,
                profileId: null,
                signOut: async () => { },
            }}>
                {children}
            </AuthContext.Provider>
        )
    }

    if (!isAuthenticated) {
        return (
            <AuthContext.Provider value={{
                isAuthenticated: false,
                isLoading: false,
                role: null,
                profileId: null,
                signOut: async () => { },
            }}>
                {children}
            </AuthContext.Provider>
        )
    }

    return (
        <AuthenticatedProvider>{children}</AuthenticatedProvider>
    )
}

function AuthenticatedProvider({ children }: { children: ReactNode }) {
    const { signOut } = useAuthActions()
    const roleData = useQuery(api.users.getRole)

    const value: AuthState = {
        isAuthenticated: true,
        isLoading: roleData === undefined,
        role: roleData?.role ?? null,
        profileId: roleData?.profileId ?? null,
        signOut: async () => { await signOut() },
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be inside <AuthProvider>')
    return ctx
}
