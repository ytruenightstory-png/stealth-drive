import { db } from './firebase.js';
import { doc, setDoc, serverTimestamp } from "[https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js](https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js)";
import { CryptoModule } from './crypto.js';
import { CONFIG } from './config.js';

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export const UploaderModule = {
    render: (container) => {
        container.innerHTML = `
            <header class="pt-4 pb-4 border-b border-gray-200 bg-white shadow-sm">
                <div class="max-w-6xl mx-auto px-6 flex justify-between items-center">
                    <span class="font-bold text-2xl tracking-tight text-gray-900">StealthDrive</span>
                </div>
            </header>
            <div class="flex-grow flex items-center justify-center p-6">
                <div class="max-w-xl w-full text-center space-y-6">
                    <h1 class="text-4xl font-extrabold tracking-tight">Upload Securely</h1>
                    <p class="text-gray-500">Encrypted, anonymous, and lightning fast.</p>
                    
                    <div class="p-8 bg-white shadow-2xl rounded-2xl border border-gray-100 mt-8">
                        <input type="file" id="fileInput" class="hidden" accept="video/mp4,video/quicktime" />
                        <button id="uploadBtn" class="bg-gray-900 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition-all shadow-lg">
                            Select Video to Upload
                        </button>
                        <p id="statusTxt" class="mt-6 text-sm font-medium text-gray-500"></p>
                        
                        <div id="resultBox" class="hidden mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <p class="text-xs text-gray-400 mb-2 text-left font-semibold uppercase">Your Encrypted Link</p>
                            <div class="flex gap-2">
                                <input type="text" id="shareLink" readonly class="flex-grow p-3 border rounded-md bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                <button id="copyBtn" class="bg-blue-600 text-white px-5 rounded-md hover:bg-blue-700 font-semibold transition-colors">Copy</button>
                            </div>
                            <a id="previewLink" href="#" target="_blank" class="block mt-4 text-sm text-blue-600 hover:underline font-medium">Open Player in New Tab &rarr;</a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const fileInput = document.getElementById('fileInput');
        const uploadBtn = document.getElementById('uploadBtn');
        const statusTxt = document.getElementById('statusTxt');
        const resultBox = document.getElementById('resultBox');
        const shareLink = document.getElementById('shareLink');
        const copyBtn = document.getElementById('copyBtn');
        const previewLink = document.getElementById('previewLink');

        uploadBtn.onclick = () => fileInput.click();

        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            uploadBtn.disabled = true;
            uploadBtn.classList.add('opacity-50', 'cursor-not-allowed');
            statusTxt.innerHTML = `<span class="animate-pulse text-blue-600">Uploading to Proxy Network...</span>`;
            resultBox.classList.add('hidden');

            const formData = new FormData();
            formData.append('file', file);
            let data = {};
            let provider = 'worker_pool';

            try {
                if (CONFIG.WORKER_UPLOAD_URL && !CONFIG.WORKER_UPLOAD_URL.includes('yourdomain')) {
                    const response = await fetch(CONFIG.WORKER_UPLOAD_URL, { method: 'POST', body: formData });
                    data = await response.json();
                } else { throw new Error("Worker not configured."); }
            } catch (workerErr) {
                console.warn("Falling back to direct upload:", workerErr.message);
                statusTxt.innerHTML = `<span class="animate-pulse text-yellow-600">Using direct upload fallback...</span>`;
                provider = 'direct_videy';
                
                try {
                    const visitorId = generateUUID();
                    const fallbackResponse = await fetch(`https://videy.co/api/upload?visitorId=${visitorId}`, { method: 'POST', body: formData });
                    const text = await fallbackResponse.text();
                    try { data = JSON.parse(text); } catch (e) { data = { id: text.trim() }; }
                } catch (directErr) {
                    statusTxt.innerHTML = `<span class="text-red-600 font-bold">Upload Blocked (CORS Error).</span><br/><span class="text-xs text-gray-500">Please configure the Cloudflare Worker URL.</span>`;
                    uploadBtn.disabled = false;
                    uploadBtn.classList.remove('opacity-50');
                    fileInput.value = '';
                    return;
                }
            }

            try {
                if (!data.id && !data.url) throw new Error("No ID returned from CDN");
                const realId = data.id || data.url.split('/').pop().split('.')[0];
                
                // Calls Backend API
                const encryptedId = await CryptoModule.encryptId(realId);
                if (!encryptedId) throw new Error("Backend Encryption failed");
                
                await setDoc(doc(db, "videos", encryptedId), {
                    real_cdn_id: realId,
                    cdn_provider: provider,
                    views: 0,
                    created_at: serverTimestamp()
                });

                let currentDomain = window.location.origin;
                if (currentDomain === 'file://' || currentDomain === 'null') currentDomain = 'http://localhost';
                const link = `${currentDomain}/v/${encryptedId}`;
                
                shareLink.value = link;
                previewLink.href = link;
                statusTxt.innerHTML = `<span class="text-green-600 font-bold">Upload Complete!</span>`;
                resultBox.classList.remove('hidden');

            } catch (err) {
                statusTxt.innerHTML = `<span class="text-red-600 font-bold">Database Save Failed.</span>`;
                console.error("Database Error:", err);
            } finally {
                uploadBtn.disabled = false;
                uploadBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                fileInput.value = '';
            }
        };

        copyBtn.onclick = () => {
            shareLink.select();
            document.execCommand('copy');
            copyBtn.innerText = 'Copied!';
            copyBtn.classList.replace('bg-blue-600', 'bg-green-600');
            setTimeout(() => {
                copyBtn.innerText = 'Copy';
                copyBtn.classList.replace('bg-green-600', 'bg-blue-600');
            }, 2000);
        };
    }
};
