export function getPhonePlatform(navigatorInfo = navigator) {
    if (/iPad|iPhone|iPod/.test(navigatorInfo.userAgent) ||
        (navigatorInfo.platform === 'MacIntel' && navigatorInfo.maxTouchPoints > 1)) return 'ios';
    if (/Android/.test(navigatorInfo.userAgent)) return 'android';
    return 'desktop';
}

export function getInstallGuide({
    platform = getPhonePlatform(),
    secure = window.isSecureContext,
    hostname = window.location.hostname
} = {}) {
    if (!secure) return {
        title: 'Open a secure game link',
        steps: ['Open the published game using its https:// address.', 'Return to Install game to add it to your phone.'],
        note: 'Installation and offline play need a secure connection. An http:// address on your home network will not work.'
    };
    const preview = ['localhost', '127.0.0.1', '[::1]'].includes(hostname);
    const note = preview ? 'This is a preview on this device. To install on your phone, open the published HTTPS game link on your phone.' :
        'Once the game is ready offline, you can play without an internet connection.';
    if (platform === 'ios') return {
        title: 'Install on iPhone or iPad',
        steps: ['Open this game in Safari.', 'Tap Share, then Add to Home Screen. You may need to scroll down.', 'Keep Open as Web App turned on if it appears, then tap Add.'],
        note
    };
    if (platform === 'android') return {
        title: 'Install on Android',
        steps: ['Open this game in Chrome, outside any in-app browser.', 'Tap the three-dot menu and choose Add to Home screen or Install app.', 'Choose Install and confirm.'],
        note
    };
    return {
        title: 'Install Snake',
        steps: ['Open this game in Chrome or Edge, outside any in-app browser.', 'Choose Install from the address bar or browser menu.', 'To install on a phone, open the game link in Safari on iPhone or Chrome on Android.'],
        note
    };
}
