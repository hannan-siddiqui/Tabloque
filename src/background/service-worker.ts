import { TabloqueState, Bookmark, Board, Page } from '../types';

const STORAGE_KEY = 'tabloque_state_v1';

// Listen for global command (Ctrl+Shift+Y or Cmd+Shift+Y)
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'quick-save-tab') {
    await saveCurrentTabToTabLoque();
  }
});

/**
 * Grabs the active tab's title and URL and persists it to the active board.
 */
async function saveCurrentTabToTabLoque() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs || tabs.length === 0) return;

    const currentTab = tabs[0];
    if (!currentTab.url || currentTab.url.startsWith('chrome://') || currentTab.url.startsWith('edge://')) {
      return;
    }

    // Load state
    const data = await chrome.storage.local.get([STORAGE_KEY]);
    let state: TabloqueState = data[STORAGE_KEY];

    if (!state) {
      return;
    }

    // Determine target board
    const activePage: Page | undefined = state.pages[state.activePageId] || Object.values(state.pages)[0];
    if (!activePage) return;

    let targetBoardId = activePage.boardIds[0];

    // If active page has no boards, create a default Quick Inbox board
    if (!targetBoardId || !state.boards[targetBoardId]) {
      const inboxBoardId = 'board-' + Date.now();
      const newBoard: Board = {
        id: inboxBoardId,
        title: 'Quick Inbox',
        color: 'indigo',
        bookmarkIds: [],
        createdAt: Date.now(),
      };
      state.boards[inboxBoardId] = newBoard;
      activePage.boardIds.unshift(inboxBoardId);
      targetBoardId = inboxBoardId;
    }

    const newBookmarkId = 'bm-' + Date.now();
    const newBookmark: Bookmark = {
      id: newBookmarkId,
      title: currentTab.title || currentTab.url,
      url: currentTab.url,
      description: `Saved from active tab on ${new Date().toLocaleDateString()}`,
      createdAt: Date.now(),
    };

    state.bookmarks[newBookmarkId] = newBookmark;
    state.boards[targetBoardId].bookmarkIds.unshift(newBookmarkId);

    await chrome.storage.local.set({ [STORAGE_KEY]: state });

    // Show temporary badge confirmation on extension action icon
    if (chrome.action) {
      await chrome.action.setBadgeText({ text: '✓' });
      await chrome.action.setBadgeBackgroundColor({ color: '#4f46e5' });
      setTimeout(() => {
        chrome.action.setBadgeText({ text: '' });
      }, 2500);
    }
  } catch (error) {
    console.error('[TabLoque Background] Error saving current tab:', error);
  }
}

// Service worker install & update handler
chrome.runtime.onInstalled.addListener(() => {
  console.log('[TabLoque] Extension installed and background worker ready.');
});
