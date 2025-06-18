// Push Notification Service for Staff Portal
import { useState, useEffect } from 'react';

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  subscriptionTime?: string;
}

class PushNotificationService {
  private vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  private subscriptionsKey = 'staff_push_subscriptions';

  constructor() {
    if (typeof window !== 'undefined') {
      this.registerServiceWorker();
    }
  }

  // Register service worker
  private async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('❌ Service Worker not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registered:', registration);
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      console.log('✅ Service Worker ready');
      
      return registration;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      return null;
    }
  }

  // Check if notifications are supported
  public isNotificationSupported(): boolean {
    return typeof window !== 'undefined' && 
           'Notification' in window && 
           'serviceWorker' in navigator && 
           'PushManager' in window;
  }

  // Request notification permission
  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isNotificationSupported()) return 'denied';
    
    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }
    
    return Notification.permission;
  }

  // Subscribe to push notifications
  public async subscribe(): Promise<PushSubscription | null> {
    if (!this.vapidPublicKey) {
      console.error('❌ VAPID public key not configured');
      return null;
    }

    try {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.warn('❌ Notification permission denied');
        return null;
      }

      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        console.error('❌ Service Worker not available');
        return null;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      console.log('✅ Push subscription created:', subscription);
      
      // Save subscription locally and send to server
      await this.saveSubscription(subscription);
      
      return subscription;
    } catch (error) {
      console.error('❌ Push subscription failed:', error);
      return null;
    }
  }

  // Save subscription to localStorage and send to server
  private async saveSubscription(subscription: PushSubscription): Promise<void> {
    const subscriptionData: PushSubscriptionData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
      },
      userAgent: navigator.userAgent,
      subscriptionTime: new Date().toISOString()
    };

    // Save to localStorage
    const existing = this.getStoredSubscriptions();
    const updated = [...existing.filter(sub => sub.endpoint !== subscriptionData.endpoint), subscriptionData];
    localStorage.setItem(this.subscriptionsKey, JSON.stringify(updated));

    // Send to server
    try {
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionData),
      });

      if (response.ok) {
        console.log('✅ Subscription saved to server');
      } else {
        console.error('❌ Failed to save subscription to server');
      }
    } catch (error) {
      console.error('❌ Error saving subscription to server:', error);
    }
  }

  // Get stored subscriptions
  private getStoredSubscriptions(): PushSubscriptionData[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(this.subscriptionsKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Check if user is already subscribed
  public async isSubscribed(): Promise<boolean> {
    if (!this.isNotificationSupported()) return false;

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return false;

      const subscription = await registration.pushManager.getSubscription();
      return !!subscription;
    } catch {
      return false;
    }
  }

  // Unsubscribe from push notifications
  public async unsubscribe(): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return false;

      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) return false;

      const result = await subscription.unsubscribe();
      
      if (result) {
        // Remove from localStorage
        const existing = this.getStoredSubscriptions();
        const updated = existing.filter(sub => sub.endpoint !== subscription.endpoint);
        localStorage.setItem(this.subscriptionsKey, JSON.stringify(updated));

        // Notify server
        try {
          await fetch('/api/push/unsubscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ endpoint: subscription.endpoint }),
          });
        } catch (error) {
          console.error('❌ Error notifying server of unsubscription:', error);
        }

        console.log('✅ Successfully unsubscribed from push notifications');
      }

      return result;
    } catch (error) {
      console.error('❌ Error unsubscribing:', error);
      return false;
    }
  }

  // Test notification
  public async testNotification(): Promise<void> {
    if (!this.isNotificationSupported()) {
      alert('Notifications are not supported on this device');
      return;
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      alert('Please enable notifications to receive booking alerts');
      return;
    }

    // Show local test notification
    new Notification('New Surf Lesson Booked!', {
      body: 'John Test has booked a lesson at Doheny!',
      icon: '/zek-surf-icon.ico',
      tag: 'test-notification',
      requireInteraction: true
    });
  }

  // Utility functions
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  // Get permission status
  public getPermissionStatus(): NotificationPermission {
    if (!this.isNotificationSupported()) return 'denied';
    return Notification.permission;
  }

  // Check if this is likely an iOS device
  public isIOSDevice(): boolean {
    if (typeof window === 'undefined') return false;
    
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  // iOS specific setup instructions
  public getIOSInstructions(): string[] {
    return [
      '1. Open Safari and navigate to this website',
      '2. Tap the Share button (square with arrow)',
      '3. Select "Add to Home Screen"',
      '4. Open the app from your home screen',
      '5. Enable notifications when prompted',
      '6. You\'ll now receive push notifications for new bookings!'
    ];
  }
}

export const pushNotificationService = new PushNotificationService(); 