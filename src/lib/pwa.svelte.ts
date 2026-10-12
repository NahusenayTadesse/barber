import { dev } from '$app/environment';

// Chromium-only event, not in the DOM typings yet
interface BeforeInstallPromptEvent extends Event {
	prompt(): Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'dashboard-install-dismissed';

/** Install state for the dashboard app, shared by the home-page card and the avatar menu. */
class DashboardApp {
	#prompt = $state<BeforeInstallPromptEvent | null>(null);
	/** Already running as the installed app */
	standalone = $state(false);
	/** iPhone/iPad Safari: no install prompt, the user adds it from the Share sheet */
	ios = $state(false);
	/** The user closed the home-page card */
	dismissed = $state(false);
	/** The iPhone "Add to Home Screen" steps sheet is open */
	showIosSteps = $state(false);
	#started = false;

	/** Chrome/Edge/Android: one tap shows the browser's own install dialog */
	get canPrompt() {
		return this.#prompt !== null;
	}

	/** Whether there is anything to offer: a prompt, or instructions for iOS */
	get installable() {
		return !this.standalone && (this.canPrompt || this.ios);
	}

	start() {
		if (this.#started || typeof window === 'undefined') return;
		this.#started = true;

		const standaloneQuery = window.matchMedia('(display-mode: standalone)');
		this.standalone =
			standaloneQuery.matches ||
			(navigator as Navigator & { standalone?: boolean }).standalone === true;
		standaloneQuery.addEventListener('change', (e) => (this.standalone = e.matches));

		this.ios =
			/iphone|ipad|ipod/i.test(navigator.userAgent) ||
			(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

		try {
			this.dismissed = localStorage.getItem(DISMISS_KEY) === '1';
		} catch {
			// Storage blocked (private mode); the card just shows again
		}

		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault(); // we show our own button instead of the mini-infobar
			this.#prompt = e as BeforeInstallPromptEvent;
		});
		window.addEventListener('appinstalled', () => {
			this.#prompt = null;
			this.standalone = true;
		});

		if ('serviceWorker' in navigator) {
			navigator.serviceWorker
				.register('/service-worker.js', {
					scope: '/dashboard',
					type: dev ? 'module' : 'classic'
				})
				.catch((error) => console.error('Dashboard service worker failed to register', error));
		}
	}

	/**
	 * Shows the browser's install dialog, or the iPhone steps. Resolves true if the
	 * user installed through the browser dialog.
	 */
	async install() {
		const prompt = this.#prompt;
		if (!prompt) {
			if (this.ios) this.showIosSteps = true;
			return false;
		}
		await prompt.prompt();
		const { outcome } = await prompt.userChoice;
		this.#prompt = null; // a prompt can only be used once
		return outcome === 'accepted';
	}

	dismiss() {
		this.dismissed = true;
		try {
			localStorage.setItem(DISMISS_KEY, '1');
		} catch {
			// Storage blocked; dismissed for this visit only
		}
	}
}

export const dashboardApp = new DashboardApp();
