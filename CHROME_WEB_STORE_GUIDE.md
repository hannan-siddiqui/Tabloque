# TabLoque — Chrome Web Store Publication Guide

This document contains everything you need to publish **TabLoque** to the Google Chrome Web Store.

---

## 📦 1. Your Pre-Packaged Extension Zip

Your production extension archive has already been built and compressed:
- **Zip Archive File:** `TabLoque-v1.0.0.zip` (located in the project root directory)
- **Path:** `c:\Users\Hannan Siddiqui\Desktop\Hannan-Dev\TabLoque\TabLoque-v1.0.0.zip`

*(To rebuild or update the package at any time in the future, simply run: `npm run package`)*

---

## 🚀 2. Chrome Developer Dashboard Steps

1. Go to the **[Chrome Web Store Developer Console](https://chrome.google.com/webstore/devconsole)**.
2. Sign in with your Google account.
   - *Note: If this is your first time publishing, Google charges a one-time $5 USD developer registration fee.*
3. Click the **"+ New Item"** button in the top right.
4. Drag and drop or upload `TabLoque-v1.0.0.zip`.

---

## 📝 3. Store Listing Details (Copy & Paste)

### Product Details
- **Extension Name:** `TabLoque - Visual Bookmark Manager`
- **Short Summary (under 132 chars):**
  ```text
  Visual, drag-and-drop bookmark manager replacing your Chrome New Tab with liquid glass boards, notes & cloud sync.
  ```

### Detailed Description
```markdown
TabLoque transforms your Google Chrome New Tab into a stunning, liquid-glass visual workspace and intelligent bookmark organizer.

Designed for developers, designers, and power users who want a clean, responsive, and beautiful start page with zero clutter and complete privacy.

✨ KEY FEATURES:

🔹 Visual Drag-and-Drop Boards
Organize bookmarks into customizable liquid-glass cards. Drag and rearrange links between boards effortlessly with smooth kinetic animations.

🔹 20+ Silk Wave Themes & Background Patterns
Choose from vibrant cyberpunk neon, emerald silk, obsidian midnight, and arctic glacier themes. Pick any custom hex color or select from 8 dynamic ambient patterns (Silk Waves, Cyber Grid, Dot Matrix, Hex Honeycomb, Isometric Mesh, Circuit Traces, Diagonal Lines, or Pure Color with no patterns).

🔹 Custom Wallpaper Support
Upload any high-res photo from your device or paste an image link (Unsplash, etc.) with real-time blur and brightness dimming sliders.

🔹 Quick-Save Active Tab (Ctrl+Shift+Y / Cmd+Shift+Y)
Save any website you're currently browsing straight into your TabLoque inbox with a single global keyboard shortcut.

🔹 Notes & Scratchpad Cards
Jot down quick thoughts, roadmaps, code snippets, or daily tasks right on your start page. Features a built-in markdown-friendly modal reader and quick copying.

🔹 Encrypted Local Auth Vault
Securely store developer tokens, staging accounts, and credentials locally with privacy masking and one-click copy on link launch.

🔹 Privacy-First & Offline Architecture
100% of your data stays locally on your device in Chrome's local storage. Zero analytics, zero tracking, and no external servers.

🔹 Optional Cloud Sync (Firebase)
Want to sync across your laptops? Connect your own private Google Firebase project for direct, encrypted synchronization where you retain full ownership of your data.

🔹 Keyboard Shortcuts & Fast Search
Search bookmarks, notes, or credentials instantly with the top liquid glass search capsule.

Transform your daily browser workflow with TabLoque!
```

---

## 🔒 4. Privacy Practices Tab (Crucial for Fast Approval)

Google reviewers inspect this section carefully. Fill it out with these exact answers:

### 1. Single Purpose
> `A visual drag-and-drop bookmark manager and productivity dashboard that replaces the new tab page with customizable boards, notes, and appearance themes.`

### 2. Permissions Justifications
Google asks why each permission in `manifest.json` is required:

- **`storage` & `unlimitedStorage`**:
  > *Used to store and persist user-created boards, bookmarks, notes, local vault items, and custom theme/background preferences on the user's device.*

- **`tabs` & `activeTab`**:
  > *Used solely when the user triggers the "quick-save-tab" command (Ctrl+Shift+Y) to retrieve the active tab's URL and title and save it as a bookmark.*

- **`favicon`**:
  > *Used to display the website icons (favicons) next to saved bookmarks from Chrome's cache.*

### 3. Data Usage Certifications
- **Does your extension collect user data?** Select **Yes** (User-generated bookmarks, notes, and local settings).
- Check the box: *"I certify that this extension complies with the Limited Use Policy."*
- Check: *"I certify that this extension does not sell user data to third parties, does not use or transfer data for purposes unrelated to the item's single purpose, and does not use or transfer data for creditworthiness or lending purposes."*
- **Privacy Policy URL:**
  Paste the link to your privacy policy (e.g., your GitHub repository `https://github.com/hannan-siddiqui/TabLoque/blob/main/PRIVACY_POLICY.md` or a personal site).

---

## 🖼️ 5. Store Graphics & Media Assets

Google requires:
1. **Store Icon (128x128 PNG)**:
   - Already provided in: `public/icons/icon128.png`
2. **Screenshots (1280x800 or 640x400)**:
   - At least **1 screenshot** is required (up to 5 allowed).
   - Take a screenshot of TabLoque open on your screen (or press `F11` in Chrome to go full screen on `http://localhost:5173/`, then capture with Windows Snipping Tool `Win + Shift + S`).
   - Recommended screenshots:
     1. Main Dashboard (boards, bookmarks, search bar, and glass cards).
     2. Theme & Wallpaper Customizer with patterns and color picker open.
     3. Notes Card & Auth Vault view.

---

## 🚀 6. Submit for Review
1. Review all tabs: **Package**, **Store Listing**, **Privacy**, and **Pricing & Distribution**.
2. Set Distribution to **Public** (or **Unlisted** if you prefer a private link first).
3. Click the blue **"Submit for Review"** button!
   - Reviews typically take between **24 to 72 hours**. Once approved, TabLoque will be live for everyone on the Chrome Web Store!
