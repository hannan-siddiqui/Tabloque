# Privacy Policy for TabLoque

**Last Updated:** September 14, 2026

TabLoque ("we", "our", or "the Extension") is committed to protecting your privacy. This Privacy Policy explains how TabLoque handles your data and privacy when you use the TabLoque Chrome Extension.

---

### 1. Single Purpose
TabLoque is a visual, drag-and-drop bookmark manager and productivity dashboard that replaces your default Chrome New Tab page with customizable liquid glass boards, notes scratchpads, credential vaults, and customizable themes.

---

### 2. Information We Handle & Where It Is Stored

TabLoque is built on an **offline-first, privacy-by-design** architecture:

- **Bookmarks & Boards**: URLs, titles, and layout configurations you create are stored **locally** on your device using Chrome's secure storage API (`chrome.storage.local`).
- **Notes & Scratchpad Items**: Text notes created in TabLoque reside exclusively in your local browser storage.
- **Credentials & Auth Vault**: Any logins or tokens stored in the optional Auth Vault are stored locally on your device.
- **Customization Settings**: Selected themes, custom colors, background patterns, and wallpaper configurations are stored locally.

> **We do not operate any external tracking servers, telemetry services, or remote analytics.** We do not collect, view, sell, or monetize any of your personal browsing history, bookmarks, or data.

---

### 3. Permissions Justification

TabLoque requests only the minimum permissions necessary to function:

| Permission | Purpose |
| :--- | :--- |
| `storage` & `unlimitedStorage` | To store and persist your boards, bookmarks, notes, custom layouts, and appearance preferences locally in your browser. |
| `tabs` & `activeTab` | Used solely when you press the quick-save shortcut (`Ctrl+Shift+Y` or `Cmd+Shift+Y`) to read the URL and title of the active tab so it can be added to your bookmarks board. |
| `favicon` | Used to display website icons (favicons) next to your saved bookmarks directly from Chrome's local cache. |

---

### 4. Optional Cloud Synchronization (Firebase)

TabLoque provides an **optional** cloud synchronization feature. If you choose to enable cloud sync:
- You provide your own private Firebase configuration credentials.
- Synchronization occurs directly between your browser and your own Google Firebase project.
- TabLoque developers never have access to your Firebase project or your synchronized data.

---

### 5. Data Retention and Deletion

- All data stored by TabLoque can be exported as a JSON backup at any time via the Settings modal.
- You can clear your data at any time via Settings -> Reset to Default, or by uninstalling the extension from `chrome://extensions`.

---

### 6. Contact & Support

If you have questions regarding this Privacy Policy or TabLoque, please contact:
- **Developer**: Hannan Siddiqui
- **Repository**: [GitHub - TabLoque](https://github.com/hannan-siddiqui/TabLoque)
