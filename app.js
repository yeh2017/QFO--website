document.addEventListener("DOMContentLoaded", () => {
    initActiveNav();
    initCopyButtons();
    initSandbox();
    initLatestRelease();
});

async function initLatestRelease() {
    const endpoint = "https://api.github.com/repos/yeh2017/QFO-Quant-Platform/releases/latest";

    try {
        const response = await fetch(endpoint, {
            headers: { Accept: "application/vnd.github+json" },
        });
        if (!response.ok) return;

        const release = await response.json();
        if (!release.tag_name || !release.zipball_url || !release.html_url) return;

        const releaseAsset = release.assets?.find(
            (asset) => asset.name === "QFO-Quant-Platform.zip",
        );
        const downloadUrl = releaseAsset?.browser_download_url || release.zipball_url;

        document.querySelectorAll("[data-release-download]").forEach((link) => {
            link.href = downloadUrl;
        });
        document.querySelectorAll("[data-release-page]").forEach((link) => {
            link.href = release.html_url;
        });
        document.querySelectorAll("[data-release-tag]").forEach((label) => {
            label.textContent = release.tag_name;
        });

        const publishedDate = release.published_at?.slice(0, 10);
        document.querySelectorAll("[data-release-date]").forEach((time) => {
            if (!publishedDate) return;
            time.dateTime = publishedDate;
            time.textContent = publishedDate;
        });

        const structuredData = document.getElementById("software-data");
        if (structuredData) {
            const data = JSON.parse(structuredData.textContent);
            data.softwareVersion = release.tag_name.replace(/^v/, "");
            data.downloadUrl = downloadUrl;
            structuredData.textContent = JSON.stringify(data);
        }
    } catch {
        // Keep the stable release links already rendered in the page.
    }
}

function initActiveNav() {
    const links = Array.from(document.querySelectorAll(".side-nav a"));
    const sections = links
        .map((link) => document.querySelector(link.getAttribute("href")))
        .filter(Boolean);

    const setActive = () => {
        let current = sections[0]?.id;
        for (const section of sections) {
            if (section.getBoundingClientRect().top <= 120) {
                current = section.id;
            }
        }
        links.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
        });
    };

    document.addEventListener("scroll", setActive, { passive: true });
    setActive();
}

function initCopyButtons() {
    document.querySelectorAll(".copy-button").forEach((button) => {
        button.addEventListener("click", async () => {
            const code = button.parentElement.querySelector("code")?.innerText || "";
            try {
                await navigator.clipboard.writeText(code);
                showToast("已复制启动命令");
            } catch {
                showToast("复制失败，请手动复制");
            }
        });
    });
}

function initSandbox() {
    const capital = document.getElementById("capital");
    const risk = document.getElementById("risk");
    const factor = document.getElementById("factor");
    const returnMetric = document.getElementById("returnMetric");
    const drawdownMetric = document.getElementById("drawdownMetric");
    const sharpeMetric = document.getElementById("sharpeMetric");
    const capitalValue = document.getElementById("capitalValue");
    const riskValue = document.getElementById("riskValue");
    const factorValue = document.getElementById("factorValue");

    if (!capital || !risk || !factor) return;

    const update = () => {
        const c = Number(capital.value);
        const r = Number(risk.value);
        const f = Number(factor.value);
        const expectedReturn = 6 + r * 1.15 + f * 0.9 + c / 35;
        const drawdown = 3 + r * 0.72 + Math.max(0, 7 - f) * 0.35;
        const sharpe = Math.max(0.4, expectedReturn / (drawdown * 2.1));

        capitalValue.textContent = `${c} 万`;
        riskValue.textContent = `${r} / 10`;
        factorValue.textContent = `${f} / 10`;
        returnMetric.textContent = `${expectedReturn.toFixed(1)}%`;
        drawdownMetric.textContent = `${drawdown.toFixed(1)}%`;
        sharpeMetric.textContent = sharpe.toFixed(2);
    };

    [capital, risk, factor].forEach((input) => input.addEventListener("input", update));
    update();
}

function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 1800);
}
