<div align="center">
  <img src="public/logo.png" alt="ROEDEX Logo" width="128" />
  
  # ROEDEX Companion Tool
  
  ### *The Ultimate Real-Time Tracker & Interactive Overlay Suite for Roots of Embervault*

  <p align="center">
    <a href="README.md">🇺🇸 English</a> • 
    <a href="README.es.md">🇪🇸 Español</a> • 
    <a href="README.ru.md">🇷🇺 Русский</a> • 
    <a href="README.ko.md">🇰🇷 한국어</a>
  </p>

  ---

  <p align="center">
    <a href="https://chromewebstore.google.com/detail/roedex/fgdehjebfkbdefdnenpgjejjnhlkchjh" target="_blank">
      <img src="https://img.shields.io/chrome-web-store/v/fgdehjebfkbdefdnenpgjejjnhlkchjh?label=Install%20from%20Chrome%20Web%20Store&style=for-the-badge&color=22d3ee&logo=googlechrome&logoColor=white" alt="Chrome Web Store" />
    </a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Version-v0.0.4-blue.svg?style=flat-square&color=3b82f6" alt="Version" />
    <img src="https://img.shields.io/badge/React-19.0.0-blue.svg?style=flat-square&color=61dafb&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5.7-blue.svg?style=flat-square&color=3178c6&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square&color=10b981" alt="License" />
  </p>
</div>

> [!IMPORTANT]
> **Official Support & Collaboration:**  
> ROEDEX is developed in close partnership with **Voxel Queen** (Co-Founder of *Roots of Embervault*) and is officially supported by **Ruyui Studios** through the provision of raw game map data. This collaboration powers our high-accuracy static spawn mapping and advanced navigational tools!  
> *Note: ROEDEX is not audited or officially endorsed by Ruyui Studios.*

---

## 📖 Table of Contents
1. [🌟 Overview](#-overview)
2. [✨ Key Features](#-key-features)
3. [📢 What's New in v0.0.4](#-whats-new-in-v004)
4. [🎮 Keyboard Shortcuts](#-keyboard-shortcuts)
5. [🔒 Security & Privacy](#-security--privacy)
6. [🛠️ Installation Guide](#️-installation-guide)
7. [🏆 Credits & Acknowledgements](#-credits--acknowledgements)
8. [🤝 Support & Contributions](#-support--contributions)

---

## 🌟 Overview

**ROEDEX** is a premium, non-intrusive client-side overlay extension for *Roots of Embervault*. By passively reading incoming WebSocket traffic, ROEDEX provides players with instant access to real-time statistics, spawn trackers, loot logs, and interactive companions. 

Built using **Manifest V3**, **React**, and **Tailwind CSS**, it features a gorgeous floating Glassmorphism UI that matches the high-quality feel of AAA gaming dashboards.

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| **📈 Live Session Tracking** | Real-time calculations of XP/hr, Runestones/hr, and raw gold/loot value. |
| **🤖 Interactive AI Companions** | 4 unique companions (**Bob**, **Kaya**, **Lia**, and **Crash**) who react dynamically to game events. |
| **🗺️ High-Accuracy Spawns** | Tracks distance and precise respawn queues for resources, NPCs, and bosses using official map data. |
| **⚔️ Gear Durability Alerts** | Real-time monitoring of weapon and armor durability with breaking warnings. |
| **🌐 Multi-Language Core** | Fully translated into **English, Spanish, Russian, and Korean** with custom location guides. |
| **🎨 Glassmorphism Themes** | Obsidian Gold, Hologram, and Ruby Glass themes with draggable, detachable pop-out windows. |
| **📐 Dynamic Customization** | Complete 8-way resizing, layout flipping (vertical/horizontal), and positioning persistence. |
| **⚡ Audit-Passed Optimization** | Zero memory leaks (audited for 12+ hr sessions), fully compressed assets, and lean Vite build chunks. |

---

## 📢 What's New in v0.0.4

*   🌍 **Complete Localization:** Migrated all remaining UI screens (Quest Board, Blacksmith, Players View) into our localization engine.
*   🐛 **Chest HUD Sticky Bug:** Fixed an issue where closing chests while moving items kept the minimal chest value stuck on the screen.
*   ⌨️ **Hotkey Persistence:** Custom keybindings (lock UI, layout toggle, reset size) now successfully persist across extension reloads.
*   ⏱️ **Delayed Boot Sequence:** The overlay now waits for your first active game packet (with a 5-second cinematic fade-in) for a clean entry.

---

## 🎮 Keyboard Shortcuts

The following hotkeys can be fully customized within the **Settings Tab**:

| Action | Default Shortcut | Description |
| :--- | :--- | :--- |
| **Minimize / Maximize HUD** | `Ctrl + Shift + M` | Toggle the entire ROEDEX UI into a floating minimized orb. |
| **Toggle Layout Mode** | `Shift + H` | Swap between Vertical Column and Horizontal Row display modes. |
| **Reset Overlay Size** | `Shift + R` | Reset all window dimensions to their standard optimized defaults. |
| **Lock / Unlock UI** | `Shift + U` | Lock window positions and enable click-through mode for uninterrupted gameplay. |

---

## 🔒 Security & Privacy

We believe in absolute transparency. **ROEDEX collects ZERO user data.**

*   **100% Client-Side:** All settings, loot histories, and custom layouts are stored locally on your machine via IndexedDB/localStorage.
*   **No Injection:** ROEDEX does not inject scripts or modify the game client. It is anti-cheat compliant.
*   **Passive Listening:** The extension acts purely as a spectator on the game's WebSocket traffic to display data.
*   **Scoped Permissions:** The extension only requests host permission for the official game domain.

For details, view our [Privacy Policy](PRIVACY_POLICY.md).

---

## 🛠️ Installation Guide

### Option A: Web Store (Recommended)
1. Visit the **ROEDEX** Chrome Web Store page.
2. Click **Add to Chrome**.
3. Pin the extension to your browser toolbar.
4. Launch the game; the extension will initialize automatically!

### Option B: Developer Mode (From Source)
1. Clone the repository:
   ```bash
   git clone https://github.com/LordCyberr/ROEDEX.git
   ```
2. Navigate to the directory and install dependencies:
   ```bash
   npm install
   ```
3. Run the compiler:
   ```bash
   npm run build
   ```
4. Open Chrome and navigate to `chrome://extensions/`.
5. Enable **Developer Mode** (top-right toggle).
6. Click **Load Unpacked** and select the generated `dist` folder.

---

## 🏆 Credits & Acknowledgements

ROEDEX is made possible by the dedication of our community and the support of the game creators:

*   👑 **Lord Cyberr** – Lead Developer & Project Creator
*   🛠️ **MrSnorch** – Contributions, guidance, and architecture support.
*   💎 **Voxel Queen** – Co-Founder of *Roots of Embervault* — for her calls, guidance, and providing the raw map files.
*   🎮 **Ruyui Studios** – The developers of *Roots of Embervault*, for supporting community modding and co-creation.

---

## 🤝 Support & Contributions

ROEDEX is free, open-source, and maintained in our spare time. If this tool has made your adventures more efficient, please consider starring the repository ⭐!

If you wish to support server costs, assets, and future updates, optional donations can be sent to:

<details>
<summary><b>🪙 Click to expand EVM & Solana Donation Addresses</b></summary>

*   **Abstract Chain**: `0xeb6C0506F624239dAa704c375d0494B14ea81322`
*   **Global Wallet (EVM)**: `0x364aC821eEf0D90678F0B6df44b700d3Df14D89a`
*   **Solana**: `GzRU5v4Tyqx7iGrc7Saed943gMnbMuEDwrpC9vZWyreq`

</details>

*Contributions are entirely optional. Thank you for supporting the community!*

---
<div align="center">
  <p><i>Crafted with ❤️ for the Roots of Embervault community.</i></p>
</div>
