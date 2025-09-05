# Virtual Try-On Chrome Extension

A powerful Chrome extension that lets you replace e-commerce models with your own photo using Google's Gemini AI. Try on clothes virtually by simply right-clicking on any clothing image!

## ✨ Features

- **Photo Upload**: Save your photo locally for repeated use
- **Right-Click Integration**: Context menu on any clothing image for instant try-on
- **AI-Powered**: Uses Fal AI's nano-banana model via HTTP API for realistic virtual try-on generation
- **Loading States**: Visual feedback during AI generation
- **Cross-Site Support**: Works on any e-commerce website
- **Privacy-First**: Your photo is stored locally in the browser

## 🚀 How It Works

1. **Upload Your Photo**: Use the extension popup to upload a clear photo of yourself
2. **Browse E-commerce**: Visit any online store (Amazon, Zara, H&M, etc.)
3. **Right-Click**: Right-click on any clothing/model image
4. **Virtual Try-On**: Select "Virtual Try-On" from the context menu
5. **See Results**: Watch as Fal AI replaces the model with you wearing the outfit!

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 18+ and pnpm
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

   ```bash
   cp .env.example .env
   # Add your Fal AI API key to .env
   ```

4. **Build the extension**

   ```bash
   pnpm build
   ```

5. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder

### Development Mode

For development with hot reload:

```bash
pnpm dev
```

## 📖 API Setup

### Fal AI API Key

1. Visit [Fal AI](https://fal.ai/)
2. Create a new account or sign in
3. Generate an API key from your dashboard
4. Add it to your `.env` file:
   ```
   FAL_KEY=your_fal_ai_api_key_here
   ```

## 🎯 Usage Examples

### Supported E-commerce Sites

- Amazon Fashion
- Zara
- H&M
- ASOS
- Nike
- Adidas
- Any site with clothing images

### Best Practices for Photos

- Use a clear, well-lit photo
- Face the camera directly
- Wear form-fitting clothes
- Avoid busy backgrounds
- High resolution preferred

## 🔧 Technical Architecture

### Built With

- **WXT Framework**: Modern Chrome extension development
- **React + TypeScript**: Popup interface
- **Fal AI**: Nano-banana model via HTTP API for virtual try-on generation
- **Tailwind CSS**: Styling (via classes)

### Extension Components

1. **Background Script** (`background.ts`)

   - Context menu creation
   - Message handling
   - Fal AI HTTP API integration

2. **Content Script** (`content.ts`)

   - Image detection and replacement
   - Loading states and notifications
   - User interaction handling

3. **Popup** (`popup/`)
   - Photo upload interface
   - Settings and instructions
   - React-based UI

### File Structure

```
src/
├── app/
│   ├── background.ts     # Background script
│   ├── content.ts        # Content script
│   └── popup/
│       ├── App.tsx       # Main popup component
│       ├── index.html    # Popup HTML
│       ├── main.tsx      # React entry point
│       └── style.css     # Popup styling
├── assets/               # Extension icons
└── public/              # Static assets
```

## 🔒 Privacy & Security

- **Local Storage**: Photos are stored locally in browser storage
- **No External Servers**: Direct HTTP API calls to Fal AI
- **Temporary Processing**: Images processed only during generation
- **User Control**: Easy photo deletion and management

## 🐛 Troubleshooting

### Common Issues

1. **"Please upload your photo first"**

   - Open extension popup and upload a photo
   - Ensure photo is saved (green indicator)

2. **Virtual try-on fails**

   - Check your Fal AI API key
   - Ensure stable internet connection
   - Try with a different image

3. **Context menu not appearing**
   - Ensure you're right-clicking on an image
   - Refresh the page and try again

### Debug Mode

Enable debug logs:

```javascript
// In console
localStorage.setItem("debug", "true");
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📋 Roadmap

- [ ] Batch processing multiple images
- [ ] Style transfer options
- [ ] Outfit recommendation engine
- [ ] Social sharing features
- [ ] Mobile app version
- [ ] Integration with popular shopping sites

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Fal AI for nano-banana virtual try-on model
- WXT framework for Chrome extension development
- Lucide React for beautiful icons

## 📞 Support

- Create an issue for bug reports
- Join discussions for feature requests
- Check existing issues before posting

---

**Made with ❤️ by [Ritik Sharma](https://github.com/ritiksharmarj)**
