export default defineBackground(() => {
  // Context menu for virtual try-on
  browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.create({
      id: "virtual-tryon",
      title: "Virtual Try-On",
      contexts: ["image"],
    });
  });

  // Handle context menu clicks
  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "virtual-tryon" && info.srcUrl && tab?.id) {
      // Check if user has uploaded their photo
      const { userPhoto } = await browser.storage.local.get("userPhoto");

      if (!userPhoto) {
        // Send message to show popup for photo upload
        browser.tabs.sendMessage(tab.id, {
          type: "SHOW_UPLOAD_PROMPT",
          message: "Please upload your photo first in the extension popup!",
        });
        return;
      }

      // Send message to content script to start virtual try-on
      browser.tabs.sendMessage(tab.id, {
        type: "START_VIRTUAL_TRYON",
        imageUrl: info.srcUrl,
        userPhoto: userPhoto,
      });
    }
  });

  // Handle messages from content script and popup
  browser.runtime.onMessage.addListener(
    async (message, _sender, sendResponse) => {
      if (message.type === "GENERATE_TRYON_IMAGE") {
        try {
          console.log("Starting virtual try-on generation...");
          const { userPhoto, productImage, imageElement } = message;

          // Generate virtual try-on using Fal AI HTTP API
          const result = await generateVirtualTryOn(userPhoto, productImage);

          console.log("Virtual try-on generation successful");
          sendResponse({
            success: true,
            generatedImage: result,
            imageElement,
          });
        } catch (error) {
          console.error("Virtual try-on generation failed:", error);
          sendResponse({
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to generate virtual try-on image",
          });
        }
      }
    },
  );
});

// Define interfaces for Fal AI HTTP API
interface VirtualTryOnResponse {
  images: Array<{
    url: string;
  }>;
  description?: string;
}

interface QueueStatusResponse {
  status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  queue_position?: number;
  logs?: Array<{ message: string; timestamp: string }>;
  response_url?: string;
}

interface QueueSubmitResponse {
  request_id: string;
  status_url: string;
  response_url: string;
}

async function generateVirtualTryOn(
  userPhoto: string,
  productImage: string,
): Promise<string> {
  try {
    console.log("Getting API key from storage...");
    // Get API key from storage first, then fallback to environment
    const { falApiKey } = await browser.storage.local.get("falApiKey");
    let apiKey = falApiKey;

    // Fallback to environment variable if not in storage
    if (!apiKey && typeof process !== "undefined" && process.env?.FAL_KEY) {
      apiKey = process.env.FAL_KEY;
      console.log("Using API key from environment variable");
    }

    if (!apiKey) {
      throw new Error("Please set your Fal AI API key in the extension popup");
    }
    console.log("API key found, proceeding with request...");

    console.log("Submitting request to Fal AI...");
    // Step 1: Submit request to Fal AI queue
    const submitResponse = await fetch(
      "https://queue.fal.run/fal-ai/nano-banana",
      {
        method: "POST",
        headers: {
          Authorization: `Key ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt:
            "Virtual try-on: replace the clothing on the person with the clothing from the second image while keeping the person's body pose, face, and background intact. Make it look natural and realistic.",
          image_urls: [userPhoto, productImage],
          num_images: 1,
          output_format: "jpeg",
        }),
      },
    );

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text();
      console.error("Submit request failed:", submitResponse.status, errorText);
      throw new Error(
        `Failed to submit request: ${submitResponse.status} ${submitResponse.statusText}`,
      );
    }

    const submitResult: QueueSubmitResponse = await submitResponse.json();
    const { request_id } = submitResult;
    console.log("Request submitted successfully, request_id:", request_id);

    console.log("Polling for completion...");
    // Step 2: Poll status until completion
    let status: QueueStatusResponse;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes with 5-second intervals

    do {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

      const statusResponse = await fetch(
        `https://queue.fal.run/fal-ai/nano-banana/requests/${request_id}/status`,
        {
          headers: {
            Authorization: `Key ${apiKey}`,
          },
        },
      );

      if (!statusResponse.ok) {
        const errorText = await statusResponse.text();
        console.error("Status check failed:", statusResponse.status, errorText);
        throw new Error(
          `Failed to check status: ${statusResponse.status} ${statusResponse.statusText}`,
        );
      }

      status = await statusResponse.json();
      console.log(`Status check ${attempts + 1}:`, status.status);
      attempts++;

      if (attempts >= maxAttempts) {
        throw new Error("Request timed out after 5 minutes");
      }
    } while (status.status === "IN_QUEUE" || status.status === "IN_PROGRESS");

    // Check if request failed
    if (status.status === "FAILED") {
      console.error("Request failed on server:", status.logs);
      throw new Error("Virtual try-on generation failed on server");
    }

    console.log("Request completed, fetching result...");
    // Step 3: Get the result
    const resultResponse = await fetch(
      `https://queue.fal.run/fal-ai/nano-banana/requests/${request_id}`,
      {
        headers: {
          Authorization: `Key ${apiKey}`,
        },
      },
    );

    if (!resultResponse.ok) {
      const errorText = await resultResponse.text();
      console.error("Result fetch failed:", resultResponse.status, errorText);
      throw new Error(
        `Failed to get result: ${resultResponse.status} ${resultResponse.statusText}`,
      );
    }

    const result: VirtualTryOnResponse = await resultResponse.json();
    console.log("Result received:", result);

    // Extract the generated image URL from the response
    if (result?.images?.length && result.images.length > 0) {
      console.log("Virtual try-on generation completed successfully");
      return result.images[0].url;
    }

    throw new Error("No image was generated");
  } catch (error) {
    console.error("Error generating virtual try-on with Fal AI:", error);
    throw error;
  }
}
