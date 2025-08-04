// PWA utility functions

// Register service worker
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available, prompt user to refresh
                  if (confirm('New version available! Refresh to update?')) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });

    // Listen for SW messages
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SW_UPDATED') {
        window.location.reload();
      }
    });
  }
};

// Check if app is installed as PWA
export const isPWA = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
};

// Show install prompt
export const showInstallPrompt = () => {
  let deferredPrompt: any;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show custom install button
    const installButton = document.createElement('button');
    installButton.textContent = 'Install App';
    installButton.className = 'fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    installButton.onclick = () => {
      // Hide the button
      installButton.style.display = 'none';
      // Show the prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        deferredPrompt = null;
      });
    };
    
    // Only show if not already installed
    if (!isPWA()) {
      document.body.appendChild(installButton);
      
      // Auto-hide after 10 seconds
      setTimeout(() => {
        if (installButton.parentNode) {
          installButton.remove();
        }
      }, 10000);
    }
  });

  // Handle app installation
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    // Hide any install prompts
    const installButton = document.querySelector('button');
    if (installButton && installButton.textContent === 'Install App') {
      installButton.remove();
    }
  });
};

// Sync offline data when back online
export const syncOfflineData = () => {
  window.addEventListener('online', () => {
    console.log('Back online, syncing data...');
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SYNC_OFFLINE_REQUESTS' });
    }
    
    // Show notification that we're back online
    const notification = document.createElement('div');
    notification.textContent = '🟢 Back online! Syncing your data...';
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  });

  window.addEventListener('offline', () => {
    console.log('Gone offline');
    
    // Show offline notification
    const notification = document.createElement('div');
    notification.textContent = '🔴 You are offline. Changes will sync when you reconnect.';
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  });
};

// Initialize PWA features
export const initializePWA = () => {
  registerServiceWorker();
  showInstallPrompt();
  syncOfflineData();
  
  // Add PWA class to body for CSS targeting
  if (isPWA()) {
    document.body.classList.add('pwa-installed');
  }
};

// Background sync for form data
export const requestBackgroundSync = (tag: string) => {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then((registration) => {
      return (registration as any).sync.register(tag);
    }).catch((error) => {
      console.log('Background sync registration failed:', error);
    });
  }
};

// Check network status
export const getNetworkStatus = () => {
  return {
    online: navigator.onLine,
    connection: (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection,
    effectiveType: ((navigator as any).connection && (navigator as any).connection.effectiveType) || 'unknown'
  };
};