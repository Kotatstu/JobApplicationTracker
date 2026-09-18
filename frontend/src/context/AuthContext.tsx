import { useState, useEffect, type ReactNode } from 'react'
import { api } from '../api/axiosInstance'
import { AuthContext, type User } from './AuthContextObject'

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const fetchCurrentUser = async () => {
        try {
            const response = await api.get<User>('/auth/me')
            setUser(response.data)
        } catch {
            setUser(null)
        }
    }

    useEffect(() => {
        let ignore = false

        const runInitialCheck = async () => {
            try {
                const response = await api.get<User>('/auth/me')
                if (!ignore) setUser(response.data)
            } catch {
                if (!ignore) setUser(null)
            } finally {
                if (!ignore) setIsLoading(false)
            }
        }

        runInitialCheck()
        return () => { ignore = true }
    }, [])

    const login = async (email: string, password: string) => {
        await api.post('/auth/login', { email, password })
        await fetchCurrentUser()
    }

    const logout = async () => {
        await api.post('/auth/logout')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}