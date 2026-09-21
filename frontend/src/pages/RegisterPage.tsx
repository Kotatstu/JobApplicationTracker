import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api/axiosInstance'

export function RegisterPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        try {
            await api.post('/auth/register', { email, password })
            navigate('/login')
        } catch (err: any) {
            const messages = err.response?.data?.map((e: any) => e.description).join(', ')
            setError(messages || 'Registration failed')
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-80 flex flex-col gap-4">
                <h1 className="text-xl font-bold">Register</h1>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border rounded px-3 py-2" required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="border rounded px-3 py-2" required />
                <button type="submit" className="bg-blue-600 text-white py-2 rounded">Register</button>
                <Link to="/login" className="text-sm text-center text-blue-600">Already have an account? Log in</Link>
            </form>
        </div>
    )
}