import CryptoJS from 'crypto-js';

export default function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    
    const { realId } = req.body;
    if (!realId) return res.status(400).json({ error: 'Missing realId' });

    // The secret is stored safely in Vercel Environment Variables
    const secret = process.env.AES_SECRET || "SuperSecretKey2026!@#";
    
    const encrypted = CryptoJS.AES.encrypt(realId, secret).toString()
        .replace(/\+/g, 'p1L2u3S')
        .replace(/\//g, 's1L2a3S')
        .replace(/=/g, 'e1Q2u3A');
        
    res.status(200).json({ encryptedId: encrypted });
}
