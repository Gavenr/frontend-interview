# 网络与HTTP协议

## 概述

网络知识是前端工程师的必备基础,面试中经常会考察 **HTTP 协议**、**HTTPS 加密**、**跨域处理**、**网络安全**等内容。

## 核心考点

### 🎯 高频考点
- HTTP 状态码及含义
- HTTP 请求方法(GET、POST 等)
- HTTP 缓存机制
- HTTPS 加密原理
- 跨域产生原因和解决方案
- Cookie、Session、Token 区别
- WebSocket 实时通信

### 💡 深度考点
- HTTP/1.1 vs HTTP/2 vs HTTP/3
- TCP 三次握手和四次挥手
- XSS、CSRF 攻击原理和防御
- CDN 工作原理
- DNS 解析过程

---

## HTTP 基础

### 1. HTTP 请求方法

| 方法 | 描述 | 特点 |
|------|------|------|
| **GET** | 获取资源 | 幂等、可缓存、参数在 URL |
| **POST** | 提交数据 | 非幂等、参数在 body |
| **PUT** | 更新资源 | 幂等、完整替换 |
| **PATCH** | 部分更新 | 非幂等、部分修改 |
| **DELETE** | 删除资源 | 幂等 |
| **HEAD** | 获取头信息 | 不返回 body |
| **OPTIONS** | 获取支持的方法 | 用于 CORS 预检 |

### GET vs POST

```javascript
// GET 请求
// ✅ 适用场景: 查询、搜索、获取数据
// 特点: 参数在 URL,有长度限制,可缓存,可收藏
fetch('https://api.example.com/users?id=1&name=Alice')
  .then(res => res.json())
  .then(data => console.log(data));

// POST 请求
// ✅ 适用场景: 提交表单、上传文件、创建资源
// 特点: 参数在 body,无长度限制,不可缓存
fetch('https://api.example.com/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Alice',
    age: 25
  })
})
  .then(res => res.json())
  .then(data => console.log(data));

// 区别总结:
// 1. 参数位置: GET 在 URL, POST 在 body
// 2. 安全性: POST 相对安全(参数不在 URL)
// 3. 长度限制: GET 有限制(浏览器约 2KB), POST 无限制
// 4. 缓存: GET 可缓存, POST 不可缓存
// 5. 幂等性: GET 幂等, POST 非幂等
// 6. 书签: GET 可收藏, POST 不可
```

### 2. HTTP 状态码

#### 2xx 成功
```javascript
200 OK              // 请求成功
201 Created         // 资源创建成功
204 No Content      // 成功但无返回内容(如删除操作)
206 Partial Content // 部分内容(范围请求)
```

#### 3xx 重定向
```javascript
301 Moved Permanently   // 永久重定向(会被缓存)
302 Found              // 临时重定向
304 Not Modified       // 资源未修改,使用缓存
307 Temporary Redirect // 临时重定向(保持方法)
308 Permanent Redirect // 永久重定向(保持方法)

// 使用示例
// 301 vs 302
// 301: 搜索引擎会更新索引
// 302: 搜索引擎不会更新索引

// 重定向示例
res.writeHead(301, { Location: 'https://new-url.com' });
res.end();
```

#### 4xx 客户端错误
```javascript
400 Bad Request         // 请求参数错误
401 Unauthorized        // 未认证(未登录)
403 Forbidden          // 无权限
404 Not Found          // 资源不存在
405 Method Not Allowed // 方法不允许
408 Request Timeout    // 请求超时
429 Too Many Requests  // 请求过于频繁

// 实际应用
if (response.status === 401) {
  // 跳转登录页
  router.push('/login');
} else if (response.status === 403) {
  // 提示无权限
  message.error('无权限访问');
}
```

#### 5xx 服务器错误
```javascript
500 Internal Server Error // 服务器内部错误
502 Bad Gateway          // 网关错误
503 Service Unavailable  // 服务不可用
504 Gateway Timeout      // 网关超时
```

### 3. HTTP 缓存

#### 强缓存
```javascript
// Cache-Control (HTTP/1.1)
Cache-Control: max-age=31536000  // 缓存 1 年
Cache-Control: no-cache          // 不使用强缓存,需验证
Cache-Control: no-store          // 不缓存
Cache-Control: public            // 可被任何缓存
Cache-Control: private           // 只能被浏览器缓存

// Expires (HTTP/1.0, 已过时)
Expires: Wed, 21 Oct 2025 07:28:00 GMT

// 优先级: Cache-Control > Expires

// Nginx 配置强缓存
location ~* \.(jpg|jpeg|png|gif|css|js)$ {
    expires 30d;  // 30 天
    add_header Cache-Control "public, immutable";
}
```

#### 协商缓存
```javascript
// 方式1: Last-Modified / If-Modified-Since
// 首次请求
Response Headers:
Last-Modified: Wed, 21 Oct 2024 07:28:00 GMT

// 再次请求
Request Headers:
If-Modified-Since: Wed, 21 Oct 2024 07:28:00 GMT

// 服务器判断
if (文件未修改) {
  return 304 Not Modified;  // 使用缓存
} else {
  return 200 OK;  // 返回新内容
}

// 方式2: ETag / If-None-Match (更精确)
// 首次请求
Response Headers:
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"

// 再次请求
Request Headers:
If-None-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"

// ETag 优势:
// - 更精确(内容未变,修改时间变了,ETag 不变)
// - 可以处理文件精确到秒级修改的情况

// 优先级: ETag > Last-Modified
```

#### 缓存策略

```javascript
// 完整的缓存流程
/*
1. 浏览器发起请求
2. 检查是否有缓存
3. 如果有缓存:
   a. 检查强缓存是否过期
   b. 未过期: 直接使用缓存(200 from disk cache)
   c. 过期: 发起协商缓存请求
      - 304: 使用缓存
      - 200: 使用新内容
4. 如果无缓存: 正常请求
*/

// 实际应用策略
// HTML: 协商缓存
Cache-Control: no-cache

// CSS/JS 带哈希: 强缓存
Cache-Control: max-age=31536000, immutable
// 文件名: main.a3f4b2c.js

// 图片: 强缓存
Cache-Control: max-age=2592000  // 30 天

// API 接口: 不缓存
Cache-Control: no-store
```

---

## HTTPS

### 1. HTTP vs HTTPS

| 特性 | HTTP | HTTPS |
|------|------|-------|
| 安全性 | 明文传输 | 加密传输 |
| 端口 | 80 | 443 |
| 证书 | 不需要 | 需要 SSL/TLS 证书 |
| 性能 | 快 | 稍慢(加密解密) |
| SEO | 正常 | 更好(Google 优先) |

### 2. HTTPS 加密过程

```javascript
/*
1. 客户端 Hello
   - 发送支持的加密算法列表
   - 随机数 Client Random

2. 服务器 Hello
   - 选择加密算法
   - 发送数字证书(包含公钥)
   - 随机数 Server Random

3. 客户端验证证书
   - 验证证书是否由可信 CA 签发
   - 验证证书是否过期
   - 验证域名是否匹配

4. 客户端生成 Pre-Master Secret
   - 生成随机数
   - 用服务器公钥加密
   - 发送给服务器

5. 双方生成会话密钥
   - Session Key = Function(Client Random, Server Random, Pre-Master Secret)
   - 对称加密密钥

6. 开始加密通信
   - 使用会话密钥进行对称加密通信
*/

// 非对称加密 + 对称加密
// 握手阶段: 非对称加密(RSA)交换密钥
// 通信阶段: 对称加密(AES)传输数据

// 为什么这样设计?
// 非对称加密安全但慢 → 用于交换密钥
// 对称加密快但密钥交换不安全 → 用于数据传输
```

### 3. 数字证书

```javascript
// 证书内容
{
  "subject": "www.example.com",     // 域名
  "issuer": "Let's Encrypt",        // 颁发者
  "validFrom": "2024-01-01",        // 生效时间
  "validTo": "2025-01-01",          // 过期时间
  "publicKey": "...",               // 公钥
  "signature": "..."                // 签名
}

// 证书验证流程
1. 浏览器内置 CA 根证书
2. 服务器发送证书
3. 浏览器用 CA 公钥验证服务器证书签名
4. 验证通过 → 信任该网站
5. 验证失败 → 显示不安全警告
```

---

## 跨域

### 1. 什么是跨域?

**同源策略**(Same-Origin Policy): 协议、域名、端口必须完全相同。

```javascript
// 当前页面: https://www.example.com:443/page.html

// 同源
https://www.example.com:443/api/data  ✅

// 跨域
http://www.example.com/api/data       ❌ 协议不同
https://api.example.com/data          ❌ 域名不同
https://www.example.com:8080/api      ❌ 端口不同
```

### 2. CORS (跨域资源共享)

#### 简单请求
```javascript
// 条件:
// 1. 方法: GET、POST、HEAD
// 2. 头部: Accept、Accept-Language、Content-Type
// 3. Content-Type: text/plain、multipart/form-data、application/x-www-form-urlencoded

// 前端代码
fetch('https://api.example.com/data')
  .then(res => res.json())
  .then(data => console.log(data));

// 后端响应头(Node.js + Express)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');  // 允许所有域名
  // res.header('Access-Control-Allow-Origin', 'https://example.com');  // 指定域名
  res.header('Access-Control-Allow-Credentials', 'true');  // 允许携带 Cookie
  next();
});
```

#### 预检请求 (Preflight)
```javascript
// 条件: 不满足简单请求条件时触发
// 如: PUT、DELETE 方法,自定义头部等

// 前端代码
fetch('https://api.example.com/data', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'X-Custom-Header': 'value'
  },
  body: JSON.stringify({ name: 'Alice' })
});

// 浏览器先发送 OPTIONS 预检请求
OPTIONS /data HTTP/1.1
Origin: https://example.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: Content-Type, X-Custom-Header

// 服务器响应
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, X-Custom-Header
Access-Control-Max-Age: 86400  // 预检结果缓存 1 天

// 预检通过后,才发送实际请求

// 后端完整配置(Express)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Custom-Header');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
```

### 3. 其他跨域方案

#### JSONP
```javascript
// 原理: <script> 标签不受同源策略限制

// 前端
function handleResponse(data) {
  console.log('收到数据:', data);
}

const script = document.createElement('script');
script.src = 'https://api.example.com/data?callback=handleResponse';
document.body.appendChild(script);

// 后端(Node.js)
app.get('/data', (req, res) => {
  const callback = req.query.callback;
  const data = { name: 'Alice', age: 25 };
  res.send(`${callback}(${JSON.stringify(data)})`);
  // 返回: handleResponse({"name":"Alice","age":25})
});

// 缺点:
// - 只支持 GET 请求
// - 安全性差(容易被 XSS 攻击)
// - 错误处理困难
```

#### 代理服务器
```javascript
// Nginx 反向代理
server {
    listen 80;
    server_name example.com;

    location /api/ {
        proxy_pass https://api.other-domain.com/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

// 开发环境: Vite/Webpack 代理
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'https://api.example.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
};

// webpack.config.js
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'https://api.example.com',
        changeOrigin: true,
        pathRewrite: { '^/api': '' }
      }
    }
  }
};
```

#### postMessage
```javascript
// 页面 A (http://a.com)
const iframe = document.getElementById('iframe');
iframe.contentWindow.postMessage('Hello from A', 'http://b.com');

window.addEventListener('message', (event) => {
  if (event.origin !== 'http://b.com') return;
  console.log('收到消息:', event.data);
});

// 页面 B (http://b.com)
window.addEventListener('message', (event) => {
  if (event.origin !== 'http://a.com') return;
  console.log('收到消息:', event.data);

  // 回复消息
  event.source.postMessage('Hello from B', event.origin);
});
```

---

## WebSocket

### 基础使用

```javascript
// 创建 WebSocket 连接
const ws = new WebSocket('ws://localhost:8080');

// 连接打开
ws.addEventListener('open', (event) => {
  console.log('连接已建立');
  ws.send('Hello Server!');
});

// 接收消息
ws.addEventListener('message', (event) => {
  console.log('收到消息:', event.data);
});

// 连接关闭
ws.addEventListener('close', (event) => {
  console.log('连接已关闭', event.code, event.reason);
});

// 连接错误
ws.addEventListener('error', (error) => {
  console.error('WebSocket 错误:', error);
});

// 发送消息
ws.send('Hello');
ws.send(JSON.stringify({ type: 'message', content: 'Hello' }));

// 关闭连接
ws.close();
```

### 封装 WebSocket 类

```javascript
class WebSocketClient {
  constructor(url, options = {}) {
    this.url = url;
    this.options = {
      reconnect: true,           // 自动重连
      reconnectInterval: 5000,   // 重连间隔
      heartbeat: true,           // 心跳检测
      heartbeatInterval: 30000,  // 心跳间隔
      ...options
    };

    this.ws = null;
    this.reconnectTimer = null;
    this.heartbeatTimer = null;
    this.messageQueue = [];  // 消息队列

    this.connect();
  }

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('WebSocket 连接成功');
      this.onopen?.();

      // 发送队列中的消息
      while (this.messageQueue.length > 0) {
        this.send(this.messageQueue.shift());
      }

      // 启动心跳
      if (this.options.heartbeat) {
        this.startHeartbeat();
      }
    };

    this.ws.onmessage = (event) => {
      this.onmessage?.(event.data);
    };

    this.ws.onclose = () => {
      console.log('WebSocket 连接关闭');
      this.onclose?.();

      // 停止心跳
      this.stopHeartbeat();

      // 自动重连
      if (this.options.reconnect) {
        this.reconnectTimer = setTimeout(() => {
          console.log('正在重连...');
          this.connect();
        }, this.options.reconnectInterval);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket 错误:', error);
      this.onerror?.(error);
    };
  }

  send(data) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
    } else {
      // 连接未就绪,加入队列
      this.messageQueue.push(data);
    }
  }

  close() {
    this.options.reconnect = false;  // 禁用重连
    this.stopHeartbeat();
    clearTimeout(this.reconnectTimer);
    this.ws?.close();
  }

  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      this.send({ type: 'ping' });
    }, this.options.heartbeatInterval);
  }

  stopHeartbeat() {
    clearInterval(this.heartbeatTimer);
  }
}

// 使用
const client = new WebSocketClient('ws://localhost:8080');

client.onmessage = (data) => {
  console.log('收到:', data);
};

client.send({ type: 'message', content: 'Hello' });
```

---

## 总结

### 核心要点
1. **HTTP**: 掌握请求方法、状态码、缓存机制
2. **HTTPS**: 理解加密过程、证书验证
3. **跨域**: 熟练使用 CORS,理解跨域原理
4. **WebSocket**: 实时通信场景

### 面试加分项
- 能说出 HTTPS 完整握手过程
- 了解 HTTP/2、HTTP/3 的改进
- 熟悉常见的网络安全问题和防御
- 有 WebSocket 实战经验
