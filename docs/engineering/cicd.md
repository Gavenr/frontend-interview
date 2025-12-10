# CI/CD 持续集成与部署

## 什么是 CI/CD？

- **CI (Continuous Integration)**: 持续集成，频繁将代码合并到主分支
- **CD (Continuous Delivery/Deployment)**: 持续交付/部署，自动化发布流程

## 前端 CI/CD 流程

```
代码提交 → 代码检查 → 单元测试 → 构建 → 部署 → 通知
```

## GitHub Actions 实战

### 基本配置

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm test

      - name: Build
        run: npm run build

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/
```

### 自动部署

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - run: npm ci
      - run: npm run build

      # 部署到 GitHub Pages
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist

      # 或部署到服务器
      - name: Deploy to Server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/app
            git pull
            npm ci
            npm run build
            pm2 restart all
```

### 缓存优化

```yaml
jobs:
  build:
    steps:
      - name: Cache node_modules
        uses: actions/cache@v3
        with:
          path: node_modules
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-

      - name: Cache Next.js build
        uses: actions/cache@v3
        with:
          path: .next/cache
          key: ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}
```

## 前端部署方案

### 静态资源部署

```javascript
// 1. CDN 部署
// - 将 JS/CSS/图片等静态资源上传到 CDN
// - HTML 保持在源站

// 2. 资源命名
// - 使用 contenthash: app.[contenthash].js
// - 内容变化时哈希变化，实现缓存更新

// 3. 缓存策略
// - HTML: Cache-Control: no-cache
// - 静态资源: Cache-Control: max-age=31536000
```

### 容器化部署

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 常见面试题

### 1. 前端如何实现灰度发布？

```javascript
// 1. 用户分流
// - 按用户 ID 哈希
// - 按地区/设备类型
// - 按百分比随机

// 2. 实现方式
// - Nginx 配置
// - 网关层分流
// - 前端 SDK 判断

// Nginx 灰度配置
location / {
  if ($cookie_version = "beta") {
    proxy_pass http://beta_server;
  }
  proxy_pass http://stable_server;
}
```

### 2. 如何实现前端错误监控？

```javascript
// 1. JS 错误
window.onerror = (msg, url, line, col, error) => {
  report({ type: 'js', msg, url, line, col, stack: error?.stack });
};

// 2. Promise 错误
window.addEventListener('unhandledrejection', (e) => {
  report({ type: 'promise', reason: e.reason });
});

// 3. 资源加载错误
window.addEventListener('error', (e) => {
  if (e.target?.tagName) {
    report({ type: 'resource', src: e.target.src });
  }
}, true);

// 4. 使用 Sentry 等成熟方案
import * as Sentry from '@sentry/browser';
Sentry.init({ dsn: 'your-dsn' });
```

### 3. 如何优化构建速度？

```javascript
// 1. 使用缓存
// - babel-loader cacheDirectory
// - 持久化缓存

// 2. 并行处理
// - thread-loader
// - parallel-webpack

// 3. 减少构建范围
// - include/exclude
// - noParse

// 4. 使用更快的工具
// - esbuild-loader
// - swc-loader
```
