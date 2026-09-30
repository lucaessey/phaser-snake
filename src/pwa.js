import { registerSW } from 'virtual:pwa-register';
import { getInstallGuide } from './install-guide.js';

let installPrompt;
let installing = false;
let installed = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const installListeners = new Set();

export function getInstallState() {
    if (installed) return 'installed';
    if (installing) return 'installing';
    return installPrompt ? 'available' : 'unavailable';
}

function notifyInstallState() {
    for (const listener of installListeners) listener(getInstallState());
}

export function subscribeInstallState(listener) {
    installListeners.add(listener);
    listener(getInstallState());
    return () => installListeners.delete(listener);
}

export function getInstallInstructions() {
    const guide = getInstallGuide();
    return guide.steps.join(' ');
}

function showInstallGuide() {
    const guide = getInstallGuide();
    const dialog = document.getElementById('install-guide');
    document.getElementById('install-guide-title').textContent = guide.title;
    const steps = guide.steps.map(text => {
        const item = document.createElement('li');
        item.textContent = text;
        return item;
    });
    document.getElementById('install-guide-steps').replaceChildren(...steps);
    document.getElementById('install-guide-note').textContent = guide.note;
    if (!dialog.open) dialog.showModal();
    return guide.steps.join(' ');
}
export async function requestInstall() {
    if (installed) return 'Snake is already installed on this device.';
    if (installing) return 'Follow the installation prompt in your browser.';
    if (!installPrompt) return showInstallGuide();
    const prompt = installPrompt;
    installPrompt = null;
    installing = true;
    notifyInstallState();
    try {
        await prompt.prompt();
        const { outcome } = await prompt.userChoice;
        return outcome === 'accepted' ? 'Installation requested. Follow your browser to finish.' :
            'Installation canceled. You can install later from your browser menu.';
    } catch (error) {
        console.warn('Installation prompt was unavailable.', error);
        return showInstallGuide();
    } finally {
        installing = false;
        notifyInstallState();
    }
}

export function setupPWA() {
    const installButton = document.getElementById('install-button');
    const status = document.getElementById('offline-status');
    const notice = document.getElementById('update-notice');
    let offlineReady = false;
    const updateStatus = () => {
        status.textContent = !navigator.onLine ? 'Offline' : offlineReady ? 'Ready to play offline' : '';
    };
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    updateStatus();
    subscribeInstallState(state => {
        installButton.hidden = state === 'installed';
        installButton.disabled = state === 'installing';
        installButton.textContent = state === 'installing' ? 'Installing…' : 'Install game';
    });
    window.addEventListener('beforeinstallprompt', event => {
        event.preventDefault();
        installPrompt = event;
        notifyInstallState();
    });
    window.addEventListener('appinstalled', () => {
        installed = true;
        installPrompt = null;
        notifyInstallState();
    });
    const standalone = window.matchMedia('(display-mode: standalone)');
    standalone.addEventListener('change', event => {
        if (event.matches) { installed = true; notifyInstallState(); }
    });
    installButton.addEventListener('click', () => { void requestInstall(); });
    document.getElementById('install-guide-close').addEventListener('click', () => {
        document.getElementById('install-guide').close();
    });
    const updateSW = registerSW({
        immediate: true,
        onNeedRefresh() { notice.hidden = false; },
        onOfflineReady() { offlineReady = true; updateStatus(); },
        onRegisterError(error) { console.warn('Offline support could not be enabled.', error); }
    });
    document.getElementById('update-button').addEventListener('click', async () => {
        try {
            await updateSW(true);
        } catch (error) {
            console.warn('The update could not be applied.', error);
        }
    });
    document.getElementById('dismiss-update').addEventListener('click', () => { notice.hidden = true; });
}
