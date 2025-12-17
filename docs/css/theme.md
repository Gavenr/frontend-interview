# 主题切换与夜间模式

## 概述

主题切换是现代 Web 应用的常见需求，包括亮色/暗色模式切换、品牌色定制等。本文详细介绍各种主题切换方案的实现。

---

## CSS 变量方案

### 基础实现

```css
/* 定义主题变量 */
:root {
  /* 亮色主题（默认） */
  --color-bg: #ffffff;
  --color-bg-secondary: #f5f5f5;
  --color-text: #333333;
  --color-text-secondary: #666666;
  --color-primary: #1890ff;
  --color-border: #e8e8e8;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 暗色主题 */
[data-theme="dark"] {
  --color-bg: #1a1a1a;
  --color-bg-secondary: #2d2d2d;
  --color-text: #e5e5e5;
  --color-text-secondary: #a0a0a0;
  --color-primary: #177ddc;
  --color-border: #434343;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

/* 使用变量 */
body {
  background-color: var(--color-bg);
  color: var(--color-text);
}

.card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow);
}

.button-primary {
  background: var(--color-primary);
  color: #fff;
}
```

### JavaScript 切换

```javascript
// 切换主题
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

// 获取当前主题
function getTheme() {
  return localStorage.getItem('theme') || 'light';
}

// 初始化主题
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  setTheme(theme);
}

// 切换主题
function toggleTheme() {
  const current = getTheme();
  setTheme(current === 'light' ? 'dark' : 'light');
}

// 监听系统主题变化
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  // 如果用户没有手动设置主题，则跟随系统
  if (!localStorage.getItem('theme')) {
    setTheme(e.matches ? 'dark' : 'light');
  }
});

// 页面加载时初始化
initTheme();
```

---

## 媒体查询方案

### 跟随系统主题

```css
/* 默认亮色 */
:root {
  --color-bg: #ffffff;
  --color-text: #333333;
}

/* 系统暗色模式 */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #1a1a1a;
    --color-text: #e5e5e5;
  }
}

body {
  background: var(--color-bg);
  color: var(--color-text);
  /* 平滑过渡 */
  transition: background-color 0.3s, color 0.3s;
}
```

### 结合用户偏好和系统主题

```css
/* 基础变量 */
:root {
  --color-bg: #ffffff;
  --color-text: #333333;
}

/* 系统暗色（用户未设置时） */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    --color-bg: #1a1a1a;
    --color-text: #e5e5e5;
  }
}

/* 用户手动选择暗色 */
:root[data-theme="dark"] {
  --color-bg: #1a1a1a;
  --color-text: #e5e5e5;
}

/* 用户手动选择亮色（覆盖系统暗色） */
:root[data-theme="light"] {
  --color-bg: #ffffff;
  --color-text: #333333;
}
```

---

## Vue 3 实现

### 主题 Hook

```typescript
// composables/useTheme.ts
import { ref, watch, onMounted } from 'vue';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const theme = ref<Theme>('system');
  const isDark = ref(false);

  // 获取实际应用的主题
  const getAppliedTheme = (): 'light' | 'dark' => {
    if (theme.value === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return theme.value;
  };

  // 应用主题
  const applyTheme = () => {
    const appliedTheme = getAppliedTheme();
    isDark.value = appliedTheme === 'dark';
    document.documentElement.setAttribute('data-theme', appliedTheme);
  };

  // 设置主题
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme;
    localStorage.setItem('theme', newTheme);
    applyTheme();
  };

  // 切换主题
  const toggleTheme = () => {
    const current = getAppliedTheme();
    setTheme(current === 'light' ? 'dark' : 'light');
  };

  // 初始化
  onMounted(() => {
    const saved = localStorage.getItem('theme') as Theme | null;
    theme.value = saved || 'system';
    applyTheme();

    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (theme.value === 'system') {
        applyTheme();
      }
    });
  });

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme
  };
}
```

### 主题切换组件

```vue
<template>
  <div class="theme-switcher">
    <button
      v-for="option in options"
      :key="option.value"
      :class="['theme-btn', { active: theme === option.value }]"
      @click="setTheme(option.value)"
    >
      <span class="icon">{{ option.icon }}</span>
      <span class="label">{{ option.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme';

const { theme, setTheme } = useTheme();

const options = [
  { value: 'light', label: '亮色', icon: '☀️' },
  { value: 'dark', label: '暗色', icon: '🌙' },
  { value: 'system', label: '跟随系统', icon: '💻' }
];
</script>

<style scoped>
.theme-switcher {
  display: flex;
  gap: 8px;
}

.theme-btn {
  padding: 8px 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg);
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s;
}

.theme-btn:hover {
  border-color: var(--color-primary);
}

.theme-btn.active {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}
</style>
```

---

## React 实现

### ThemeProvider

```tsx
// contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [isDark, setIsDark] = useState(false);

  const getAppliedTheme = (currentTheme: Theme): 'light' | 'dark' => {
    if (currentTheme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return currentTheme;
  };

  const applyTheme = (theme: Theme) => {
    const appliedTheme = getAppliedTheme(theme);
    setIsDark(appliedTheme === 'dark');
    document.documentElement.setAttribute('data-theme', appliedTheme);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    const current = getAppliedTheme(theme);
    setTheme(current === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme | null;
    const initial = saved || 'system';
    setThemeState(initial);
    applyTheme(initial);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

### 使用示例

```tsx
// App.tsx
import { ThemeProvider } from './contexts/ThemeContext';
import ThemeSwitcher from './components/ThemeSwitcher';

function App() {
  return (
    <ThemeProvider>
      <div className="app">
        <header>
          <ThemeSwitcher />
        </header>
        <main>{/* ... */}</main>
      </div>
    </ThemeProvider>
  );
}

// components/ThemeSwitcher.tsx
import { useTheme } from '../contexts/ThemeContext';

function ThemeSwitcher() {
  const { theme, isDark, toggleTheme, setTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      {isDark ? '🌙' : '☀️'}
    </button>
  );
}
```

---

## 多主题色方案

### 品牌色定制

```css
/* 预设主题色 */
:root {
  --color-primary: #1890ff;
}

[data-color="blue"] {
  --color-primary: #1890ff;
}

[data-color="green"] {
  --color-primary: #52c41a;
}

[data-color="purple"] {
  --color-primary: #722ed1;
}

[data-color="red"] {
  --color-primary: #f5222d;
}

/* 自动生成派生色 */
:root {
  --color-primary: #1890ff;
  --color-primary-light: color-mix(in srgb, var(--color-primary), white 20%);
  --color-primary-dark: color-mix(in srgb, var(--color-primary), black 20%);
  --color-primary-bg: color-mix(in srgb, var(--color-primary), transparent 90%);
}
```

### 动态主题色

```typescript
// 设置自定义主题色
function setCustomColor(color: string) {
  const root = document.documentElement;
  root.style.setProperty('--color-primary', color);

  // 生成派生色
  root.style.setProperty('--color-primary-light', lighten(color, 20));
  root.style.setProperty('--color-primary-dark', darken(color, 20));

  localStorage.setItem('custom-color', color);
}

// 颜色处理函数
function lighten(color: string, percent: number): string {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  const newR = Math.min(255, r + (255 - r) * (percent / 100));
  const newG = Math.min(255, g + (255 - g) * (percent / 100));
  const newB = Math.min(255, b + (255 - b) * (percent / 100));

  return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`;
}

function darken(color: string, percent: number): string {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  const newR = Math.max(0, r * (1 - percent / 100));
  const newG = Math.max(0, g * (1 - percent / 100));
  const newB = Math.max(0, b * (1 - percent / 100));

  return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`;
}
```

---

## 过渡动画

### 平滑过渡

```css
/* 全局过渡 */
* {
  transition:
    background-color 0.3s ease,
    color 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}

/* 或者只对特定属性 */
body,
.card,
.button {
  transition: background-color 0.3s, color 0.3s;
}
```

### 避免首次加载闪烁

```html
<!-- 在 head 中尽早执行 -->
<script>
  (function() {
    const theme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const appliedTheme = theme || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', appliedTheme);
  })();
</script>

<!-- 防止过渡动画在初始化时触发 -->
<style>
  html.no-transition,
  html.no-transition * {
    transition: none !important;
  }
</style>

<script>
  document.documentElement.classList.add('no-transition');
  window.addEventListener('load', () => {
    document.documentElement.classList.remove('no-transition');
  });
</script>
```

---

## 后台管理布局

### 内容区域占满剩余高度

```css
/* 方案 1：Flexbox */
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.header {
  height: 64px;
  flex-shrink: 0;
}

.main {
  flex: 1;
  overflow: auto;  /* 内容超出时滚动 */
}

/* 方案 2：Grid */
.layout {
  display: grid;
  grid-template-rows: 64px 1fr;
  height: 100vh;
}

.main {
  overflow: auto;
}

/* 方案 3：calc */
.main {
  height: calc(100vh - 64px);
  overflow: auto;
}

/* 方案 4：绝对定位 */
.layout {
  position: relative;
  height: 100vh;
}

.header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
}

.main {
  position: absolute;
  top: 64px;
  bottom: 0;
  left: 0;
  right: 0;
  overflow: auto;
}
```

### 左右布局

```css
.layout {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 200px;
  flex-shrink: 0;
  overflow-y: auto;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-header {
  height: 64px;
  flex-shrink: 0;
}

.content-main {
  flex: 1;
  overflow: auto;
}
```

---

## 收起/展开过渡

### 高度过渡

```css
/* 问题：height: auto 无法过渡 */
.collapse {
  height: 0;
  overflow: hidden;
  transition: height 0.3s ease;
}

.collapse.open {
  height: auto;  /* ❌ 无法过渡 */
}

/* 方案 1：使用 max-height */
.collapse {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.collapse.open {
  max-height: 500px;  /* 设置足够大的值 */
}

/* 方案 2：使用 grid */
.collapse {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s ease;
}

.collapse > .inner {
  overflow: hidden;
}

.collapse.open {
  grid-template-rows: 1fr;
}
```

### Vue 过渡组件

```vue
<template>
  <button @click="isOpen = !isOpen">切换</button>

  <CollapseTransition>
    <div v-show="isOpen" class="content">
      内容区域
    </div>
  </CollapseTransition>
</template>

<script setup>
import { ref } from 'vue';

const isOpen = ref(false);
</script>

<!-- CollapseTransition.vue -->
<template>
  <Transition
    @before-enter="beforeEnter"
    @enter="enter"
    @after-enter="afterEnter"
    @before-leave="beforeLeave"
    @leave="leave"
    @after-leave="afterLeave"
  >
    <slot />
  </Transition>
</template>

<script setup>
function beforeEnter(el) {
  el.style.height = '0';
  el.style.overflow = 'hidden';
}

function enter(el) {
  el.style.transition = 'height 0.3s ease';
  el.style.height = `${el.scrollHeight}px`;
}

function afterEnter(el) {
  el.style.height = '';
  el.style.overflow = '';
  el.style.transition = '';
}

function beforeLeave(el) {
  el.style.height = `${el.scrollHeight}px`;
  el.style.overflow = 'hidden';
}

function leave(el) {
  el.style.transition = 'height 0.3s ease';
  el.style.height = '0';
}

function afterLeave(el) {
  el.style.height = '';
  el.style.overflow = '';
  el.style.transition = '';
}
</script>
```

### React 版本

```tsx
import { useRef, useState, useEffect, CSSProperties } from 'react';

interface CollapseProps {
  isOpen: boolean;
  children: React.ReactNode;
}

function Collapse({ isOpen, children }: CollapseProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(isOpen ? undefined : 0);

  useEffect(() => {
    if (!contentRef.current) return;

    if (isOpen) {
      const contentHeight = contentRef.current.scrollHeight;
      setHeight(contentHeight);

      // 过渡结束后移除固定高度
      const timer = setTimeout(() => {
        setHeight(undefined);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      // 先设置当前高度，然后设为 0
      const contentHeight = contentRef.current.scrollHeight;
      setHeight(contentHeight);

      requestAnimationFrame(() => {
        setHeight(0);
      });
    }
  }, [isOpen]);

  const style: CSSProperties = {
    height: height,
    overflow: 'hidden',
    transition: 'height 0.3s ease'
  };

  return (
    <div style={style}>
      <div ref={contentRef}>{children}</div>
    </div>
  );
}

// 使用
function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)}>切换</button>
      <Collapse isOpen={isOpen}>
        <div className="content">
          内容区域
        </div>
      </Collapse>
    </>
  );
}
```

---

## 常见面试题

### 1. 如何实现夜间模式？

**答案要点：**
- 使用 CSS 变量定义颜色
- 通过 `data-theme` 属性切换变量值
- 使用 `prefers-color-scheme` 媒体查询跟随系统
- localStorage 保存用户偏好
- 监听系统主题变化事件

### 2. 如何避免主题切换时的闪烁？

```javascript
// 在 <head> 中尽早执行同步脚本设置主题
// 添加 no-transition 类避免过渡动画
// 页面加载完成后移除 no-transition
```

### 3. height: auto 无法过渡怎么办？

```css
/* 方案 1：使用 max-height */
.collapse {
  max-height: 0;
  transition: max-height 0.3s;
}
.collapse.open {
  max-height: 500px;
}

/* 方案 2：使用 grid */
.collapse {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s;
}
.collapse.open {
  grid-template-rows: 1fr;
}

/* 方案 3：JS 动态设置 scrollHeight */
```

### 4. 后台布局如何让内容区占满剩余高度？

```css
/* Flexbox 方案 */
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.header { height: 64px; flex-shrink: 0; }
.main { flex: 1; overflow: auto; }

/* Grid 方案 */
.layout {
  display: grid;
  grid-template-rows: 64px 1fr;
  height: 100vh;
}
```
