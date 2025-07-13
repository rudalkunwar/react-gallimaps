export const loadScript = (scriptSrc: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.GalliMapPlugin) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = scriptSrc;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load GalliMaps script'));
    document.head.appendChild(script);
  });
};