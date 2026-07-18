/*
 * Material You New Tab
 * Copyright (c) 2024-2026 Prem, 2023-2025 XengShi
 * Copyright (c) 2026 SakuraCake
 * Modified by SakuraCake for SakuraKono
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

const hitokotoUrl = "https://v1.hitokoto.cn/";

const quotesContainer = document.querySelector(".quotesContainer");
const authorName = document.querySelector(".authorName span");
const authorContainer = document.querySelector(".authorName");

const FALLBACK_QUOTE = {
    quote: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson"
};

const INTERVALS = { load: 0, hourly: 3600000, daily: 86400000, weekly: 604800000 };

const CATEGORY_KEYS = [
    "hitokotoTypeAll", "hitokotoTypeA", "hitokotoTypeB", "hitokotoTypeC",
    "hitokotoTypeD", "hitokotoTypeE", "hitokotoTypeF", "hitokotoTypeG",
    "hitokotoTypeH", "hitokotoTypeI", "hitokotoTypeJ", "hitokotoTypeK",
    "hitokotoTypeL"
];
const CATEGORY_VALUES = ["", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"];

const INTERVAL_KEYS = ["hitokotoIntervalLoad", "hitokotoIntervalHourly", "hitokotoIntervalDaily", "hitokotoIntervalWeekly"];
const INTERVAL_VALUES = ["load", "hourly", "daily", "weekly"];

function fitAuthorWidth() {
    requestAnimationFrame(() => {
        const padding = 16;
        authorContainer.style.width = (authorName.scrollWidth + padding * 2) + "px";
    });
}

function clearQuotesStorage() {
    localStorage.removeItem("hitokotoCachedQuote");
    quotesContainer.textContent = "";
    authorName.textContent = "";
}

function displayFallbackQuote() {
    quotesContainer.textContent = FALLBACK_QUOTE.quote;
    authorName.textContent = FALLBACK_QUOTE.author;
    fitAuthorWidth();
}

function getCachedQuote() {
    try {
        const stored = localStorage.getItem("hitokotoCachedQuote");
        return stored ? JSON.parse(stored) : null;
    } catch { return null; }
}

function setCachedQuote(quote) {
    localStorage.setItem("hitokotoCachedQuote", JSON.stringify({
        quote: quote.quote,
        author: quote.author,
        timestamp: Date.now()
    }));
}

function isQuoteExpired() {
    const interval = localStorage.getItem("hitokotoInterval") || "load";
    if (interval === "load") return true;
    const cached = getCachedQuote();
    if (!cached || !cached.timestamp) return true;
    const diff = Date.now() - cached.timestamp;
    return diff > (INTERVALS[interval] || 0);
}

function populateSelect(selectId, values, keys) {
    const select = document.getElementById(selectId);
    if (!select) return;
    const lang = translations[currentLanguage] || translations["en"];
    select.innerHTML = "";
    values.forEach((value, i) => {
        const opt = document.createElement("option");
        opt.value = value;
        opt.textContent = lang[keys[i]] || keys[i];
        select.appendChild(opt);
    });
}

async function fetchHitokotoQuote() {
    try {
        const category = localStorage.getItem("hitokotoCategory") || "";
        const url = category ? `${hitokotoUrl}?c=${category}` : hitokotoUrl;
        const response = await fetch(url);
        const data = await response.json();
        return {
            quote: data.hitokoto || "",
            author: data.from_who || data.from || ""
        };
    } catch (error) {
        console.error("Error fetching hitokoto:", error);
        return null;
    }
}

async function displayQuote() {
    try {
        if (!isQuoteExpired()) {
            const cached = getCachedQuote();
            if (cached && cached.quote) {
                quotesContainer.textContent = cached.quote;
                authorName.textContent = cached.author || "";
                fitAuthorWidth();
                return;
            }
        }

        const quote = await fetchHitokotoQuote();
        if (!quote || !quote.quote) {
            displayFallbackQuote();
            return;
        }

        setCachedQuote(quote);

        quotesContainer.textContent = quote.quote;
        authorName.textContent = quote.author || "";
        fitAuthorWidth();
    } catch (error) {
        console.error("Error displaying quote:", error);
        displayFallbackQuote();
    }
}

async function loadAndDisplayQuote(forceRefresh = false) {
    if (forceRefresh) {
        localStorage.removeItem("hitokotoCachedQuote");
    }
    await displayQuote();
}

document.addEventListener("DOMContentLoaded", () => {
    const hideSearchWith = document.getElementById("shortcut_switchcheckbox");
    const quotesToggle = document.getElementById("quotesToggle");
    const motivationalQuotesCont = document.getElementById("motivationalQuotesCont");
    const motivationalQuotesCheckbox = document.getElementById("motivationalQuotesCheckbox");
    const searchWithContainer = document.getElementById("search-with-container");
    const hitokotoCategorySelect = document.getElementById("hitokotoCategorySelect");
    const hitokotoIntervalSelect = document.getElementById("hitokotoIntervalSelect");
    const quotesOptions = document.querySelector(".quotesOptions");

    // Migrate old dailyQuoteEnabled setting
    if (localStorage.getItem("dailyQuoteEnabled") !== null) {
        const wasDaily = localStorage.getItem("dailyQuoteEnabled") === "false";
        localStorage.setItem("hitokotoInterval", wasDaily ? "daily" : "load");
        localStorage.removeItem("dailyQuoteEnabled");
    }
    // Clean up old daily_quote keys
    const keys = Object.keys(localStorage);
    keys.forEach(k => { if (k.startsWith("daily_quote_")) localStorage.removeItem(k); });

    // Populate selects
    populateSelect("hitokotoCategorySelect", CATEGORY_VALUES, CATEGORY_KEYS);
    populateSelect("hitokotoIntervalSelect", INTERVAL_VALUES, INTERVAL_KEYS);

    // Load saved values
    const savedCategory = localStorage.getItem("hitokotoCategory") || "";
    const savedInterval = localStorage.getItem("hitokotoInterval") || "load";
    if (hitokotoCategorySelect) hitokotoCategorySelect.value = savedCategory;
    if (hitokotoIntervalSelect) hitokotoIntervalSelect.value = savedInterval;

    hideSearchWith.checked = localStorage.getItem("showShortcutSwitch") === "true";
    motivationalQuotesCheckbox.checked = localStorage.getItem("motivationalQuotesVisible") !== "false";

    const updateMotivationalQuotesState = () => {
        const isHideSearchWithEnabled = hideSearchWith.checked;
        const isMotivationalQuotesEnabled = motivationalQuotesCheckbox.checked;

        localStorage.setItem("motivationalQuotesVisible", isMotivationalQuotesEnabled);

        if (!isHideSearchWithEnabled) {
            quotesToggle.classList.add("inactive");
            quotesOptions.classList.add("not-applicable");
            motivationalQuotesCont.style.display = "none";
            clearQuotesStorage();
            return;
        }

        quotesToggle.classList.remove("inactive");
        searchWithContainer.style.display = isMotivationalQuotesEnabled ? "none" : "flex";
        motivationalQuotesCont.style.display = isMotivationalQuotesEnabled ? "flex" : "none";

        quotesOptions.classList.toggle("not-applicable", !isMotivationalQuotesEnabled);

        if (isMotivationalQuotesEnabled) {
            displayQuote();
        } else {
            clearQuotesStorage();
        }
    };

    // Category change
    if (hitokotoCategorySelect) {
        hitokotoCategorySelect.addEventListener("change", () => {
            localStorage.setItem("hitokotoCategory", hitokotoCategorySelect.value);
            localStorage.removeItem("hitokotoCachedQuote");
            displayQuote();
        });
    }

    // Interval change
    if (hitokotoIntervalSelect) {
        hitokotoIntervalSelect.addEventListener("change", () => {
            localStorage.setItem("hitokotoInterval", hitokotoIntervalSelect.value);
            if (hitokotoIntervalSelect.value === "load") {
                localStorage.removeItem("hitokotoCachedQuote");
                displayQuote();
            } else {
                // Store current quote with new timestamp
                const currentQuote = quotesContainer.textContent;
                const currentAuthor = authorName.textContent;
                if (currentQuote && currentAuthor) {
                    setCachedQuote({ quote: currentQuote, author: currentAuthor });
                }
            }
        });
    }

    updateMotivationalQuotesState();

    hideSearchWith.addEventListener("change", () => {
        searchWithContainer.style.display = "flex";
        updateMotivationalQuotesState();
    });

    motivationalQuotesCheckbox.addEventListener("change", updateMotivationalQuotesState);
});

