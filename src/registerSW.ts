/**
 * Registers the Service Worker for offline PWA gameplay
 */
export function registerServiceWorker(): void {
  if (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    Boolean((import.meta as unknown as { env?: { PROD?: boolean } }).env?.PROD)
  ) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Knowledge Crossword SW registered:', registration.scope);
        })
        .catch((error) => {
          console.warn('Knowledge Crossword SW registration failed:', error);
        });
    });
  }
}
