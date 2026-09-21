import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function Layout() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b px-6 py-3 flex justify-between items-center">
                <Link to="/" className="font-bold text-lg">Job Tracker</Link>
                <div className="flex items-center gap-4 text-sm">
                    {user && <span className="text-gray-600">{user.email}</span>}
                    <button onClick={handleLogout} className="text-red-600 underline">
                        Log out
                    </button>
                </div>
            </header>
            <main>
                <Outlet />
            </main>
        </div>
    )
}