const admin = require('../../../lib/firebase');
const { firebaseConfig } = require('../../../lib/firebase-config');

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

export default async function handler(req, res) {
    if (handleCors(req, res)) return;

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, password } = req.body;
        
        const response = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`,
            {
                method: 'POST',
                body: JSON.stringify({
                    email,
                    password,
                    returnSecureToken: true
                }),
                headers: { 'Content-Type': 'application/json' }
            }
        );

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error?.message || 'Login failed');
        }

        const userRecord = await admin.auth().getUserByEmail(email);
        return res.json({
            token: data.idToken,
            user: {
                uid: userRecord.uid,
                email: userRecord.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: error.message });
    }
}