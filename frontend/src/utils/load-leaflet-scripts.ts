export const loadLeafLetScripts = async () => {
  try {
    console.log("Starting to load scripts...");

    // Load Leaflet first
    console.log("Loading Leaflet...");
    await new Promise<void>((resolve, reject) => {
      // Check if script already exists
      if (document.querySelector('script[src*="leaflet"]')) {
        console.log("Leaflet script already in DOM");
        // Wait a bit and check if L is available
        const checkL = () => {
          // @ts-ignore
          if (window.L) {
            resolve();
          } else {
            setTimeout(checkL, 100);
          }
        };
        checkL();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.3/dist/leaflet.js";
      script.onload = () => {
        console.log("Leaflet script loaded");
        resolve();
      };
      script.onerror = () => reject(new Error("Failed to load Leaflet"));
      document.head.appendChild(script);
    });

    // Load MarkerPlayer
    console.log("Loading MarkerPlayer...");
    await new Promise<void>((resolve, reject) => {
      // Check if script already exists
      if (document.querySelector('script[src*="markerplayer"]')) {
        console.log("MarkerPlayer script already in DOM");
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet.markerplayer@latest";
      script.onload = () => {
        console.log("MarkerPlayer script loaded");
        resolve();
      };
      script.onerror = () => reject(new Error("Failed to load MarkerPlayer"));
      document.head.appendChild(script);
    });

    console.log("All scripts loaded, initializing map...");

    return true;
  } catch (error) {
    console.error("Error loading scripts:", error);
    return error;
  }
};
