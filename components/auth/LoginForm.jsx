import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'

export default function LoginForm({ onLogin }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLogin, setIsLogin] = useState(true)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Authentication failed')
            }

            if (isLogin) {
                localStorage.setItem('authToken', data.token)
                onLogin(data.token)
            } else {
                setError('Registration successful! Please login.')
                setIsLogin(true)
            }
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md glass border-white/20">
                <CardHeader>
                    <CardTitle className="text-center text-white">
                        🔐 RBAC Configuration Tool
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="text-red-300 text-sm text-center bg-red-500/20 p-2 rounded">
                                {error}
                            </div>
                        )}
                        
                        <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                        />
                        
                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                        />
                        
                        <Button 
                            type="submit" 
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
                        </Button>
                        
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full text-white border-white/20 hover:bg-white/10"
                            onClick={() => setIsLogin(!isLogin)}
                        >
                            {isLogin ? 'Need to register?' : 'Already have an account?'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}