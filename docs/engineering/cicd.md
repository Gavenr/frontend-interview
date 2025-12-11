# CI/CD 持续集成与部署

## 什么是 CI/CD？

- **CI (Continuous Integration)**: 持续集成，频繁将代码合并到主分支
- **CD (Continuous Delivery/Deployment)**: 持续交付/部署，自动化发布流程

### CI/CD 详解

```yaml
# ==================== CI 持续集成 ====================
# 核心理念：频繁地将代码变更合并到主分支

# CI 的主要环节：
# 1. 代码提交触发构建
# 2. 自动运行代码检查（Lint）
# 3. 自动运行单元测试
# 4. 自动运行集成测试
# 5. 生成构建产物
# 6. 反馈构建结果

# CI 的好处：
# - 快速发现和定位问题
# - 减少集成冲突
# - 保证代码质量
# - 提高开发效率

# ==================== CD 持续交付/部署 ====================

# 持续交付 (Continuous Delivery)：
# - 自动化构建、测试、预发布
# - 手动触发生产部署
# - 适合需要审批流程的场景

# 持续部署 (Continuous Deployment)：
# - 完全自动化，直达生产环境
# - 通过所有测试后自动发布
# - 适合快速迭代的场景

# CD 的主要环节：
# 1. 构建生产版本
# 2. 自动化测试（E2E、性能测试）
# 3. 部署到预发布环境
# 4. 验收测试
# 5. 部署到生产环境
# 6. 监控和回滚准备
```

### DevOps 流程图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              DevOps 流程                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   计划 → 编码 → 构建 → 测试 → 发布 → 部署 → 运维 → 监控 → 计划...        │
│    │      │      │      │      │      │      │      │                    │
│    ↓      ↓      ↓      ↓      ↓      ↓      ↓      ↓                    │
│  Jira   Git   Webpack Jest  Docker  K8s   Ansible Prometheus            │
│  Trello GitHub Vite   Cypress npm   AWS   Terraform Grafana             │
│         GitLab esbuild       yarn   Azure Jenkins   Sentry              │
│                                                                          │
│   ├──────── CI（持续集成）────────┤ ├──── CD（持续交付/部署）───────┤    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### CI/CD 工具对比

```javascript
// ==================== 主流 CI/CD 平台 ====================

// 1. GitHub Actions
// - 与 GitHub 深度集成
// - 丰富的 Marketplace
// - 免费额度：2000 分钟/月（公开仓库无限）
// - YAML 配置

// 2. GitLab CI
// - 与 GitLab 深度集成
// - 内置 Container Registry
// - 可私有化部署
// - .gitlab-ci.yml 配置

// 3. Jenkins
// - 开源、可高度自定义
// - 丰富的插件生态
// - 需要自己维护服务器
// - Jenkinsfile（Groovy）配置

// 4. CircleCI
// - 配置简单、启动快
// - 原生 Docker 支持
// - 免费额度较少
// - YAML 配置

// 5. Travis CI
// - 老牌 CI 服务
// - 开源项目免费
// - .travis.yml 配置

// 6. Azure DevOps
// - 微软生态集成
// - 企业级功能
// - YAML / 可视化配置

// 7. Vercel / Netlify
// - 前端专用
// - 零配置部署
// - 自动预览部署
// - 内置 CDN

// ==================== 选择建议 ====================

// 个人/开源项目
// → GitHub Actions + Vercel/Netlify

// 小型团队
// → GitHub Actions / GitLab CI

// 中大型企业
// → Jenkins / GitLab CI（私有部署）

// 前端项目
// → Vercel / Netlify（零配置）
```

## 前端 CI/CD 流程

```
代码提交 → 代码检查 → 单元测试 → 构建 → 部署 → 通知
```

### 完整流程详解

```yaml
# ==================== 前端 CI/CD 完整流程 ====================

# 阶段 1: 代码提交
# - 开发者 push 代码或提交 PR
# - 触发 CI 流水线

# 阶段 2: 代码质量检查
# - ESLint / Stylelint 代码规范
# - Prettier 格式检查
# - TypeScript 类型检查
# - Commitlint 提交信息检查
# - SonarQube 代码质量扫描

# 阶段 3: 自动化测试
# - 单元测试（Jest / Vitest）
# - 组件测试（Testing Library）
# - 集成测试（Cypress / Playwright）
# - 快照测试
# - 覆盖率报告

# 阶段 4: 构建
# - 安装依赖
# - 打包构建（Webpack / Vite）
# - 生成 Source Map
# - 优化压缩

# 阶段 5: 部署
# - 预发布环境部署
# - E2E 测试
# - 生产环境部署
# - CDN 资源上传

# 阶段 6: 发布后
# - 通知（Slack / 钉钉 / 企业微信）
# - 监控告警设置
# - 版本记录
# - 回滚准备

# ==================== 流程图 ====================

#   ┌─────────────┐
#   │  代码提交    │
#   └──────┬──────┘
#          ↓
#   ┌─────────────┐
#   │  代码检查    │ ──→ 失败 → 通知开发者
#   └──────┬──────┘
#          ↓
#   ┌─────────────┐
#   │  单元测试    │ ──→ 失败 → 通知开发者
#   └──────┬──────┘
#          ↓
#   ┌─────────────┐
#   │    构建     │ ──→ 失败 → 通知开发者
#   └──────┬──────┘
#          ↓
#   ┌─────────────┐
#   │  E2E 测试   │ ──→ 失败 → 通知开发者
#   └──────┬──────┘
#          ↓
#   ┌─────────────┐
#   │ 部署预发布   │
#   └──────┬──────┘
#          ↓
#   ┌─────────────┐
#   │  人工审核    │ ←─ 可选（持续交付）
#   └──────┬──────┘
#          ↓
#   ┌─────────────┐
#   │ 部署生产环境 │
#   └──────┬──────┘
#          ↓
#   ┌─────────────┐
#   │  发布通知    │
#   └─────────────┘
```

### PR 触发的 CI 流程

```yaml
# PR 打开或更新时触发的检查

name: PR Check

on:
  pull_request:
    branches: [main, develop]
    types: [opened, synchronize, reopened]

jobs:
  # 1. 代码质量检查
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  # 2. 单元测试
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test -- --coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  # 3. 构建测试
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build
          path: dist/

  # 4. E2E 测试
  e2e:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - name: Download build
        uses: actions/download-artifact@v4
        with:
          name: build
          path: dist/
      - name: Run E2E tests
        uses: cypress-io/github-action@v6
        with:
          start: npm run preview
          wait-on: 'http://localhost:4173'

  # 5. PR 预览部署
  preview:
    needs: [lint, test, build]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Download build
        uses: actions/download-artifact@v4
        with:
          name: build
          path: dist/
      - name: Deploy to Vercel Preview
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
      - name: Comment PR with preview URL
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '🚀 Preview deployed: ${{ steps.deploy.outputs.preview-url }}'
            })
```

## GitHub Actions 实战

### 基本概念

```yaml
# ==================== GitHub Actions 核心概念 ====================

# Workflow（工作流）
# - 定义在 .github/workflows/*.yml
# - 由一个或多个 Job 组成
# - 由事件触发运行

# Job（作业）
# - 工作流的执行单元
# - 默认并行执行，可设置依赖关系
# - 运行在指定的 Runner 上

# Step（步骤）
# - Job 内的执行步骤
# - 顺序执行
# - 可以是 Action 或 Shell 命令

# Action（动作）
# - 可复用的工作单元
# - 官方、社区或自定义
# - 使用 uses 关键字引用

# Runner（运行器）
# - 执行工作流的服务器
# - GitHub 托管或自托管
# - 支持 Linux、macOS、Windows

# ==================== 文件结构 ====================

# .github/
# ├── workflows/
# │   ├── ci.yml           # CI 流水线
# │   ├── deploy.yml       # 部署流水线
# │   ├── release.yml      # 发布流水线
# │   └── cron.yml         # 定时任务
# └── actions/
#     └── custom-action/   # 自定义 Action
#         ├── action.yml
#         └── index.js
```

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
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
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
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
```

### 触发事件详解

```yaml
# ==================== 常用触发事件 ====================

on:
  # Push 事件
  push:
    branches:
      - main
      - 'release/**'      # 匹配 release/ 开头的分支
      - '!release/old-*'  # 排除 release/old- 开头的分支
    tags:
      - 'v*'              # 匹配 v 开头的标签
    paths:
      - 'src/**'          # 只有 src 目录变化时触发
      - '!src/**/*.md'    # 排除 markdown 文件
    paths-ignore:
      - 'docs/**'         # 忽略 docs 目录
      - '**.md'           # 忽略所有 markdown

  # Pull Request 事件
  pull_request:
    branches: [main]
    types:
      - opened            # PR 打开
      - synchronize       # PR 更新
      - reopened          # PR 重新打开
      - closed            # PR 关闭
      - labeled           # 添加标签

  # Issue 事件
  issues:
    types: [opened, labeled]

  # 定时任务（Cron）
  schedule:
    - cron: '0 2 * * *'   # 每天 UTC 2:00 (北京 10:00)
    - cron: '0 0 * * 1'   # 每周一 UTC 0:00

  # 手动触发
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment environment'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production
      version:
        description: 'Version to deploy'
        required: false

  # 其他工作流完成时触发
  workflow_run:
    workflows: ["CI"]
    types: [completed]
    branches: [main]

  # 仓库事件
  release:
    types: [published, created]

  # Webhook 调用
  repository_dispatch:
    types: [custom-event]

# ==================== 使用手动触发的输入 ====================

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to ${{ github.event.inputs.environment }}
        run: |
          echo "Deploying version ${{ github.event.inputs.version }}"
          echo "Environment: ${{ github.event.inputs.environment }}"
```

### Job 配置详解

```yaml
jobs:
  # ==================== 基本 Job ====================
  build:
    name: Build Application
    runs-on: ubuntu-latest
    timeout-minutes: 30           # 超时时间

    # 环境变量
    env:
      NODE_ENV: production
      CI: true

    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build

  # ==================== Job 依赖 ====================
  test:
    needs: build                  # 依赖 build job
    runs-on: ubuntu-latest
    steps:
      - run: npm test

  deploy:
    needs: [build, test]          # 依赖多个 job
    runs-on: ubuntu-latest
    steps:
      - run: ./deploy.sh

  # ==================== 条件执行 ====================
  deploy-prod:
    if: github.ref == 'refs/heads/main'  # 只在 main 分支执行
    runs-on: ubuntu-latest
    steps:
      - run: ./deploy-prod.sh

  # ==================== 矩阵策略 ====================
  test-matrix:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [18, 20, 22]
        exclude:
          - os: windows-latest
            node-version: 18
        include:
          - os: ubuntu-latest
            node-version: 20
            experimental: true
      fail-fast: false            # 一个失败不影响其他
      max-parallel: 3             # 最大并行数

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm test

  # ==================== 服务容器 ====================
  test-with-db:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4
      - run: npm test
        env:
          DATABASE_URL: postgres://test:test@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379

  # ==================== 使用环境 ====================
  deploy-production:
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://example.com
    steps:
      - name: Deploy
        run: ./deploy.sh
        env:
          API_KEY: ${{ secrets.PRODUCTION_API_KEY }}

  # ==================== 并发控制 ====================
  deploy:
    runs-on: ubuntu-latest
    concurrency:
      group: deploy-${{ github.ref }}
      cancel-in-progress: true    # 取消进行中的相同工作流
    steps:
      - run: ./deploy.sh
```

### Step 配置详解

```yaml
jobs:
  example:
    runs-on: ubuntu-latest
    steps:
      # ==================== 使用 Action ====================
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0          # 获取完整历史
          ref: ${{ github.head_ref }}

      # ==================== 运行命令 ====================
      - name: Run script
        run: |
          echo "Hello World"
          npm run build
        working-directory: ./app
        shell: bash               # 指定 shell

      # ==================== 条件执行 ====================
      - name: Only on main
        if: github.ref == 'refs/heads/main'
        run: echo "Main branch"

      - name: On success
        if: success()             # 之前步骤成功
        run: echo "Success"

      - name: On failure
        if: failure()             # 之前步骤失败
        run: echo "Failed"

      - name: Always run
        if: always()              # 总是执行
        run: echo "Cleanup"

      - name: On cancelled
        if: cancelled()           # 被取消时
        run: echo "Cancelled"

      # ==================== 环境变量 ====================
      - name: With env
        run: echo $MY_VAR
        env:
          MY_VAR: hello
          SECRET_KEY: ${{ secrets.SECRET_KEY }}

      # ==================== 设置输出 ====================
      - name: Set output
        id: step1
        run: echo "version=1.0.0" >> $GITHUB_OUTPUT

      - name: Use output
        run: echo "Version is ${{ steps.step1.outputs.version }}"

      # ==================== 继续执行（忽略错误）====================
      - name: May fail
        id: may_fail
        continue-on-error: true
        run: exit 1

      - name: Check result
        if: steps.may_fail.outcome == 'failure'
        run: echo "Previous step failed"

      # ==================== 超时设置 ====================
      - name: Long running task
        timeout-minutes: 10
        run: ./long-task.sh
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
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - run: npm ci
      - run: npm run build

      # 部署到 GitHub Pages
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist

      # 或部署到服务器
      - name: Deploy to Server
        uses: appleboy/ssh-action@v1
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

### 多环境部署

```yaml
# .github/workflows/deploy-multi-env.yml
name: Multi-Environment Deploy

on:
  push:
    branches:
      - main        # 生产环境
      - develop     # 测试环境
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        type: choice
        options:
          - staging
          - production

jobs:
  # 根据分支确定环境
  set-environment:
    runs-on: ubuntu-latest
    outputs:
      environment: ${{ steps.set-env.outputs.environment }}
    steps:
      - id: set-env
        run: |
          if [ "${{ github.event_name }}" == "workflow_dispatch" ]; then
            echo "environment=${{ github.event.inputs.environment }}" >> $GITHUB_OUTPUT
          elif [ "${{ github.ref }}" == "refs/heads/main" ]; then
            echo "environment=production" >> $GITHUB_OUTPUT
          else
            echo "environment=staging" >> $GITHUB_OUTPUT
          fi

  build:
    runs-on: ubuntu-latest
    needs: set-environment
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run build
        env:
          VITE_API_URL: ${{ needs.set-environment.outputs.environment == 'production' && 'https://api.example.com' || 'https://api-staging.example.com' }}

      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  deploy:
    needs: [set-environment, build]
    runs-on: ubuntu-latest
    environment:
      name: ${{ needs.set-environment.outputs.environment }}
      url: ${{ needs.set-environment.outputs.environment == 'production' && 'https://example.com' || 'https://staging.example.com' }}

    steps:
      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/

      - name: Deploy to ${{ needs.set-environment.outputs.environment }}
        run: |
          echo "Deploying to ${{ needs.set-environment.outputs.environment }}"
          # 实际部署命令
```

### 常用部署方式

```yaml
# ==================== 1. 部署到 Vercel ====================
deploy-vercel:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'  # 生产部署

# ==================== 2. 部署到 Netlify ====================
deploy-netlify:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - run: npm ci && npm run build
    - uses: nwtgck/actions-netlify@v3
      with:
        publish-dir: './dist'
        production-branch: main
        github-token: ${{ secrets.GITHUB_TOKEN }}
        deploy-message: "Deploy from GitHub Actions"
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}

# ==================== 3. 部署到 AWS S3 + CloudFront ====================
deploy-aws:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - run: npm ci && npm run build

    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ap-northeast-1

    - name: Sync to S3
      run: |
        aws s3 sync dist/ s3://${{ secrets.S3_BUCKET }} --delete
        aws cloudfront create-invalidation \
          --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
          --paths "/*"

# ==================== 4. 部署到阿里云 OSS ====================
deploy-aliyun:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - run: npm ci && npm run build

    - name: Setup aliyun oss
      uses: manyuanrong/setup-ossutil@v3.0
      with:
        endpoint: oss-cn-hangzhou.aliyuncs.com
        access-key-id: ${{ secrets.OSS_KEY_ID }}
        access-key-secret: ${{ secrets.OSS_KEY_SECRET }}

    - name: Upload to OSS
      run: ossutil cp -rf dist/ oss://${{ secrets.OSS_BUCKET }}/

# ==================== 5. 部署到 Docker ====================
deploy-docker:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4

    - name: Login to Docker Hub
      uses: docker/login-action@v3
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}

    - name: Build and push
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: |
          ${{ secrets.DOCKER_USERNAME }}/my-app:latest
          ${{ secrets.DOCKER_USERNAME }}/my-app:${{ github.sha }}

# ==================== 6. 部署到 Kubernetes ====================
deploy-k8s:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4

    - name: Set up kubectl
      uses: azure/setup-kubectl@v3

    - name: Set context
      uses: azure/k8s-set-context@v3
      with:
        kubeconfig: ${{ secrets.KUBE_CONFIG }}

    - name: Deploy
      run: |
        kubectl set image deployment/my-app \
          my-app=${{ secrets.DOCKER_USERNAME }}/my-app:${{ github.sha }}
        kubectl rollout status deployment/my-app

# ==================== 7. 部署到腾讯云 COS ====================
deploy-tencent:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - run: npm ci && npm run build

    - name: Upload to COS
      uses: TencentCloud/cos-action@v1
      with:
        secret_id: ${{ secrets.TENCENT_SECRET_ID }}
        secret_key: ${{ secrets.TENCENT_SECRET_KEY }}
        cos_bucket: ${{ secrets.COS_BUCKET }}
        cos_region: ap-guangzhou
        local_path: dist/
        remote_path: /
        clean: true
```

### 缓存优化

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # ==================== 方式1: setup-node 内置缓存 ====================
      - name: Setup Node.js with cache
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'  # 或 'yarn', 'pnpm'

      # ==================== 方式2: 手动缓存 node_modules ====================
      - name: Cache node_modules
        uses: actions/cache@v4
        with:
          path: node_modules
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-

      # ==================== 方式3: 缓存多个目录 ====================
      - name: Cache dependencies
        uses: actions/cache@v4
        with:
          path: |
            node_modules
            ~/.npm
            ~/.cache/Cypress
          key: deps-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}

      # ==================== 方式4: 框架特定缓存 ====================

      # Next.js 缓存
      - name: Cache Next.js build
        uses: actions/cache@v4
        with:
          path: |
            ${{ github.workspace }}/.next/cache
          key: nextjs-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}-${{ hashFiles('**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx') }}
          restore-keys: |
            nextjs-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}-
            nextjs-${{ runner.os }}-

      # Vite 缓存
      - name: Cache Vite
        uses: actions/cache@v4
        with:
          path: node_modules/.vite
          key: vite-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}

      # Turborepo 缓存
      - name: Cache Turborepo
        uses: actions/cache@v4
        with:
          path: .turbo
          key: turbo-${{ runner.os }}-${{ hashFiles('**/turbo.json') }}

      # pnpm 缓存
      - name: Cache pnpm
        uses: actions/cache@v4
        with:
          path: |
            ~/.local/share/pnpm/store
            node_modules
          key: pnpm-${{ runner.os }}-${{ hashFiles('**/pnpm-lock.yaml') }}
```

### 通知配置

```yaml
# ==================== 发布通知 ====================

jobs:
  notify:
    needs: deploy
    runs-on: ubuntu-latest
    if: always()  # 无论成功失败都执行
    steps:
      # ==================== Slack 通知 ====================
      - name: Notify Slack
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          fields: repo,message,commit,author,action,eventName,ref,workflow
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
        if: always()

      # ==================== 钉钉通知 ====================
      - name: Notify DingTalk
        uses: fifsky/dingtalk-action@master
        with:
          url: ${{ secrets.DINGTALK_WEBHOOK }}
          type: markdown
          content: |
            ### 🚀 部署通知
            - **状态**: ${{ needs.deploy.result }}
            - **分支**: ${{ github.ref_name }}
            - **提交**: ${{ github.sha }}
            - **作者**: ${{ github.actor }}

      # ==================== 企业微信通知 ====================
      - name: Notify WeChat Work
        uses: chf007/action-wechat-work@master
        with:
          msgtype: markdown
          content: |
            ### 部署通知
            > 状态: ${{ needs.deploy.result }}
            > 仓库: ${{ github.repository }}
            > 分支: ${{ github.ref_name }}
          mentioned_list: '["@all"]'
        env:
          WECHAT_WORK_BOT_WEBHOOK: ${{ secrets.WECHAT_WEBHOOK }}

      # ==================== 邮件通知 ====================
      - name: Send email
        uses: dawidd6/action-send-mail@v3
        with:
          server_address: smtp.gmail.com
          server_port: 465
          username: ${{ secrets.EMAIL_USERNAME }}
          password: ${{ secrets.EMAIL_PASSWORD }}
          subject: Build ${{ github.repository }} - ${{ job.status }}
          body: |
            Build ${{ job.status }}
            Repository: ${{ github.repository }}
            Branch: ${{ github.ref_name }}
            Commit: ${{ github.sha }}
          to: team@example.com
          from: CI Bot

      # ==================== GitHub Release 通知 ====================
      - name: Create Release
        if: startsWith(github.ref, 'refs/tags/')
        uses: softprops/action-gh-release@v1
        with:
          body: |
            ## What's Changed
            See [CHANGELOG](./CHANGELOG.md) for details.
          files: |
            dist/*.js
            dist/*.css
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 版本管理与发布

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'

      - run: npm ci
      - run: npm run build
      - run: npm test

      # 发布到 npm
      - name: Publish to npm
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      # 生成 Changelog
      - name: Generate Changelog
        id: changelog
        uses: metcalfc/changelog-generator@v4
        with:
          myToken: ${{ secrets.GITHUB_TOKEN }}

      # 创建 GitHub Release
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          body: ${{ steps.changelog.outputs.changelog }}
          files: |
            dist/*
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

# ==================== 语义化版本发布 ====================
# 使用 semantic-release 自动化版本管理

# package.json
# {
#   "release": {
#     "branches": ["main"],
#     "plugins": [
#       "@semantic-release/commit-analyzer",
#       "@semantic-release/release-notes-generator",
#       "@semantic-release/changelog",
#       "@semantic-release/npm",
#       "@semantic-release/github",
#       "@semantic-release/git"
#     ]
#   }
# }

# .github/workflows/semantic-release.yml
name: Semantic Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          persist-credentials: false

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - run: npm ci

      - name: Semantic Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: npx semantic-release
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

### 部署架构详解

```javascript
// ==================== 静态资源部署架构 ====================

/*
用户请求流程:

用户 → CDN(边缘节点) → HTML (源站)
         ↓
      JS/CSS/图片 (CDN 缓存)

HTML 文件:
- 不缓存或短时间缓存
- 每次请求都获取最新版本
- 包含最新的资源引用

静态资源:
- 强缓存 (max-age=31536000)
- 文件名包含 hash
- 内容变化 → hash 变化 → 新文件
*/

// ==================== 资源命名策略 ====================

// Vite 配置
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // 入口文件
        entryFileNames: 'js/[name].[hash].js',
        // 代码分割后的文件
        chunkFileNames: 'js/[name].[hash].js',
        // 资源文件
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name)) {
            return `images/[name].[hash].[ext]`
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
            return `fonts/[name].[hash].[ext]`
          }
          if (/\.css$/.test(assetInfo.name)) {
            return `css/[name].[hash].[ext]`
          }
          return `assets/[name].[hash].[ext]`
        }
      }
    }
  }
})

// Webpack 配置
module.exports = {
  output: {
    filename: 'js/[name].[contenthash:8].js',
    chunkFilename: 'js/[name].[contenthash:8].chunk.js',
    assetModuleFilename: 'assets/[name].[contenthash:8][ext]'
  }
}

// ==================== 缓存策略 ====================

// Nginx 配置
/*
server {
    listen 80;
    server_name example.com;
    root /var/www/html;

    # HTML 文件 - 不缓存
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # 带 hash 的静态资源 - 强缓存一年
    location ~* \.(js|css)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # 图片、字体 - 强缓存
    location ~* \.(png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000";
    }

    # 开启 gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1000;
}
*/
```

### CDN 部署配置

```javascript
// ==================== CDN 部署流程 ====================

// 1. 构建时设置 CDN 路径
// vite.config.js
export default defineConfig({
  base: process.env.NODE_ENV === 'production'
    ? 'https://cdn.example.com/project/'
    : '/'
})

// webpack.config.js
module.exports = {
  output: {
    publicPath: process.env.NODE_ENV === 'production'
      ? 'https://cdn.example.com/project/'
      : '/'
  }
}

// 2. 上传到 CDN
// 使用 CI/CD 自动上传

// 3. 部署流程
/*
构建 → 上传静态资源到 CDN → 部署 HTML 到源站

时序很重要:
1. 先上传新版本静态资源
2. 再更新 HTML 文件
3. 这样可以避免 HTML 引用不存在的资源
*/

// ==================== 多 CDN 配置 ====================

// 根据环境选择 CDN
const cdnConfig = {
  development: '/',
  staging: 'https://cdn-staging.example.com/',
  production: 'https://cdn.example.com/'
}

export default defineConfig({
  base: cdnConfig[process.env.NODE_ENV] || '/'
})

// ==================== CDN 回源配置 ====================

/*
CDN 回源配置 (以阿里云 OSS 为例):

1. 源站配置
   - 类型: OSS 域名
   - 域名: bucket.oss-cn-hangzhou.aliyuncs.com

2. 缓存配置
   - HTML: 缓存过期时间 0 秒
   - JS/CSS: 缓存过期时间 31536000 秒
   - 图片: 缓存过期时间 31536000 秒

3. 性能优化
   - 开启 Gzip/Brotli 压缩
   - 开启 HTTP/2
   - 配置 HTTPS
*/
```

### 容器化部署

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
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

### Docker 完整配置

```dockerfile
# ==================== 多阶段构建 Dockerfile ====================

# 阶段 1: 安装依赖
FROM node:20-alpine AS deps
WORKDIR /app

# 安装依赖（利用缓存）
COPY package.json package-lock.json ./
RUN npm ci --only=production

# 阶段 2: 构建
FROM node:20-alpine AS builder
WORKDIR /app

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 构建参数
ARG NODE_ENV=production
ARG API_URL
ENV NODE_ENV=$NODE_ENV
ENV VITE_API_URL=$API_URL

# 构建
RUN npm run build

# 阶段 3: 生产镜像
FROM nginx:alpine AS runner

# 安装时区
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx.default.conf /etc/nginx/conf.d/default.conf

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;

    # Brotli 压缩 (需要额外模块)
    # brotli on;
    # brotli_comp_level 6;
    # brotli_types text/plain text/css application/json application/javascript;

    include /etc/nginx/conf.d/*.conf;
}
```

```nginx
# nginx.default.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    # API 代理 (可选)
    location /api/ {
        proxy_pass http://backend:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 健康检查
    location /health {
        access_log off;
        return 200 "OK";
        add_header Content-Type text/plain;
    }
}
```

### Docker Compose 配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - NODE_ENV=production
        - API_URL=https://api.example.com
    ports:
      - "80:80"
    restart: unless-stopped
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M

  # 后端服务 (可选)
  backend:
    image: node:20-alpine
    working_dir: /app
    volumes:
      - ./backend:/app
    command: npm start
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://user:pass@db:5432/app
    networks:
      - app-network
    depends_on:
      - db

  # 数据库 (可选)
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=app
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  postgres_data:
```

### Kubernetes 部署

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  labels:
    app: frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
        - name: frontend
          image: your-registry/frontend:latest
          ports:
            - containerPort: 80
          resources:
            requests:
              memory: "64Mi"
              cpu: "100m"
            limits:
              memory: "256Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 80
            initialDelaySeconds: 10
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 80
            initialDelaySeconds: 5
            periodSeconds: 5
          env:
            - name: NODE_ENV
              value: "production"

---
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  selector:
    app: frontend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: ClusterIP

---
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: frontend-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
    - hosts:
        - example.com
      secretName: frontend-tls
  rules:
    - host: example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend-service
                port:
                  number: 80

---
# k8s/hpa.yaml (自动扩缩容)
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: frontend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: frontend
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

## 常见面试题

### 1. 前端如何实现灰度发布？

```javascript
// ==================== 灰度发布方案 ====================

// 1. 用户分流策略
// - 按用户 ID 哈希（固定用户体验一致）
// - 按地区/设备类型
// - 按百分比随机
// - 按白名单（内部测试）
// - 按特性标记（Feature Flag）

// 2. 实现方式

// 方式一：Nginx 灰度配置
/*
upstream stable {
    server 192.168.1.1:80;
}

upstream beta {
    server 192.168.1.2:80;
}

# 根据 Cookie 分流
map $cookie_version $upstream {
    default stable;
    beta    beta;
}

# 根据用户 ID 哈希分流（10% 流量）
split_clients "${remote_addr}" $variant {
    10%     beta;
    *       stable;
}

server {
    location / {
        proxy_pass http://$upstream;
        # 或使用 split_clients
        # proxy_pass http://$variant;
    }
}
*/

// 方式二：前端 SDK 判断
class GrayRelease {
  constructor(config) {
    this.config = config
    this.userId = this.getUserId()
  }

  getUserId() {
    // 从 Cookie 或 localStorage 获取用户标识
    return localStorage.getItem('userId') || this.generateUserId()
  }

  generateUserId() {
    const id = Math.random().toString(36).substr(2, 9)
    localStorage.setItem('userId', id)
    return id
  }

  // 根据用户 ID 哈希判断是否命中灰度
  isGray(percentage = 10) {
    const hash = this.hashCode(this.userId)
    return (hash % 100) < percentage
  }

  hashCode(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i)
      hash = hash & hash
    }
    return Math.abs(hash)
  }

  // 加载不同版本的资源
  loadVersion() {
    if (this.isGray(10)) {
      return 'https://cdn.example.com/beta/'
    }
    return 'https://cdn.example.com/stable/'
  }
}

// 方式三：Feature Flag 服务
class FeatureFlag {
  async isEnabled(featureName, userId) {
    const response = await fetch(`/api/features/${featureName}?user=${userId}`)
    const { enabled } = await response.json()
    return enabled
  }
}

// 使用
const flag = new FeatureFlag()
if (await flag.isEnabled('new-checkout', userId)) {
  // 显示新版结账流程
}

// ==================== 灰度发布流程 ====================

// 1. 金丝雀发布 (Canary Release)
//    先发布给 1% 用户 → 5% → 10% → 50% → 100%
//    每个阶段观察监控数据

// 2. 蓝绿部署 (Blue-Green Deployment)
//    两套完整环境，一键切换

// 3. A/B 测试
//    对比不同版本的效果指标
```

### 2. 如何实现前端错误监控？

```javascript
// ==================== 错误监控完整方案 ====================

class ErrorMonitor {
  constructor(config) {
    this.config = config
    this.errorQueue = []
    this.init()
  }

  init() {
    this.catchJSError()
    this.catchPromiseError()
    this.catchResourceError()
    this.catchAjaxError()
    this.catchFrameError()
  }

  // 1. JS 运行时错误
  catchJSError() {
    window.onerror = (message, source, lineno, colno, error) => {
      this.report({
        type: 'js_error',
        message,
        source,
        lineno,
        colno,
        stack: error?.stack,
        timestamp: Date.now()
      })
      return false  // 不阻止默认处理
    }
  }

  // 2. Promise 未捕获错误
  catchPromiseError() {
    window.addEventListener('unhandledrejection', (event) => {
      this.report({
        type: 'promise_error',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        timestamp: Date.now()
      })
    })
  }

  // 3. 资源加载错误
  catchResourceError() {
    window.addEventListener('error', (event) => {
      const target = event.target
      if (target && (target.tagName === 'IMG' || target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
        this.report({
          type: 'resource_error',
          tagName: target.tagName,
          src: target.src || target.href,
          timestamp: Date.now()
        })
      }
    }, true)  // 捕获阶段
  }

  // 4. Ajax/Fetch 错误
  catchAjaxError() {
    // 拦截 XMLHttpRequest
    const originalOpen = XMLHttpRequest.prototype.open
    const originalSend = XMLHttpRequest.prototype.send
    const self = this

    XMLHttpRequest.prototype.open = function(method, url) {
      this._url = url
      this._method = method
      return originalOpen.apply(this, arguments)
    }

    XMLHttpRequest.prototype.send = function() {
      this.addEventListener('error', function() {
        self.report({
          type: 'xhr_error',
          url: this._url,
          method: this._method,
          status: this.status,
          timestamp: Date.now()
        })
      })
      this.addEventListener('load', function() {
        if (this.status >= 400) {
          self.report({
            type: 'xhr_error',
            url: this._url,
            method: this._method,
            status: this.status,
            response: this.responseText?.substring(0, 500),
            timestamp: Date.now()
          })
        }
      })
      return originalSend.apply(this, arguments)
    }

    // 拦截 Fetch
    const originalFetch = window.fetch
    window.fetch = function(url, options) {
      return originalFetch.apply(this, arguments)
        .then(response => {
          if (!response.ok) {
            self.report({
              type: 'fetch_error',
              url: url,
              method: options?.method || 'GET',
              status: response.status,
              timestamp: Date.now()
            })
          }
          return response
        })
        .catch(error => {
          self.report({
            type: 'fetch_error',
            url: url,
            method: options?.method || 'GET',
            message: error.message,
            timestamp: Date.now()
          })
          throw error
        })
    }
  }

  // 5. 框架错误（React/Vue）
  catchFrameError() {
    // React Error Boundary
    // Vue errorHandler
  }

  // 上报错误
  report(error) {
    // 添加环境信息
    const data = {
      ...error,
      url: location.href,
      userAgent: navigator.userAgent,
      userId: this.config.userId,
      version: this.config.version
    }

    // 使用 Beacon API（页面卸载时也能发送）
    if (navigator.sendBeacon) {
      navigator.sendBeacon(this.config.reportUrl, JSON.stringify(data))
    } else {
      // 降级使用 Image
      const img = new Image()
      img.src = `${this.config.reportUrl}?data=${encodeURIComponent(JSON.stringify(data))}`
    }
  }
}

// 使用 Sentry
import * as Sentry from '@sentry/browser'

Sentry.init({
  dsn: 'https://xxx@sentry.io/xxx',
  release: 'my-app@1.0.0',
  environment: 'production',
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ],
  tracesSampleRate: 0.1,  // 性能追踪采样率
  replaysSessionSampleRate: 0.1,  // 会话回放采样率
  beforeSend(event) {
    // 过滤敏感信息
    return event
  }
})
```

### 3. 如何优化构建速度？

```javascript
// ==================== 构建速度优化 ====================

// 1. 使用缓存
module.exports = {
  // Webpack 5 持久化缓存
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
  },

  module: {
    rules: [{
      test: /\.js$/,
      use: [{
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,       // 启用缓存
          cacheCompression: false     // 禁用压缩（更快）
        }
      }]
    }]
  }
}

// 2. 并行处理
module.exports = {
  module: {
    rules: [{
      test: /\.js$/,
      use: [
        'thread-loader',  // 多线程处理
        'babel-loader'
      ]
    }]
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true  // 并行压缩
      })
    ]
  }
}

// 3. 减少构建范围
module.exports = {
  module: {
    rules: [{
      test: /\.js$/,
      include: path.resolve(__dirname, 'src'),  // 只处理 src
      exclude: /node_modules/,  // 排除 node_modules
      use: 'babel-loader'
    }],
    noParse: /jquery|lodash/  // 跳过大型库的解析
  },
  resolve: {
    modules: [path.resolve(__dirname, 'node_modules')],  // 减少搜索范围
    extensions: ['.js', '.jsx'],  // 减少扩展名尝试
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
}

// 4. 使用更快的工具
// esbuild-loader（比 babel-loader 快 20-100 倍）
module.exports = {
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'esbuild-loader',
      options: {
        loader: 'jsx',
        target: 'es2015'
      }
    }]
  },
  optimization: {
    minimizer: [
      new ESBuildMinifyPlugin({
        target: 'es2015'
      })
    ]
  }
}

// 5. 使用 Vite（开发环境秒启动）
// vite.config.js
export default defineConfig({
  build: {
    target: 'esnext',
    minify: 'esbuild'  // 使用 esbuild 压缩
  },
  optimizeDeps: {
    include: ['lodash-es']  // 预构建依赖
  }
})

// 6. DLL 预编译（Webpack 4 常用）
// webpack.dll.config.js
module.exports = {
  entry: {
    vendor: ['react', 'react-dom', 'lodash']
  },
  output: {
    path: path.join(__dirname, 'dll'),
    filename: '[name].dll.js',
    library: '[name]_library'
  },
  plugins: [
    new webpack.DllPlugin({
      name: '[name]_library',
      path: path.join(__dirname, 'dll', '[name].manifest.json')
    })
  ]
}

// 7. 分析构建瓶颈
// speed-measure-webpack-plugin
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
const smp = new SpeedMeasurePlugin()
module.exports = smp.wrap(config)

// webpack-bundle-analyzer
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
plugins: [new BundleAnalyzerPlugin()]
```

### 4. 如何实现前端项目的回滚？

```javascript
// ==================== 回滚策略 ====================

// 1. 版本管理回滚
// 保留多个版本的构建产物
// 回滚时切换到之前的版本

// 目录结构
// /var/www/app/
// ├── releases/
// │   ├── v1.0.0/
// │   ├── v1.0.1/
// │   └── v1.0.2/
// └── current -> releases/v1.0.2  (符号链接)

// 回滚脚本
// ln -sfn /var/www/app/releases/v1.0.1 /var/www/app/current

// 2. Docker 镜像回滚
// 每次部署打不同的 tag
// docker pull app:v1.0.1
// docker-compose up -d

// 3. Kubernetes 回滚
// kubectl rollout undo deployment/frontend
// kubectl rollout undo deployment/frontend --to-revision=2

// 4. CDN 资源回滚
// 由于使用 hash 命名，只需更新 HTML 中的资源引用
// 保留旧版本资源，回滚时切换 HTML

// 5. 自动化回滚
// GitHub Actions 回滚 workflow
/*
name: Rollback

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to rollback to'
        required: true

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
      - name: Rollback to version
        run: |
          ssh user@server "cd /var/www/app && ln -sfn releases/${{ github.event.inputs.version }} current"
*/
```

### 5. CI/CD 流程中如何处理敏感信息？

```javascript
// ==================== 敏感信息处理 ====================

// 1. 使用 Secrets 管理
// GitHub Actions: Settings > Secrets and variables > Actions
// GitLab CI: Settings > CI/CD > Variables

// 2. 不同环境使用不同 Secrets
/*
name: Deploy

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production  # 使用 production 环境的 secrets
    steps:
      - name: Deploy
        env:
          API_KEY: ${{ secrets.PRODUCTION_API_KEY }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: ./deploy.sh
*/

// 3. 使用密钥管理服务
// - AWS Secrets Manager
// - HashiCorp Vault
// - Azure Key Vault

// 4. 运行时注入环境变量
// Docker 启动时注入
// docker run -e API_KEY=xxx -e DB_URL=xxx my-app

// Kubernetes ConfigMap 和 Secret
/*
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  api-key: YWJjMTIz  # base64 编码
---
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      containers:
        - name: app
          envFrom:
            - secretRef:
                name: app-secrets
*/

// 5. 敏感信息不要提交到代码仓库
// .gitignore
// .env
// .env.local
// *.pem
// credentials.json

// 使用 .env.example 作为模板
// API_KEY=your_api_key_here
// DATABASE_URL=your_database_url_here
```

### 6. 如何保证部署的稳定性？

```javascript
// ==================== 部署稳定性保障 ====================

// 1. 健康检查
// Kubernetes 探针
/*
livenessProbe:
  httpGet:
    path: /health
    port: 80
  initialDelaySeconds: 10
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /ready
    port: 80
  initialDelaySeconds: 5
  periodSeconds: 5
*/

// 2. 滚动更新
// 逐步替换旧 Pod，避免服务中断
/*
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 25%        # 最多超出期望 25%
    maxUnavailable: 25%  # 最多不可用 25%
*/

// 3. 自动回滚
// 健康检查失败自动回滚
/*
kubectl rollout status deployment/frontend --timeout=300s
if [ $? -ne 0 ]; then
  kubectl rollout undo deployment/frontend
fi
*/

// 4. 金丝雀发布
// 先发布小部分流量验证

// 5. 蓝绿部署
// 两套环境，一键切换

// 6. 监控告警
// 部署后监控关键指标
// - 错误率
// - 响应时间
// - 成功率
// 指标异常自动告警或回滚

// 7. 流量预热
// 新版本上线前预热缓存
// 避免冷启动导致的性能问题

// 8. 限流降级
// 流量突增时自动限流
// 核心功能优先，非核心功能降级
```
