export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    chrome.runtime.onMessage.addListener(async (message) => {
      if (message.type === "SHOW_UPLOAD_PROMPT") {
        showUploadPrompt(message.message);
      }

      if (message.type === "START_VIRTUAL_TRYON") {
        await startVirtualTryOn(message.imageUrl, message.userPhoto);
      }
    });

    // Show upload prompt
    function showUploadPrompt(message: string) {
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

      const style = document.createElement("style");
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
      document.body.appendChild(toast);

      setTimeout(() => {
        toast.remove();
        style.remove();
      }, 4000);
    }

    // Start virtual try-on process
    async function startVirtualTryOn(imageUrl: string, userPhoto: string) {
      const productImageUrl = imageUrl.split("?")[0];

      const img = Array.from(document.querySelectorAll("img")).find(
        (img) => img.src === imageUrl,
      );

      if (!img) {
        console.error("Could not find matching image element.");
        return;
      }

      const originalSrc = img.src;
      const loadingOverlay = createLoadingOverlay(img);

      try {
        // Send to background script for AI processing
        const response = await chrome.runtime.sendMessage({
          type: "GENERATE_TRYON_IMAGE",
          userPhoto,
          productImage: productImageUrl,
          // imageElement: img.outerHTML,
        });

        if (response.success) {
          // Replace image with generated result
          img.src = response.generatedImage;

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
        img.src = originalSrc;

        showErrorMessage();
      } finally {
        loadingOverlay.remove();
      }
    }

    // Create loading overlay
    function createLoadingOverlay(img: HTMLImageElement) {
      const overlay = document.createElement("div");
      overlay.style.cssText = `
        position: absolute;
        inset: 0;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        backdrop-filter: blur(2px);
      `;

      overlay.innerHTML = `
        <div style="text-align: center; font-family: -apple-system, "system-ui", sans-serif;">
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

      const imgParent = img.parentElement;

      if (imgParent) {
        imgParent.style.position = "relative";

        imgParent.appendChild(overlay);

        overlay.remove = () => {
          if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
          }
        };
      } else {
        const container = document.createElement("div");
        container.style.cssText = `
          position: relative;
          display: inline-block;
          width: ${img.width}px;
          height: ${img.height}px;
      `;

        img.parentNode?.insertBefore(container, img);
        container.appendChild(img);
        container.appendChild(overlay);

        overlay.remove = () => {
          if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
          }

          if (container.parentNode) {
            container.parentNode.insertBefore(img, container);
            container.parentNode.removeChild(container);
          }
        };
      }

      return overlay;
    }

    // Add virtual try-on indicator
    // function addVirtualTryOnIndicator(img: HTMLImageElement) {
    //   const indicator = document.createElement("div");
    //   indicator.style.cssText = `
    //     position: absolute;
    //     top: 8px;
    //     left: 8px;
    //     background: linear-gradient(135deg, #FF6B6B, #FF8E53);
    //     color: white;
    //     padding: 4px 8px;
    //     border-radius: 12px;
    //     font-size: 11px;
    //     font-weight: 600;
    //     font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    //     box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    //     z-index: 100;
    //   `;
    //   indicator.textContent = "✨ Virtual Try-On";

    //   // Position relative to image
    //   const imgRect = img.getBoundingClientRect();
    //   indicator.style.position = "fixed";
    //   indicator.style.top = `${imgRect.top + window.scrollY + 8}px`;
    //   indicator.style.left = `${imgRect.left + window.scrollX + 8}px`;

    //   document.body.appendChild(indicator);

    //   // Remove indicator after 3 seconds
    //   setTimeout(() => indicator.remove(), 3000);
    // }

    // Show success message
    function showSuccessMessage() {
      const toast = document.createElement("div");
      toast.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          background: white;
          color: #333;
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 10000;
          font-family: -apple-system, "system-ui", sans-serif;
          font-size: 14px;
          border: 1px solid #e5e7eb;
          animation: slideIn 0.3s ease-out;
          min-width: 200px;
        ">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="
              width: 16px;
              height: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            ">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" height="20" width="20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    clipRule="evenodd"
                  />
              </svg>
            </div>
            Virtual try-on generated successfully!
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
