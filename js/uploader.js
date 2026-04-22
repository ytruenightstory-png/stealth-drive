// ... existing top portion of uploader.js ...
            try {
                if (!data.id && !data.url) throw new Error("No ID returned from CDN");
                const realId = data.id || data.url.split('/').pop().split('.')[0];
                
                // [UPDATED] Use await because encryptId is now an API call
                const encryptedId = await CryptoModule.encryptId(realId);
                if (!encryptedId) throw new Error("Failed to encrypt ID via Server");
                
                await setDoc(doc(db, "videos", encryptedId), {
                    real_cdn_id: realId,
                    cdn_provider: provider,
                    views: 0,
                    created_at: serverTimestamp()
                });

                let currentDomain = window.location.origin;
                if (currentDomain === 'file://' || currentDomain === 'null') currentDomain = 'http://localhost';
                const link = `${currentDomain}/v/${encryptedId}`;
// ... remaining uploader.js code ...
