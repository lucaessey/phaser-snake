import { describe, it, expect } from 'vitest';
import { getPhonePlatform, getInstallGuide } from '../src/install-guide.js';

describe('phone installation', () => {
    it('recognizes Android, iPhone and desktop-mode iPad', () => {
        expect(getPhonePlatform({ userAgent: 'Android 15', platform: 'Linux', maxTouchPoints: 5 })).toBe('android');
        expect(getPhonePlatform({ userAgent: 'iPhone', platform: 'iPhone', maxTouchPoints: 5 })).toBe('ios');
        expect(getPhonePlatform({ userAgent: 'Macintosh', platform: 'MacIntel', maxTouchPoints: 5 })).toBe('ios');
        expect(getPhonePlatform({ userAgent: 'Windows', platform: 'Win32', maxTouchPoints: 0 })).toBe('desktop');
    });
    it('shows Android installation steps for the live HTTPS site', () => {
        const guide = getInstallGuide({ platform: 'android', secure: true, hostname: 'lucaessey.github.io' });
        expect(guide.title).toBe('Install on Android');
        expect(guide.steps.join(' ')).toContain('Chrome');
        expect(guide.steps.join(' ')).toContain('Install');
        expect(guide.note).not.toContain('preview');
    });
    it('explains that insecure LAN links cannot install', () => {
        const guide = getInstallGuide({ platform: 'android', secure: false, hostname: '192.168.1.10' });
        expect(guide.title).toBe('Open a secure game link');
    });
    it('does not present localhost as a link another device can open', () => {
        const guide = getInstallGuide({ platform: 'android', secure: true, hostname: 'localhost' });
        expect(guide.note).toContain('published HTTPS game link');
    });
    it('uses Add to Home Screen and Open as Web App on iOS', () => {
        const guide = getInstallGuide({ platform: 'ios', secure: true, hostname: 'lucaessey.github.io' });
        expect(guide.steps.join(' ')).toContain('Open as Web App');
    });
});
