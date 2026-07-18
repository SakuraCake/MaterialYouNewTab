/* 
 * Material You NewTab
 * Copyright (c) 2024-2026 Prem, 2023-2025 XengShi
 * Copyright (c) 2026 SakuraCake
 * Modified by SakuraCake for SakuraKono
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program. 
 * If not, see <https://www.gnu.org/licenses/>.
 */

// ------------------------ Bookmark System -----------------------------------
// DOM Variables
const bookmarkButton = document.getElementById("bookmarkButton");
const bookmarkSidebar = document.getElementById("bookmarkSidebar");
const bookmarkList = document.getElementById("bookmarkList");
const bookmarkSearch = document.getElementById("bookmarkSearch");
const bookmarkSearchClearButton = document.getElementById("clearSearchButton");
const bookmarkViewGrid = document.getElementById("bookmarkViewGrid");
const bookmarkViewList = document.getElementById("bookmarkViewList");
const bookmarksCheckbox = document.getElementById("bookmarksCheckbox");

const editBookmarkModal = document.getElementById("editBookmarkModal");
const editBookmarkName = document.getElementById("editBookmarkName");
const editBookmarkURL = document.getElementById("editBookmarkURL");
const editBookmarkFavicon = document.getElementById("editBookmarkFavicon");
const saveBookmarkChanges = document.getElementById("saveBookmarkChanges");
const cancelBookmarkEdit = document.getElementById("cancelBookmarkEdit");
let currentBookmarkId = null;

const sortAlphabetical = document.getElementById("sortAlphabetical");
const sortTimeAdded = document.getElementById("sortTimeAdded");
let currentSortMethod = localStorage.getItem("bookmarkSortMethod") || 'title';

var bookmarksAPI;
if (typeof browser !== 'undefined' && browser.bookmarks) {
    bookmarksAPI = browser.bookmarks;
} else if (typeof chrome !== 'undefined' && chrome.bookmarks && chrome.bookmarks.getTree) {
    bookmarksAPI = chrome.bookmarks;
} else {
    // Standalone mode: localStorage-based bookmarks
    bookmarksAPI = createLocalBookmarksAPI();
}

function createLocalBookmarksAPI() {
    let nextId = Date.now();
    function getLinks() {
        try { return JSON.parse(localStorage.getItem("personalLinks") || "[]"); }
        catch { return []; }
    }
    function saveLinks(links) {
        localStorage.setItem("personalLinks", JSON.stringify(links));
    }
    function toNodes(links) {
        return links.map(l => ({ id: l.id, title: l.title, url: l.url, dateAdded: l.dateAdded }));
    }
    return {
        getTree() {
            const links = getLinks();
            return Promise.resolve([{
                id: "0", title: "root",
                children: links.length > 0 ? toNodes(links) : undefined
            }]);
        },
        getRecent(count) {
            const links = [...getLinks()].sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0));
            return Promise.resolve(toNodes(links.slice(0, count)));
        },
        create(data) {
            const links = getLinks();
            const id = "local_" + (nextId++);
            const bookmark = { id, title: data.title || "", url: data.url || "", dateAdded: Date.now() };
            links.push(bookmark);
            saveLinks(links);
            return Promise.resolve(bookmark);
        },
        remove(id) {
            saveLinks(getLinks().filter(l => l.id !== id));
            return Promise.resolve();
        },
        update(id, data) {
            const links = getLinks();
            const idx = links.findIndex(l => l.id === id);
            if (idx !== -1) { links[idx].title = data.title; links[idx].url = data.url; saveLinks(links); }
            return Promise.resolve();
        }
    };
}

// Initialize sort buttons
updateSortButtons();

bookmarkButton.addEventListener("click", function () {
    toggleBookmarkSidebar();
    bookmarkSearchClearButton.click();
    bookmarkSearch.focus();
});

bookmarkViewGrid.addEventListener("click", function () {
    if (!bookmarkGridCheckbox.checked) bookmarkGridCheckbox.click();
});

bookmarkViewList.addEventListener("click", function () {
    if (bookmarkGridCheckbox.checked) bookmarkGridCheckbox.click();
});

document.addEventListener("click", function (event) {
    const modalContainer = document.getElementById("prompt-modal-container");
    // If modal is open, don't close the sidebar
    if (modalContainer && modalContainer.style.display === "flex") {
        return;
    }

    if (
        !bookmarkSidebar.contains(event.target) &&
        !bookmarkButton.contains(event.target) &&
        !editBookmarkModal.contains(event.target) &&
        bookmarkSidebar.classList.contains("open")
    ) {
        toggleBookmarkSidebar();

        if (editBookmarkModal.style.display !== "none") {
            editBookmarkModal.style.display = "none";
        }
    }
});

// Search Functionality
bookmarkSearch.addEventListener("input", function () {
    const searchTerm = bookmarkSearch.value.toLowerCase();
    const bookmarks = bookmarkList.querySelectorAll("li[data-url], li.folder"); // Include both bookmarks and folders

    Array.from(bookmarks).forEach(function (bookmark) {
        const text = bookmark.textContent.toLowerCase();
        const url = bookmark.dataset.url ? bookmark.dataset.url.toLowerCase() : "";
        const isFolder = bookmark.classList.contains("folder");

        // Show bookmarks if the search term matches either the name or the URL
        if (!isFolder && (text.includes(searchTerm) || url.includes(searchTerm))) {
            bookmark.style.display = ""; // Show matching bookmarks
        } else if (isFolder) {
            // For folders, check if any child bookmarks match the search
            const childBookmarks = bookmark.querySelectorAll("li[data-url]");
            let hasVisibleChild = false;
            Array.from(childBookmarks).forEach(function (childBookmark) {
                const childText = childBookmark.textContent.toLowerCase();
                const childUrl = childBookmark.dataset.url ? childBookmark.dataset.url.toLowerCase() : "";
                if (childText.includes(searchTerm) || childUrl.includes(searchTerm)) {
                    hasVisibleChild = true;
                    childBookmark.style.display = ""; // Show matching child bookmarks
                } else {
                    childBookmark.style.display = "none"; // Hide non-matching child bookmarks
                }
            });

            if (hasVisibleChild) {
                bookmark.style.display = ""; // Show folder if it has matching child bookmarks
                bookmark.classList.add("open"); // Open folder to show matching child bookmarks
            } else {
                bookmark.style.display = "none"; // Hide folder if no child matches
                bookmark.classList.remove("open");
            }
        } else {
            bookmark.style.display = "none"; // Hide non-matching bookmarks
        }
    });

    if (searchTerm === "") {
        // Reset display for all bookmarks and folders
        Array.from(bookmarks).forEach(function (bookmark) {
            bookmark.style.display = "";
            if (bookmark.classList.contains("folder")) {
                bookmark.classList.remove("open");
                const childList = bookmark.querySelector("ul");
                if (childList) {
                    childList.classList.add("hidden");
                }
            }
        });
    }

    // Show or hide the clear button based on the search term
    bookmarkSearchClearButton.style.display = searchTerm ? "inline" : "none";
});

// Sorting functionality
sortAlphabetical.addEventListener("click", function () {
    if (!this.classList.contains("active")) {
        currentSortMethod = 'title';
        localStorage.setItem("bookmarkSortMethod", "title");
        updateSortButtons();
        loadBookmarks();
    }
});

sortTimeAdded.addEventListener("click", function () {
    if (!this.classList.contains("active")) {
        currentSortMethod = 'date';
        localStorage.setItem("bookmarkSortMethod", "date");
        updateSortButtons();
        loadBookmarks();
    }
});

function updateSortButtons() {
    sortAlphabetical.classList.toggle("active", currentSortMethod === 'title');
    sortTimeAdded.classList.toggle("active", currentSortMethod === 'date');
}


bookmarkSearchClearButton.addEventListener("click", function () {
    bookmarkSearch.value = "";
    bookmarkSearch.dispatchEvent(new Event("input")); // Trigger input event to clear search results
});

function updateBookmarkUI(enabled) {
    bookmarksCheckbox.checked = enabled;
    bookmarkButton.style.display = enabled ? "flex" : "none";
    saveDisplayStatus("bookmarksDisplayStatus", enabled ? "flex" : "none");
    saveCheckboxState("bookmarksCheckboxState", bookmarksCheckbox);
}

async function verifyBookmarkPermission() {
    if (!bookmarksAPI) {
        updateBookmarkUI(false);
        return false;
    }
    return true;
}

async function toggleBookmarkSidebar() {
    const hasPermission = await verifyBookmarkPermission();
    if (hasPermission) {
        bookmarkSidebar.classList.toggle("open");
        bookmarkButton.classList.toggle("rotate");

        if (bookmarkSidebar.classList.contains("open")) {
            loadBookmarks();
        }
    }
}

// Function to load bookmarks
function loadBookmarks() {
    if (!bookmarksAPI?.getTree) {
        console.error("Bookmarks API is unavailable. Please check permissions or context.");
        return;
    }

    bookmarksAPI.getTree().then(bookmarkTreeNodes => {
        // Clear the current list
        bookmarkList.innerHTML = "";

        // Display the "Recently Added" folder
        if (bookmarksAPI.getRecent) {
            bookmarksAPI.getRecent(8).then(recentBookmarks => {
                if (recentBookmarks.length > 0) {
                    const recentAddedFolder = {
                        title: translations[currentLanguage]?.recentlyAddedBookmarks || translations["en"]?.recentlyAddedBookmarks,
                        children: recentBookmarks
                    };
                    bookmarkList.appendChild(displayBookmarks([recentAddedFolder]));
                }
            });
        }

        // For Firefox: "Bookmarks Menu" and "Other Bookmarks" are distinct nodes
        if (isFirefox) {
            const toolbarNode = bookmarkTreeNodes[0]?.children?.find(node => node.title === "Bookmarks Toolbar");
            const menuNode = bookmarkTreeNodes[0]?.children?.find(node => node.title === "Bookmarks Menu");
            const otherNode = bookmarkTreeNodes[0]?.children?.find(node => node.title === "Other Bookmarks");

            if (toolbarNode?.children) bookmarkList.appendChild(displayBookmarks(toolbarNode.children));
            if (menuNode?.children) bookmarkList.appendChild(displayBookmarks(menuNode.children));
            if (otherNode?.children) bookmarkList.appendChild(displayBookmarks(otherNode.children));
        }
        else {
            let default_folder = "Bookmarks bar";
            if (isEdge) default_folder = "Favorites bar";
            if (isBrave) default_folder = "Bookmarks";

            // Get the children of the root bookmark folder
            const rootChildren = bookmarkTreeNodes[0]?.children || [];

            // Find and process the default bookmarks folder
            const mainBookmarks = rootChildren.find(node =>
                node.title === default_folder ||
                node.folderType === "bookmarks-bar"
            );

            // If the default folder has children, display its bookmarks
            if (mainBookmarks?.children) {
                bookmarkList.appendChild(displayBookmarks(mainBookmarks.children));
            }

            // Process all other root-level folders
            rootChildren.forEach(node => {
                if (node !== mainBookmarks && node.id !== "1" && node.children) {
                    bookmarkList.appendChild(displayBookmarks([node]));
                }
            });
        }
    }).catch(err => {
        console.error("Error loading bookmarks:", err);
    });
}

// Function to set the favicon for a bookmark
function setBookmarkFavicon(faviconElement, pageUrl) {
    const offlineFallback = () => faviconElement.src = "./svgs/offline.svg";
    const googleFallback = () => {
        try {
            faviconElement.src = `https://www.google.com/s2/favicons?domain=${new URL(pageUrl).hostname}&sz=32`;
        } catch { faviconElement.src = "./svgs/offline.svg"; }
        faviconElement.onerror = offlineFallback;
    };

    const hasChromeRuntime = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
    if (hasChromeRuntime && !isFirefox) {
        faviconElement.src = `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(pageUrl)}&size=32`;
        faviconElement.onerror = googleFallback;
    } else {
        googleFallback();
    }
}

function displayBookmarks(bookmarkNodes) {
    let list = document.createElement("ul");

    // Separate folders and bookmarks
    const folders = bookmarkNodes.filter(node => node.children && node.children.length > 0);
    const bookmarks = bookmarkNodes.filter(node => node.url);

    // Sorting folders and bookmarks separately by title or dateAdded
    if (currentSortMethod === 'title') {
        folders.sort((a, b) => a.title.localeCompare(b.title));
        bookmarks.sort((a, b) => a.title.localeCompare(b.title));
    } else {
        folders.sort((a, b) => (a.dateAdded || 0) - (b.dateAdded || 0));
        bookmarks.sort((a, b) => (a.dateAdded || 0) - (b.dateAdded || 0));
    }

    // Combine folders and bookmarks
    const sortedNodes = [...bookmarks, ...folders];

    for (let node of sortedNodes) {
        if (node.id === "1") continue;

        if (node.children && node.children.length > 0) {
            let folderItem = document.createElement("li");

            folderItem.dataset.id = node.id; // Add ID as dataset for context menu

            // Use the SVG icon from HTML
            const folderIcon = document.getElementById("folderIconTemplate").cloneNode(true);
            folderIcon.removeAttribute("id"); // Remove the id to prevent duplicates
            folderItem.appendChild(folderIcon);

            folderItem.appendChild(document.createTextNode(node.title));
            folderItem.classList.add("folder", "open");

            // Add event listener for unfolding/folding
            folderItem.addEventListener("click", function (event) {
                event.stopPropagation();
                folderItem.classList.toggle("open");
                const subList = folderItem.querySelector("ul");
                if (subList) {
                    subList.classList.toggle("hidden");
                }
            });

            let subList = displayBookmarks(node.children);
            folderItem.appendChild(subList);

            list.appendChild(folderItem);
        } else if (node.url) {
            let item = document.createElement("li");
            item.dataset.id = node.id; // Add ID as dataset for context menu
            item.dataset.url = node.url; // Add URL as dataset for search functionality
            let link = document.createElement("a");
            link.href = node.url;
            let span = document.createElement("span");
            span.textContent = node.title;

            const favicon = document.createElement("img");
            setBookmarkFavicon(favicon, node.url);
            favicon.classList.add("favicon");

            // Create the delete button
            let deleteButton = document.createElement("button");
            deleteButton.textContent = "✖";
            deleteButton.classList.add("bookmark-delete-button");

            deleteButton.addEventListener("click", async function (event) {
                event.preventDefault();
                event.stopPropagation();

                const confirmMessage = (translations[currentLanguage]?.deleteBookmark || translations["en"].deleteBookmark)
                    .replace("{title}", node.title || node.url);

                if (await confirmPrompt(confirmMessage)) {
                    try {
                        const result = bookmarksAPI.remove(node.id);
                        if (result && typeof result.then === 'function') {
                            await result;
                        }
                        item.remove();
                    } catch (err) {
                        console.error("Error removing bookmark:", err);
                    }
                }
            });

            link.appendChild(favicon);
            link.appendChild(span);
            item.appendChild(link);
            item.appendChild(deleteButton); // Add delete button to the item

            // Open links in the current tab or new tab if ctrl pressed
            link.addEventListener("click", function (event) {
                const hasBrowserTabs = typeof browser !== 'undefined' && browser.tabs;
                const hasChromeTabs = typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create;
                event.preventDefault();
                if (event.ctrlKey || event.metaKey) {
                    if (hasBrowserTabs) browser.tabs.create({ url: node.url, active: false });
                    else if (hasChromeTabs) chrome.tabs.create({ url: node.url, active: false });
                    else window.open(node.url, "_blank");
                } else {
                    if (hasBrowserTabs) browser.tabs.update({ url: node.url });
                    else if (hasChromeTabs) chrome.tabs.update({ url: node.url });
                    else window.location.href = node.url;
                }
            });
            list.appendChild(item);
        }
    }

    list.addEventListener("click", function (event) {
        event.stopPropagation();
    });

    return list;
}

// Right-click (context menu) event
bookmarkList.addEventListener("contextmenu", function (event) {
    event.preventDefault(); // Prevent default right-click menu

    const bookmarkItem = event.target.closest("li[data-id]");
    if (!bookmarkItem) return;

    currentBookmarkId = bookmarkItem.dataset.id;
    const bookmarkTitle = bookmarkItem.querySelector("a").textContent.trim();
    const bookmarkURL = bookmarkItem.dataset.url;

    // Populate modal fields
    editBookmarkName.value = bookmarkTitle;
    editBookmarkURL.value = bookmarkURL;
    setBookmarkFavicon(editBookmarkFavicon, bookmarkURL);

    // Show modal
    document.getElementById("editBookmarkHeading").textContent = "Edit Bookmark";
    editBookmarkModal.style.display = "block";
    saveBookmarkChanges.disabled = false;
});

// Disable save button if URL is empty
editBookmarkURL.addEventListener("input", () => {
    saveBookmarkChanges.disabled = editBookmarkURL.value.trim() === "";
});

// Save button action
saveBookmarkChanges.onclick = function () {
    const updatedTitle = editBookmarkName.value.trim();
    const updatedURL = encodeURI(editBookmarkURL.value.trim());

    const updatedData = { title: updatedTitle, url: updatedURL };
    let action;

    if (!currentBookmarkId || currentBookmarkId === "new") {
        if (!updatedURL) return;
        action = bookmarksAPI.create ? bookmarksAPI.create(updatedData) : null;
    } else {
        action = bookmarksAPI.update(currentBookmarkId, updatedData);
    }

    function done() {
        if (currentBookmarkId && currentBookmarkId !== "new") {
            updateBookmark(currentBookmarkId, updatedTitle, updatedURL);
        }
        editBookmarkModal.style.display = "none";
        currentBookmarkId = null;
        loadBookmarks();
    }

    try {
        if (action && typeof action.then === 'function') {
            action.then(done).catch(err => console.error("Error saving bookmark:", err));
        } else {
            done();
        }
    } catch (err) {
        console.error("Error saving bookmark:", err);
    }
};

// Cancel button action
cancelBookmarkEdit.onclick = function () {
    editBookmarkModal.style.display = "none";
    currentBookmarkId = null;
};

// "Add link" button handler
document.getElementById("addBookmarkBtn").addEventListener("click", function () {
    currentBookmarkId = "new";
    editBookmarkName.value = "";
    editBookmarkURL.value = "";
    editBookmarkFavicon.src = "";
    document.getElementById("editBookmarkHeading").textContent = "Add Link";
    saveBookmarkChanges.disabled = true;
    editBookmarkModal.style.display = "block";
    setTimeout(() => editBookmarkName.focus(), 100);
});

// Function to update after edit
function updateBookmark(bookmarkId, title, url) {
    const bookmarkItem = document.querySelector(`li[data-id="${bookmarkId}"]`);
    if (bookmarkItem) {
        const link = bookmarkItem.querySelector("a");
        link.textContent = title;
        link.href = url;
        bookmarkItem.dataset.url = url;
    }
}

// Move focus to URL field when Enter is pressed in Name field
editBookmarkName.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        editBookmarkURL.focus();
    }
});

// Trigger Save button when Enter is pressed in URL field
editBookmarkURL.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        if (!saveBookmarkChanges.disabled) {
            saveBookmarkChanges.click();
        }
    }
});

// ------------------------ End of Bookmark System -----------------------------------

// Save and load the state of the bookmarks toggle
document.addEventListener("DOMContentLoaded", function () {
    bookmarksCheckbox.addEventListener("change", async function () {
        if (!bookmarksCheckbox.checked) {
            updateBookmarkUI(false);
            return;
        }
        await verifyBookmarkPermission();
    });

    bookmarkGridCheckbox.addEventListener("change", function () {
        saveCheckboxState("bookmarkGridCheckboxState", bookmarkGridCheckbox);
        if (bookmarkGridCheckbox.checked) {
            bookmarkList.classList.add("grid-view");
        } else {
            bookmarkList.classList.remove("grid-view");
        }
    });

    const savedBookmarks = localStorage.getItem("bookmarksCheckboxState");
    bookmarksCheckbox.checked = savedBookmarks ? savedBookmarks === "checked" : false;
    const savedDisplay = localStorage.getItem("bookmarksDisplayStatus");
    bookmarkButton.style.display = savedDisplay || (bookmarksCheckbox.checked ? "flex" : "none");
    loadCheckboxState("bookmarkGridCheckboxState", bookmarkGridCheckbox);
});

// Keyboard shortcut for bookmarks
document.addEventListener("keydown", function (event) {
    // Prevent shortcut if modal or menu is open
    const modalContainer = document.getElementById("prompt-modal-container");
    if (modalContainer?.style.display === "flex" || menuBar.style.display !== "none") {
        return;
    }

    if (bookmarksCheckbox.checked &&
        event.key === "ArrowRight" &&
        !event.repeat &&
        event.target.tagName !== "INPUT" &&
        event.target.tagName !== "TEXTAREA" &&
        event.target.isContentEditable !== true
    ) {
        bookmarkButton.click();
    }
});


