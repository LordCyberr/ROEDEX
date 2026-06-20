<div align="center">
  <img src="public/logo.png" alt="ROEDEX Logo" width="128" />
  <h1>ROEDEX Tracker and Companion Tool</h1>
  <p><strong>The Ultimate Real-Time Tracker & Companion Suite for Roots of Embervault</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/version-v0.0.1-blue.svg?style=for-the-badge" alt="Version" />
    <img src="https://img.shields.io/badge/chrome-extension-success.svg?style=for-the-badge" alt="Chrome Extension" />
    <img src="https://img.shields.io/badge/react-19.0.0-61dafb.svg?style=for-the-badge" alt="React" />
    <img src="https://img.shields.io/badge/typescript-5.7-blue.svg?style=for-the-badge" alt="TypeScript" />
    <img src="https://img.shields.io/badge/license-MIT-green.svg?style=for-the-badge" alt="License" />
  </p>
</div>

---

## 🌟 Overview

**ROEDEX** is an incredibly advanced, non-intrusive, and beautifully designed overlay extension. By tracking live WebSocket traffic on the client side, ROEDEX provides players with real-time game statistics, spawn timers, and loot efficiencies without ever injecting malicious code or modifying the game client itself. 

Built on **Manifest V3**, React, and Tailwind CSS, it features a deeply customizable UI that seamlessly floats over your gameplay.

---

## ✨ Key Features

- 🟢 **Live Session Tracking**: Calculate your gold per hour, XP per hour, and raw loot efficiency entirely in real-time.
- 🤖 **4 Unique AI Companions**: Choose between Bob, Kaya, Lia, and Crash! Highly interactive, customizable pixel-matrix companions that guide you through the overlay and react to your live game events.
- 🗺️ **Distance & Spawns**: Tracks the exact distance of NPCs, resources, and enemies. Calculates exact respawn intervals for highly-contested resources.
- ⚔️ **Quests & Combat Tracking**: View active quests and track weapon/armor durability dynamically.
- 🌐 **Multi-Language Support**: Fully localized in **English, Spanish, Russian, and Korean**, including pinpoint MMO-style location guides.
- 🎨 **Glassmorphism UI**: Featuring Obsidian Gold, Hologram, and Ruby Glass themes with draggable, detachable, and minimizable windows.
- 📏 **Unrestricted Customization**: Full 8-way custom resizing for all pop-out windows with intelligent auto-expand support.
- ⚡ **Highly Optimized**: Passed rigorous memory leak audits for 12+ hour gaming sessions, with fully compressed pure-PNG assets and lean Vite build chunks.

---

## 🔒 Security & Privacy

ROEDEX is built with absolute privacy in mind. **We collect ZERO user data.** 
- **100% Local**: All loot history, statistics, and settings are saved locally on your own machine. We use no external databases or analytics.
- **Strictly Scoped**: The extension only runs on the game domain and cannot see or access any other websites you visit.
- **Passive Listening**: ROEDEX only reads incoming game packets. It does not inject macros, automate gameplay, or violate fair-play anti-cheat systems.

Please read our full [Privacy Policy](PRIVACY_POLICY.md) for more details.

---

## 🚀 Installation (Web Store)

Once approved on the Google Chrome Web Store:
1. Navigate to the ROEDEX Chrome Extension Page.
2. Click **Add to Chrome**.
3. Pin the extension to your toolbar.
4. Navigate to the game website and click the ROEDEX icon to initialize!

---

## 🛠️ Installation (Developer Mode)

If you are cloning this repository to build from the source code:

1. Clone this repository:
   ```bash
   git clone https://github.com/LordCyberr/ROEDEX.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the production extension:
   ```bash
   npm run build
   ```
4. Navigate to `chrome://extensions/` in your browser.
5. Enable **Developer Mode** in the top right corner.
6. Click **Load Unpacked** and select the newly generated `dist` folder.

---

## 🏆 Credits & Acknowledgements

ROEDEX wouldn't be possible without the incredible contributions from our community and developers:
- **Lord Cyberr** - Lead Developer & Creator
- **MrSnorch** - For his guidance and contributions to the project.

---

## 🤝 Support & Contributions

ROEDEX is an open-source project maintained by the community. Developing and updating this tool requires countless late-night coding sessions. If ROEDEX has helped you track that ultra-rare drop or level up faster, consider giving the repository a ⭐! 

If you would like to support ongoing development, server costs, and future updates, contributions are strictly optional but immensely appreciated:

<details>
<summary><b>🪙 Click to show Crypto Donation Addresses</b></summary>

- **Abstract Chain**: `0xeb6C0506F624239dAa704c375d0494B14ea81322`
- **Global Wallet (EVM)**: `0x364aC821eEf0D90678F0B6df44b700d3Df14D89a`
- **Solana**: `GzRU5v4Tyqx7iGrc7Saed943gMnbMuEDwrpC9vZWyreq`

</details>

We also welcome pull requests! Please follow standard TypeScript and React best practices when submitting new features or bug fixes. Ensure you test your WebSocket parsing logic carefully to prevent memory leaks!

---
<div align="center">
  <p><i>Crafted with ❤️ for the gaming community.</i></p>
</div>
