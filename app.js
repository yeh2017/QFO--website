// ==========================================
// QFO量化回测平台 - 交互与 Canvas 渲染 JS
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initInnerTabs();
    initCopyButtons();
    initFactorSliders();
    initBacktestSandbox();
});

/**
 * 1. 侧边栏 Tab 切换路由逻辑（带哈希定位）
 */
function initNavigation() {
    const menuItems = document.querySelectorAll(".menu-item");
    const pageLinks = document.querySelectorAll("a[data-target]:not(.menu-item)");
    const sections = document.querySelectorAll(".content-section");

    const switchTab = (targetId) => {
        if (!targetId) return;
        
        menuItems.forEach(item => {
            item.classList.remove("active");
            item.removeAttribute("aria-current");
        });
        sections.forEach(sec => sec.classList.remove("active"));

        const activeMenu = document.querySelector(`.menu-item[data-target="${targetId}"]`);
        const activeSection = document.getElementById(targetId);

        if (activeSection) {
            activeSection.classList.add("active");
            if (activeMenu) {
                activeMenu.classList.add("active");
                activeMenu.setAttribute("aria-current", "page");
            }
            window.dispatchEvent(new Event("resize"));
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    menuItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = item.getAttribute("data-target");
            switchTab(targetId);
            window.location.hash = targetId;
        });
    });

    pageLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = link.getAttribute("data-target");
            switchTab(targetId);
            window.location.hash = targetId;
        });
    });

    const handleHashChange = () => {
        const hash = window.location.hash.replace("#", "");
        if (hash) {
            switchTab(hash);
        } else {
            switchTab("intro");
        }
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();
}

/**
 * 2. 课程大卡片内部的 观念-程序 切换 Tab 逻辑
 */
function initInnerTabs() {
    const tabBtns = document.querySelectorAll(".inner-tab-btn");
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetId = btn.getAttribute("data-tab");
            const container = btn.closest(".tutorial-card");
            
            // 去除当前卡片下所有 Tab 按钮的 active 样式
            const siblingBtns = container.querySelectorAll(".inner-tab-btn");
            siblingBtns.forEach(s => s.classList.remove("active"));
            
            // 激活当前点击按钮
            btn.classList.add("active");
            
            // 隐藏当前卡片下的其他选项卡内容
            const siblingContents = container.querySelectorAll(".inner-tab-content");
            siblingContents.forEach(c => c.classList.remove("active"));
            
            // 显示目标选项卡内容
            const targetContent = container.querySelector(`#${targetId}`);
            if (targetContent) {
                targetContent.classList.add("active");
            }
        });
    });
}

function initCopyButtons() {
    document.querySelectorAll(".btn-copy").forEach(button => {
        button.addEventListener("click", () => copyCode(button));
    });

    document.querySelectorAll(".btn-copy-prompt").forEach(button => {
        button.addEventListener("click", () => copyPrompt(button));
    });
}

/**
 * 3. 复制代码块功能（带有优雅的 Toast 显示）
 */
function copyCode(button) {
    const container = button.closest(".code-container");
    const code = container.querySelector("code");
    if (!code) return;

    const textToCopy = code.innerText;

    copyText(textToCopy).then(() => {
        const toast = document.getElementById("toast");
        const toastText = toast.querySelector("span");
        toastText.innerText = "程序代码已成功复制到剪贴板";
        
        toast.classList.remove("toast-hidden");
        toast.classList.add("toast-visible");
        
        const originText = button.innerText;
        button.innerText = "已复制";
        
        setTimeout(() => {
            toast.classList.remove("toast-visible");
            toast.classList.add("toast-hidden");
            button.innerText = originText;
        }, 2000);
    }).catch(() => showToast("浏览器暂不允许复制，请手动选择代码"));
}

/**
 * 4. 复制 AI 核心提示词功能
 */
function copyPrompt(button) {
    const promptBox = button.closest(".prompt-box");
    const promptContent = promptBox.querySelector(".prompt-content");
    if (!promptContent) return;

    const textToCopy = promptContent.innerText;

    copyText(textToCopy).then(() => {
        const toast = document.getElementById("toast");
        const toastText = toast.querySelector("span");
        toastText.innerText = "教学提示词已成功复制到剪贴板";
        
        toast.classList.remove("toast-hidden");
        toast.classList.add("toast-visible");
        
        const originText = button.innerText;
        button.innerText = "已复制";
        
        setTimeout(() => {
            toast.classList.remove("toast-visible");
            toast.classList.add("toast-hidden");
            button.innerText = originText;
        }, 2000);
    }).catch(() => showToast("浏览器暂不允许复制，请手动选择提示词"));
}

function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();

    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);

    return copied ? Promise.resolve() : Promise.reject(new Error("copy failed"));
}

function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    const toastText = toast.querySelector("span");
    toastText.innerText = message;
    toast.classList.remove("toast-hidden");
    toast.classList.add("toast-visible");

    setTimeout(() => {
        toast.classList.remove("toast-visible");
        toast.classList.add("toast-hidden");
    }, 2000);
}

/**
 * 5. 滑动条双向联动锁定（动量权重 + 价值权重 = 100%）
 */
function initFactorSliders() {
    const sliderMomentum = document.getElementById("weight-momentum");
    const valMomentum = document.getElementById("weight-momentum-val");
    const sliderValue = document.getElementById("weight-value");
    const valValue = document.getElementById("weight-value-val");

    if (!sliderMomentum || !sliderValue) return;

    const syncSliders = (changedSlider) => {
        const value = parseInt(changedSlider.value);
        const counterValue = 100 - value;

        if (changedSlider === sliderMomentum) {
            sliderValue.value = counterValue;
            valMomentum.innerText = `${value}%`;
            valValue.innerText = `${counterValue}%`;
        } else {
            sliderMomentum.value = counterValue;
            valValue.innerText = `${value}%`;
            valMomentum.innerText = `${counterValue}%`;
        }
    };

    sliderMomentum.addEventListener("input", () => syncSliders(sliderMomentum));
    sliderValue.addEventListener("input", () => syncSliders(sliderValue));
}

/**
 * 6. 在线回测沙盒与带十字星光标交互的高阶 Canvas 绘图引擎
 */
let globalBacktestData = null; // 缓存回测数据用于 Crosshair 悬停交互
const CHART_COLORS = {
    strategy: "#1d4ed8",
    strategyFillTop: "rgba(37, 99, 235, 0.18)",
    strategyFillBottom: "rgba(37, 99, 235, 0)",
    benchmark: "#0f766e",
    grid: "rgba(15, 23, 42, 0.08)",
    axis: "#64748b",
};

function initBacktestSandbox() {
    const canvas = document.getElementById("backtest-chart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const btnRun = document.getElementById("btn-run-backtest");

    const inputCash = document.getElementById("initial-cash");
    const selectStrategy = document.getElementById("strategy-type");
    const sliderMomentum = document.getElementById("weight-momentum");
    const selectPeriod = document.getElementById("market-period");

    const metricNav = document.getElementById("metric-nav");
    const metricReturn = document.getElementById("metric-return");
    const metricBench = document.getElementById("metric-bench");
    const metricSharpe = document.getElementById("metric-sharpe");
    const metricDrawdown = document.getElementById("metric-drawdown");
    const metricTrades = document.getElementById("metric-trades");

    function resizeCanvas() {
        const rect = canvas.parentNode.getBoundingClientRect();
        if (rect.width <= 0) return;
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = 320 * window.devicePixelRatio;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `320px`;
        ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
        
        // 若存在回测数据，重绘
        if (globalBacktestData) {
            drawChartStatic(ctx, canvas, globalBacktestData.strategyData, globalBacktestData.benchmarkData);
        } else {
            drawEmptyState(ctx, rect.width, 320);
        }
    }
    
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // 绘制初始未运行状态
    drawEmptyState(ctx, canvas.width / window.devicePixelRatio, 320);

    // 绑定回测事件
    btnRun.addEventListener("click", () => {
        const initialCash = parseFloat(inputCash.value) || 100000;
        const strategy = selectStrategy.value;
        const momentumWeight = parseInt(sliderMomentum.value) / 100.0;
        const period = selectPeriod.value;

        btnRun.innerText = "正在运行策略回测...";
        btnRun.disabled = true;
        resizeCanvas();

        setTimeout(() => {
            const simulated = runSimulation(initialCash, strategy, momentumWeight, period);
            globalBacktestData = simulated;

            animateChart(ctx, canvas, simulated.strategyData, simulated.benchmarkData, () => {
                drawChartStatic(ctx, canvas, simulated.strategyData, simulated.benchmarkData);
                metricNav.innerText = `¥${simulated.finalNav.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
                metricReturn.innerText = `${simulated.totalReturn >= 0 ? "+" : ""}${(simulated.totalReturn * 100).toFixed(2)}%`;
                metricReturn.style.color = simulated.totalReturn >= 0 ? "#09090b" : "#71717a";
                
                metricBench.innerText = `${simulated.benchReturn >= 0 ? "+" : ""}${(simulated.benchReturn * 100).toFixed(2)}%`;
                metricBench.style.color = simulated.benchReturn >= 0 ? "#09090b" : "#71717a";

                metricSharpe.innerText = simulated.sharpe.toFixed(2);
                metricDrawdown.innerText = `${(simulated.maxDrawdown * 100).toFixed(2)}%`;
                metricTrades.innerText = `${simulated.tradesCount} 次`;

                btnRun.innerText = "开始回测模拟";
                btnRun.disabled = false;
            });

        }, 500);
    });

    // ── 鼠标悬浮十字星 Crosshair 交互设计 ──
    canvas.addEventListener("mousemove", (e) => {
        if (!globalBacktestData || btnRun.disabled) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        drawChartWithCrosshair(ctx, canvas, globalBacktestData.strategyData, globalBacktestData.benchmarkData, mouseX, mouseY);
    });

    canvas.addEventListener("mouseleave", () => {
        if (!globalBacktestData || btnRun.disabled) return;
        drawChartStatic(ctx, canvas, globalBacktestData.strategyData, globalBacktestData.benchmarkData);
    });
}

/**
 * 绘制底图就绪状态
 */
function drawEmptyState(ctx, width, height) {
    ctx.clearRect(0, 0, width, height);
    const margin = { top: 34, right: 30, bottom: 44, left: 64 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const previewStrategy = [100, 101.5, 100.8, 103.2, 105.7, 104.9, 108.4, 111.2, 110.1, 114.6, 117.4, 116.8, 121.3];
    const previewBenchmark = [100, 100.6, 99.8, 101.1, 102.4, 101.7, 103.2, 104.1, 103.7, 105.5, 106.2, 105.8, 107.1];
    const allData = [...previewStrategy, ...previewBenchmark];
    const minVal = Math.min(...allData) * 0.98;
    const maxVal = Math.max(...allData) * 1.02;
    const range = maxVal - minVal;
    const getX = (index) => margin.left + (index / (previewStrategy.length - 1)) * chartWidth;
    const getY = (value) => margin.top + chartHeight - ((value - minVal) / range) * chartHeight;

    drawChartFrame(ctx, width, height, margin, chartWidth, chartHeight, minVal, range);

    const grad = ctx.createLinearGradient(0, margin.top, 0, margin.top + chartHeight);
    grad.addColorStop(0, "rgba(37, 99, 235, 0.12)");
    grad.addColorStop(1, "rgba(37, 99, 235, 0)");
    ctx.beginPath();
    ctx.moveTo(getX(0), margin.top + chartHeight);
    previewStrategy.forEach((value, index) => ctx.lineTo(getX(index), getY(value)));
    ctx.lineTo(getX(previewStrategy.length - 1), margin.top + chartHeight);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = CHART_COLORS.benchmark;
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 5]);
    drawSmoothCurve(ctx, previewBenchmark, previewBenchmark.length, getX, getY);
    ctx.setLineDash([]);

    ctx.strokeStyle = CHART_COLORS.strategy;
    ctx.lineWidth = 4;
    drawSmoothCurve(ctx, previewStrategy, previewStrategy.length, getX, getY);

    ctx.fillStyle = CHART_COLORS.strategy;
    ctx.beginPath();
    ctx.arc(getX(previewStrategy.length - 1), getY(previewStrategy[previewStrategy.length - 1]), 5, 0, Math.PI * 2);
    ctx.fill();

    drawLegend(ctx, margin.left + 12, margin.top - 14);

    ctx.fillStyle = "#475569";
    ctx.font = "600 12px 'Microsoft YaHei', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("点击「开始回测模拟」生成策略净值曲线", width / 2, height - 16);
}

function drawChartFrame(ctx, width, height, margin, chartWidth, chartHeight, minVal, range) {
    ctx.strokeStyle = CHART_COLORS.grid;
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(15, 23, 42, 0.06)";
    ctx.fillStyle = CHART_COLORS.axis;
    ctx.font = "400 10px 'JetBrains Mono', Consolas, monospace";
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) {
        const val = minVal + (range * i) / 4;
        const y = margin.top + chartHeight - (chartHeight * i) / 4;
        ctx.beginPath();
        ctx.moveTo(margin.left, y);
        ctx.lineTo(width - margin.right, y);
        ctx.stroke();
        ctx.fillText(`¥${(val / 10000).toFixed(1)}万`, margin.left - 10, y + 3);
    }

    ctx.textAlign = "center";
    for (let i = 0; i < 5; i++) {
        const pct = i / 4;
        const x = margin.left + chartWidth * pct;
        ctx.beginPath();
        ctx.moveTo(x, margin.top);
        ctx.lineTo(x, margin.top + chartHeight);
        ctx.stroke();
        ctx.fillText(`DAY ${Math.round(pct * 100)}`, x, margin.top + chartHeight + 18);
    }
}

function drawLegend(ctx, x, y) {
    ctx.textAlign = "left";
    ctx.font = "700 11px 'JetBrains Mono', Consolas, monospace";
    ctx.fillStyle = CHART_COLORS.strategy;
    ctx.fillRect(x, y, 18, 5);
    ctx.fillText("策略净值", x + 26, y + 7);

    ctx.strokeStyle = CHART_COLORS.benchmark;
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 5]);
    ctx.beginPath();
    ctx.moveTo(x + 118, y + 3);
    ctx.lineTo(x + 138, y + 3);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = CHART_COLORS.benchmark;
    ctx.fillText("沪深300基准", x + 146, y + 7);
}

/**
 * 高斯随机游走数据模拟
 */
function runSimulation(initialCash, strategy, momentumWeight, period) {
    const dataPoints = 100;
    let strategyData = [initialCash];
    let benchmarkData = [initialCash];

    let trendBench = 0.0;
    let volBench = 0.012;
    let trendStrategy = 0.0;
    let volStrategy = 0.01;

    if (period === "bull-market") {
        trendBench = 0.0009;
        volBench = 0.007;
        if (strategy === "multi-factor") {
            const alpha = 1.0 - Math.abs(momentumWeight - 0.4) * 2;
            trendStrategy = trendBench + 0.0006 + alpha * 0.0007;
            volStrategy = 0.008;
        } else if (strategy === "macd-momentum") {
            trendStrategy = trendBench + 0.0011;
            volStrategy = 0.011;
        } else {
            trendStrategy = trendBench - 0.0001;
            volStrategy = 0.007;
        }
    } else if (period === "bear-market") {
        trendBench = -0.0013;
        volBench = 0.012;
        if (strategy === "mean-reversion") {
            trendStrategy = -0.0001;
            volStrategy = 0.008;
        } else if (strategy === "multi-factor") {
            const valueWeight = 1.0 - momentumWeight;
            trendStrategy = trendBench + 0.0004 + valueWeight * 0.0007;
            volStrategy = 0.01;
        } else {
            trendStrategy = trendBench - 0.0004;
            volStrategy = 0.014;
        }
    } else {
        trendBench = 0.0000;
        volBench = 0.015;
        if (strategy === "mean-reversion") {
            trendStrategy = 0.0010;
            volStrategy = 0.006;
        } else if (strategy === "multi-factor") {
            trendStrategy = 0.0002;
            volStrategy = 0.011;
        } else {
            trendStrategy = -0.0007;
            volStrategy = 0.016;
        }
    }

    const randomNormal = () => {
        let u = 0, v = 0;
        while(u === 0) u = Math.random();
        while(v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    };

    let maxNav = initialCash;
    let maxDd = 0.0;
    
    for (let i = 1; i < dataPoints; i++) {
        const randBench = randomNormal();
        const randStrat = randomNormal();

        const retBench = trendBench + volBench * randBench;
        const retStrat = trendStrategy + volStrategy * randStrat;

        const nextBench = benchmarkData[i - 1] * (1 + retBench);
        const nextStrat = strategyData[i - 1] * (1 + retStrat);

        benchmarkData.push(nextBench);
        strategyData.push(nextStrat);

        if (nextStrat > maxNav) {
            maxNav = nextStrat;
        }
        const dd = (maxNav - nextStrat) / maxNav;
        if (dd > maxDd) {
            maxDd = dd;
        }
    }

    const finalNav = strategyData[dataPoints - 1];
    const finalBench = benchmarkData[dataPoints - 1];
    const totalReturn = (finalNav - initialCash) / initialCash;
    const benchReturn = (finalBench - initialCash) / initialCash;
    
    const dailyReturns = [];
    for (let i = 1; i < strategyData.length; i++) {
        dailyReturns.push((strategyData[i] - strategyData[i-1]) / strategyData[i-1]);
    }
    const avgDailyReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
    const stdDailyReturn = Math.sqrt(dailyReturns.map(x => Math.pow(x - avgDailyReturn, 2)).reduce((a, b) => a + b, 0) / dailyReturns.length);
    const annualizedVol = stdDailyReturn * Math.sqrt(252);
    const annualizedReturn = avgDailyReturn * 252;
    const rf = 0.02;
    const sharpe = annualizedVol > 0 ? (annualizedReturn - rf) / annualizedVol : 0.0;

    let tradesCount = 10;
    if (strategy === "macd-momentum") {
        tradesCount = Math.floor(14 + Math.random() * 8);
    } else if (strategy === "mean-reversion") {
        tradesCount = Math.floor(18 + Math.random() * 12);
    } else {
        tradesCount = Math.floor(6 + Math.random() * 4);
    }

    return {
        strategyData,
        benchmarkData,
        tradesCount,
        finalNav,
        totalReturn,
        benchReturn,
        sharpe: Math.max(0.02, sharpe),
        maxDrawdown: maxDd
    };
}

/**
 * 贝塞尔曲线连线算法辅助函数
 */
const drawSmoothCurve = (ctx, data, visiblePoints, getX, getY) => {
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(data[0]));
    
    if (visiblePoints === 2) {
        ctx.lineTo(getX(1), getY(data[1]));
    } else if (visiblePoints > 2) {
        for (let i = 0; i < visiblePoints - 2; i++) {
            const xc = (getX(i) + getX(i + 1)) / 2;
            const yc = (getY(data[i]) + getY(data[i + 1])) / 2;
            ctx.quadraticCurveTo(getX(i), getY(data[i]), xc, yc);
        }
        ctx.quadraticCurveTo(
            getX(visiblePoints - 2), 
            getY(data[visiblePoints - 2]), 
            getX(visiblePoints - 1), 
            getY(data[visiblePoints - 1])
        );
    }
    ctx.stroke();
};

/**
 * 渐变填充区域绘制辅助函数
 */
const drawGradientFill = (ctx, data, visiblePoints, getX, getY, margin, chartHeight) => {
    const grad = ctx.createLinearGradient(0, margin.top, 0, margin.top + chartHeight);
    grad.addColorStop(0, CHART_COLORS.strategyFillTop);
    grad.addColorStop(1, CHART_COLORS.strategyFillBottom);

    ctx.beginPath();
    ctx.moveTo(getX(0), margin.top + chartHeight);
    ctx.lineTo(getX(0), getY(data[0]));

    if (visiblePoints === 2) {
        ctx.lineTo(getX(1), getY(data[1]));
    } else if (visiblePoints > 2) {
        for (let i = 0; i < visiblePoints - 2; i++) {
            const xc = (getX(i) + getX(i + 1)) / 2;
            const yc = (getY(data[i]) + getY(data[i + 1])) / 2;
            ctx.quadraticCurveTo(getX(i), getY(data[i]), xc, yc);
        }
        ctx.quadraticCurveTo(
            getX(visiblePoints - 2), 
            getY(data[visiblePoints - 2]), 
            getX(visiblePoints - 1), 
            getY(data[visiblePoints - 1])
        );
    }

    ctx.lineTo(getX(visiblePoints - 1), margin.top + chartHeight);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
};

/**
 * 7. Canvas 平滑曲线生长动画
 */
function animateChart(ctx, canvas, strategyData, benchmarkData, callback) {
    const width = canvas.width / window.devicePixelRatio;
    const height = 320;
    
    const margin = { top: 35, right: 30, bottom: 45, left: 65 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const allData = [...strategyData, ...benchmarkData];
    const minVal = Math.min(...allData) * 0.98;
    const maxVal = Math.max(...allData) * 1.02;
    const range = maxVal - minVal;

    let frame = 0;
    const totalFrames = 50; 

    const getX = (index) => margin.left + (index / (strategyData.length - 1)) * chartWidth;
    const getY = (value) => margin.top + chartHeight - ((value - minVal) / range) * chartHeight;

    const drawFrame = () => {
        ctx.clearRect(0, 0, width, height);

        // 绘制卡片网格底图
        ctx.strokeStyle = "rgba(9, 9, 11, 0.06)";
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, width, height);

        // 绘制 Y 轴
        ctx.strokeStyle = "rgba(9, 9, 11, 0.02)";
        ctx.fillStyle = "#71717a";
        ctx.font = "400 9px 'Geist Mono', monospace";
        ctx.textAlign = "right";

        const yTicks = 4;
        for (let i = 0; i <= yTicks; i++) {
            const val = minVal + (range * i) / yTicks;
            const y = margin.top + chartHeight - (chartHeight * i) / yTicks;
            ctx.beginPath();
            ctx.moveTo(margin.left, y);
            ctx.lineTo(width - margin.right, y);
            ctx.stroke();
            ctx.fillText(`¥${(val / 10000).toFixed(1)}万`, margin.left - 12, y + 3);
        }

        // 绘制 X 轴
        ctx.textAlign = "center";
        const xTicks = 4;
        for (let i = 0; i < xTicks; i++) {
            const pct = i / (xTicks - 1);
            const x = margin.left + chartWidth * pct;
            ctx.beginPath();
            ctx.moveTo(x, margin.top);
            ctx.lineTo(x, margin.top + chartHeight);
            ctx.stroke();
            ctx.fillText(`DAY ${Math.round(pct * 100)}`, x, margin.top + chartHeight + 16);
        }

        const visiblePoints = Math.ceil((frame / totalFrames) * strategyData.length);

        // 绘制基准曲线 (HS300 - 灰色虚线)
        if (visiblePoints > 1) {
            ctx.strokeStyle = CHART_COLORS.benchmark;
            ctx.lineWidth = 3;
            ctx.setLineDash([8, 5]);
            drawSmoothCurve(ctx, benchmarkData, visiblePoints, getX, getY);
            ctx.setLineDash([]);
        }

        // 绘制策略面积渐变
        if (visiblePoints > 1) {
            drawGradientFill(ctx, strategyData, visiblePoints, getX, getY, margin, chartHeight);
        }

        // 绘制策略曲线 (深黑粗实线)
        if (visiblePoints > 1) {
            ctx.strokeStyle = CHART_COLORS.strategy;
            ctx.lineWidth = 4;
            drawSmoothCurve(ctx, strategyData, visiblePoints, getX, getY);
        }

        // 绘制生长前沿端点闪烁环
        if (visiblePoints > 1) {
            const lastIdx = visiblePoints - 1;
            const endX = getX(lastIdx);
            const endY = getY(strategyData[lastIdx]);

            ctx.fillStyle = CHART_COLORS.strategy;
            ctx.beginPath();
            ctx.arc(endX, endY, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = "rgba(37, 99, 235, 0.24)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(endX, endY, 10, 0, Math.PI * 2);
            ctx.stroke();
        }

        // 绘制图例
        ctx.textAlign = "left";
        ctx.font = "600 8.5px 'Geist Mono', monospace";
        ctx.fillStyle = CHART_COLORS.strategy;
        ctx.fillRect(margin.left + 15, margin.top - 18, 12, 5);
        ctx.fillText("策略净值", margin.left + 33, margin.top - 13);

        ctx.strokeStyle = CHART_COLORS.benchmark;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(margin.left + 165, margin.top - 15);
        ctx.lineTo(margin.left + 177, margin.top - 15);
        ctx.stroke();
        ctx.fillStyle = CHART_COLORS.benchmark;
        ctx.fillText("沪深300基准", margin.left + 185, margin.top - 13);

        if (frame < totalFrames) {
            frame++;
            requestAnimationFrame(drawFrame);
        } else {
            callback();
        }
    };

    drawFrame();
}

/**
 * 8. 绘制静态图表（无动画重绘，供尺寸自适应）
 */
function drawChartStatic(ctx, canvas, strategyData, benchmarkData) {
    const width = canvas.width / window.devicePixelRatio;
    const height = 320;
    const margin = { top: 35, right: 30, bottom: 45, left: 65 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const allData = [...strategyData, ...benchmarkData];
    const minVal = Math.min(...allData) * 0.98;
    const maxVal = Math.max(...allData) * 1.02;
    const range = maxVal - minVal;

    const getX = (index) => margin.left + (index / (strategyData.length - 1)) * chartWidth;
    const getY = (value) => margin.top + chartHeight - ((value - minVal) / range) * chartHeight;

    ctx.clearRect(0, 0, width, height);

    // 网格边框
    ctx.strokeStyle = "rgba(9, 9, 11, 0.06)";
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);

    // Y 轴
    ctx.strokeStyle = "rgba(9, 9, 11, 0.02)";
    ctx.fillStyle = "#71717a";
    ctx.font = "400 9px 'Geist Mono', monospace";
    ctx.textAlign = "right";
    const yTicks = 4;
    for (let i = 0; i <= yTicks; i++) {
        const val = minVal + (range * i) / yTicks;
        const y = margin.top + chartHeight - (chartHeight * i) / yTicks;
        ctx.beginPath();
        ctx.moveTo(margin.left, y);
        ctx.lineTo(width - margin.right, y);
        ctx.stroke();
        ctx.fillText(`¥${(val / 10000).toFixed(1)}万`, margin.left - 12, y + 3);
    }

    // X 轴
    ctx.textAlign = "center";
    const xTicks = 4;
    for (let i = 0; i < xTicks; i++) {
        const pct = i / (xTicks - 1);
        const x = margin.left + chartWidth * pct;
        ctx.beginPath();
        ctx.moveTo(x, margin.top);
        ctx.lineTo(x, margin.top + chartHeight);
        ctx.stroke();
        ctx.fillText(`DAY ${Math.round(pct * 100)}`, x, margin.top + chartHeight + 16);
    }

    // 基准线
    ctx.strokeStyle = CHART_COLORS.benchmark;
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 5]);
    drawSmoothCurve(ctx, benchmarkData, benchmarkData.length, getX, getY);
    ctx.setLineDash([]);

    // 策略面积渐变
    drawGradientFill(ctx, strategyData, strategyData.length, getX, getY, margin, chartHeight);

    // 策略实线
    ctx.strokeStyle = CHART_COLORS.strategy;
    ctx.lineWidth = 4;
    drawSmoothCurve(ctx, strategyData, strategyData.length, getX, getY);

    // 图例
    ctx.textAlign = "left";
    ctx.font = "600 8.5px 'Geist Mono', monospace";
    ctx.fillStyle = CHART_COLORS.strategy;
    ctx.fillRect(margin.left + 15, margin.top - 18, 12, 5);
    ctx.fillText("策略净值", margin.left + 33, margin.top - 13);

    ctx.strokeStyle = CHART_COLORS.benchmark;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(margin.left + 165, margin.top - 15);
    ctx.lineTo(margin.left + 177, margin.top - 15);
    ctx.stroke();
    ctx.fillStyle = CHART_COLORS.benchmark;
    ctx.fillText("沪深300基准", margin.left + 185, margin.top - 13);
}

/**
 * 9. 带十字星光标交互的 Canvas 渲染器
 */
function drawChartWithCrosshair(ctx, canvas, strategyData, benchmarkData, mouseX, mouseY) {
    const width = canvas.width / window.devicePixelRatio;
    const height = 320;
    const margin = { top: 35, right: 30, bottom: 45, left: 65 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // 先画静态背景
    drawChartStatic(ctx, canvas, strategyData, benchmarkData);

    // 如果鼠标超出了图表坐标系边界，不画十字交叉星
    if (mouseX < margin.left || mouseX > width - margin.right || mouseY < margin.top || mouseY > height - margin.bottom) {
        return;
    }

    const allData = [...strategyData, ...benchmarkData];
    const minVal = Math.min(...allData) * 0.98;
    const maxVal = Math.max(...allData) * 1.02;
    const range = maxVal - minVal;

    const getX = (index) => margin.left + (index / (strategyData.length - 1)) * chartWidth;
    const getY = (value) => margin.top + chartHeight - ((value - minVal) / range) * chartHeight;

    // 寻找距离鼠标 X 最近的数据点索引
    const percentX = (mouseX - margin.left) / chartWidth;
    const index = Math.round(percentX * (strategyData.length - 1));
    const finalIndex = Math.max(0, Math.min(strategyData.length - 1, index));

    const snapX = getX(finalIndex);
    const snapYStrat = getY(strategyData[finalIndex]);
    const snapYBench = getY(benchmarkData[finalIndex]);

    // ── 绘制十字交叉虚线 ──
    ctx.strokeStyle = "rgba(9, 9, 11, 0.25)";
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);

    // 垂直虚线
    ctx.beginPath();
    ctx.moveTo(snapX, margin.top);
    ctx.lineTo(snapX, margin.top + chartHeight);
    ctx.stroke();

    // 水平虚线 (锚定策略点)
    ctx.beginPath();
    ctx.moveTo(margin.left, snapYStrat);
    ctx.lineTo(width - margin.right, snapYStrat);
    ctx.stroke();

    ctx.setLineDash([]);

    // ── 绘制两个曲线上的焦点圆环 ──
    // 策略圆点
    ctx.fillStyle = CHART_COLORS.strategy;
    ctx.beginPath();
    ctx.arc(snapX, snapYStrat, 4, 0, Math.PI * 2);
    ctx.fill();

    // 基准圆点
    ctx.fillStyle = CHART_COLORS.benchmark;
    ctx.beginPath();
    ctx.arc(snapX, snapYBench, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // ── 绘制浮动 Tooltip 信息面板 (黑底白字 Stark 标签) ──
    const textDay = `DAY ${finalIndex}`;
    const textStrat = `策略: ¥${Math.round(strategyData[finalIndex]).toLocaleString()}`;
    const textBench = `基准: ¥${Math.round(benchmarkData[finalIndex]).toLocaleString()}`;

    // 智能定位 Tooltip 的 X 轴偏置，避免卡在画布右侧边缘切除
    let tooltipX = snapX + 15;
    if (snapX > width - margin.right - 110) {
        tooltipX = snapX - 125;
    }

    ctx.fillStyle = "rgba(9, 9, 11, 0.9)";
    ctx.fillRect(tooltipX, snapYStrat - 25, 110, 52);
    ctx.strokeStyle = "rgba(9, 9, 11, 1)";
    ctx.lineWidth = 1;
    ctx.strokeRect(tooltipX, snapYStrat - 25, 110, 52);

    ctx.font = "bold 8.5px 'Geist Mono', monospace";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.fillText(textDay, tooltipX + 8, snapYStrat - 13);
    ctx.font = "400 8.5px var(--font-sans)";
    ctx.fillText(textStrat, tooltipX + 8, snapYStrat - 1);
    ctx.fillStyle = "#d4d4d8";
    ctx.fillText(textBench, tooltipX + 8, snapYStrat + 11);
}
