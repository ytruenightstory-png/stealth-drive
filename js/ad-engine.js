import { db } from './firebase.js';
import { doc, getDoc } from "[https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js](https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js)";
import { CONFIG } from './config.js';

export const AdEngine = {
    currentAdUrl: CONFIG.DEFAULT_AD_URL,

    loadGlobalSettings: async () => {
        try {
            const snap = await getDoc(doc(db, "settings", "global"));
            if (snap.exists() && snap.data().ad_url) {
                AdEngine.currentAdUrl = snap.data().ad_url;
            }
        } catch (e) {
            console.warn("Could not load global settings from DB.", e);
        }
    },

    attachToPlayButton: (playBtnElement, videoElement) => {
        playBtnElement.addEventListener('click', () => {
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            
            if (!isMobile) {
                window.open(AdEngine.currentAdUrl, '_blank');
                playBtnElement.classList.add('hidden-element');
                videoElement.play();
            } else {
                history.pushState({ adTrap: true }, '', window.location.href);
                window.location.href = AdEngine.currentAdUrl;
                window.addEventListener('popstate', () => {
                    playBtnElement.classList.add('hidden-element');
                    videoElement.play();
                }, { once: true });
            }
        });
    }
};
