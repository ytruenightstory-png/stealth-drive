import { db } from './firebase.js';
import { doc, setDoc, collection, getDocs, deleteDoc } from "[https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js](https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js)";
import { CONFIG } from './config.js';
import { AdEngine } from './ad-engine.js';

export const AdminModule = {
    renderLogin: (container) => {
        container.innerHTML = `
            <div class="min-h-screen flex items-center justify-center bg-gray-100">
                <div class="bg-white p-8 rounded-lg shadow-md w-96 text-center">
                    <h2 class="text-2xl font-bold mb-6">Admin Access</h2>
                    <input type="password" id="adminPass" placeholder="Enter Admin Password" class="w-full p-3 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-gray-800">
                    <button id="loginBtn" class="w-full bg-gray-900 text-white py-3 rounded font-bold hover:bg-gray-800 transition-colors">Enter Dashboard</button>
                    <p id="loginError" class="text-red-500 text-sm mt-3 hidden-element">Incorrect Password</p>
                </div>
            </div>
        `;
        document.getElementById('loginBtn').onclick = async () => {
            const pass = document.getElementById('adminPass').value;
            const btn = document.getElementById('loginBtn');
            const errorTxt = document.getElementById('loginError');
            
            btn.innerText = "Verifying...";
            btn.disabled = true;
            errorTxt.classList.add('hidden-element');

            try {
                // Call Vercel API securely
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: pass })
                });

                if (res.ok) {
                    const data = await res.json();
                    sessionStorage.setItem('stealth_admin_auth', data.token);
                    AdminModule.renderDashboard(container);
                } else {
                    errorTxt.classList.remove('hidden-element');
                }
            } catch (e) {
                console.error("Login API error", e);
                errorTxt.innerText = "Server Error";
                errorTxt.classList.remove('hidden-element');
            } finally {
                btn.innerText = "Enter Dashboard";
                btn.disabled = false;
            }
        };
    },

    renderDashboard: async (container) => {
        container.innerHTML = `
            <div class="min-h-screen bg-gray-100 p-8">
                <div class="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                    <div class="bg-gray-900 text-white p-6 flex justify-between items-center">
                        <h1 class="text-2xl font-bold">Platform Management</h1>
                        <button id="logoutBtn" class="text-sm bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">Logout</button>
                    </div>
                    
                    <div class="p-6">
                        <div class="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-100">
                            <h2 class="text-xl font-bold mb-4">Advertisement Configuration</h2>
                            <div class="flex gap-4">
                                <input type="text" id="adUrlInput" value="${AdEngine.currentAdUrl}" class="flex-grow p-3 border rounded focus:ring-2 focus:ring-blue-500" placeholder="Enter Target Ad URL">
                                <button id="saveAdBtn" class="bg-blue-600 text-white px-6 py-3 rounded font-bold hover:bg-blue-700">Update Link</button>
                            </div>
                            <p id="adSaveStatus" class="text-sm text-green-600 mt-2 hidden-element">Successfully updated ad link!</p>
                        </div>

                        <h2 class="text-xl font-bold mb-4">Video Database</h2>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="bg-gray-100">
                                        <th class="p-4 border-b font-semibold">Encrypted ID</th>
                                        <th class="p-4 border-b font-semibold">CDN ID</th>
                                        <th class="p-4 border-b font-semibold">Views</th>
                                        <th class="p-4 border-b font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="videoTableBody">
                                    <tr><td colspan="4" class="p-4 text-center text-gray-500">Loading database...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('logoutBtn').onclick = () => {
            sessionStorage.removeItem('stealth_admin_auth');
            window.location.reload();
        };

        document.getElementById('saveAdBtn').onclick = async () => {
            const newUrl = document.getElementById('adUrlInput').value;
            try {
                await setDoc(doc(db, "settings", "global"), { ad_url: newUrl }, { merge: true });
                AdEngine.currentAdUrl = newUrl;
                const status = document.getElementById('adSaveStatus');
                status.classList.remove('hidden-element');
                setTimeout(() => status.classList.add('hidden-element'), 3000);
            } catch (e) {
                alert("Error saving settings. Check Firebase rules.");
            }
        };

        const tbody = document.getElementById('videoTableBody');
        try {
            const snapshot = await getDocs(collection(db, "videos"));
            let html = '';
            if (snapshot.empty) {
                html = `<tr><td colspan="4" class="p-4 text-center text-gray-500">No videos found.</td></tr>`;
            } else {
                snapshot.forEach(docSnap => {
                    const data = docSnap.data();
                    const docId = docSnap.id;
                    html += `
                        <tr class="hover:bg-gray-50" id="row-${docId}">
                            <td class="p-4 border-b font-mono text-xs truncate max-w-[150px]">${docId}</td>
                            <td class="p-4 border-b font-mono text-xs text-gray-500">${data.real_cdn_id}</td>
                            <td class="p-4 border-b font-bold text-blue-600">${data.views || 0}</td>
                            <td class="p-4 border-b">
                                <a href="/v/${docId}" target="_blank" class="text-blue-500 hover:underline mr-3 text-sm">View</a>
                                <button onclick="window.deleteVideo('${docId}')" class="text-red-500 hover:underline text-sm font-semibold">Delete</button>
                            </td>
                        </tr>
                    `;
                });
            }
            tbody.innerHTML = html;
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-red-500">Error loading database.</td></tr>`;
        }

        window.deleteVideo = async (docId) => {
            if(confirm("Are you sure you want to delete this record?")) {
                try {
                    await deleteDoc(doc(db, "videos", docId));
                    document.getElementById(`row-${docId}`).remove();
                } catch (e) {
                    alert("Failed to delete. Check Firebase rules.");
                }
            }
        };
    }
};
