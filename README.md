# Virtual Try-On Chrome Extension

🔗 Extension - [Virtual Try-On](https://chromewebstore.google.com/detail/glimeidbokkhofiiloikgdnkdnofpjbd?utm_source=item-share-cb)

This extension lets you virtually try on clothes from any e-commerce website using Gemini Flash Image Model (NanoBanana). You just upload your photo once, and then whenever you see a clothing image you like, right-click on it and select 'Virtual Try-On.' The AI then generates a realistic image of you wearing that outfit right there on the page.

Works best with clear, well-lit photos and form-fitting clothing. Supports all major e-commerce sites including Amazon, Zara, Bewakoof, TheSouledStore, and thousands more!

## 🛍️ Perfect For:

- Online fashion shopping on any website
- Trying different styles before buying
- Reducing returns and exchanges
- Confident purchase decisions
- Fashion experimentation

## 🔒 Privacy & Security:

- Photos and API key stored locally
- No data sent to our servers

## 🛠️ Tech Stack

- [WXT](https://wxt.dev/) – Framework
- [TypeScript](https://www.typescriptlang.org/) – Language
- [Tailwind](https://tailwindcss.com/) – CSS
- [Nano Banana](https://fal.ai/) - Gemini Flash Image Model

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 20+ and pnpm
- Fal AI API key (get from [Fal AI](https://fal.ai/))

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/ritiksharmarj/virtual-tryon.git
   cd virtual-tryon
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```bash
   WXT_FAL_KEY=""
   ```

4. **Run the extension**

   ```bash
   pnpm dev
   ```

Cheers 🤟
