# Migration Guide: From Google Gemini to Fal AI HTTP API

This guide helps you migrate from the previous Google Gemini implementation to the new Fal AI HTTP API implementation.

## What Changed

- **AI Provider**: Switched from Google Gemini to Fal AI's nano-banana model
- **API Approach**: Migrated from client library to HTTP API calls
- **Dependencies**: Removed `@ai-sdk/google`, `ai`, and `@fal-ai/client`
- **Environment Variable**: Changed from `GOOGLE_GENERATIVE_AI_API_KEY` to `FAL_KEY`
- **Processing**: Implemented queue-based processing (submit → poll → retrieve)
- **Input Schema**: Updated to use `image_urls` array instead of separate image fields

## Migration Steps

### 1. Update Dependencies

Remove old dependencies:

```bash
pnpm remove @ai-sdk/google ai @fal-ai/client
```

No new AI client dependencies needed (using native fetch API).

### 2. Update Environment Variables

Update your `.env` file:

**Before:**

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key_here
```

**After:**

```bash
FAL_KEY=your_fal_ai_api_key_here
```

### 3. Get Fal AI API Key

1. Visit [Fal AI](https://fal.ai/)
2. Create an account or sign in
3. Generate an API key from your dashboard
4. Add it to your `.env` file

### 4. Rebuild Extension

```bash
pnpm build
```

## API Implementation Changes

### Google Gemini (Old)

```typescript
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";

const result = await generateObject({
  model: google("gemini-1.5-flash"),
  schema: z.object({
    tryOnImage: z.string(),
  }),
  prompt: `Create a virtual try-on image...`,
});
```

### Fal AI Client Library (Previous)

```typescript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/nano-banana/edit", {
  input: {
    image_url: userImageUrl,
    edit_image_url: productImageUrl,
    // ... parameters
  },
});
```

### Fal AI HTTP API (Current)

```typescript
// Step 1: Submit request
const submitResponse = await fetch("https://queue.fal.run/fal-ai/nano-banana", {
  method: "POST",
  headers: {
    Authorization: `Key ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    prompt: "Virtual try-on: replace the clothing...",
    image_urls: [userPhoto, productImage],
    num_images: 1,
    output_format: "jpeg",
  }),
});

// Step 2: Poll status
const { request_id } = await submitResponse.json();
let status;
do {
  await new Promise((resolve) => setTimeout(resolve, 5000));
  const statusResponse = await fetch(
    `https://queue.fal.run/fal-ai/nano-banana/requests/${request_id}/status`
  );
  status = await statusResponse.json();
} while (status.status === "IN_QUEUE" || status.status === "IN_PROGRESS");

// Step 3: Get result
const result = await fetch(
  `https://queue.fal.run/fal-ai/nano-banana/requests/${request_id}`
);
const { images } = await result.json();
```

## Benefits of HTTP API Approach

### Reliability

- **Chrome Extension Compatibility**: Better support for service worker environment
- **No Client Library Issues**: Eliminates dependency-related runtime errors
- **Direct Control**: Full control over request/response handling

### Performance

- **Queue System**: Efficient processing with status tracking
- **Timeout Control**: 5-minute maximum with proper error handling
- **Resource Management**: Better memory and connection management

### Maintainability

- **Native Fetch**: No external client libraries to maintain
- **Simple Debugging**: Plain HTTP requests are easier to debug
- **Error Transparency**: Direct access to HTTP status codes and responses

## Technical Details

### Queue Processing Flow

1. **Submit** (`POST /fal-ai/nano-banana`): Send prompt and image URLs array
2. **Poll** (`GET /requests/{request_id}/status`): Check processing status every 5 seconds
3. **Retrieve** (`GET /requests/{request_id}`): Get final generated image

### Input Schema Changes

**Previous (nano-banana/edit):**

```json
{
  "image_url": "user_photo_url",
  "edit_image_url": "product_image_url",
  "prompt": "instruction text",
  "negative_prompt": "what to avoid",
  "num_inference_steps": 20,
  "guidance_scale": 7.5,
  "strength": 0.8
}
```

**Current (nano-banana):**

```json
{
  "prompt": "instruction text",
  "image_urls": ["user_photo_url", "product_image_url"],
  "num_images": 1,
  "output_format": "jpeg"
}
```

### Output Schema

```json
{
  "images": [
    {
      "url": "https://storage.googleapis.com/falserverless/example_outputs/nano-banana-output.png"
    }
  ],
  "description": "Generated virtual try-on result description"
}
```

### Status States

- `IN_QUEUE`: Request is waiting to be processed
- `IN_PROGRESS`: AI model is generating the image
- `COMPLETED`: Generation finished, result available
- `FAILED`: Error occurred during processing

### Error Handling

- Network timeouts and retries
- API rate limiting protection
- Invalid response validation
- Processing failure recovery

## Troubleshooting

### Common Issues

1. **Request Timeout**

   - Increase timeout limit in code
   - Check network connectivity
   - Verify API key permissions

2. **Status Polling Fails**

   - Ensure status_url is correctly received
   - Check authorization headers
   - Verify polling interval (5 seconds recommended)

3. **Empty Results**
   - Validate response_url accessibility
   - Check for API errors in status response
   - Verify image format compatibility

### Debug Mode

Enable detailed logging:

```typescript
console.log("Submit response:", submitResult);
console.log("Status response:", status);
console.log("Final result:", result);
```

## Migration Checklist

- [x] Remove all AI client dependencies
- [x] Update environment variables
- [x] Implement HTTP API approach
- [x] Update to correct nano-banana endpoint (removed /edit)
- [x] Switch to image_urls array input format
- [x] Update output schema handling
- [x] Add queue status polling
- [x] Update error handling
- [x] Test virtual try-on functionality
- [x] Update documentation

## Need Help?

If you encounter issues after migration:

1. **Check API Key**: Ensure your Fal AI API key is correctly set and valid
2. **Clear Storage**: Clear browser extension storage and reload
3. **Network**: Verify internet connectivity and API accessibility
4. **Console**: Check browser console for detailed error messages
5. **Rebuild**: Run `pnpm build` and reload extension

For detailed setup instructions, see the updated README.md file.
