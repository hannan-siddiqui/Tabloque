export interface ParsedBookmarkItem {
  title: string;
  url: string;
  faviconUrl?: string;
  folder?: string;
}

export interface ParsedBookmarkGroup {
  folderName: string;
  bookmarks: ParsedBookmarkItem[];
}

/**
 * Parses Chrome / Netscape HTML Bookmark export file.
 */
export function parseChromeBookmarksHtml(htmlString: string): ParsedBookmarkGroup[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');

  const groups: Map<string, ParsedBookmarkItem[]> = new Map();
  const defaultFolder = 'Imported Bookmarks';

  // Recursive walker over <DT> and <DL>
  function walk(node: Element, currentFolderName: string) {
    const children = Array.from(node.children);

    for (let i = 0; i < children.length; i++) {
      const el = children[i];
      const tag = el.tagName.toUpperCase();

      if (tag === 'H3') {
        // Folder title
        const folderName = el.textContent?.trim() || defaultFolder;
        // The corresponding DL might be the next sibling or inside a DT
        const nextEl = el.nextElementSibling;
        if (nextEl && nextEl.tagName.toUpperCase() === 'DL') {
          walk(nextEl, folderName);
        }
      } else if (tag === 'A') {
        // Bookmark link
        const url = el.getAttribute('href');
        const title = el.textContent?.trim() || url || 'Untitled';
        const faviconUrl = el.getAttribute('icon') || undefined;

        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
          const folder = currentFolderName || defaultFolder;
          if (!groups.has(folder)) {
            groups.set(folder, []);
          }
          groups.get(folder)!.push({
            title,
            url,
            faviconUrl,
            folder,
          });
        }
      } else if (tag === 'DL' || tag === 'DT' || tag === 'P' || tag === 'BODY') {
        walk(el, currentFolderName);
      }
    }
  }

  // Find root DL or body
  const root = doc.querySelector('dl') || doc.body;
  if (root) {
    walk(root, defaultFolder);
  }

  // Convert map to array
  const result: ParsedBookmarkGroup[] = [];
  groups.forEach((bookmarks, folderName) => {
    if (bookmarks.length > 0) {
      result.push({ folderName, bookmarks });
    }
  });

  return result;
}
