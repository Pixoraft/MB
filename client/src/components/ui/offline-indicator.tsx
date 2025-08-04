import { useState, useEffect } from 'react';
import { getNetworkStatus } from '@/lib/pwa-utils';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show indicator initially if offline
    if (!navigator.onLine) {
      setShowIndicator(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showIndicator) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
        isOnline
          ? 'bg-green-500 text-white'
          : 'bg-red-500 text-white'
      }`}
    >
      <div className="flex items-center space-x-2 text-sm font-medium">
        <div
          className={`w-2 h-2 rounded-full ${
            isOnline ? 'bg-green-200' : 'bg-red-200'
          }`}
        />
        <span>
          {isOnline ? '🟢 Back online! Syncing data...' : '🔴 You are offline. Changes will sync when reconnected.'}
        </span>
      </div>
    </div>
  );
}

export function PWAStatusBar() {
  const [isPWA, setIsPWA] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Check if running as PWA
    const checkPWA = () => {
      return window.matchMedia('(display-mode: standalone)').matches ||
             (window.navigator as any).standalone === true;
    };

    setIsPWA(checkPWA());

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <div className="bg-gray-900 dark:bg-gray-800 text-white text-xs px-3 py-1 rounded-full shadow-lg opacity-75">
        <div className="flex items-center space-x-2">
          {isPWA && (
            <span className="text-green-400">📱 PWA</span>
          )}
          <span className={isOnline ? 'text-green-400' : 'text-red-400'}>
            {isOnline ? '🟢 Online' : '🔴 Offline'}
          </span>
        </div>
      </div>
    </div>
  );
}