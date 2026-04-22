// ... existing top portion of player.js ...
        try {
            const docRef = doc(db, "videos", encryptedId);
            await updateDoc(docRef, { views: increment(1) }).catch(e => console.warn("View tracking failed"));

            // [UPDATED] Use await because decryptId is now an API call
            const realId = await CryptoModule.decryptId(encryptedId);
            if (!realId) throw new Error("Failed to decrypt ID via Server");

            const cdnUrl = `https://cdn.videy.co/${realId}.mp4`; 
            
            fetch(cdnUrl)
// ... remaining player.js code ...
