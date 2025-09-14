export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    chrome.runtime.onMessage.addListener(async (message) => {
      if (message.type === "UPLOAD_IMAGE") {
        showErrorMessage(message.message);
      }

      if (message.type === "START_VIRTUAL_TRYON") {
        await startVirtualTryOn(message.imageUrl, message.userPhoto);
      }
    });

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
        });

        if (response.success) {
          // Replace image with generated result
          img.src = response.generatedImage;

          showSuccessMessage();
        } else {
          throw new Error(response.error);
        }
      } catch (error) {
        console.error("Virtual try-on failed:", error);
        // Restore original image
        img.src = originalSrc;

        showErrorMessage(String(error));
      } finally {
        loadingOverlay.remove();
      }
    }

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
        <div style="
        text-align: center; 
        font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        color: #171717;
        font-size: 14px;
        font-weight: 500;
        ">
          <div style="
            width: 40px;
            height: 40px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #FF4D00;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          "></div>
          Generating virtual try-on...
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

    function showSuccessMessage() {
      const toast = document.createElement("div");
      toast.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          background: #ffffff;
          color: #171717;
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          z-index: 10000;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 14px;
          font-weight: 500;
          border: 1px solid #F3F3F3;
          min-width: 200px;
          opacity: 0;
          transform: translateY(50px);
          animation: slideUp 0.15s ease-out forwards;
        ">
          <div style="display: flex; align-items: center; gap: 6px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#171717" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
              <circle stroke="#171717" cx="12" cy="12" r="10"/>
              <path stroke="#ffffff" d="m9 12 2 2 4-4"/>
            </svg>
            Virtual try-on generated successfully!
          </div>
        </div>
      `;

      const style = document.createElement("style");
      style.textContent = `
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `;
      document.head.appendChild(style);
      document.body.appendChild(toast);

      setTimeout(() => {
        toast.remove();
        style.remove();
      }, 4000);
    }

    function showErrorMessage(message: string) {
      const toast = document.createElement("div");
      toast.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          background: #ffffff;
          color: #171717;
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          z-index: 10000;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 14px;
          font-weight: 500;
          border: 1px solid #F3F3F3;
          min-width: 200px;
          opacity: 0;
          transform: translateY(50px);
          animation: slideUp 0.15s ease-out forwards;
        ">
          <div style="display: flex; align-items: center; gap: 6px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#171717" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
              <circle stroke="#171717" cx="12" cy="12" r="10"/>
              <line stroke="#ffffff" x1="12" x2="12" y1="8" y2="12"/>
              <line stroke="#ffffff" x1="12" x2="12.01" y1="16" y2="16"/>
            </svg>
            ${message ? message : "Failed to generate virtual try-on."}
          </div>
        </div>
      `;

      const style = document.createElement("style");
      style.textContent = `
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `;
      document.head.appendChild(style);
      document.body.appendChild(toast);

      setTimeout(() => {
        toast.remove();
        style.remove();
      }, 4000);
    }
  },
});
