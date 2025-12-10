# Babel 详解

## 什么是 Babel？

Babel 是一个 JavaScript 编译器，主要用于将 ES6+ 代码转换为向后兼容的 JavaScript 代码。

## 核心概念

### 编译流程

```
源代码 → 解析(Parse) → AST → 转换(Transform) → AST → 生成(Generate) → 目标代码
```

```javascript
// 输入 (ES6+)
const fn = (a, b) => a + b;

// 输出 (ES5)
var fn = function(a, b) {
  return a + b;
};
```

### 核心包

```javascript
// @babel/core - 核心编译功能
const babel = require('@babel/core');
const result = babel.transformSync(code, options);

// @babel/parser - 解析器
const parser = require('@babel/parser');
const ast = parser.parse(code);

// @babel/traverse - AST 遍历
const traverse = require('@babel/traverse').default;
traverse(ast, visitor);

// @babel/generator - 代码生成
const generate = require('@babel/generator').default;
const output = generate(ast);

// @babel/types - AST 节点工具
const t = require('@babel/types');
t.identifier('name');
```

## 配置详解

### babel.config.js

```javascript
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        browsers: ['> 1%', 'last 2 versions']
      },
      useBuiltIns: 'usage',
      corejs: 3
    }],
    '@babel/preset-react',
    '@babel/preset-typescript'
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-optional-chaining'
  ]
};
```

### Preset vs Plugin

```javascript
// Plugin: 单个功能转换
// 例如: @babel/plugin-transform-arrow-functions

// Preset: 一组 Plugin 的集合
// 例如: @babel/preset-env 包含所有 ES6+ 转换

// 执行顺序:
// 1. Plugins 先于 Presets
// 2. Plugins 从前往后
// 3. Presets 从后往前
```

## @babel/preset-env

```javascript
// 智能预设，根据目标环境按需转换

module.exports = {
  presets: [
    ['@babel/preset-env', {
      // 目标环境
      targets: {
        chrome: '60',
        ie: '11'
      },

      // Polyfill 策略
      // 'usage': 按需引入
      // 'entry': 入口全部引入
      // false: 不引入
      useBuiltIns: 'usage',

      // core-js 版本
      corejs: 3,

      // 是否转换模块语法
      modules: false,  // 保留 ESM，利于 tree-shaking

      // 调试输出
      debug: true
    }]
  ]
};
```

## @babel/runtime

```javascript
// 问题：Babel 转换会注入大量重复的辅助代码

// 解决：使用 @babel/plugin-transform-runtime
{
  "plugins": [
    ["@babel/plugin-transform-runtime", {
      "corejs": 3,
      "helpers": true,
      "regenerator": true
    }]
  ]
}

// 优点:
// 1. 减少代码体积（共享辅助函数）
// 2. 避免全局污染（沙盒化 Polyfill）
```

## 编写 Babel 插件

```javascript
// 简单示例：将 console.log 替换为空函数

module.exports = function(babel) {
  const { types: t } = babel;

  return {
    name: 'remove-console',
    visitor: {
      CallExpression(path) {
        const { callee } = path.node;

        if (
          t.isMemberExpression(callee) &&
          t.isIdentifier(callee.object, { name: 'console' }) &&
          t.isIdentifier(callee.property, { name: 'log' })
        ) {
          path.remove();
        }
      }
    }
  };
};
```

## 常见面试题

### 1. Babel 的编译流程？

```javascript
// 1. 解析 (Parse)
//    - 词法分析：代码 → Token
//    - 语法分析：Token → AST

// 2. 转换 (Transform)
//    - 遍历 AST
//    - 应用 Plugin 转换

// 3. 生成 (Generate)
//    - AST → 代码
```

### 2. preset-env 和 runtime 的区别？

```javascript
// preset-env:
// - 转换语法（箭头函数、类等）
// - Polyfill 新 API（Promise、Symbol 等）
// - 全局引入 Polyfill

// runtime:
// - 提取公共辅助函数
// - 沙盒化 Polyfill，不污染全局
// - 适合开发库
```

### 3. useBuiltIns 的三个值？

```javascript
// 'entry': 在入口处全量引入 polyfill
// 'usage': 按需引入（推荐）
// false: 不自动引入
```
