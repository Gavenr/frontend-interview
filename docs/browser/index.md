# 浏览器原理

## 概述

深入理解浏览器工作原理是前端工程师进阶的必经之路。面试中常考察**渲染流程**、**事件循环**、**浏览器缓存**、**浏览器存储**等内容。

## 核心考点

### 🎯 高频考点
- 浏览器渲染流程
- 重排(Reflow)和重绘(Repaint)
- 事件循环(Event Loop)
- 宏任务和微任务
- 浏览器缓存机制
- Cookie、LocalStorage、SessionStorage 区别

### 💡 深度考点
- 浏览器多进程架构
- V8 引擎工作原理
- 垃圾回收机制
- 浏览器安全策略
- 性能指标和优化

---

## 1. 浏览器架构

### 多进程架构

```
Chrome 浏览器的进程模型:

┌─────────────────────────────────────┐
│      Browser Process (浏览器进程)      │
│   - 负责界面显示、用户交互             │
│   - 管理其他进程                      │
└─────────────────────────────────────┘
              │
    ┌─────────┼─────────┬─────────┐
    │         │         │         │
┌───▼───┐ ┌──▼───┐ ┌──▼───┐ ┌───▼────┐
│Renderer│ │Network│ │ GPU  │ │Plugin  │
│Process │ │Process│ │Process│ │Process │
│(渲染)  │ │(网络) │ │(GPU) │ │(插件)  │
└────────┘ └───────┘ └──────┘ └────────┘

每个标签页一个渲染进程(默认)
```

### 为什么要多进程?

```javascript
/*
1. 安全性: 渲染进程沙箱隔离,恶意代码无法访问系统
2. 稳定性: 某个标签页崩溃不影响其他标签页
3. 性能: 充分利用多核 CPU
4. 响应性: 渲染进程可以并行工作

缺点:
- 内存占用高
- 进程间通信开销
*/
```

---

## 2. 浏览器渲染流程

### 完整流程

```
URL 输入
  │
  ▼
DNS 解析 (域名 → IP)
  │
  ▼
TCP 连接 (三次握手)
  │
  ▼
发送 HTTP 请求
  │
  ▼
服务器响应
  │
  ▼
浏览器接收 HTML
  │
  ▼
┌─────────────────────────────────────┐
│          渲染流程开始                 │
└─────────────────────────────────────┘
  │
  ├─► 解析 HTML → DOM Tree
  │
  ├─► 解析 CSS → CSSOM Tree
  │
  ├─► 执行 JavaScript
  │
  ▼
DOM + CSSOM → Render Tree (渲染树)
  │
  ▼
Layout (布局/重排) - 计算位置和大小
  │
  ▼
Paint (绘制/重绘) - 绘制像素
  │
  ▼
Composite (合成) - 合成图层
  │
  ▼
显示在屏幕上
```

### 详细步骤

```javascript
// 1. 构建 DOM 树
/*
<!DOCTYPE html>
<html>
  <head><title>Page</title></head>
  <body>
    <div class="container">
      <p>Hello</p>
    </div>
  </body>
</html>

转换为:
html
├─ head
│  └─ title
│     └─ "Page"
└─ body
   └─ div.container
      └─ p
         └─ "Hello"
*/

// 2. 构建 CSSOM 树
/*
body { font-size: 16px; }
div { display: block; }
.container { margin: 20px; }
p { color: blue; }

转换为样式规则树
*/

// 3. 合成 Render Tree
/*
只包含可见元素:
- display: none 的元素不包含
- head、script 等不可见元素不包含

Render Tree:
body (font-size: 16px)
└─ div.container (display: block, margin: 20px)
   └─ p (color: blue)
*/

// 4. Layout (布局)
/*
计算每个元素的几何信息:
- 位置: x, y
- 尺寸: width, height
- 盒模型: padding, border, margin

输出: Layout Tree (布局树)
*/

// 5. Paint (绘制)
/*
将元素转换为屏幕上的像素:
- 绘制顺序
- 分层绘制
- 生成绘制列表

输出: Paint Records (绘制记录)
*/

// 6. Composite (合成)
/*
将多个图层合成为最终的页面:
- 图层管理
- 硬件加速
- GPU 合成

输出: 最终画面
*/
```

---

## 3. 重排(Reflow)和重绘(Repaint)

### 概念

```javascript
// 重排(Reflow/Layout)
// 元素的几何属性发生变化,需要重新计算布局

// 触发重排的操作:
element.style.width = '100px';      // 修改宽高
element.style.padding = '10px';     // 修改内外边距
element.style.display = 'none';     // 显示隐藏
element.appendChild(newNode);       // 添加/删除元素
window.innerWidth;                  // 读取某些属性

// 读取会触发重排的属性:
const width = element.offsetWidth;
const height = element.offsetHeight;
const top = element.offsetTop;
const scrollTop = element.scrollTop;
const clientWidth = element.clientWidth;

// 重绘(Repaint)
// 元素的外观发生变化,但布局不变

// 触发重绘的操作:
element.style.color = 'red';          // 修改颜色
element.style.backgroundColor = 'blue'; // 修改背景色
element.style.visibility = 'hidden';   // 可见性

// 关系: 重排一定会重绘,重绘不一定重排
```

### 优化策略

```javascript
// ❌ 多次重排
for (let i = 0; i < 1000; i++) {
  element.style.width = i + 'px';  // 每次都重排!
  element.style.height = i + 'px';
}

// ✅ 批量修改
element.style.cssText = 'width: 1000px; height: 1000px;';

// ✅ 使用 class
element.className = 'large';

// ❌ 读写交替
element.style.width = element.offsetWidth + 10 + 'px';  // 读
element.style.height = element.offsetHeight + 10 + 'px'; // 读

// ✅ 读写分离
const width = element.offsetWidth;   // 批量读
const height = element.offsetHeight;
element.style.width = width + 10 + 'px';   // 批量写
element.style.height = height + 10 + 'px';

// ✅ 使用 DocumentFragment
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  fragment.appendChild(div);
}
document.body.appendChild(fragment);  // 只触发一次重排

// ✅ 脱离文档流
element.style.display = 'none';  // 脱离文档流
// ... 多次修改
element.style.display = 'block'; // 重新进入文档流,只触发一次重排

// ✅ 使用 transform 代替 top/left
// ❌ 触发重排
element.style.left = '100px';

// ✅ 只触发合成
element.style.transform = 'translateX(100px)';

// 只触发合成的属性:
// - transform
// - opacity
// - filter
// - will-change
```

---

## 4. 事件循环(Event Loop)

### 执行机制

```javascript
/*
JavaScript 是单线程语言,通过事件循环实现异步

执行顺序:
1. 同步代码
2. 微任务(Microtask)
3. 宏任务(Macrotask)

每轮循环:
1. 执行一个宏任务
2. 执行所有微任务
3. 渲染(可能)
4. 执行下一个宏任务
*/

// 宏任务(Macrotask):
// - script (整体代码)
// - setTimeout
// - setInterval
// - setImmediate (Node.js)
// - I/O
// - UI rendering

// 微任务(Microtask):
// - Promise.then/catch/finally
// - MutationObserver
// - process.nextTick (Node.js)
// - queueMicrotask

console.log('1');  // 同步

setTimeout(() => {
  console.log('2');  // 宏任务
}, 0);

Promise.resolve().then(() => {
  console.log('3');  // 微任务
});

console.log('4');  // 同步

// 输出: 1 → 4 → 3 → 2
```

### 经典面试题

```javascript
// 题目1
console.log('start');

setTimeout(() => {
  console.log('timeout');
}, 0);

Promise.resolve()
  .then(() => {
    console.log('promise1');
  })
  .then(() => {
    console.log('promise2');
  });

console.log('end');

/*
输出:
start
end
promise1
promise2
timeout

解析:
1. 同步: start, end
2. 微任务: promise1, promise2
3. 宏任务: timeout
*/

// 题目2
async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');
}

async function async2() {
  console.log('async2');
}

console.log('script start');

setTimeout(() => {
  console.log('setTimeout');
}, 0);

async1();

new Promise((resolve) => {
  console.log('promise1');
  resolve();
}).then(() => {
  console.log('promise2');
});

console.log('script end');

/*
输出:
script start
async1 start
async2
promise1
script end
async1 end
promise2
setTimeout

解析:
1. 同步: script start, async1 start, async2, promise1, script end
2. 微任务: async1 end, promise2
3. 宏任务: setTimeout

注意: await 后面的代码相当于 Promise.then
*/

// 题目3
setTimeout(() => {
  console.log('timeout1');
  Promise.resolve().then(() => {
    console.log('promise1');
  });
}, 0);

setTimeout(() => {
  console.log('timeout2');
  Promise.resolve().then(() => {
    console.log('promise2');
  });
}, 0);

/*
输出:
timeout1
promise1
timeout2
promise2

解析:
1. 第一个宏任务: timeout1
2. 清空微任务: promise1
3. 第二个宏任务: timeout2
4. 清空微任务: promise2
*/
```

---

## 5. 浏览器存储

### Cookie

```javascript
// 设置 Cookie
document.cookie = 'name=Alice';
document.cookie = 'age=25; max-age=3600'; // 1小时后过期
document.cookie = 'token=xxx; secure; httpOnly; sameSite=strict';

// 读取 Cookie
console.log(document.cookie); // "name=Alice; age=25"

// Cookie 属性
/*
- expires: 过期时间(GMT 格式)
- max-age: 存活时间(秒)
- domain: 域名
- path: 路径
- secure: 只在 HTTPS 传输
- httpOnly: 不能被 JavaScript 访问(防 XSS)
- sameSite: 防止 CSRF 攻击
  - strict: 严格模式,完全禁止第三方 Cookie
  - lax: 宽松模式,部分情况允许
  - none: 无限制(需配合 secure)
*/

// 封装 Cookie 工具
const CookieUtil = {
  set(name, value, options = {}) {
    let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (options.maxAge) {
      cookieStr += `; max-age=${options.maxAge}`;
    }

    if (options.expires) {
      cookieStr += `; expires=${options.expires.toUTCString()}`;
    }

    if (options.domain) {
      cookieStr += `; domain=${options.domain}`;
    }

    if (options.path) {
      cookieStr += `; path=${options.path}`;
    }

    if (options.secure) {
      cookieStr += '; secure';
    }

    if (options.sameSite) {
      cookieStr += `; sameSite=${options.sameSite}`;
    }

    document.cookie = cookieStr;
  },

  get(name) {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
      const [key, value] = cookie.split('=');
      if (decodeURIComponent(key) === name) {
        return decodeURIComponent(value);
      }
    }
    return null;
  },

  remove(name, options = {}) {
    this.set(name, '', { ...options, maxAge: -1 });
  }
};

// 使用
CookieUtil.set('user', 'Alice', { maxAge: 3600 });
console.log(CookieUtil.get('user'));
CookieUtil.remove('user');
```

### LocalStorage

```javascript
// 永久存储,除非手动删除
// 容量: 约 5-10MB

// 设置
localStorage.setItem('name', 'Alice');
localStorage.setItem('user', JSON.stringify({ name: 'Alice', age: 25 }));

// 读取
const name = localStorage.getItem('name');
const user = JSON.parse(localStorage.getItem('user'));

// 删除
localStorage.removeItem('name');

// 清空
localStorage.clear();

// 遍历
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(key, localStorage.getItem(key));
}

// 监听存储变化
window.addEventListener('storage', (e) => {
  console.log('Storage changed:', e.key, e.oldValue, e.newValue);
  // 注意: 只在其他标签页修改时触发!
});

// 封装存储工具
const Storage = {
  set(key, value, expire = null) {
    const data = {
      value,
      expire: expire ? Date.now() + expire : null
    };
    localStorage.setItem(key, JSON.stringify(data));
  },

  get(key) {
    const str = localStorage.getItem(key);
    if (!str) return null;

    try {
      const data = JSON.parse(str);

      // 检查是否过期
      if (data.expire && Date.now() > data.expire) {
        this.remove(key);
        return null;
      }

      return data.value;
    } catch {
      return str;
    }
  },

  remove(key) {
    localStorage.removeItem(key);
  },

  clear() {
    localStorage.clear();
  }
};

// 使用
Storage.set('token', 'xxx', 3600000); // 1小时过期
const token = Storage.get('token');
```

### SessionStorage

```javascript
// 会话存储,关闭标签页后清除
// 容量: 约 5-10MB

// API 与 localStorage 完全相同
sessionStorage.setItem('tempData', 'value');
const data = sessionStorage.getItem('tempData');
sessionStorage.removeItem('tempData');
sessionStorage.clear();
```

### IndexedDB

```javascript
// 大容量存储(可达几百 MB)
// 支持事务、索引、游标

// 打开数据库
const request = indexedDB.open('MyDatabase', 1);

request.onupgradeneeded = (event) => {
  const db = event.target.result;

  // 创建对象仓库(表)
  if (!db.objectStoreNames.contains('users')) {
    const objectStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
    objectStore.createIndex('name', 'name', { unique: false });
    objectStore.createIndex('email', 'email', { unique: true });
  }
};

request.onsuccess = (event) => {
  const db = event.target.result;

  // 添加数据
  const transaction = db.transaction(['users'], 'readwrite');
  const objectStore = transaction.objectStore('users');

  objectStore.add({ name: 'Alice', email: 'alice@example.com' });

  transaction.oncomplete = () => {
    console.log('Transaction completed');
  };
};

// 封装 IndexedDB
class IndexedDBHelper {
  constructor(dbName, version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
  }

  async open(stores) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        stores.forEach(({ name, options, indexes }) => {
          if (!db.objectStoreNames.contains(name)) {
            const store = db.createObjectStore(name, options);
            indexes?.forEach(({ name, keyPath, options }) => {
              store.createIndex(name, keyPath, options);
            });
          }
        });
      };
    });
  }

  async add(storeName, data) {
    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.add(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async get(storeName, key) {
    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(storeName) {
    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName, key) {
    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// 使用
const db = new IndexedDBHelper('MyApp');
await db.open([
  {
    name: 'users',
    options: { keyPath: 'id', autoIncrement: true },
    indexes: [
      { name: 'email', keyPath: 'email', options: { unique: true } }
    ]
  }
]);

await db.add('users', { name: 'Alice', email: 'alice@example.com' });
const users = await db.getAll('users');
```

### 存储方案对比

| 特性 | Cookie | LocalStorage | SessionStorage | IndexedDB |
|------|--------|--------------|----------------|-----------|
| 容量 | ~4KB | ~5-10MB | ~5-10MB | ~几百MB |
| 生命周期 | 可设置过期时间 | 永久 | 会话 | 永久 |
| 作用域 | 同源 + 路径 | 同源 | 同源 + 标签页 | 同源 |
| HTTP 传输 | 每次都发送 | 不发送 | 不发送 | 不发送 |
| 访问方式 | 前后端 | 前端 | 前端 | 前端 |
| 数据类型 | 字符串 | 字符串 | 字符串 | 任意类型 |

---

## 总结

### 核心要点
1. **浏览器架构**: 多进程模型,渲染进程独立
2. **渲染流程**: DOM → CSSOM → Render Tree → Layout → Paint → Composite
3. **重排重绘**: 优化策略,减少性能开销
4. **事件循环**: 宏任务、微任务执行顺序
5. **浏览器存储**: 根据场景选择合适的存储方案

### 面试加分项
- 能手绘渲染流程图
- 理解事件循环的细节(async/await、Promise)
- 掌握性能优化策略
- 了解浏览器安全机制(同源策略、CSP)
- 熟悉各种存储方案的应用场景
