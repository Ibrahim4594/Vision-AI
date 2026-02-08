# 🌟 VisionAI - AI-Powered Accessibility Companion

<div align="center">

![VisionAI](https://img.shields.io/badge/VisionAI-Accessibility-gold?style=for-the-badge)
![Gemini 3](https://img.shields.io/badge/Powered%20by-Gemini%203-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Making the world accessible through Gemini 3's multimodal AI**

[Live Demo](#) · [Report Bug](https://github.com/Ibrahim4594/Vision-AI/issues) · [Request Feature](https://github.com/Ibrahim4594/Vision-AI/issues)

Built for the [Gemini 3 Global Hackathon](https://gemini3.devpost.com/)

</div>

---

## 🎯 The Problem

**253 million people worldwide** are visually impaired. Existing assistive technologies are often:
- ❌ **Expensive** - Specialized hardware costs $1,000s (OrCam MyEye: $4,250)
- ❌ **Limited** - Single-purpose devices that can't adapt
- ❌ **Inaccessible** - Require training, subscriptions, or special equipment

## 💡 Our Solution

**VisionAI** is a free, web-based accessibility companion that uses **Gemini 3's advanced multimodal AI** to help visually impaired users:

✅ Navigate safely with real-time obstacle detection
✅ Read text from signs, menus, and documents
✅ Identify objects and colors instantly
✅ Understand their environment through AI-powered descriptions
✅ Ask questions about their surroundings

**All through a simple camera and web browser - no special hardware required.**

---

## ✨ Features

### 🔍 **Scene Description Mode**
Real-time analysis of surroundings with spatial awareness
- Identifies objects, people, and layout
- Provides spatial context ("desk to your left, 3 feet ahead")
- Alerts to potential hazards

### 📖 **Read Text Mode**
Advanced OCR powered by Gemini 3 Vision
- Reads signs, menus, labels, documents
- Maintains formatting and structure
- Works in various lighting conditions

### 🎯 **Object Identification**
Detailed object analysis
- Identifies what objects are
- Describes color, material, and condition
- Explains purpose and use

### 🧭 **Navigation Mode**
Safe movement guidance with:
- Obstacle detection with distance estimates
- Clear path identification
- Hazard warnings with urgency levels
- Haptic feedback (vibration) for urgent alerts
- "Safe to proceed" vs "Stop" commands

### 🎨 **Color Identification**
Helps with daily choices:
- Clothing selection
- Object identification
- Color matching

### 💬 **Ask Anything (Chat)**
Interactive Q&A about environment
- "Is anyone in the room?"
- "What's on the table?"
- "What color is this?"

### 🎤 **Voice Commands** (Chrome/Edge)
Hands-free operation:
- "Start" / "Stop"
- "Read text"
- "What is this?"
- "Navigate"
- "What color?"

### ⌨️ **Keyboard Shortcuts**
Accessible controls:
- `Space` - Start/Stop
- `1-6` - Switch modes
- `R` - Repeat last message
- `Esc` - Stop/Close

### ⚙️ **Customizable Settings**
- Adjustable speech rate (0.5x - 2.0x)
- Toggle voice commands
- Toggle haptic feedback
- Persistent preferences

---

## 🚀 Powered by Gemini 3

### Why Gemini 3 Flash?

We chose **Gemini 3 Flash** specifically for:

#### ⚡ **Low Latency**
- <2 second response time critical for navigation safety
- Real-time processing for continuous modes

#### 👁️ **Multimodal Understanding**
- Simultaneous analysis of images and text prompts
- Contextual reasoning beyond simple object detection

#### 🧠 **Advanced Reasoning**
- Understands spatial relationships ("chair to your left")
- Assesses safety contexts (identifies hazards)
- Provides actionable guidance

#### 🎯 **Superior OCR**
- Accurate text extraction in various conditions
- Maintains document structure
- Works with handwriting and printed text

### Technical Integration

```typescript
const response = await ai.models.generateContent({
  model: 'gemini-3-flash-preview',
  contents: {
    role: "user",
    parts: [
      { inlineData: { mimeType: "image/jpeg", data: base64Image } },
      { text: prompt },
    ],
  },
  config: {
    systemInstruction: "You are VisionAI, an accessibility assistant...",
    temperature: 0.4,
    maxOutputTokens: 300,
  },
});
```

---

## 💻 Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **AI Engine:** Gemini 3 Flash API (@google/genai)
- **APIs:**
  - MediaDevices API (Camera)
  - Web Speech API (TTS & Voice Recognition)
  - Vibration API (Haptic feedback)
- **Storage:** LocalStorage (settings persistence)

---

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ installed
- Modern web browser (Chrome/Edge recommended for voice commands)
- Gemini API key ([Get one here](https://ai.google.dev/))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Ibrahim4594/Vision-AI.git
cd Vision-AI
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up API key**

Create `.env.local` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

4. **Run locally**
```bash
npm run dev
```

5. **Open in browser**
```
http://localhost:5173
```

⚠️ **Note:** HTTPS required for camera access in production

### Build for Production

```bash
npm run build
npm run preview
```

Deploy the `dist/` folder to:
- Vercel
- Netlify
- GitHub Pages
- Any static host with HTTPS

---

## 📖 Usage Guide

### For Visually Impaired Users

1. **Start the app** - Press `Space` or say "Start"
2. **Choose a mode:**
   - Press `1` for Scene Description
   - Press `2` to Read Text
   - Press `3` to Identify Objects
   - Press `4` for Navigation
   - Press `5` for Color Identification
   - Press `6` to Ask Questions

3. **Listen** to AI descriptions through speakers/headphones
4. **Navigate safely** with real-time guidance

### Voice Commands (Chrome/Edge only)

Enable in Settings, then use:
- "**Start**" - Begin analysis
- "**Stop**" - Stop analysis
- "**Read**" - Switch to text reading
- "**Navigate**" - Switch to navigation mode
- "**What is this?**" - Identify object
- "**What color?**" - Identify colors
- "**Help**" - List available commands

### Keyboard Shortcuts

- `Space` - Start/Stop
- `1-6` - Mode selection
- `R` - Repeat last message
- `Esc` - Stop/Close settings
- `H` - Help

---

## 🌍 Impact

### Who Benefits?

- **253 million visually impaired people worldwide**
- Low-vision individuals
- Elderly with declining vision
- Anyone in temporary vision-impaired situations

### Real-World Use Cases

✅ **Daily Navigation:** Safely walk through home, office, public spaces
✅ **Reading:** Menus, signs, mail, product labels
✅ **Shopping:** Identify products, read prices, check expiration dates
✅ **Social:** Know who's in the room, read social cues
✅ **Independence:** Reduced reliance on sighted assistance

### Cost Comparison

| Solution | Cost | Features | Accessibility |
|----------|------|----------|---------------|
| **VisionAI** | **$0** | **6 modes** | **Any device** |
| OrCam MyEye | $4,250 | Single-purpose | Special hardware |
| Aira Service | $89/month | Limited hours | Requires subscription |
| Guide Dogs | $42,000+ | Limited scope | 2-year wait |

**VisionAI saves users $4,000+ per year while providing MORE features.**

---

## 🏗️ Architecture

```
User → Camera Feed → Frame Capture (every 2-3s)
            ↓
      Image Base64
            ↓
   Gemini 3 Flash API
   (Vision Analysis + Reasoning)
            ↓
      Text Response
            ↓
   ┌────────┴────────┐
   ↓                 ↓
Text-to-Speech   Visual Display
(Audio Output)   (UI Captions)
   ↓                 ↓
Haptic Feedback   User Interface
```

---

## 📁 Project Structure

```
visionai/
├── components/
│   ├── Camera.tsx           # Camera capture component
│   ├── ControlPanel.tsx     # Mode selection UI
│   ├── ChatInterface.tsx    # Chat mode interface
│   └── SettingsPanel.tsx    # Settings UI
├── services/
│   ├── geminiService.ts     # Gemini 3 API integration
│   ├── speechService.ts     # Text-to-speech
│   └── voiceService.ts      # Voice recognition
├── App.tsx                  # Main application
├── constants.ts             # Prompts & configuration
├── types.ts                 # TypeScript types
├── index.css                # Styles
└── README.md                # This file
```

---

## 🎬 Demo

**Coming soon:** 3-minute demo video

**Try it live:** [Demo Link](#)

---

## 🔒 Privacy & Security

- ✅ **No data storage** - Images are processed and immediately discarded
- ✅ **Client-side processing** - All logic runs in your browser
- ✅ **HTTPS enforced** - Secure connections only
- ✅ **No tracking** - We don't collect user data
- ✅ **API key privacy** - Your Gemini API key stays on your device

---

## 🤝 Contributing

Contributions are welcome! We're looking for help with:

- 🌍 Multi-language support
- 📱 Mobile native apps
- ♿ Accessibility testing with real users
- 🐛 Bug fixes and improvements
- 📖 Documentation

**Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting PRs.**

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google DeepMind** for Gemini 3 API
- **Devpost** for hosting the hackathon
- **Visually impaired beta testers** for invaluable feedback
- **Open source community** for React, Vite, and other tools

---

## 📞 Contact

- **Developer:** Ibrahim
- **Email:** ibrahimsamad507@gmail.com
- **GitHub:** [@Ibrahim4594](https://github.com/Ibrahim4594)
- **Project:** [Vision-AI](https://github.com/Ibrahim4594/Vision-AI)

---

## 🔮 Roadmap

- [ ] Native mobile apps (iOS/Android)
- [ ] Multi-language support (50+ languages)
- [ ] Offline mode with local models
- [ ] Smart glasses integration
- [ ] Indoor navigation with GPS
- [ ] Object tracking
- [ ] Open source community features

---

<div align="center">

**Built with ❤️ for the Gemini 3 Global Hackathon**

*Making the world more accessible, one frame at a time.*

⭐ **Star this repo if you find it helpful!** ⭐

</div>
