# QFO量化回测平台教学网站

QFO Quant Platform Website 是 [QFO量化回测平台](https://github.com/yeh2017/QFO-Quant-Platform) 的静态教学网站，面向 A 股量化回测、股票量化回测和量化研究学习场景。

网站覆盖数据中台、智能选股、因子模块、策略回测、组合风控、可视化分析、新闻中心和在线实战沙盒，用于帮助用户理解 QFO 的主要模块和使用路径。

## 在线访问

[https://www.qfo-quant-platform.com/](https://www.qfo-quant-platform.com/)

## 快速开始

### Windows 用户

1. **下载**：[直接下载 ZIP 源码包](https://github.com/yeh2017/QFO-Quant-Platform/archive/refs/heads/main.zip)
2. **解压**：将压缩包解压到一个**不包含中文、空格**的路径下，例如 `D:\QFO`。
3. **运行**：双击文件夹内的 **`run_first_time.bat`** 启动；日常快速启动使用 **`run_quick_start.bat`**。

> **注意**
> - 请勿直接在压缩包内运行。
> - 需要使用 [Python（下载链接）](https://www.python.org/downloads/windows/)、[Node.js（下载链接）](https://nodejs.org/en/download) 运行环境。

## 本地预览

```bash
python -m http.server 5177
```

打开 `http://127.0.0.1:5177/`。

## 部署到 Vercel

- Framework Preset: `Other`
- Build Command: 留空
- Output Directory: `.`

连接 GitHub 仓库后，推送到 `main` 会自动触发生产部署。

## 相关仓库

- 主项目：[QFO-Quant-Platform](https://github.com/yeh2017/QFO-Quant-Platform)
- 教学网站：[QFO-Quant-Platform-Website](https://github.com/yeh2017/QFO-Quant-Platform-Website)
