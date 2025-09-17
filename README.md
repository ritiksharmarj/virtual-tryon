# Virtual Try-On

🏄‍♂️ [Chrome extension](https://ritiksharma.me/virtual-try-on)

[![Virtual Try-On Cover Image](https://github.com/user-attachments/assets/425a55c9-eaa6-4460-b554-3af37c85e865)](https://www.youtube.com/watch?v=OZUYG-LK7Bs)

This chrome extension lets you virtually try on clothes from any e-commerce website using Nano Banana. Simply upload your photo once, and whenever you see a clothing image you like, right-click on it and select 'Virtual Try-On.' The AI generates a realistic image of you wearing that outfit directly on the page. This tool is designed to enhance your online shopping experience by providing a realistic preview of how clothes will look on you before making a purchase.

## Key Features:

- Works on any e-commerce site, including Amazon, Zara, Bewakoof, TheSouledStore and more.
- Reduces returns and exchanges by allowing you to try different styles before buying.
- Ensures confident purchase decisions and encourages fashion experimentation.

## Privacy & Security:

- Photos and API key stored locally
- No data sent to our servers

## Tech Stack

- [WXT](https://wxt.dev/) – Framework
- [TypeScript](https://www.typescriptlang.org/) – Language
- [Tailwind](https://tailwindcss.com/) – CSS
- [Nano Banana](https://fal.ai/) - Gemini Flash Image Model

## Setup & Installation

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
