/*
 * Material You New Tab
 * Copyright (c) 2024-2026 Prem, 2023-2025 XengShi
 * Copyright (c) 2026 SakuraCake
 * Modified by SakuraCake for SakuraKono
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 */

// Sub-page content definitions
const pageData = {
    about: {
        title: "关于我",
        content: `
            <div class="aboutPage">
                <div class="aboutAvatar">
                    <svg width="80" height="80" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="40" class="accentColor" opacity="0.3"/>
                        <text x="40" y="48" text-anchor="middle" class="textColorDark" font-size="28">🌸</text>
                    </svg>
                </div>
                <h2 class="aboutName">SakuraCake</h2>
                <p class="aboutBio">热爱技术与创作，致力于打造优雅的数字体验。SakuraKono 是我的个人品牌，代表着我对美学与功能的追求。</p>
                <div class="aboutAttribution">
                    <p>本页面基于 <a href="https://github.com/prem-k-r/MaterialYouNewTab" target="_blank">Material You NewTab</a> 修改，遵循 GPL-3.0 协议。</p>
                    <p>原作者：<a href="https://github.com/XengShi" target="_blank">XengShi</a> / <a href="https://github.com/prem-k-r" target="_blank">Prem</a></p>
                    <p>修改者：SakuraCake</p>
                </div>
                <div class="aboutSkills">
                    <span class="skillTag">HTML</span>
                    <span class="skillTag">CSS</span>
                    <span class="skillTag">JavaScript</span>
                    <span class="skillTag">React</span>
                    <span class="skillTag">Python</span>
                    <span class="skillTag">Node.js</span>
                </div>
            </div>
        `
    },
    projects: {
        title: "我的项目",
        content: `<div class="projectsPage" id="projectsContainer"></div>`
    },
    contact: {
        title: "联系我",
        content: `
            <div class="contactPage">
                <p class="contactIntro">可以通过以下方式联系我：</p>
                <a class="contactItem" href="mailto:sakura@example.com">
                    <span class="contactIcon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                        </svg>
                    </span>
                    <span>sakura@example.com</span>
                </a>
                <a class="contactItem" href="https://github.com/SakuraCake" target="_blank" rel="noopener">
                    <span class="contactIcon">
                        <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="20" height="20">
                            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                        </svg>
                    </span>
                    <span>github.com/SakuraCake</span>
                </a>
                <div class="contactForm">
                    <h3>或直接留言</h3>
                    <input type="text" placeholder="你的名字" class="contactInput" disabled>
                    <input type="email" placeholder="你的邮箱" class="contactInput" disabled>
                    <textarea placeholder="留言内容..." class="contactTextarea" rows="4" disabled></textarea>
                    <button class="contactSubmit" disabled>发送 (占位)</button>
                </div>
            </div>
        `
    },
    links: {
        title: "个人链接",
        content: `<div class="linksPage" id="linksContainer"></div>`
    },
    friends: {
        title: "友情链接",
        content: `<div class="linksPage" id="friendsContainer"></div>`
    }
};

// Initialize sub-pages
document.addEventListener("DOMContentLoaded", () => {
    for (const [key, data] of Object.entries(pageData)) {
        const contentEl = document.getElementById(key + "Content");
        const titleEl = document.getElementById(key + "Title");
        if (contentEl) contentEl.innerHTML = data.content;
        if (titleEl) titleEl.textContent = data.title;
    }

    // Render links dynamically
    renderLinks("linksContainer", [
        { title: "GitHub", url: "https://github.com/SakuraCake", desc: "开源代码仓库" },
        { title: "博客", url: "#", desc: "个人技术博客（建设中）" },
        { title: "B站", url: "#", desc: "Bilibili 个人空间" },
    ]);

    renderLinks("friendsContainer", [
        // Add friend links here, e.g.:
        // { title: "朋友", url: "https://...", desc: "..." }
    ]);

    // Fetch GitHub repos
    loadGitHubProjects("SakuraCake", "projectsContainer");
});

function renderLinks(containerId, links) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!links || links.length === 0) {
        container.innerHTML = `<p class="emptyHint"></p>`;
        return;
    }
    container.innerHTML = links.map(link => `
        <a class="linkItem" href="${link.url}" target="_blank" rel="noopener">
            <div class="linkItemTitle">${link.title}</div>
            <div class="linkItemDesc">${link.desc}</div>
            <div class="linkItemUrl">${link.url}</div>
        </a>
    `).join("");
}

async function loadGitHubProjects(username, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `<p class="emptyHint">加载中...</p>`;
    try {
        const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10&type=owner`);
        if (!res.ok) throw new Error("HTTP " + res.status);
        const repos = await res.json();
        if (!repos || repos.length === 0) {
            container.innerHTML = ``;
            return;
        }
        container.innerHTML = repos.map(repo => `
            <a class="projectCard" href="${repo.html_url}" target="_blank" rel="noopener">
                <h3>${repo.name}</h3>
                <p>${repo.description || "暂无描述"}</p>
                <div class="projectTags">
                    ${repo.language ? `<span class="skillTag">${repo.language}</span>` : ""}
                    ${repo.stargazers_count > 0 ? `<span class="skillTag">★ ${repo.stargazers_count}</span>` : ""}
                    ${repo.fork ? `<span class="skillTag">Fork</span>` : ""}
                </div>
            </a>
        `).join("");
    } catch (e) {
        container.innerHTML = `<p class="emptyHint">网络异常，无法加载项目</p>`;
    }
}

