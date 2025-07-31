import { useState, useEffect } from 'react'
import LoginForm from '../components/auth/LoginForm'
import PermissionsList from '../components/permissions/PermissionsList'
import RolesList from '../components/roles/RolesList'
import NaturalLanguageInput from '../components/nlp/NaturalLanguageInput'
import { Button } from '../components/ui/button'

export default function Home() {
    const [token, setToken] = useState(null)
    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
        const savedToken = localStorage.getItem('authToken')
        if (savedToken) {
            setToken(savedToken)
        }
    }, [])

    const handleLogin = (newToken) => {
        setToken(newToken)
    }

    const handleLogout = () => {
        localStorage.removeItem('authToken')
        setToken(null)
    }

    const refreshData = () => {
        setRefreshKey(prev => prev + 1)
    }

    if (!token) {
        return <LoginForm onLogin={handleLogin} />
    }

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white">
                        🔐 RBAC Configuration Tool
                    </h1>
                    <Button 
                        onClick={handleLogout}
                        variant="outline"
                        className="text-white border-white/20 hover:bg-white/10"
                    >
                        Logout
                    </Button>
                </div>

                {/* Natural Language Input */}
                <div className="mb-8">
                    <NaturalLanguageInput token={token} onSuccess={refreshData} />
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div key={`permissions-${refreshKey}`}>
                        <PermissionsList token={token} />
                    </div>
                    <div key={`roles-${refreshKey}`}>
                        <RolesList token={token} />
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center text-white/60 text-sm">
                    <p>Built with Next.js, Firebase, and AI-powered natural language processing</p>
                </div>
            </div>
        </div>
    )
}