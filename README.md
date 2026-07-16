# QFO量化回测平台教学网站

QFO Quant Platform Website 是 [QFO量化回测平台](https://github.com/yeh2017/QFO-Quant-Platform) 的静态教学网站，面向 A 股量化回测、股票量化回测和量化研究学习场景。

网站覆盖数据中台、智能选股、因子模块、策略回测、组合风控、可视化分析、新闻中心和在线实战沙盒，用于帮助用户理解 QFO 的主要模块和使用路径。

## 在线访问

[https://qfo-website-yyy18337s-projects.vercel.app/](https://qfo-website-yyy18337s-projects.vercel.app/)

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
