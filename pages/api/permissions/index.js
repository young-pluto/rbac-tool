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
                const permissionsSnapshot = await db.ref('permissions').once('value');
                return res.json(permissionsSnapshot.val() || {});

            case 'POST':
                const { name, description } = req.body;
                if (!name) {
                    return res.status(400).json({ error: 'Permission name is required' });
                }

                const newPermissionRef = db.ref('permissions').push();
                await newPermissionRef.set({
                    name,
                    description: description || '',
                    createdAt: admin.database.ServerValue.TIMESTAMP,
                    createdBy: user.uid
                });

                return res.json({
                    id: newPermissionRef.key,
                    name,
                    description
                });

            case 'PUT':
                const { id, name: updateName, description: updateDesc } = req.body;
                if (!id) {
                    return res.status(400).json({ error: 'Permission ID is required' });
                }

                await db.ref(`permissions/${id}`).update({
                    name: updateName,
                    description: updateDesc,
                    updatedAt: admin.database.ServerValue.TIMESTAMP
                });

                return res.json({ success: true });

            case 'DELETE':
                const { id: deleteId } = req.body;
                if (!deleteId) {
                    return res.status(400).json({ error: 'Permission ID is required' });
                }

                const rolesSnapshot = await db.ref('role_permissions').once('value');
                const rolePermissions = rolesSnapshot.val() || {};
                
                for (const [roleId, permissions] of Object.entries(rolePermissions)) {
                    if (permissions[deleteId]) {
                        await db.ref(`role_permissions/${roleId}/${deleteId}`).remove();
                    }
                }

                await db.ref(`permissions/${deleteId}`).remove();
                return res.json({ success: true });

            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Permissions error:', error);
        return res.status(500).json({ error: error.message });
    }
}