// pages/api/nlp/process.js - ULTIMATE VERSION
const admin = require('../../../lib/firebase');
const { googleAiApiKey } = require('../../../lib/firebase-config');

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

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const user = await verifyToken(req);
        const { command } = req.body;

        if (!command) {
            return res.status(400).json({ error: 'Command is required' });
        }

        console.log('🎯 Processing command:', command);
        
        const commandLower = command.toLowerCase();
        const db = admin.database();

        // ===================================================
        // 🚀 ULTIMATE PATTERN MATCHING SYSTEM
        // ===================================================

        // 1. CREATE PERMISSION PATTERNS
        if (commandLower.includes('create') && commandLower.includes('permission')) {
            console.log('📝 Pattern matching: CREATE PERMISSION');
            
            const patterns = [
                /create\s+(?:a\s+|an\s+)?permission\s+called\s+['""]?([^'""\n]+)['""]?/i,
                /create\s+(?:a\s+|an\s+)?permission\s+['""]?([^'""\n]+)['""]?/i,
                /(?:add|make)\s+(?:a\s+|an\s+)?permission\s+['""]?([^'""\n]+)['""]?/i,
                /permission\s+called\s+['""]?([^'""\n]+)['""]?/i,
                /new\s+permission\s+['""]?([^'""\n]+)['""]?/i
            ];
            
            for (const pattern of patterns) {
                const match = command.match(pattern);
                if (match) {
                    const permissionName = match[1].trim();
                    console.log('✅ Pattern matched! Creating permission:', permissionName);
                    
                    try {
                        const newPermRef = db.ref('permissions').push();
                        await newPermRef.set({
                            name: permissionName,
                            description: '',
                            createdAt: admin.database.ServerValue.TIMESTAMP,
                            createdBy: user.uid
                        });
                        
                        return res.json({
                            success: true,
                            message: `✅ Created permission: "${permissionName}"`
                        });
                    } catch (dbError) {
                        console.error('Database error:', dbError);
                        return res.json({
                            success: false,
                            message: `❌ Error creating permission: ${dbError.message}`
                        });
                    }
                }
            }
        }

        // 2. CREATE ROLE PATTERNS  
        if (commandLower.includes('create') && commandLower.includes('role')) {
            console.log('📝 Pattern matching: CREATE ROLE');
            
            const patterns = [
                /create\s+(?:a\s+|an\s+)?role\s+called\s+['""]?([^'""\n]+)['""]?/i,
                /create\s+(?:a\s+|an\s+)?role\s+['""]?([^'""\n]+)['""]?/i,
                /(?:add|make)\s+(?:a\s+|an\s+)?role\s+['""]?([^'""\n]+)['""]?/i,
                /role\s+called\s+['""]?([^'""\n]+)['""]?/i,
                /new\s+role\s+['""]?([^'""\n]+)['""]?/i
            ];
            
            for (const pattern of patterns) {
                const match = command.match(pattern);
                if (match) {
                    const roleName = match[1].trim();
                    console.log('✅ Pattern matched! Creating role:', roleName);
                    
                    try {
                        const newRoleRef = db.ref('roles').push();
                        await newRoleRef.set({
                            name: roleName,
                            createdAt: admin.database.ServerValue.TIMESTAMP,
                            createdBy: user.uid
                        });
                        
                        return res.json({
                            success: true,
                            message: `✅ Created role: "${roleName}"`
                        });
                    } catch (dbError) {
                        console.error('Database error:', dbError);
                        return res.json({
                            success: false,
                            message: `❌ Error creating role: ${dbError.message}`
                        });
                    }
                }
            }
        }

        // 3. ASSIGN PERMISSION PATTERNS (MOST COMPLEX)
        if (commandLower.includes('give') || commandLower.includes('allow') || 
            commandLower.includes('grant') || commandLower.includes('assign') ||
            commandLower.includes('able to') || commandLower.includes('can') ||
            commandLower.includes('should have') || commandLower.includes('access to')) {
            
            console.log('📝 Pattern matching: ASSIGN PERMISSION');
            
            let roleName = null;
            let permissionName = null;
            
            // Ultra comprehensive patterns for assignment
            const assignmentPatterns = [
                // "Give [role] [permission]"
                /give\s+(?:the\s+)?(?:role\s+)?['""]?([^'""\n,]+)['""]?\s+(?:the\s+)?(?:permission\s+(?:to\s+)?)?['""]?([^'""\n]+)['""]?/i,
                
                // "Allow [role] to [permission]"
                /allow\s+(?:the\s+)?(?:role\s+)?['""]?([^'""\n,]+)['""]?\s+to\s+['""]?([^'""\n]+)['""]?/i,
                
                // "Grant [role] access to [permission]"
                /grant\s+(?:the\s+)?(?:role\s+)?['""]?([^'""\n,]+)['""]?\s+(?:access\s+to\s+)?['""]?([^'""\n]+)['""]?/i,
                
                // "Make [role] able to [permission]"
                /make\s+(?:the\s+)?(?:role\s+)?['""]?([^'""\n,]+)['""]?\s+(?:role\s+)?able\s+to\s+['""]?([^'""\n]+)['""]?/i,
                
                // "[role] should have [permission]"
                /^(?:the\s+)?(?:role\s+)?['""]?([^'""\n,]+)['""]?\s+should\s+have\s+(?:the\s+)?(?:permission\s+(?:to\s+)?)?['""]?([^'""\n]+)['""]?/i,
                
                // "[role] can [permission]"
                /^(?:the\s+)?(?:role\s+)?['""]?([^'""\n,]+)['""]?\s+can\s+['""]?([^'""\n]+)['""]?/i,
                
                // "Assign [permission] to [role]"
                /assign\s+(?:the\s+)?(?:permission\s+)?['""]?([^'""\n,]+)['""]?\s+to\s+(?:the\s+)?(?:role\s+)?['""]?([^'""\n]+)['""]?/i,
                
                // "Let [role] [permission]"
                /let\s+(?:the\s+)?(?:role\s+)?['""]?([^'""\n,]+)['""]?\s+['""]?([^'""\n]+)['""]?/i
            ];
            
            for (const pattern of assignmentPatterns) {
                const match = command.match(pattern);
                if (match) {
                    // For "assign X to Y" pattern, swap the order
                    if (pattern.source.includes('assign')) {
                        permissionName = match[1].trim();
                        roleName = match[2].trim();
                    } else {
                        roleName = match[1].trim();
                        permissionName = match[2].trim();
                    }
                    console.log('✅ Assignment pattern matched!', { roleName, permissionName });
                    break;
                }
            }
            
            // Clean up extracted names
            if (roleName) {
                roleName = roleName
                    .replace(/^(the\s+)?(.+?)(\s+role)?$/i, '$2')
                    .trim();
            }
            if (permissionName) {
                permissionName = permissionName
                    .replace(/^(permission\s+to\s+|to\s+|the\s+)/i, '')
                    .trim();
            }
            
            console.log('📝 Final extracted values:', { roleName, permissionName });
            
            if (roleName && permissionName) {
                try {
                    // Get current data
                    const rolesSnap = await db.ref('roles').once('value');
                    const permsSnap = await db.ref('permissions').once('value');
                    
                    const roles = rolesSnap.val() || {};
                    const permissions = permsSnap.val() || {};

                    console.log('📊 Available roles:', Object.values(roles).filter(r => r && r.name).map(r => r.name));
                    console.log('📊 Available permissions:', Object.values(permissions).filter(p => p && p.name).map(p => p.name));

                    // Find role by name (case insensitive, fuzzy matching)
                    const roleId = Object.keys(roles).find(id => 
                        roles[id] && roles[id].name && 
                        roles[id].name.toLowerCase().includes(roleName.toLowerCase())
                    ) || Object.keys(roles).find(id => 
                        roles[id] && roles[id].name && 
                        roleName.toLowerCase().includes(roles[id].name.toLowerCase())
                    );
                    
                    // Find permission by name (case insensitive, fuzzy matching)
                    const permissionId = Object.keys(permissions).find(id => 
                        permissions[id] && permissions[id].name && 
                        permissions[id].name.toLowerCase().includes(permissionName.toLowerCase())
                    ) || Object.keys(permissions).find(id => 
                        permissions[id] && permissions[id].name && 
                        permissionName.toLowerCase().includes(permissions[id].name.toLowerCase())
                    );

                    if (!roleId) {
                        const availableRoles = Object.values(roles)
                            .filter(r => r && r.name)
                            .map(r => r.name)
                            .join(', ');
                        return res.json({
                            success: false,
                            message: `❌ Role "${roleName}" not found. Available roles: ${availableRoles}`
                        });
                    }

                    if (!permissionId) {
                        const availablePerms = Object.values(permissions)
                            .filter(p => p && p.name)
                            .map(p => p.name)
                            .join(', ');
                        return res.json({
                            success: false,
                            message: `❌ Permission "${permissionName}" not found. Available permissions: ${availablePerms}`
                        });
                    }

                    // Assign permission to role
                    await db.ref(`role_permissions/${roleId}/${permissionId}`).set(true);
                    
                    return res.json({
                        success: true,
                        message: `✅ Assigned "${permissions[permissionId].name}" to "${roles[roleId].name}"`
                    });
                    
                } catch (dbError) {
                    console.error('Database error:', dbError);
                    return res.json({
                        success: false,
                        message: `❌ Database error: ${dbError.message}`
                    });
                }
            }
        }

        // ===================================================
        // 🤖 AI FALLBACK SYSTEM
        // ===================================================
        
        console.log('🤖 Pattern matching failed, trying AI fallback...');
        
        if (!googleAiApiKey || googleAiApiKey === 'AIzaSyBEGkSHzbWrDvSORophZHVmfU2IZAVOQIE') {
            return res.json({
                success: false,
                message: "❌ Pattern matching failed and AI not configured. Try these formats:\n• 'Create a permission called [name]'\n• 'Create a role called [name]'\n• 'Give [role] [permission]'"
            });
        }

        try {
            console.log('🤖 Calling Google AI API...');
            
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${googleAiApiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are an RBAC (Role-Based Access Control) command parser. Parse this natural language command and return ONLY a valid JSON response.

Valid actions: "create_permission", "create_role", "assign_permission"

Examples:
"Create a permission called edit articles" -> {"action": "create_permission", "name": "edit articles"}
"Make a role called Super Admin" -> {"action": "create_role", "name": "Super Admin"}
"Give Admin the ability to delete users" -> {"action": "assign_permission", "role": "Admin", "permission": "delete users"}
"Allow Editor to publish posts" -> {"action": "assign_permission", "role": "Editor", "permission": "publish posts"}
"Let Moderator ban users" -> {"action": "assign_permission", "role": "Moderator", "permission": "ban users"}

Command to parse: "${command}"

Return ONLY the JSON object, no other text.`
                        }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`AI API returned ${response.status}: ${response.statusText}`);
            }

            const aiData = await response.json();
            console.log('🤖 AI Raw Response:', JSON.stringify(aiData, null, 2));

            if (!aiData.candidates || !aiData.candidates[0] || !aiData.candidates[0].content) {
                throw new Error('Invalid AI response structure');
            }

            const aiResponse = aiData.candidates[0].content.parts[0].text;
            console.log('🤖 AI Text Response:', aiResponse);
            
            // Clean and parse AI response
            const cleanedResponse = aiResponse
                .replace(/```json\s*/g, '')
                .replace(/```\s*/g, '')
                .replace(/^[^{]*({.*})[^}]*$/s, '$1')
                .trim();
            
            console.log('🤖 Cleaned Response:', cleanedResponse);
            
            const parsedCommand = JSON.parse(cleanedResponse);
            console.log('🤖 Parsed AI Command:', parsedCommand);

            // Execute AI-parsed command
            switch (parsedCommand.action) {
                case 'create_permission':
                    const newPermRef = db.ref('permissions').push();
                    await newPermRef.set({
                        name: parsedCommand.name,
                        description: '',
                        createdAt: admin.database.ServerValue.TIMESTAMP,
                        createdBy: user.uid
                    });
                    return res.json({
                        success: true,
                        message: `✅ AI created permission: "${parsedCommand.name}"`
                    });

                case 'create_role':
                    const newRoleRef = db.ref('roles').push();
                    await newRoleRef.set({
                        name: parsedCommand.name,
                        createdAt: admin.database.ServerValue.TIMESTAMP,
                        createdBy: user.uid
                    });
                    return res.json({
                        success: true,
                        message: `✅ AI created role: "${parsedCommand.name}"`
                    });

                case 'assign_permission':
                    const rolesSnap = await db.ref('roles').once('value');
                    const permsSnap = await db.ref('permissions').once('value');
                    
                    const roles = rolesSnap.val() || {};
                    const permissions = permsSnap.val() || {};

                    const roleId = Object.keys(roles).find(id => 
                        roles[id] && roles[id].name && 
                        roles[id].name.toLowerCase() === parsedCommand.role.toLowerCase()
                    );
                    const permissionId = Object.keys(permissions).find(id => 
                        permissions[id] && permissions[id].name && 
                        permissions[id].name.toLowerCase() === parsedCommand.permission.toLowerCase()
                    );

                    if (!roleId) {
                        return res.json({
                            success: false,
                            message: `❌ AI: Role "${parsedCommand.role}" not found`
                        });
                    }

                    if (!permissionId) {
                        return res.json({
                            success: false,
                            message: `❌ AI: Permission "${parsedCommand.permission}" not found`
                        });
                    }

                    await db.ref(`role_permissions/${roleId}/${permissionId}`).set(true);
                    return res.json({
                        success: true,
                        message: `✅ AI assigned "${permissions[permissionId].name}" to "${roles[roleId].name}"`
                    });

                default:
                    return res.json({
                        success: false,
                        message: `❌ AI returned unknown action: ${parsedCommand.action}`
                    });
            }

        } catch (aiError) {
            console.error('🤖 AI Processing Failed:', aiError.message);
            console.error('🤖 Full AI Error:', aiError);
            
            return res.json({
                success: false,
                message: `❌ AI processing failed: ${aiError.message}. Try these formats:\n• 'Create a permission called [name]'\n• 'Create a role called [name]'\n• 'Give [role] [permission]'`
            });
        }

    } catch (error) {
        console.error('💥 Server Error:', error);
        return res.status(500).json({ 
            success: false,
            message: `❌ Server error: ${error.message}`
        });
    }
}