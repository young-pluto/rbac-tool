import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'

export default function RolesList({ token }) {
    const [roles, setRoles] = useState({})
    const [permissions, setPermissions] = useState({})
    const [showForm, setShowForm] = useState(false)
    const [editingRole, setEditingRole] = useState(null)
    const [formData, setFormData] = useState({ name: '', selectedPermissions: [] })

    useEffect(() => {
        loadRoles()
        loadPermissions()
    }, [])

    const loadRoles = async () => {
        try {
            const response = await fetch('/api/roles', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            setRoles(data)
        } catch (error) {
            console.error('Error loading roles:', error)
        }
    }

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
            const method = editingRole ? 'PUT' : 'POST'
            const body = editingRole 
                ? { ...formData, id: editingRole, permissions: formData.selectedPermissions }
                : { ...formData, permissions: formData.selectedPermissions }

            const response = await fetch('/api/roles', {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            })

            if (response.ok) {
                loadRoles()
                setShowForm(false)
                setEditingRole(null)
                setFormData({ name: '', selectedPermissions: [] })
            }
        } catch (error) {
            console.error('Error saving role:', error)
        }
    }

    const handleEdit = (id, role) => {
        setEditingRole(id)
        setFormData({
            name: role.name,
            selectedPermissions: Object.keys(role.permissions || {})
        })
        setShowForm(true)
    }

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this role?')) {
            try {
                const response = await fetch('/api/roles', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ id })
                })

                if (response.ok) {
                    loadRoles()
                }
            } catch (error) {
                console.error('Error deleting role:', error)
            }
        }
    }

    const togglePermission = (permissionId) => {
        setFormData(prev => ({
            ...prev,
            selectedPermissions: prev.selectedPermissions.includes(permissionId)
                ? prev.selectedPermissions.filter(id => id !== permissionId)
                : [...prev.selectedPermissions, permissionId]
        }))
    }

    return (
        <Card className="glass border-white/20">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">👥 Roles</CardTitle>
                <Button 
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    + Add Role
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {Object.entries(roles).map(([id, role]) => (
                        <div key={id} className="p-4 bg-white/10 rounded-lg">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="text-white font-medium text-lg">{role.name}</h3>
                                    <p className="text-white/70 text-sm">
                                        {Object.keys(role.permissions || {}).length} permissions assigned
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => handleEdit(id, role)}
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
                            
                            {Object.keys(role.permissions || {}).length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {Object.keys(role.permissions || {}).map(permId => {
                                        const permission = permissions[permId]
                                        return permission ? (
                                            <span 
                                                key={permId}
                                                className="px-2 py-1 bg-blue-500/30 text-blue-100 rounded text-xs"
                                            >
                                                {permission.name}
                                            </span>
                                        ) : null
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                    {Object.keys(roles).length === 0 && (
                        <p className="text-white/70 text-center py-8">No roles created yet</p>
                    )}
                </div>

                <Dialog open={showForm} onOpenChange={setShowForm}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {editingRole ? 'Edit Role' : 'Create Role'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                placeholder="Role name (e.g., Content Editor)"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                            />
                            
                            <div>
                                <h4 className="font-medium mb-2">Permissions:</h4>
                                <div className="max-h-48 overflow-y-auto space-y-2 border rounded p-3">
                                    {Object.entries(permissions).map(([permId, permission]) => (
                                        <label key={permId} className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.selectedPermissions.includes(permId)}
                                                onChange={() => togglePermission(permId)}
                                                className="rounded"
                                            />
                                            <span className="text-sm">
                                                <span className="font-medium">{permission.name}</span>
                                                {permission.description && (
                                                    <span className="text-gray-500 ml-1">
                                                        - {permission.description}
                                                    </span>
                                                )}
                                            </span>
                                        </label>
                                    ))}
                                    {Object.keys(permissions).length === 0 && (
                                        <p className="text-gray-500 text-sm">No permissions available</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" className="flex-1">
                                    {editingRole ? 'Update' : 'Create'}
                                </Button>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => {
                                        setShowForm(false)
                                        setEditingRole(null)
                                        setFormData({ name: '', selectedPermissions: [] })
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