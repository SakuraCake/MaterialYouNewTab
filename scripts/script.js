/*
 * Material You New Tab
 * Copyright (c) 2024-2026 Prem, 2023-2025 XengShi
 * Copyright (c) 2026 SakuraCake
 * Modified by SakuraCake for SakuraKono
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

// ------------------------------------ Tips ------------------------------------
document.addEventListener("DOMContentLoaded", function () {
    if (!isDesktop) {
        localStorage.setItem("hideTips", "true");
    }

    const tips = document.getElementById("tips");
    const dontShowButton = document.getElementById("dontShowTips");

    if (localStorage.getItem("hideTips") === "true") {
        tips.classList.add("tips-hidden");
    }

    dontShowButton.addEventListener("click", function () {
        tips.classList.add("tips-hidden");
        localStorage.setItem("hideTips", "true");
    });
});


// ------------------------------- Footer Toast -------------------------------
(function () {
    if (isFirefoxAll || !isDesktop) return; // Don't show on Firefox or mobile

    const TOAST_DURATION = 30 * 1000; // 30 seconds
    const STORAGE_KEY = 'chrome-footer-toast-shown';

    const toast = document.getElementById('chromeFooterToast');
    const progressBar = document.getElementById('toastProgressBar');
    const closeBtn = document.getElementById('toastClose');

    let progressInterval;
    let elapsedTime = 0;
    let lastTick = 0;
    let isPaused = false;

    function showToast() {
        // Check if toast has been shown before
        const hasShown = localStorage.getItem(STORAGE_KEY);
        if (hasShown) return;

        // Mark as shown
        localStorage.setItem(STORAGE_KEY, 'true');

        // Show toast after brief delay
        setTimeout(() => {
            toast.classList.add('show');
            startProgress();
        }, 1500);
    }

    function hideToast() {
        toast.classList.remove('show');
        clearInterval(progressInterval);
    }

    function startProgress() {
        lastTick = Date.now();

        progressInterval = setInterval(() => {
            if (isPaused) return;

            const now = Date.now();
            elapsedTime += now - lastTick;
            lastTick = now;

            const remaining = Math.max(0, 100 - (elapsedTime / TOAST_DURATION) * 100);

            progressBar.style.width = remaining + '%';

            if (elapsedTime >= TOAST_DURATION) {
                hideToast();
            }
        }, 50);
    }

    // Hover pause
    toast.addEventListener('mouseenter', () => {
        isPaused = true;
    });

    toast.addEventListener('mouseleave', () => {
        isPaused = false;
        lastTick = Date.now();
    });

    closeBtn.addEventListener('click', hideToast);

    showToast();
})();

