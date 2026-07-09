# QFO Static Learning Site

QFO 量化回测平台的静态教学站，覆盖数据中台、智能选股、因子模块、策略回测、组合风控、可视化分析、新闻中心和在线实战沙盒。

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
