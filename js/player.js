
        } catch (error) {
            container.innerHTML = `<div class="text-white bg-black h-screen flex items-center justify-center font-bold text-xl">VIDEO NOT FOUND OR CORRUPTED</div>`;
        }
    }
};
import { db } from './firebase.js';
import { doc, updateDoc, increment } from "[https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js](https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js)";
import { CryptoModule } from './crypto.js';
import { AdEngine } from './ad-engine.js';

export const PlayerModule = {
    render: async (container, encryptedId) => {
        container.innerHTML = `
            <div class="flex-grow flex items-center justify-center bg-black w-full min-h-screen relative overflow-hidden">
                <video id="mainVideo" class="w-full h-full max-h-screen object-contain" controls preload="auto"></video>
                <div id="custom-play-btn" class="hidden-element">
                    <svg width="40" height="40" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M10.804 8 5 4.633v6.734L10.804 8zm.792-.696a.802.802 0 0 1 0 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696l6.363 3.692z"/>
                    </svg>
                </div>
                <div id="loadingIndicator" class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div class="spinner"></div>
                    <span class="text-white text-sm mt-3 font-mono">Connecting to CDN...</span>
                </div>
            </div>
        `;

        const video = document.getElementById('mainVideo');
        const playBtn = document.getElementById('custom-play-btn');
        const loading = document.getElementById('loadingIndicator');
        
        try {
            const docRef = doc(db, "videos", encryptedId);
            await updateDoc(docRef, { views: increment(1) }).catch(e => console.warn("View tracking failed"));

            // Calls Backend API
            const realId = await CryptoModule.decryptId(encryptedId);
            if (!realId) throw new Error("Backend Decryption failed");

            const cdnUrl = `https://cdn.videy.co/${realId}.mp4`; 
            
            fetch(cdnUrl)
                .then(res => {
                    if (!res.ok) throw new Error("Network response was not ok");
                    return res.blob();
                })
                .then(blob => {
                    const blobUrl = URL.createObjectURL(blob);
                    video.src = blobUrl;
                    loading.classList.add('hidden-element');
                    playBtn.classList.remove('hidden-element');
                })
                .catch(err => {
                    video.src = cdnUrl;
                    loading.classList.add('hidden-element');
                    playBtn.classList.remove('hidden-element');
                });

            AdEngine.attachToPlayButton(playBtn, video);

            video.onpause = () => playBtn.classList.remove('hidden-element');
            video.onplay = () => playBtn.classList.add('hidden-element');
