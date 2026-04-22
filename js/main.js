import { AdEngine } from './ad-engine.js';
import { UploaderModule } from './uploader.js';
import { PlayerModule } from './player.js';
import { AdminModule } from './admin.js';

async function routeApp() {
    await AdEngine.loadGlobalSettings(); 

    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    const appContainer = document.getElementById('app-container');
    appContainer.innerHTML = ''; 

    if (path.startsWith('/admin') || searchParams.has('admin')) {
        document.title = "Admin Dashboard";
        if (sessionStorage.getItem('stealth_admin_auth') === 'stealth_auth_valid_token_999') {
            AdminModule.renderDashboard(appContainer);
        } else {
            AdminModule.renderLogin(appContainer);
        }
    } else if (path.startsWith('/v/')) {
        const encryptedId = path.split('/v/')[1].replace('/', '');
        document.title = "Watching Video - StealthDrive";
        PlayerModule.render(appContainer, encryptedId);
    } else if (searchParams.has('v')) {
        const encryptedId = searchParams.get('v');
        document.title = "Watching Video - StealthDrive";
        PlayerModule.render(appContainer, encryptedId);
    } else {
        document.title = "Upload - StealthDrive";
        UploaderModule.render(appContainer);
    }
}

window.addEventListener('popstate', routeApp);
document.addEventListener('DOMContentLoaded', routeApp);
