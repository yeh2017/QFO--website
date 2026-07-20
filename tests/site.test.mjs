import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../style.css', import.meta.url), 'utf8');
const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));

test('uses current product positioning and social metadata', () => {
  assert.match(html, /<title>QFO量化回测平台 \| A股量化研究与回测工具<\/title>/);
  assert.match(html, /rel="canonical" href="https:\/\/www\.qfo-quant-platform\.com\/"/);
  assert.match(html, /property="og:title"/);
  assert.match(html, /name="twitter:card"/);
  assert.match(html, /type="application\/ld\+json"/);
  const structuredData = JSON.parse(
    html.match(/<script[^>]+type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] || '',
  );
  assert.equal(structuredData.softwareVersion, 'latest');
  assert.match(structuredData.downloadUrl, /releases\/latest\/download\/QFO-Quant-Platform\.zip/);
  assert.doesNotMatch(html, /教学网站|组合风控|智能选股与因子/);
});

test('offers a stable release download', () => {
  assert.match(html, /releases\/latest\/download\/QFO-Quant-Platform\.zip/);
  assert.doesNotMatch(html, /archive\/refs\/tags\/v1\.0\.0\.zip/);
  assert.doesNotMatch(html, />v1\.0\.0</);
});

test('shows at least six real product previews', () => {
  const preview = html.match(/<section class="section" id="preview">([\s\S]*?)<\/section>/)?.[1] || '';
  assert.ok((preview.match(/<figure>/g) || []).length >= 6);
  assert.match(preview, /因子模块/);
  assert.match(preview, /可视化/);
});

test('contains mobile overflow protections', () => {
  assert.match(css, /\.top-nav a\s*{[^}]*white-space:\s*nowrap/s);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*?\.side-nav\s*{[^}]*display:\s*none/s);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*?\.hero-actions\s*{[^}]*flex-wrap:\s*wrap/s);
});

test('sizes images and lazily loads preview media', () => {
  assert.match(css, /img\s*{[^}]*height:\s*auto/s);
  const images = [...html.matchAll(/<img\s+[^>]+>/g)].map((match) => match[0]);
  assert.ok(images.length >= 7);
  for (const image of images) {
    assert.match(image, /\swidth="\d+"/);
    assert.match(image, /\sheight="\d+"/);
  }
  for (const image of images.slice(1)) assert.match(image, /loading="lazy"/);
});

test('labels sandbox controls and demonstration results', () => {
  assert.match(html, /演示数据 · 非真实回测/);
  for (const id of ['capital', 'risk', 'factor']) {
    assert.match(html, new RegExp(`<input[^>]+id="${id}"[^>]+aria-label="[^"]+"`));
  }
});

test('ships crawler metadata files', () => {
  const robots = readFileSync(new URL('../robots.txt', import.meta.url), 'utf8');
  const sitemap = readFileSync(new URL('../sitemap.xml', import.meta.url), 'utf8');
  assert.match(robots, /Sitemap: https:\/\/www\.qfo-quant-platform\.com\/sitemap\.xml/);
  assert.match(sitemap, /<loc>https:\/\/www\.qfo-quant-platform\.com\/<\/loc>/);
});

test('loads Vercel Web Analytics', () => {
  assert.match(html, /window\.va\s*=\s*window\.va\s*\|\|\s*function/);
  assert.match(html, /<script defer src="\/_vercel\/insights\/script\.js"><\/script>/);
});

test('loads Vercel Speed Insights', () => {
  assert.match(html, /window\.si\s*=\s*window\.si\s*\|\|\s*function/);
  assert.match(html, /<script defer src="\/_vercel\/speed-insights\/script\.js"><\/script>/);
});

test('updates download links from the latest GitHub release', () => {
  assert.match(html, /data-release-download/);
  assert.match(html, /data-release-tag/);
  assert.match(html, /data-release-date/);
  assert.match(app, /api\.github\.com\/repos\/yeh2017\/QFO-Quant-Platform\/releases\/latest/);
  assert.match(app, /QFO-Quant-Platform\.zip/);
  assert.match(app, /browser_download_url/);
  assert.match(app, /zipball_url/);
  assert.match(app, /initLatestRelease\(\)/);
});

test('sets baseline security headers on every route', () => {
  const rule = vercel.headers?.find((entry) => entry.source === '/(.*)');
  assert.ok(rule, 'missing global Vercel header rule');
  const headers = Object.fromEntries(rule.headers.map(({ key, value }) => [key, value]));
  assert.equal(headers['X-Content-Type-Options'], 'nosniff');
  assert.equal(headers['X-Frame-Options'], 'DENY');
  assert.equal(headers['Referrer-Policy'], 'strict-origin-when-cross-origin');
  assert.match(headers['Permissions-Policy'], /camera=\(\)/);
  assert.match(headers['Content-Security-Policy'], /default-src 'self'/);
  assert.match(headers['Content-Security-Policy'], /connect-src 'self' https:\/\/api\.github\.com/);
});

test('uses a dedicated social sharing image', () => {
  assert.match(html, /property="og:image" content="https:\/\/www\.qfo-quant-platform\.com\/assets\/qfo-share\.webp"/);
  assert.match(html, /property="og:image:width" content="1200"/);
  assert.match(html, /property="og:image:height" content="630"/);
  assert.match(html, /name="twitter:image" content="https:\/\/www\.qfo-quant-platform\.com\/assets\/qfo-share\.webp"/);
});

test('ships a concise branded 404 page', () => {
  const notFound = readFileSync(new URL('../404.html', import.meta.url), 'utf8');
  assert.match(notFound, /<title>页面未找到 \| QFO量化回测平台<\/title>/);
  assert.match(notFound, /name="robots" content="noindex, follow"/);
  assert.match(notFound, /href="\/"[^>]*>返回首页<\/a>/);
  assert.match(notFound, /href="https:\/\/github\.com\/yeh2017\/QFO-Quant-Platform"/);
});
