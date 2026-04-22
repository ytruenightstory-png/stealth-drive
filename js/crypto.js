export const CryptoModule = {
    encryptId: async (realId) => {
        try {
            const res = await fetch('/api/encrypt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ realId })
            });
            if (!res.ok) throw new Error("Encryption API failed");
            const data = await res.json();
            return data.encryptedId;
        } catch (e) {
            console.error(e);
            return null;
        }
    },
    
    decryptId: async (encryptedStr) => {
        try {
            const res = await fetch('/api/decrypt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ encryptedId: encryptedStr })
            });
            if (!res.ok) throw new Error("Decryption API failed");
            const data = await res.json();
            return data.realId;
        } catch (e) {
            console.error(e);
            return null;
        }
    }
};
