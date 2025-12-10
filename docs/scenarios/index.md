# 场景题与系统设计

## 概述

场景题是面试中考察**实战能力**和**系统思维**的重要环节,通常会考察你如何设计和实现一个完整的功能或系统。

## 核心考点

### 🎯 常见场景题类型
- 页面/组件设计(如无限滚动、虚拟列表)
- 系统设计(如IM聊天、在线文档)
- 性能优化(如首屏加载、大数据渲染)
- 问题排查(如内存泄漏、页面卡顿)
- 架构设计(如前端监控、权限系统)

---

## 一、页面/组件设计类

### 1. 实现一个图片懒加载

```javascript
/**
 * 需求分析:
 * 1. 图片进入视口时才加载
 * 2. 支持占位图
 * 3. 支持加载失败处理
 * 4. 支持加载完成回调
 */

// 方案1: IntersectionObserver (推荐)
class LazyLoad {
  constructor(options = {}) {
    this.options = {
      root: null,              // 视口元素
      rootMargin: '0px',       // 提前加载距离
      threshold: 0.01,         // 触发阈值
      placeholder: 'data:image/svg+xml,...',  // 占位图
      errorImg: '/error.png',  // 错误图
      ...options
    }

    this.observer = null
    this.init()
  }

  init() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target)
          this.observer.unobserve(entry.target)
        }
      })
    }, {
      root: this.options.root,
      rootMargin: this.options.rootMargin,
      threshold: this.options.threshold
    })
  }

  loadImage(img) {
    const src = img.dataset.src
    if (!src) return

    // 创建新图片对象
    const image = new Image()

    image.onload = () => {
      img.src = src
      img.classList.add('loaded')
      this.options.onLoad?.(img)
    }

    image.onerror = () => {
      img.src = this.options.errorImg
      img.classList.add('error')
      this.options.onError?.(img)
    }

    image.src = src
  }

  observe(images) {
    images.forEach(img => {
      // 设置占位图
      if (!img.src) {
        img.src = this.options.placeholder
      }
      this.observer.observe(img)
    })
  }

  disconnect() {
    this.observer.disconnect()
  }
}

// 使用
const lazyLoad = new LazyLoad({
  rootMargin: '50px',  // 提前50px开始加载
  onLoad: (img) => {
    console.log('图片加载成功:', img.src)
  }
})

const images = document.querySelectorAll('img[data-src]')
lazyLoad.observe(images)

// HTML
/*
<img data-src="real-image.jpg" alt="描述">
*/

// 方案2: Scroll + getBoundingClientRect
class LazyLoadScroll {
  constructor(images, options = {}) {
    this.images = Array.from(images)
    this.options = {
      offset: 0,  // 提前加载距离
      ...options
    }

    this.init()
  }

  init() {
    this.handleScroll = this.throttle(this.check.bind(this), 200)
    window.addEventListener('scroll', this.handleScroll)
    this.check()  // 初始检查
  }

  check() {
    this.images = this.images.filter(img => {
      if (this.isInViewport(img)) {
        this.loadImage(img)
        return false  // 移除已加载的图片
      }
      return true
    })

    // 所有图片加载完,移除监听
    if (this.images.length === 0) {
      window.removeEventListener('scroll', this.handleScroll)
    }
  }

  isInViewport(element) {
    const rect = element.getBoundingClientRect()
    return (
      rect.top <= window.innerHeight + this.options.offset &&
      rect.bottom >= 0 &&
      rect.left <= window.innerWidth &&
      rect.right >= 0
    )
  }

  loadImage(img) {
    const src = img.dataset.src
    if (!src) return

    img.src = src
    img.removeAttribute('data-src')
  }

  throttle(fn, wait) {
    let lastTime = 0
    return function(...args) {
      const now = Date.now()
      if (now - lastTime >= wait) {
        fn.apply(this, args)
        lastTime = now
      }
    }
  }

  destroy() {
    window.removeEventListener('scroll', this.handleScroll)
  }
}
```

### 2. 实现虚拟滚动列表

```vue
<template>
  <div class="virtual-list" @scroll="handleScroll">
    <!-- 占位,撑起总高度 -->
    <div
      class="list-phantom"
      :style="{ height: totalHeight + 'px' }"
    ></div>

    <!-- 可视区域 -->
    <div
      class="list-content"
      :style="{ transform: `translateY(${offset}px)` }"
    >
      <div
        v-for="item in visibleData"
        :key="item.id"
        class="list-item"
        :style="{ height: itemHeight + 'px' }"
      >
        <slot :item="item"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  // 所有数据
  data: {
    type: Array,
    required: true
  },
  // 每项高度
  itemHeight: {
    type: Number,
    default: 50
  },
  // 可视区域显示数量
  visibleCount: {
    type: Number,
    default: 20
  },
  // 缓冲数量
  bufferCount: {
    type: Number,
    default: 5
  }
})

// 滚动距离
const scrollTop = ref(0)

// 总高度
const totalHeight = computed(() => {
  return props.data.length * props.itemHeight
})

// 起始索引
const startIndex = computed(() => {
  const index = Math.floor(scrollTop.value / props.itemHeight)
  return Math.max(0, index - props.bufferCount)
})

// 结束索引
const endIndex = computed(() => {
  const index = startIndex.value + props.visibleCount + props.bufferCount * 2
  return Math.min(props.data.length, index)
})

// 可见数据
const visibleData = computed(() => {
  return props.data.slice(startIndex.value, endIndex.value)
})

// 偏移量
const offset = computed(() => {
  return startIndex.value * props.itemHeight
})

// 滚动处理
function handleScroll(e) {
  scrollTop.value = e.target.scrollTop
}
</script>

<style scoped>
.virtual-list {
  height: 100%;
  overflow: auto;
  position: relative;
}

.list-phantom {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
}

.list-content {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
}

.list-item {
  box-sizing: border-box;
  border-bottom: 1px solid #ddd;
}
</style>

<!-- 使用 -->
<VirtualList :data="list" :item-height="60">
  <template #default="{ item }">
    <div class="user-item">
      <img :src="item.avatar" />
      <div>{{ item.name }}</div>
    </div>
  </template>
</VirtualList>

<!-- 动态高度版本 -->
<script setup>
// 使用 Map 存储每项高度
const itemHeights = new Map()
const positions = ref([])  // 存储每项位置信息

// 初始化位置
function initPositions() {
  positions.value = props.data.map((item, index) => ({
    index,
    height: props.estimatedHeight,  // 预估高度
    top: index * props.estimatedHeight,
    bottom: (index + 1) * props.estimatedHeight
  }))
}

// 更新位置
function updatePositions() {
  const items = document.querySelectorAll('.list-item')
  items.forEach((item, index) => {
    const rect = item.getBoundingClientRect()
    const height = rect.height
    const oldHeight = positions.value[index].height

    if (oldHeight !== height) {
      // 更新高度
      const diff = height - oldHeight
      positions.value[index].height = height
      positions.value[index].bottom = positions.value[index].bottom + diff

      // 更新后续所有项的位置
      for (let i = index + 1; i < positions.value.length; i++) {
        positions.value[i].top = positions.value[i - 1].bottom
        positions.value[i].bottom = positions.value[i].top + positions.value[i].height
      }
    }
  })
}

// 获取起始索引
function getStartIndex(scrollTop) {
  let start = 0
  let end = positions.value.length - 1

  while (start < end) {
    const mid = Math.floor((start + end) / 2)
    if (positions.value[mid].bottom < scrollTop) {
      start = mid + 1
    } else {
      end = mid
    }
  }

  return start
}
</script>
```

### 3. 实现一个轮播图

```vue
<template>
  <div class="carousel" @mouseenter="pause" @mouseleave="resume">
    <div class="carousel-wrapper" :style="wrapperStyle">
      <div
        v-for="(item, index) in items"
        :key="index"
        class="carousel-item"
      >
        <img :src="item.image" :alt="item.title" />
      </div>
    </div>

    <!-- 指示器 -->
    <div class="carousel-indicators">
      <span
        v-for="(item, index) in items"
        :key="index"
        :class="['indicator', { active: index === currentIndex }]"
        @click="goto(index)"
      ></span>
    </div>

    <!-- 箭头 -->
    <button class="carousel-arrow prev" @click="prev">‹</button>
    <button class="carousel-arrow next" @click="next">›</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  autoplay: {
    type: Boolean,
    default: true
  },
  interval: {
    type: Number,
    default: 3000
  },
  transitionDuration: {
    type: Number,
    default: 500
  }
})

const currentIndex = ref(0)
let timer = null

const wrapperStyle = computed(() => ({
  transform: `translateX(-${currentIndex.value * 100}%)`,
  transition: `transform ${props.transitionDuration}ms ease-in-out`
}))

function next() {
  currentIndex.value = (currentIndex.value + 1) % props.items.length
}

function prev() {
  currentIndex.value = (currentIndex.value - 1 + props.items.length) % props.items.length
}

function goto(index) {
  currentIndex.value = index
}

function startAutoplay() {
  if (!props.autoplay) return

  timer = setInterval(() => {
    next()
  }, props.interval)
}

function pause() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function resume() {
  if (props.autoplay && !timer) {
    startAutoplay()
  }
}

onMounted(() => {
  startAutoplay()
})

onUnmounted(() => {
  pause()
})
</script>

<style scoped>
.carousel {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 400px;
}

.carousel-wrapper {
  display: flex;
  height: 100%;
}

.carousel-item {
  flex-shrink: 0;
  width: 100%;
  height: 100%;
}

.carousel-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-indicators {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: background 0.3s;
}

.indicator.active {
  background: white;
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  transition: background 0.3s;
}

.carousel-arrow:hover {
  background: rgba(0, 0, 0, 0.8);
}

.carousel-arrow.prev {
  left: 20px;
}

.carousel-arrow.next {
  right: 20px;
}
</style>
```

---

## 二、系统设计类

### 1. 设计一个前端监控系统

```javascript
/**
 * 需求:
 * 1. 性能监控 - FCP、LCP、FID、CLS
 * 2. 错误监控 - JS错误、Promise错误、资源加载错误
 * 3. 行为监控 - 用户点击、路由跳转、接口调用
 * 4. 数据上报 - 批量上报、失败重试
 */

class Monitor {
  constructor(options = {}) {
    this.options = {
      appId: '',           // 应用ID
      userId: '',          // 用户ID
      reportUrl: '',       // 上报地址
      batchSize: 10,       // 批量上报数量
      maxRetry: 3,         // 最大重试次数
      ...options
    }

    this.queue = []      // 上报队列
    this.init()
  }

  init() {
    this.performanceMonitor()
    this.errorMonitor()
    this.behaviorMonitor()
  }

  // 性能监控
  performanceMonitor() {
    // 页面加载性能
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = window.performance.timing
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart

        this.report({
          type: 'performance',
          subType: 'page-load',
          data: {
            pageLoadTime,
            domReadyTime: perfData.domContentLoadedEventEnd - perfData.navigationStart,
            firstPaintTime: perfData.responseEnd - perfData.fetchStart,
            dnsTime: perfData.domainLookupEnd - perfData.domainLookupStart,
            tcpTime: perfData.connectEnd - perfData.connectStart,
            ttfbTime: perfData.responseStart - perfData.navigationStart
          }
        })
      }, 0)
    })

    // Core Web Vitals
    // FCP - First Contentful Paint
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.report({
            type: 'performance',
            subType: 'fcp',
            data: { value: entry.startTime }
          })
        }
      }
    }).observe({ entryTypes: ['paint'] })

    // LCP - Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]

      this.report({
        type: 'performance',
        subType: 'lcp',
        data: {
          value: lastEntry.renderTime || lastEntry.loadTime,
          element: lastEntry.element?.tagName
        }
      })
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // FID - First Input Delay
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.report({
          type: 'performance',
          subType: 'fid',
          data: {
            value: entry.processingStart - entry.startTime,
            name: entry.name
          }
        })
      }
    }).observe({ entryTypes: ['first-input'] })

    // CLS - Cumulative Layout Shift
    let clsValue = 0
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      }

      this.report({
        type: 'performance',
        subType: 'cls',
        data: { value: clsValue }
      })
    }).observe({ entryTypes: ['layout-shift'] })
  }

  // 错误监控
  errorMonitor() {
    // JS 运行错误
    window.addEventListener('error', (event) => {
      if (event.target && (event.target.src || event.target.href)) {
        // 资源加载错误
        this.report({
          type: 'error',
          subType: 'resource',
          data: {
            url: event.target.src || event.target.href,
            tagName: event.target.tagName,
            type: event.target.type
          }
        })
      } else {
        // JS 错误
        this.report({
          type: 'error',
          subType: 'js',
          data: {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error?.stack
          }
        })
      }
    }, true)

    // Promise 错误
    window.addEventListener('unhandledrejection', (event) => {
      this.report({
        type: 'error',
        subType: 'promise',
        data: {
          reason: event.reason,
          promise: event.promise
        }
      })
    })

    // Vue 错误
    if (window.Vue) {
      window.Vue.config.errorHandler = (err, vm, info) => {
        this.report({
          type: 'error',
          subType: 'vue',
          data: {
            message: err.message,
            stack: err.stack,
            info,
            componentName: vm?.$options?.name
          }
        })
      }
    }

    // React 错误边界
    // 需要在React组件中实现
  }

  // 行为监控
  behaviorMonitor() {
    // 路由变化
    let lastPath = location.pathname
    setInterval(() => {
      const currentPath = location.pathname
      if (currentPath !== lastPath) {
        this.report({
          type: 'behavior',
          subType: 'route',
          data: {
            from: lastPath,
            to: currentPath
          }
        })
        lastPath = currentPath
      }
    }, 100)

    // 用户点击
    document.addEventListener('click', (event) => {
      const target = event.target
      this.report({
        type: 'behavior',
        subType: 'click',
        data: {
          tagName: target.tagName,
          className: target.className,
          id: target.id,
          text: target.textContent?.slice(0, 50),
          x: event.pageX,
          y: event.pageY
        }
      })
    }, true)

    // 接口调用(拦截fetch和xhr)
    this.interceptFetch()
    this.interceptXHR()
  }

  // 拦截 fetch
  interceptFetch() {
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const startTime = Date.now()
      const [url, options] = args

      try {
        const response = await originalFetch(...args)
        const duration = Date.now() - startTime

        this.report({
          type: 'api',
          subType: 'fetch',
          data: {
            url,
            method: options?.method || 'GET',
            status: response.status,
            duration,
            success: response.ok
          }
        })

        return response
      } catch (error) {
        this.report({
          type: 'api',
          subType: 'fetch',
          data: {
            url,
            method: options?.method || 'GET',
            error: error.message,
            success: false
          }
        })
        throw error
      }
    }
  }

  // 拦截 XMLHttpRequest
  interceptXHR() {
    const originalOpen = XMLHttpRequest.prototype.open
    const originalSend = XMLHttpRequest.prototype.send

    XMLHttpRequest.prototype.open = function(method, url) {
      this._monitor = {
        method,
        url,
        startTime: Date.now()
      }
      return originalOpen.apply(this, arguments)
    }

    XMLHttpRequest.prototype.send = function() {
      const monitor = this._monitor

      this.addEventListener('loadend', () => {
        const duration = Date.now() - monitor.startTime

        window.monitorInstance?.report({
          type: 'api',
          subType: 'xhr',
          data: {
            url: monitor.url,
            method: monitor.method,
            status: this.status,
            duration,
            success: this.status >= 200 && this.status < 300
          }
        })
      })

      return originalSend.apply(this, arguments)
    }
  }

  // 上报数据
  report(data) {
    // 添加公共信息
    const reportData = {
      ...data,
      appId: this.options.appId,
      userId: this.options.userId,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: location.href
    }

    this.queue.push(reportData)

    // 达到批量上报数量或页面卸载时上报
    if (this.queue.length >= this.options.batchSize) {
      this.send()
    }
  }

  // 发送数据
  send(retry = 0) {
    if (this.queue.length === 0) return

    const data = this.queue.splice(0, this.options.batchSize)

    // 使用 sendBeacon (页面卸载时也能发送)
    if (navigator.sendBeacon) {
      const success = navigator.sendBeacon(
        this.options.reportUrl,
        JSON.stringify(data)
      )

      if (!success && retry < this.options.maxRetry) {
        // 失败重试
        this.queue.unshift(...data)
        setTimeout(() => this.send(retry + 1), 1000 * (retry + 1))
      }
    } else {
      // 降级方案: fetch
      fetch(this.options.reportUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true  // 页面卸载时也能发送
      }).catch(() => {
        if (retry < this.options.maxRetry) {
          this.queue.unshift(...data)
          setTimeout(() => this.send(retry + 1), 1000 * (retry + 1))
        }
      })
    }
  }

  // 页面卸载时发送剩余数据
  destroy() {
    window.addEventListener('beforeunload', () => {
      this.send()
    })
  }
}

// 使用
const monitor = new Monitor({
  appId: 'my-app',
  userId: 'user123',
  reportUrl: 'https://monitor.example.com/api/report'
})

window.monitorInstance = monitor
```

*(由于篇幅限制,我会继续补充更多场景题...)*

## 总结

### 答题技巧
1. **需求分析** - 先理解需求,列出功能点
2. **方案设计** - 说明技术选型和架构设计
3. **代码实现** - 写出核心代码
4. **优化思路** - 说明如何优化
5. **测试方案** - 如何测试验证

### 面试加分项
- 考虑边界情况
- 性能优化思维
- 代码可维护性
- 用户体验细节
- 实际项目经验
