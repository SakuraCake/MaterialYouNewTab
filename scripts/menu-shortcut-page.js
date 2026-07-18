/*
 * Material You NewTab
 * Copyright (c) 2024-2026 Prem, 2023-2025 XengShi
 * Copyright (c) 2026 SakuraCake
 * Modified by SakuraCake for SakuraKono
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */


// Get the current language from localStorage
const currentLanguage = localStorage.getItem("selectedLanguage") || "en";
const isRTL = rtlLanguages.includes(currentLanguage);

// ------------Showing & Hiding Menu-bar ---------------
const menuButton = document.getElementById("menuButton");
const menuBar = document.getElementById("menuBar");
const menuCont = document.getElementById("menuCont");
const optCont = document.getElementById("optCont");
const overviewPage = document.getElementById("overviewPage");
const shortcutEditPage = document.getElementById("shortcutEditPage");
const settingsPage = document.getElementById("settingsPage");

// All sub-pages (slide-in pages within the menu)
const subPages = [
    settingsPage,
    shortcutEditPage,
    document.getElementById("aboutPage"),
    document.getElementById("projectsPage"),
    document.getElementById("contactPage"),
    document.getElementById("linksPage"),
    document.getElementById("friendsPage")
].filter(Boolean);

// Navigation state
let currentPage = overviewPage;

function pageReset() {
    optCont.scrollTop = 0;
    currentPage = overviewPage;
    overviewPage.style.transform = "translateX(0)";
    overviewPage.style.opacity = "1";
    overviewPage.style.display = "block";
    subPages.forEach(p => {
        p.style.transform = "translateX(120%)";
        p.style.opacity = "0";
        p.style.display = "none";
    });
}

const closeMenuBar = () => {
    requestAnimationFrame(() => {
        optCont.style.opacity = "0"
        optCont.style.transform = "translateX(100%)"
    });
    setTimeout(() => {
        requestAnimationFrame(() => {
            menuBar.style.opacity = "0"
            menuCont.style.transform = "translateX(100%)"
        });
    }, 14);
    setTimeout(() => {
        // Disable smooth scroll temporarily
        menuCont.style.scrollBehavior = "auto";
        menuCont.scrollTop = 0;

        // Restore smooth scroll
        requestAnimationFrame(() => {
            menuCont.style.scrollBehavior = "smooth";
        });

        menuBar.style.display = "none";
    }, 555);
}

const openMenuBar = () => {
    setTimeout(() => {
        menuBar.style.display = "block";
        pageReset();
    });
    setTimeout(() => {
        requestAnimationFrame(() => {
            menuBar.style.opacity = "1"
            menuCont.style.transform = "translateX(0px)"
        });
    }, 7);
    setTimeout(() => {
        requestAnimationFrame(() => {
            optCont.style.opacity = "1"
            optCont.style.transform = "translateX(0px)"
        });
    }, 11);
}

menuButton.addEventListener("click", () => {
    if (menuBar.style.display === "none" || menuBar.style.display === "") {
        openMenuBar();
    } else {
        closeMenuBar();
    }
});

//   ----------Hiding Menu Bar--------
menuBar.addEventListener("click", (event) => {
    if (event.target === menuBar) {
        closeMenuBar()
    }
});

// Hiding Menu Bar when user click on close button
document.getElementById("menuCloseButton").onclick = () => {
    closeMenuBar()
}


// Toggle expand/collapse sections
document.querySelectorAll(".sectionHeader").forEach(header => {
    header.addEventListener("click", () => {
        header.closest(".section").classList.toggle("expanded");
    });
});


/* ------ Page Transitions & Navigation Stack ------ */

function slideToPage(fromPage, toPage) {
    if (fromPage === toPage) return;
    setTimeout(() => {
        toPage.style.display = "block"
    });
    requestAnimationFrame(() => {
        fromPage.style.transform = "translateX(-120%)"
        fromPage.style.opacity = "0"
    });
    setTimeout(() => {
        requestAnimationFrame(() => {
            toPage.style.transform = "translateX(0)"
            toPage.style.opacity = "1"
        });
    }, 50);
    setTimeout(() => {
        fromPage.style.display = "none";
    }, 650);
    currentPage = toPage;
}

function slideBack(fromPage, toPage) {
    if (fromPage === toPage) return;
    setTimeout(() => {
        toPage.style.display = "block"
    });
    requestAnimationFrame(() => {
        fromPage.style.transform = "translateX(120%)";
        fromPage.style.opacity = "0";
    });
    setTimeout(() => {
        requestAnimationFrame(() => {
            toPage.style.transform = "translateX(0)";
            toPage.style.opacity = "1";
        });
    }, 50);
    setTimeout(() => {
        fromPage.style.display = "none";
    }, 650);
    currentPage = toPage;
}

// Open settings from nav
document.getElementById("openSettingsBtn").onclick = () => {
    slideToPage(currentPage, settingsPage);
}

// Settings back button → go to previous page
document.getElementById("settingsBackButton").onclick = () => {
    slideBack(settingsPage, overviewPage);
}

// Shortcut edit button (in settings page) → opens shortcut editor
document.getElementById("shortcutEditButton").onclick = () => {
    slideToPage(currentPage, shortcutEditPage);
}

// Shortcut edit back button → go to previous page
document.getElementById("backButton").onclick = () => {
    slideBack(shortcutEditPage, settingsPage);
}

// Navigation items → slide to sub-page
document.querySelectorAll(".navItem[data-nav]").forEach(item => {
    item.addEventListener("click", function () {
        const page = this.dataset.nav;
        if (page === "home") {
            closeMenuBar();
            return;
        }
        const targetPage = document.getElementById(page + "Page");
        if (targetPage) {
            slideToPage(currentPage, targetPage);
        }
    });
});

// Sub-page back buttons → go to previous page
document.querySelectorAll(".pageBackButton").forEach(btn => {
    btn.addEventListener("click", function () {
        const pageId = this.dataset.page;
        const pageEl = document.getElementById(pageId);
        if (pageEl) slideBack(pageEl, overviewPage);
    });
});

