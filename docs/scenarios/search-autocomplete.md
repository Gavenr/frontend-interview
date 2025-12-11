# 搜索建议（Autocomplete）

## 概述

搜索建议（Autocomplete/搜索联想）是前端面试中的高频场景题，考察候选人对**防抖节流**、**键盘事件处理**、**性能优化**、**用户体验**等方面的综合能力。

---

## 一、需求分析

### 功能需求

```javascript
/**
 * 搜索建议核心功能:
 *
 * 1. 输入联想 - 输入时显示建议列表
 * 2. 高亮匹配 - 高亮显示匹配的文字
 * 3. 键盘导航 - 上下键选择，回车确认，ESC 关闭
 * 4. 历史记录 - 显示搜索历史
 * 5. 热门搜索 - 显示热门搜索词
 * 6. 防抖优化 - 减少请求次数
 * 7. 缓存结果 - 避免重复请求
 * 8. 取消请求 - 取消过期的请求
 */
```

### 交互设计

```
┌─────────────────────────────────────────┐
│  🔍  手机                          × │  ← 搜索框
├─────────────────────────────────────────┤
│  📱 手机壳                              │  ← 当前选中 (高亮)
│  📱 手机支架                            │
│  📱 手机贴膜                            │
│  📱 手机充电器                          │
│  📱 手机数据线                          │
├─────────────────────────────────────────┤
│  最近搜索:  iPhone  华为  小米           │  ← 历史记录
│  热门搜索:  iPhone 15  华为 Mate 60     │  ← 热门搜索
└─────────────────────────────────────────┘
```

---

## 二、基础实现

### HTML 结构

```html
<div class="search-container">
  <div class="search-input-wrapper">
    <input
      type="text"
      class="search-input"
      placeholder="请输入搜索内容"
      autocomplete="off"
    />
    <button class="search-btn">搜索</button>
    <button class="clear-btn" style="display: none;">×</button>
  </div>

  <div class="search-dropdown" style="display: none;">
    <!-- 搜索建议列表 -->
    <ul class="suggestion-list"></ul>

    <!-- 历史记录 -->
    <div class="history-section">
      <div class="section-header">
        <span>最近搜索</span>
        <button class="clear-history">清空</button>
      </div>
      <div class="history-tags"></div>
    </div>

    <!-- 热门搜索 -->
    <div class="hot-section">
      <div class="section-header">
        <span>热门搜索</span>
      </div>
      <div class="hot-tags"></div>
    </div>
  </div>
</div>
```

### JavaScript 实现

```javascript
class SearchAutocomplete {
  constructor(options) {
    this.container = options.container
    this.fetchSuggestions = options.fetchSuggestions  // 获取建议的函数
    this.onSearch = options.onSearch                  // 搜索回调
    this.debounceTime = options.debounceTime || 300   // 防抖时间
    this.maxHistory = options.maxHistory || 10        // 最大历史记录数
    this.cacheSize = options.cacheSize || 100         // 缓存大小

    this.activeIndex = -1           // 当前选中索引
    this.suggestions = []           // 建议列表
    this.cache = new Map()          // 请求缓存
    this.abortController = null     // 用于取消请求
    this.history = this.loadHistory()  // 搜索历史

    this.init()
  }

  init() {
    this.input = this.container.querySelector('.search-input')
    this.dropdown = this.container.querySelector('.search-dropdown')
    this.suggestionList = this.container.querySelector('.suggestion-list')
    this.clearBtn = this.container.querySelector('.clear-btn')
    this.searchBtn = this.container.querySelector('.search-btn')
    this.historySection = this.container.querySelector('.history-section')
    this.historyTags = this.container.querySelector('.history-tags')

    this.bindEvents()
    this.renderHistory()
  }

  bindEvents() {
    // 输入事件 (防抖)
    this.input.addEventListener('input', this.debounce((e) => {
      this.handleInput(e.target.value)
    }, this.debounceTime))

    // 聚焦事件
    this.input.addEventListener('focus', () => {
      this.showDropdown()
    })

    // 失焦事件 (延迟关闭，允许点击建议)
    this.input.addEventListener('blur', () => {
      setTimeout(() => this.hideDropdown(), 200)
    })

    // 键盘事件
    this.input.addEventListener('keydown', (e) => {
      this.handleKeydown(e)
    })

    // 清空按钮
    this.clearBtn.addEventListener('click', () => {
      this.clearInput()
    })

    // 搜索按钮
    this.searchBtn.addEventListener('click', () => {
      this.doSearch(this.input.value)
    })

    // 建议列表点击
    this.suggestionList.addEventListener('click', (e) => {
      const item = e.target.closest('.suggestion-item')
      if (item) {
        const keyword = item.dataset.keyword
        this.selectSuggestion(keyword)
      }
    })

    // 历史记录点击
    this.historyTags.addEventListener('click', (e) => {
      const tag = e.target.closest('.history-tag')
      if (tag) {
        this.selectSuggestion(tag.textContent)
      }
    })

    // 清空历史
    const clearHistoryBtn = this.container.querySelector('.clear-history')
    clearHistoryBtn?.addEventListener('click', () => {
      this.clearHistory()
    })
  }

  // 处理输入
  async handleInput(value) {
    const keyword = value.trim()

    // 更新清空按钮显示状态
    this.clearBtn.style.display = keyword ? 'block' : 'none'

    if (!keyword) {
      this.suggestions = []
      this.renderSuggestions()
      this.showHistory()
      return
    }

    // 隐藏历史记录
    this.hideHistory()

    // 检查缓存
    if (this.cache.has(keyword)) {
      this.suggestions = this.cache.get(keyword)
      this.renderSuggestions()
      return
    }

    // 取消之前的请求
    if (this.abortController) {
      this.abortController.abort()
    }

    // 发起新请求
    this.abortController = new AbortController()

    try {
      this.showLoading()

      const suggestions = await this.fetchSuggestions(keyword, {
        signal: this.abortController.signal
      })

      // 缓存结果
      this.addToCache(keyword, suggestions)

      this.suggestions = suggestions
      this.renderSuggestions()

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('获取建议失败:', error)
        this.showError()
      }
    } finally {
      this.hideLoading()
    }
  }

  // 键盘导航
  handleKeydown(e) {
    const { key } = e

    switch (key) {
      case 'ArrowDown':
        e.preventDefault()
        this.moveSelection(1)
        break

      case 'ArrowUp':
        e.preventDefault()
        this.moveSelection(-1)
        break

      case 'Enter':
        e.preventDefault()
        if (this.activeIndex >= 0 && this.suggestions[this.activeIndex]) {
          this.selectSuggestion(this.suggestions[this.activeIndex].keyword)
        } else {
          this.doSearch(this.input.value)
        }
        break

      case 'Escape':
        this.hideDropdown()
        this.input.blur()
        break

      case 'Tab':
        // Tab 键补全
        if (this.activeIndex >= 0 && this.suggestions[this.activeIndex]) {
          e.preventDefault()
          this.input.value = this.suggestions[this.activeIndex].keyword
        }
        break
    }
  }

  // 移动选择
  moveSelection(direction) {
    const total = this.suggestions.length
    if (total === 0) return

    this.activeIndex += direction

    // 循环选择
    if (this.activeIndex >= total) {
      this.activeIndex = 0
    } else if (this.activeIndex < 0) {
      this.activeIndex = total - 1
    }

    this.renderSuggestions()

    // 更新输入框内容
    if (this.suggestions[this.activeIndex]) {
      this.input.value = this.suggestions[this.activeIndex].keyword
    }
  }

  // 选择建议
  selectSuggestion(keyword) {
    this.input.value = keyword
    this.doSearch(keyword)
  }

  // 执行搜索
  doSearch(keyword) {
    const trimmed = keyword.trim()
    if (!trimmed) return

    // 添加到历史记录
    this.addToHistory(trimmed)

    // 隐藏下拉
    this.hideDropdown()

    // 回调
    this.onSearch?.(trimmed)
  }

  // 渲染建议列表
  renderSuggestions() {
    if (this.suggestions.length === 0) {
      this.suggestionList.innerHTML = ''
      return
    }

    const keyword = this.input.value.trim()

    this.suggestionList.innerHTML = this.suggestions
      .map((item, index) => {
        const isActive = index === this.activeIndex
        const highlighted = this.highlightMatch(item.keyword, keyword)

        return `
          <li
            class="suggestion-item ${isActive ? 'active' : ''}"
            data-keyword="${this.escapeHtml(item.keyword)}"
          >
            <span class="suggestion-icon">🔍</span>
            <span class="suggestion-text">${highlighted}</span>
            ${item.count ? `<span class="suggestion-count">${item.count}</span>` : ''}
          </li>
        `
      })
      .join('')
  }

  // 高亮匹配文字
  highlightMatch(text, keyword) {
    if (!keyword) return this.escapeHtml(text)

    const regex = new RegExp(`(${this.escapeRegExp(keyword)})`, 'gi')
    return this.escapeHtml(text).replace(regex, '<mark>$1</mark>')
  }

  // 显示/隐藏下拉框
  showDropdown() {
    this.dropdown.style.display = 'block'
    if (!this.input.value.trim()) {
      this.showHistory()
    }
  }

  hideDropdown() {
    this.dropdown.style.display = 'none'
    this.activeIndex = -1
  }

  // 历史记录相关
  loadHistory() {
    try {
      return JSON.parse(localStorage.getItem('searchHistory') || '[]')
    } catch {
      return []
    }
  }

  saveHistory() {
    localStorage.setItem('searchHistory', JSON.stringify(this.history))
  }

  addToHistory(keyword) {
    // 移除重复项
    this.history = this.history.filter(item => item !== keyword)

    // 添加到开头
    this.history.unshift(keyword)

    // 限制数量
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(0, this.maxHistory)
    }

    this.saveHistory()
    this.renderHistory()
  }

  clearHistory() {
    this.history = []
    this.saveHistory()
    this.renderHistory()
  }

  renderHistory() {
    if (this.history.length === 0) {
      this.historySection.style.display = 'none'
      return
    }

    this.historySection.style.display = 'block'
    this.historyTags.innerHTML = this.history
      .map(keyword => `
        <span class="history-tag">${this.escapeHtml(keyword)}</span>
      `)
      .join('')
  }

  showHistory() {
    this.historySection.style.display = this.history.length > 0 ? 'block' : 'none'
  }

  hideHistory() {
    this.historySection.style.display = 'none'
  }

  // 缓存相关
  addToCache(key, value) {
    // LRU 策略
    if (this.cache.size >= this.cacheSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    this.cache.set(key, value)
  }

  // 清空输入
  clearInput() {
    this.input.value = ''
    this.clearBtn.style.display = 'none'
    this.suggestions = []
    this.renderSuggestions()
    this.showHistory()
    this.input.focus()
  }

  // 显示加载状态
  showLoading() {
    this.suggestionList.innerHTML = `
      <li class="suggestion-loading">
        <span class="loading-spinner"></span>
        加载中...
      </li>
    `
  }

  hideLoading() {
    const loading = this.suggestionList.querySelector('.suggestion-loading')
    loading?.remove()
  }

  // 显示错误
  showError() {
    this.suggestionList.innerHTML = `
      <li class="suggestion-error">
        加载失败，请重试
      </li>
    `
  }

  // 工具函数
  debounce(fn, delay) {
    let timer = null
    return function(...args) {
      clearTimeout(timer)
      timer = setTimeout(() => fn.apply(this, args), delay)
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  // 销毁
  destroy() {
    if (this.abortController) {
      this.abortController.abort()
    }
    this.cache.clear()
  }
}

// 使用示例
const search = new SearchAutocomplete({
  container: document.querySelector('.search-container'),

  fetchSuggestions: async (keyword, options) => {
    const response = await fetch(`/api/suggestions?q=${encodeURIComponent(keyword)}`, {
      signal: options.signal
    })
    const data = await response.json()
    return data.suggestions
  },

  onSearch: (keyword) => {
    console.log('搜索:', keyword)
    window.location.href = `/search?q=${encodeURIComponent(keyword)}`
  },

  debounceTime: 300,
  maxHistory: 10
})
```

---

## 三、Vue 3 实现

```vue
<template>
  <div class="search-autocomplete" ref="containerRef">
    <!-- 搜索框 -->
    <div class="search-input-wrapper">
      <input
        ref="inputRef"
        v-model="keyword"
        type="text"
        class="search-input"
        placeholder="请输入搜索内容"
        autocomplete="off"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
        @input="handleInput"
      />
      <button v-show="keyword" class="clear-btn" @click="clearInput">×</button>
      <button class="search-btn" @click="doSearch(keyword)">搜索</button>
    </div>

    <!-- 下拉框 -->
    <div v-show="showDropdown" class="search-dropdown">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading">
        <span class="spinner"></span>
        加载中...
      </div>

      <!-- 建议列表 -->
      <ul v-else-if="suggestions.length > 0" class="suggestion-list">
        <li
          v-for="(item, index) in suggestions"
          :key="item.keyword"
          :class="['suggestion-item', { active: index === activeIndex }]"
          @mouseenter="activeIndex = index"
          @click="selectSuggestion(item.keyword)"
        >
          <span class="icon">🔍</span>
          <span class="text" v-html="highlightMatch(item.keyword)"></span>
          <span v-if="item.count" class="count">{{ item.count }}</span>
        </li>
      </ul>

      <!-- 历史记录 -->
      <div v-show="showHistory && history.length > 0" class="history-section">
        <div class="section-header">
          <span>最近搜索</span>
          <button @click="clearHistory">清空</button>
        </div>
        <div class="history-tags">
          <span
            v-for="item in history"
            :key="item"
            class="tag"
            @click="selectSuggestion(item)"
          >
            {{ item }}
          </span>
        </div>
      </div>

      <!-- 热门搜索 -->
      <div v-if="hotKeywords.length > 0" class="hot-section">
        <div class="section-header">
          <span>热门搜索</span>
        </div>
        <div class="hot-tags">
          <span
            v-for="item in hotKeywords"
            :key="item"
            class="tag"
            @click="selectSuggestion(item)"
          >
            {{ item }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  fetchSuggestions: {
    type: Function,
    required: true
  },
  hotKeywords: {
    type: Array,
    default: () => []
  },
  debounceTime: {
    type: Number,
    default: 300
  },
  maxHistory: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits(['search', 'select'])

// 状态
const keyword = ref('')
const suggestions = ref([])
const activeIndex = ref(-1)
const loading = ref(false)
const focused = ref(false)
const history = ref([])

// 缓存
const cache = new Map()
let abortController = null
let debounceTimer = null

// 计算属性
const showDropdown = computed(() => {
  return focused.value
})

const showHistory = computed(() => {
  return !keyword.value.trim() && !loading.value
})

// 输入处理 (防抖)
function handleInput() {
  activeIndex.value = -1

  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    fetchData()
  }, props.debounceTime)
}

// 获取建议数据
async function fetchData() {
  const query = keyword.value.trim()

  if (!query) {
    suggestions.value = []
    return
  }

  // 检查缓存
  if (cache.has(query)) {
    suggestions.value = cache.get(query)
    return
  }

  // 取消之前的请求
  if (abortController) {
    abortController.abort()
  }
  abortController = new AbortController()

  loading.value = true

  try {
    const result = await props.fetchSuggestions(query, {
      signal: abortController.signal
    })

    suggestions.value = result
    cache.set(query, result)

  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('获取建议失败:', error)
    }
  } finally {
    loading.value = false
  }
}

// 键盘事件
function handleKeydown(e) {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      moveSelection(1)
      break

    case 'ArrowUp':
      e.preventDefault()
      moveSelection(-1)
      break

    case 'Enter':
      e.preventDefault()
      if (activeIndex.value >= 0 && suggestions.value[activeIndex.value]) {
        selectSuggestion(suggestions.value[activeIndex.value].keyword)
      } else {
        doSearch(keyword.value)
      }
      break

    case 'Escape':
      focused.value = false
      break
  }
}

// 移动选择
function moveSelection(direction) {
  const total = suggestions.value.length
  if (total === 0) return

  activeIndex.value += direction

  if (activeIndex.value >= total) {
    activeIndex.value = 0
  } else if (activeIndex.value < 0) {
    activeIndex.value = total - 1
  }

  // 更新输入框
  keyword.value = suggestions.value[activeIndex.value].keyword
}

// 选择建议
function selectSuggestion(value) {
  keyword.value = value
  emit('select', value)
  doSearch(value)
}

// 执行搜索
function doSearch(value) {
  const trimmed = value?.trim()
  if (!trimmed) return

  addToHistory(trimmed)
  focused.value = false
  emit('search', trimmed)
}

// 高亮匹配
function highlightMatch(text) {
  const query = keyword.value.trim()
  if (!query) return escapeHtml(text)

  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi')
  return escapeHtml(text).replace(regex, '<mark>$1</mark>')
}

// 聚焦/失焦
function handleFocus() {
  focused.value = true
}

function handleBlur() {
  // 延迟关闭，允许点击建议
  setTimeout(() => {
    focused.value = false
  }, 200)
}

// 清空输入
function clearInput() {
  keyword.value = ''
  suggestions.value = []
  activeIndex.value = -1
}

// 历史记录
function loadHistory() {
  try {
    history.value = JSON.parse(localStorage.getItem('searchHistory') || '[]')
  } catch {
    history.value = []
  }
}

function saveHistory() {
  localStorage.setItem('searchHistory', JSON.stringify(history.value))
}

function addToHistory(value) {
  history.value = history.value.filter(item => item !== value)
  history.value.unshift(value)
  if (history.value.length > props.maxHistory) {
    history.value = history.value.slice(0, props.maxHistory)
  }
  saveHistory()
}

function clearHistory() {
  history.value = []
  saveHistory()
}

// 工具函数
function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// 生命周期
onMounted(() => {
  loadHistory()
})

onUnmounted(() => {
  if (abortController) {
    abortController.abort()
  }
  clearTimeout(debounceTimer)
  cache.clear()
})

// 暴露方法
defineExpose({
  focus: () => inputRef.value?.focus(),
  clear: clearInput
})
</script>

<style scoped>
.search-autocomplete {
  position: relative;
  width: 100%;
  max-width: 600px;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
}

.search-input {
  flex: 1;
  padding: 10px 12px;
  border: none;
  outline: none;
  font-size: 14px;
}

.clear-btn {
  padding: 0 8px;
  border: none;
  background: none;
  font-size: 18px;
  color: #999;
  cursor: pointer;
}

.search-btn {
  padding: 10px 20px;
  border: none;
  background: #1890ff;
  color: #fff;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}

.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 400px;
  overflow: auto;
}

.loading {
  padding: 12px;
  text-align: center;
  color: #999;
}

.suggestion-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
}

.suggestion-item:hover,
.suggestion-item.active {
  background: #f5f5f5;
}

.suggestion-item .icon {
  margin-right: 8px;
}

.suggestion-item .text {
  flex: 1;
}

.suggestion-item .text :deep(mark) {
  background: #ff0;
  color: inherit;
}

.suggestion-item .count {
  color: #999;
  font-size: 12px;
}

.history-section,
.hot-section {
  padding: 12px;
  border-top: 1px solid #eee;
}

.section-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
  color: #999;
}

.section-header button {
  border: none;
  background: none;
  color: #1890ff;
  cursor: pointer;
}

.history-tags,
.hot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 4px 8px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.tag:hover {
  background: #e8e8e8;
}
</style>
```

---

## 四、React 实现

```jsx
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import './SearchAutocomplete.css'

function SearchAutocomplete({
  fetchSuggestions,
  hotKeywords = [],
  debounceTime = 300,
  maxHistory = 10,
  onSearch
}) {
  const [keyword, setKeyword] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const [history, setHistory] = useState([])

  const inputRef = useRef(null)
  const cacheRef = useRef(new Map())
  const abortControllerRef = useRef(null)
  const debounceTimerRef = useRef(null)

  // 加载历史记录
  useEffect(() => {
    try {
      const saved = localStorage.getItem('searchHistory')
      setHistory(saved ? JSON.parse(saved) : [])
    } catch {
      setHistory([])
    }
  }, [])

  // 保存历史记录
  const saveHistory = useCallback((items) => {
    localStorage.setItem('searchHistory', JSON.stringify(items))
  }, [])

  // 添加历史记录
  const addToHistory = useCallback((value) => {
    setHistory(prev => {
      const filtered = prev.filter(item => item !== value)
      const updated = [value, ...filtered].slice(0, maxHistory)
      saveHistory(updated)
      return updated
    })
  }, [maxHistory, saveHistory])

  // 清空历史
  const clearHistory = useCallback(() => {
    setHistory([])
    saveHistory([])
  }, [saveHistory])

  // 获取建议 (带防抖)
  const fetchData = useCallback(async (query) => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }

    // 检查缓存
    if (cacheRef.current.has(query)) {
      setSuggestions(cacheRef.current.get(query))
      return
    }

    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    setLoading(true)

    try {
      const result = await fetchSuggestions(query, {
        signal: abortControllerRef.current.signal
      })

      setSuggestions(result)
      cacheRef.current.set(query, result)

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('获取建议失败:', error)
      }
    } finally {
      setLoading(false)
    }
  }, [fetchSuggestions])

  // 输入处理
  const handleInput = useCallback((e) => {
    const value = e.target.value
    setKeyword(value)
    setActiveIndex(-1)

    clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = setTimeout(() => {
      fetchData(value)
    }, debounceTime)
  }, [fetchData, debounceTime])

  // 键盘事件
  const handleKeydown = useCallback((e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex(prev => {
          const next = prev + 1
          if (next >= suggestions.length) return 0
          return next
        })
        break

      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex(prev => {
          const next = prev - 1
          if (next < 0) return suggestions.length - 1
          return next
        })
        break

      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          selectSuggestion(suggestions[activeIndex].keyword)
        } else {
          doSearch(keyword)
        }
        break

      case 'Escape':
        setFocused(false)
        inputRef.current?.blur()
        break

      default:
        break
    }
  }, [activeIndex, suggestions, keyword])

  // 选择建议
  const selectSuggestion = useCallback((value) => {
    setKeyword(value)
    doSearch(value)
  }, [])

  // 执行搜索
  const doSearch = useCallback((value) => {
    const trimmed = value?.trim()
    if (!trimmed) return

    addToHistory(trimmed)
    setFocused(false)
    onSearch?.(trimmed)
  }, [addToHistory, onSearch])

  // 高亮匹配
  const highlightMatch = useCallback((text) => {
    const query = keyword.trim()
    if (!query) return text

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, i) =>
      regex.test(part) ? <mark key={i}>{part}</mark> : part
    )
  }, [keyword])

  // 清空输入
  const clearInput = useCallback(() => {
    setKeyword('')
    setSuggestions([])
    setActiveIndex(-1)
    inputRef.current?.focus()
  }, [])

  // 是否显示历史
  const showHistory = !keyword.trim() && !loading && history.length > 0

  // 清理
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      clearTimeout(debounceTimerRef.current)
    }
  }, [])

  return (
    <div className="search-autocomplete">
      <div className="search-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="请输入搜索内容"
          value={keyword}
          onChange={handleInput}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          onKeyDown={handleKeydown}
          autoComplete="off"
        />
        {keyword && (
          <button className="clear-btn" onClick={clearInput}>×</button>
        )}
        <button className="search-btn" onClick={() => doSearch(keyword)}>
          搜索
        </button>
      </div>

      {focused && (
        <div className="search-dropdown">
          {loading ? (
            <div className="loading">加载中...</div>
          ) : suggestions.length > 0 ? (
            <ul className="suggestion-list">
              {suggestions.map((item, index) => (
                <li
                  key={item.keyword}
                  className={`suggestion-item ${index === activeIndex ? 'active' : ''}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectSuggestion(item.keyword)}
                >
                  <span className="icon">🔍</span>
                  <span className="text">{highlightMatch(item.keyword)}</span>
                  {item.count && <span className="count">{item.count}</span>}
                </li>
              ))}
            </ul>
          ) : null}

          {showHistory && (
            <div className="history-section">
              <div className="section-header">
                <span>最近搜索</span>
                <button onClick={clearHistory}>清空</button>
              </div>
              <div className="history-tags">
                {history.map(item => (
                  <span
                    key={item}
                    className="tag"
                    onClick={() => selectSuggestion(item)}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {hotKeywords.length > 0 && (
            <div className="hot-section">
              <div className="section-header">
                <span>热门搜索</span>
              </div>
              <div className="hot-tags">
                {hotKeywords.map(item => (
                  <span
                    key={item}
                    className="tag"
                    onClick={() => selectSuggestion(item)}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// 使用示例
function App() {
  const handleSearch = (keyword) => {
    console.log('搜索:', keyword)
  }

  const fetchSuggestions = async (keyword, options) => {
    const response = await fetch(`/api/suggestions?q=${encodeURIComponent(keyword)}`, {
      signal: options.signal
    })
    const data = await response.json()
    return data.suggestions
  }

  return (
    <SearchAutocomplete
      fetchSuggestions={fetchSuggestions}
      hotKeywords={['iPhone 15', '华为 Mate 60', '小米 14']}
      onSearch={handleSearch}
    />
  )
}

export default SearchAutocomplete
```

---

## 五、性能优化

### 1. 请求优化

```javascript
// 1. 防抖
const debouncedFetch = debounce(fetchData, 300)

// 2. 取消过期请求
const controller = new AbortController()
fetch(url, { signal: controller.signal })
controller.abort()  // 取消

// 3. 缓存结果
const cache = new Map()
if (cache.has(keyword)) {
  return cache.get(keyword)
}

// 4. 最小输入长度
if (keyword.length < 2) return

// 5. 请求合并
let pendingKeyword = null
function fetchWithMerge(keyword) {
  pendingKeyword = keyword
  requestAnimationFrame(() => {
    if (pendingKeyword === keyword) {
      fetchData(keyword)
    }
  })
}
```

### 2. 渲染优化

```javascript
// 1. 虚拟列表 (大量建议时)
// 参考虚拟列表章节

// 2. 避免频繁 DOM 操作
// 使用 innerHTML 一次性更新

// 3. 使用 CSS transform 而不是 top/left
.dropdown {
  transform: translateY(0);
}

// 4. 图片懒加载
<img loading="lazy" src="..." />
```

### 3. 用户体验优化

```javascript
// 1. 加载状态
<div class="loading">加载中...</div>

// 2. 空状态
<div class="empty">未找到相关结果</div>

// 3. 错误处理
<div class="error">
  加载失败
  <button onclick="retry()">重试</button>
</div>

// 4. 骨架屏
<div class="skeleton">
  <div class="skeleton-item"></div>
  <div class="skeleton-item"></div>
</div>

// 5. 无障碍支持
<input
  role="combobox"
  aria-expanded="true"
  aria-haspopup="listbox"
  aria-autocomplete="list"
/>
<ul role="listbox">
  <li role="option" aria-selected="true">...</li>
</ul>
```

---

## 六、面试常见问题

### 1. 如何实现防抖？为什么要用防抖？

<details>
<summary>点击查看答案</summary>

**为什么使用防抖：**
- 减少请求次数，节省服务器资源
- 提升用户体验，避免频繁闪烁
- 减少不必要的计算和渲染

**实现方式：**
```javascript
function debounce(fn, delay) {
  let timer = null
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}
```
</details>

### 2. 如何取消过期的请求？

<details>
<summary>点击查看答案</summary>

**使用 AbortController：**
```javascript
let controller = null

async function fetchData(keyword) {
  // 取消之前的请求
  if (controller) {
    controller.abort()
  }

  controller = new AbortController()

  try {
    const response = await fetch(url, {
      signal: controller.signal
    })
    return response.json()
  } catch (error) {
    if (error.name === 'AbortError') {
      // 请求被取消，忽略
      return
    }
    throw error
  }
}
```
</details>

### 3. 如何实现键盘导航？

<details>
<summary>点击查看答案</summary>

**核心逻辑：**
```javascript
function handleKeydown(e) {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      activeIndex = (activeIndex + 1) % suggestions.length
      break

    case 'ArrowUp':
      e.preventDefault()
      activeIndex = (activeIndex - 1 + suggestions.length) % suggestions.length
      break

    case 'Enter':
      e.preventDefault()
      if (activeIndex >= 0) {
        selectSuggestion(suggestions[activeIndex])
      } else {
        doSearch(keyword)
      }
      break

    case 'Escape':
      hideDropdown()
      break
  }
}
```
</details>

### 4. 如何优化大量建议的渲染性能？

<details>
<summary>点击查看答案</summary>

**优化方案：**

1. **限制显示数量**：只显示前 10 条
2. **虚拟列表**：只渲染可见区域
3. **懒加载**：滚动时加载更多
4. **防抖渲染**：使用 requestAnimationFrame

```javascript
// 限制数量
const displaySuggestions = suggestions.slice(0, 10)

// 虚拟列表
<VirtualList
  data={suggestions}
  itemHeight={40}
  renderItem={(item) => <SuggestionItem item={item} />}
/>
```
</details>

---

## 总结

### 核心要点

1. **防抖处理**：减少请求频率
2. **取消请求**：使用 AbortController
3. **缓存结果**：避免重复请求
4. **键盘导航**：上下选择、回车确认、ESC 关闭
5. **高亮匹配**：正则替换高亮
6. **历史记录**：localStorage 存储
7. **无障碍**：ARIA 属性支持

### 面试加分点

- 考虑网络错误处理和重试
- 支持中英文混合搜索
- 支持拼音搜索
- 实现搜索结果去重
- 实现关键词权重排序
