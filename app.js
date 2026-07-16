document.addEventListener("DOMContentLoaded", () => {
    initActiveNav();
    initCopyButtons();
    initSandbox();
});

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
