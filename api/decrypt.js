import CryptoJS from 'crypto-js';

export default function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    
    const { encryptedId } = req.body;
    if (!encryptedId) return res.status(400).json({ error: 'Missing encryptedId' });

    const secret = process.env.AES_SECRET || "SuperSecretKey2026!@#";
    
    try {
        const standardStr = encryptedId
            .replace(/p1L2u3S/g, '+')
            .replace(/s1L2a3S/g, '/')
            .replace(/e1Q2u3A/g, '=');
            
        const bytes = CryptoJS.AES.decrypt(standardStr, secret);
        const realId = bytes.toString(CryptoJS.enc.Utf8);
        
        if (!realId) throw new Error("Decryption failed");
        
        res.status(200).json({ realId });
    } catch (error) {
        res.status(400).json({ error: 'Invalid Encrypted ID' });
    }
}
