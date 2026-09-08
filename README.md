<p align="center">
  <img src="public/icons/TabLoque.png" alt="TabLoque Logo" width="96" />
</p>

# TabLoque 🔖

> **Visual, Drag-and-Drop Bookmark Workspace replacing your Chrome New Tab page.**  
> Built with Manifest V3, React 18, Tailwind CSS, Vite, `@crxjs/vite-plugin`, `@dnd-kit`, and Firebase Firestore.

---

## ✨ Features

- **New Tab Override**: Replaces the default Chrome New Tab page with an aesthetic, customizable visual board canvas.
- **Hierarchical Structure**: Organize links into **Pages (Workspaces) → Boards (Columns) → Bookmarks (Cards)**.
- **Multi-Container Drag-and-Drop**:
  - Reorder bookmark cards inside the same board.
  - Drag and drop cards seamlessly across different boards.
  - Reorder boards horizontally across the canvas.
- **Quick-Save Global Shortcut**:
  - Press `Ctrl+Shift+Y` (or `Cmd+Shift+Y` on macOS) on any web page to immediately capture its URL and title into your active board.
- **Privacy Mode (Screen Share Protection)**:
  - One-click toggle in the header that applies a CSS blur filter over all bookmarks, preventing sensitive internal URLs and project titles from leaking during presentations or calls.
- **Chrome Bookmark Importer**:
  - Bulk-import existing browser bookmarks from standard Chrome HTML export files with automatic folder-to-board mapping.
- **Dual-Layer Persistence & Cloud Sync**:
  - Prioritizes `chrome.storage.local` for instant, offline-first performance.
  - Optional real-time bidirectional synchronization with Firebase Firestore to keep your workspace identical across all workstations.

---

## 🚀 Quick Setup & Installation in Chrome

### 1. Build the Extension
```bash
npm install
npm run build
```
This compiles the extension into the production-ready `dist/` directory.

### 2. Load Unpacked in Chrome
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** using the toggle switch in the top-right corner.
3. Click the **Load unpacked** button in the top-left.
4. Select the `dist` folder inside this project directory (`TabLoque/dist`).
5. Open a new tab (`Ctrl+T` or `Cmd+T`) — your TabLoque workspace will load instantly!

---

## 🛠️ Local Development (Live Reload)

To develop with hot module reloading:
```bash
npm run dev
```
- In Chrome with the unpacked extension loaded, Vite and CRXJS automatically hot-reload changes as you edit files!
- You can also open `http://localhost:5173` directly in your browser to test UI components. TabLoque includes an automatic fallback to `localStorage` when running outside the Chrome extension runtime.

---

## ☁️ Firebase Cloud Sync Setup (Optional)

1. Create a project at [Firebase Console](https://console.firebase.google.com/).
2. Add a Web App (`</>`) to your project.
3. Enable **Cloud Firestore** in test mode or with security rules for your user ID.
4. In TabLoque, click the **Settings (gear icon)** in the top right.
5. Enter your `Project ID`, `API Key`, `Auth Domain`, and `App ID`.
6. Choose a **Sync Key** (e.g., `work-laptop` or your email address). Any device with the same Firebase config and Sync Key will sync in real time.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Description |
| :--- | :--- |
| `Ctrl+Shift+Y` (Win/Linux) | Saves active browser tab to TabLoque |
| `Command+Shift+Y` (macOS) | Saves active browser tab to TabLoque |
