// components/nlp/NaturalLanguageInput.jsx - CLEAN VERSION
import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'

export default function NaturalLanguageInput({ token, onSuccess }) {
    const [command, setCommand] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState('')
    const [showExamples, setShowExamples] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!command.trim()) return

        setLoading(true)
        setResult('')

        try {
            const response = await fetch('/api/nlp/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ command })
            })

            const data = await response.json()
            setResult(data.message)
            
            if (data.success) {
                setCommand('')
                onSuccess() // Refresh the lists
            }
        } catch (error) {
            setResult('❌ Error processing command')
        } finally {
            setLoading(false)
        }
    }

    // CLEAN, ORGANIZED EXAMPLES
    const quickExamples = [
        "Create a permission called edit posts",
        "Create a role called Admin",
        "Give Admin edit posts",
        "Allow Editor to publish content"
    ]

    const exampleCategories = {
        "📝 Create Permissions": [
            "Create a permission called edit posts",
            "Create a permission called delete users", 
            "Create a permission called manage settings",
            "Add a permission called publish content"
        ],
        "👥 Create Roles": [
            "Create a role called Admin",
            "Create a role called Editor",
            "Create a role called Moderator",
            "Add a role called Viewer"
        ],
        "🔗 Assign Permissions": [
            "Give Admin edit posts",
            "Allow Editor to publish content",
            "Make Admin able to delete users",
            "Let Moderator ban users",
            "Give the Admin role the permission to manage settings"
        ]
    }

    return (
        <Card className="glass border-white/20">
            <CardHeader>
                <CardTitle className="text-white">🤖 Natural Language Commands</CardTitle>
                <p className="text-white/70 text-sm">
                    Type commands in plain English - the system understands natural language!
                </p>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        placeholder="Tell me what you want to do... (e.g., 'Give Admin the ability to edit posts')"
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                        disabled={loading}
                    />
                    <Button 
                        type="submit" 
                        disabled={loading || !command.trim()}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                        {loading ? '🔄 Processing...' : '✨ Execute Command'}
                    </Button>
                </form>

                {result && (
                    <div className={`mt-4 p-3 rounded-lg ${
                        result.startsWith('✅') 
                            ? 'bg-green-500/20 text-green-100 border border-green-500/30' 
                            : 'bg-red-500/20 text-red-100 border border-red-500/30'
                    }`}>
                        <pre className="whitespace-pre-wrap text-sm">{result}</pre>
                    </div>
                )}

                {/* Quick Examples */}
                <div className="mt-6">
                    <h4 className="text-white/90 text-sm font-medium mb-3">⚡ Quick Examples:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {quickExamples.map((example, index) => (
                            <button
                                key={index}
                                onClick={() => setCommand(example)}
                                className="text-left text-white/70 text-xs hover:text-white/90 hover:bg-white/10 p-2 rounded transition-all duration-200 cursor-pointer border border-white/10 hover:border-white/30"
                                disabled={loading}
                            >
                                {example}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Expandable Examples */}
                <div className="mt-4">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowExamples(!showExamples)}
                        className="text-white/80 border-white/20 hover:bg-white/10 text-xs"
                    >
                        {showExamples ? '📤 Hide More Examples' : '📥 Show More Examples'}
                    </Button>

                    {showExamples && (
                        <div className="mt-4 space-y-4 max-h-64 overflow-y-auto bg-white/5 rounded-lg p-4 border border-white/10">
                            {Object.entries(exampleCategories).map(([category, examples]) => (
                                <div key={category} className="space-y-2">
                                    <h5 className="text-white/90 text-xs font-semibold">
                                        {category}
                                    </h5>
                                    <div className="space-y-1">
                                        {examples.map((example, index) => (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    setCommand(example)
                                                    setShowExamples(false)
                                                }}
                                                className="block w-full text-left text-white/60 text-xs hover:text-white/90 hover:bg-white/10 p-2 rounded transition-all duration-200 cursor-pointer"
                                                disabled={loading}
                                            >
                                                • {example}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-blue-100/80 text-xs">
                        💡 <strong>Smart Pattern Matching: </strong> The system uses advanced patterns to understand your commands instantly. Try different phrasings - it's very flexible! Tip: Use single quotes around role and permission names (e.g., 'Admin', 'edit posts') for better recognition.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}