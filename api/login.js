export default function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    
    const { password } = req.body;
    const truePassword = process.env.ADMIN_PASSWORD || "xY7$pL9@kQ2!"; 
    
    if (password === truePassword) {
        res.status(200).json({ success: true, token: "stealth_auth_valid_token_999" });
    } else {
        res.status(401).json({ success: false, error: "Unauthorized" });
    }
}
