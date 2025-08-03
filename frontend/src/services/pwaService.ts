import { env } from '../config/env';

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class PWAService {
  private registration: ServiceWorkerRegistration | null = null;

  async init() {
    if ('serviceWorker' in navigator) {
      try {
        // Register service worker
        this.registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker registered');

        // Check for updates
        this.registration.addEventListener('updatefound', () => {
          const newWorker = this.registration!.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated') {
                this.notifyUpdate();
              }
            });
          }
        });

        // Request notification permission
        await this.requestNotificationPermission();
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (!this.registration) {
      console.error('Service Worker not registered');
      return null;
    }

    try {
      // Convert the public key
      const vapidPublicKey = env.REACT_APP_VAPID_PUBLIC_KEY || '';
      if (!vapidPublicKey) {
        throw new Error('VAPID public key not found');
      }
      const convertedVapidKey = this.urlBase64ToUint8Array(vapidPublicKey);

      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      return {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')),
          auth: this.arrayBufferToBase64(subscription.getKey('auth'))
        }
      };
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  async showNotification(title: string, options?: NotificationOptions) {
    if (this.registration && Notification.permission === 'granted') {
      await this.registration.showNotification(title, {
        icon: '/logo192.png',
        badge: '/logo192.png',
        ...options
      });
    }
  }

  async checkForUpdate() {
    if (this.registration) {
      await this.registration.update();
    }
  }

  private notifyUpdate() {
    // You can show a toast or modal here
    if (window.confirm('Versi baru tersedia! Muat ulang untuk update?')) {
      window.location.reload();
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer | null): string {
    if (!buffer) return '';
    
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  // Install prompt handling
  private deferredPrompt: any = null;

  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA installed');
      this.deferredPrompt = null;
    });
  }

  private showInstallButton() {
    // Dispatch custom event that components can listen to
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
  }

  async promptInstall() {
    if (!this.deferredPrompt) {
      return false;
    }

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    
    this.deferredPrompt = null;
    return outcome === 'accepted';
  }

  isStandalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone ||
           document.referrer.includes('android-app://');
  }
}

export const pwaService = new PWAService();