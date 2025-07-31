const admin = require('../../../lib/firebase');

const corsHeaders = {
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function handleCors(req, res) {
    if (req.method === 'OPTIONS') {
        res.writeHead(200, corsHeaders);
        res.end();
        return true;
    }
    Object.entries(corsHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
    });
    return false;
}

async function verifyToken(req) {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) throw new Error('No token provided');
    
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
}

export default async function handler(req, res) {
    if (handleCors(req, res)) return;

    try {
        const user = await verifyToken(req);
        const db = admin.database();

        switch (req.method) {
            case 'GET':
                const rolesSnapshot = await db.ref('roles').once('value');
                const rolePermissionsSnapshot = await db.ref('role_permissions').once('value');
                
                const roles = rolesSnapshot.val() || {};
                const rolePermissions = rolePermissionsSnapshot.val() || {};

                // Attach permissions to each role
                for (const [roleId, role] of Object.entries(roles)) {
                    roles[roleId].permissions = rolePermissions[roleId] || {};
                }

                return res.json(roles);

            case 'POST':
                const { name, permissions = [] } = req.body;
                if (!name) {
                    return res.status(400).json({ error: 'Role name is required' });
                }

                const newRoleRef = db.ref('roles').push();
                await newRoleRef.set({
                    name,
                    createdAt: admin.database.ServerValue.TIMESTAMP,
                    createdBy: user.uid
                });

                // Add permissions if provided
                if (permissions.length > 0) {
                    const permissionsObj = {};
                    permissions.forEach(permId => {
                        permissionsObj[permId] = true;
                    });
                    await db.ref(`role_permissions/${newRoleRef.key}`).set(permissionsObj);
                }

                return res.json({
                    id: newRoleRef.key,
                    name,
                    permissions: permissions.reduce((acc, p) => ({ ...acc, [p]: true }), {})
                });

            case 'PUT':
                const { id, name: updateName, permissions: updatePermissions = [] } = req.body;
                if (!id) {
                    return res.status(400).json({ error: 'Role ID is required' });
                }

                await db.ref(`roles/${id}`).update({
                    name: updateName,
                    updatedAt: admin.database.ServerValue.TIMESTAMP
                });

                // Update permissions
                await db.ref(`role_permissions/${id}`).remove();
                if (updatePermissions.length > 0) {
                    const permissionsObj = {};
                    updatePermissions.forEach(permId => {
                        permissionsObj[permId] = true;
                    });
                    await db.ref(`role_permissions/${id}`).set(permissionsObj);
                }

                return res.json({ success: true });

            case 'DELETE':
                const { id: deleteId } = req.body;
                if (!deleteId) {
                    return res.status(400).json({ error: 'Role ID is required' });
                }

                await db.ref(`roles/${deleteId}`).remove();
                await db.ref(`role_permissions/${deleteId}`).remove();
                return res.json({ success: true });

            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Roles error:', error);
        return res.status(500).json({ error: error.message });
    }
};