import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'

export default function PermissionsList({ token }) {
    const [permissions, setPermissions] = useState({})
    const [showForm, setShowForm] = useState(false)
    const [editingPermission, setEditingPermission] = useState(null)
    const [formData, setFormData] = useState({ name: '', description: '' })

    useEffect(() => {
        loadPermissions()
    }, [])

    const loadPermissions = async () => {
        try {
            const response = await fetch('/api/permissions', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            setPermissions(data)
        } catch (error) {
            console.error('Error loading permissions:', error)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const method = editingPermission ? 'PUT' : 'POST'
            const body = editingPermission 
                ? { ...formData, id: editingPermission }
                : formData

            const response = await fetch('/api/permissions', {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            })

            if (response.ok) {
                loadPermissions()
                setShowForm(false)
                setEditingPermission(null)
                setFormData({ name: '', description: '' })
            }
        } catch (error) {
            console.error('Error saving permission:', error)
        }
    }

    const handleEdit = (id, permission) => {
        setEditingPermission(id)
        setFormData({ name: permission.name, description: permission.description || '' })
        setShowForm(true)
    }

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this permission?')) {
            try {
                const response = await fetch('/api/permissions', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ id })
                })

                if (response.ok) {
                    loadPermissions()
                }
            } catch (error) {
                console.error('Error deleting permission:', error)
            }
        }
    }

    return (
        <Card className="glass border-white/20">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">🔑 Permissions</CardTitle>
                <Button 
                    onClick={() => setShowForm(true)}
                    className="bg-green-600 hover:bg-green-700"
                >
                    + Add Permission
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {Object.entries(permissions).map(([id, permission]) => (
                        <div key={id} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                            <div>
                                <h3 className="text-white font-medium">{permission.name}</h3>
                                <p className="text-white/70 text-sm">{permission.description}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleEdit(id, permission)}
                                    className="text-white border-white/20 hover:bg-white/10"
                                >
                                    Edit
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => handleDelete(id)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                    {Object.keys(permissions).length === 0 && (
                        <p className="text-white/70 text-center py-8">No permissions created yet</p>
                    )}
                </div>

                <Dialog open={showForm} onOpenChange={setShowForm}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingPermission ? 'Edit Permission' : 'Create Permission'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                placeholder="Permission name (e.g., edit_articles)"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                            />
                            <Input
                                placeholder="Description (optional)"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                            <div className="flex gap-2">
                                <Button type="submit" className="flex-1">
                                    {editingPermission ? 'Update' : 'Create'}
                                </Button>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => {
                                        setShowForm(false)
                                        setEditingPermission(null)
                                        setFormData({ name: '', description: '' })
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    )
}