export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener(async (message) => {
      if (message.type === "SHOW_UPLOAD_PROMPT") {
        showUploadPrompt(message.message);
      }

      if (message.type === "START_VIRTUAL_TRYON") {
        await startVirtualTryOn(message.imageUrl, message.userPhoto);
      }
    });

    // Function to show upload prompt
    function showUploadPrompt(message: string) {
      // Create a toast notification
      const toast = document.createElement("div");
      toast.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          background: #FF6B6B;
          color: white;
          padding: 16px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          z-index: 10000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          max-width: 350px;
          animation: slideIn 0.3s ease-out;
        ">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>📸</span>
            <span>${message}</span>
          </div>
        </div>
      `;

      // Add animation styles
      const style = document.createElement("style");
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
      document.body.appendChild(toast);

      // Remove toast after 4 seconds
      setTimeout(() => {
        toast.remove();
        style.remove();
      }, 4000);
    }

    // Function to start virtual try-on process
    async function startVirtualTryOn(imageUrl: string, userPhoto: string) {
      const productImageUrl = imageUrl.split("?")[0];

      // const img = Array.from(document.querySelectorAll("img")).find((img) =>
      //   img.src.includes(productImageUrl),
      // );

      const matchingImages = Array.from(
        document.querySelectorAll("img"),
      ).filter((img) => img.src.includes(productImageUrl));

      if (matchingImages.length === 0) {
        console.error("Could not find any matching image elements");
        return;
      }

      // Store original sources for all images
      const originalSources = matchingImages.map((img) => img.src);

      // Show loading state
      // const originalSrc = img.src;
      // const loadingOverlay = createLoadingOverlay(img);
      const loadingOverlays = matchingImages.map((img) =>
        createLoadingOverlay(img),
      );

      try {
        // Send to background script for AI processing
        const response = await chrome.runtime.sendMessage({
          type: "GENERATE_TRYON_IMAGE",
          userPhoto,
          productImage: productImageUrl,
          // imageElement: img.outerHTML,
        });

        console.log(response);

        if (response.success) {
          // Replace image with generated result
          // img.src = response.generatedImage;
          matchingImages.forEach((img) => {
            img.src = response.generatedImage;
          });

          // Add a small indicator that this is a virtual try-on
          // addVirtualTryOnIndicator(img);

          // Show success message
          showSuccessMessage();
        } else {
          throw new Error(response.error);
        }
      } catch (error) {
        console.error("Virtual try-on failed:", error);
        // Restore original image
        // img.src = originalSrc;
        matchingImages.forEach((img, idx) => {
          img.src = originalSources[idx];
        });
        showErrorMessage();
      } finally {
        // Remove loading overlay
        // loadingOverlay.remove();
        loadingOverlays.forEach((overlay) => {
          overlay.remove();
        });
      }
    }

    // Create loading overlay
    function createLoadingOverlay(img: HTMLImageElement) {
      const overlay = document.createElement("div");
      overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        backdrop-filter: blur(2px);
      `;

      overlay.innerHTML = `
        <div style="text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="
            width: 40px;
            height: 40px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #FF6B6B;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 12px;
          "></div>
          <div style="color: #333; font-size: 14px; font-weight: 500;">
            Generating virtual try-on...
          </div>
        </div>
      `;

      // Add spinner animation
      const spinnerStyle = document.createElement("style");
      spinnerStyle.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(spinnerStyle);

      // Position overlay relative to image
      const imgRect = img.getBoundingClientRect();
      const container = document.createElement("div");
      container.style.cssText = `
        position: fixed;
        top: ${imgRect.top + window.scrollY}px;
        left: ${imgRect.left + window.scrollX}px;
        width: ${imgRect.width}px;
        height: ${imgRect.height}px;
        pointer-events: none;
      `;

      container.appendChild(overlay);
      document.body.appendChild(container);

      return container;
    }

    // Add virtual try-on indicator
    function addVirtualTryOnIndicator(img: HTMLImageElement) {
      const indicator = document.createElement("div");
      indicator.style.cssText = `
        position: absolute;
        top: 8px;
        left: 8px;
        background: linear-gradient(135deg, #FF6B6B, #FF8E53);
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        z-index: 100;
      `;
      indicator.textContent = "✨ Virtual Try-On";

      // Position relative to image
      const imgRect = img.getBoundingClientRect();
      indicator.style.position = "fixed";
      indicator.style.top = `${imgRect.top + window.scrollY + 8}px`;
      indicator.style.left = `${imgRect.left + window.scrollX + 8}px`;

      document.body.appendChild(indicator);

      // Remove indicator after 3 seconds
      setTimeout(() => indicator.remove(), 3000);
    }

    // Show success message
    function showSuccessMessage() {
      const toast = document.createElement("div");
      toast.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          background: #4CAF50;
          color: white;
          padding: 16px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          z-index: 10000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          animation: slideIn 0.3s ease-out;
        ">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>✨</span>
            <span>Virtual try-on generated successfully!</span>
          </div>
        </div>
      `;

      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }

    // Show error message
    function showErrorMessage() {
      const toast = document.createElement("div");
      toast.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          background: #F44336;
          color: white;
          padding: 16px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          z-index: 10000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          animation: slideIn 0.3s ease-out;
        ">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>❌</span>
            <span>Failed to generate virtual try-on. Please try again.</span>
          </div>
        </div>
      `;

      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 4000);
    }
  },
});
