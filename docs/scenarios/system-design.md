# 系统设计面试题

## 概述

系统设计题是高级前端面试的重头戏，考察候选人的**架构能力**、**技术选型**、**问题分解**能力。前端工程师需要能够独立设计和实现复杂的前端系统。

---

## 一、IM 即时通讯系统

### 需求分析

```javascript
/**
 * IM 聊天系统核心需求:
 * 1. 实时消息收发
 * 2. 消息状态(发送中、已发送、已读)
 * 3. 离线消息
 * 4. 历史消息加载
 * 5. 多种消息类型(文本、图片、文件、语音)
 * 6. 群聊功能
 * 7. @功能、表情包
 * 8. 消息搜索
 */
```

### 技术架构

```javascript
// 整体架构设计
class IMSystem {
  constructor() {
    this.wsManager = new WebSocketManager()      // WebSocket 管理
    this.messageStore = new MessageStore()       // 消息存储
    this.messageQueue = new MessageQueue()       // 消息队列
    this.syncManager = new SyncManager()         // 消息同步
    this.notificationManager = new NotificationManager()  // 通知管理
  }
}
```

### 核心实现

#### 1. WebSocket 连接管理

```javascript
class WebSocketManager {
  constructor(options = {}) {
    this.url = options.url
    this.ws = null
    this.heartbeatTimer = null
    this.reconnectTimer = null
    this.reconnectCount = 0
    this.maxReconnect = options.maxReconnect || 5
    this.heartbeatInterval = options.heartbeatInterval || 30000
    this.messageHandlers = new Map()
    this.pendingMessages = []  // 断线期间的待发送消息

    this.connect()
  }

  // 建立连接
  connect() {
    this.ws = new WebSocket(this.url)

    this.ws.onopen = () => {
      console.log('WebSocket 连接成功')
      this.reconnectCount = 0
      this.startHeartbeat()
      this.flushPendingMessages()  // 发送断线期间的消息
      this.emit('connected')
    }

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      this.handleMessage(data)
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket 错误:', error)
      this.emit('error', error)
    }

    this.ws.onclose = () => {
      console.log('WebSocket 断开')
      this.stopHeartbeat()
      this.reconnect()
      this.emit('disconnected')
    }
  }

  // 心跳检测
  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping', timestamp: Date.now() })
      }
    }, this.heartbeatInterval)
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  // 断线重连 (指数退避)
  reconnect() {
    if (this.reconnectCount >= this.maxReconnect) {
      console.error('达到最大重连次数')
      this.emit('reconnectFailed')
      return
    }

    // 指数退避: 1s, 2s, 4s, 8s, 16s
    const delay = Math.pow(2, this.reconnectCount) * 1000
    this.reconnectCount++

    console.log(`${delay / 1000}秒后重连, 第${this.reconnectCount}次`)

    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, delay)
  }

  // 发送消息
  send(data) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      // 断线时加入待发送队列
      this.pendingMessages.push(data)
    }
  }

  // 发送断线期间的消息
  flushPendingMessages() {
    while (this.pendingMessages.length > 0) {
      const message = this.pendingMessages.shift()
      this.send(message)
    }
  }

  // 消息处理
  handleMessage(data) {
    const { type } = data

    switch (type) {
      case 'pong':
        // 心跳响应
        break
      case 'message':
        this.emit('message', data)
        break
      case 'ack':
        this.emit('ack', data)
        break
      case 'read':
        this.emit('read', data)
        break
      default:
        console.warn('未知消息类型:', type)
    }
  }

  // 事件发布
  on(event, handler) {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, [])
    }
    this.messageHandlers.get(event).push(handler)
  }

  emit(event, data) {
    const handlers = this.messageHandlers.get(event) || []
    handlers.forEach(handler => handler(data))
  }

  // 销毁
  destroy() {
    this.stopHeartbeat()
    clearTimeout(this.reconnectTimer)
    this.ws.close()
  }
}
```

#### 2. 消息管理

```javascript
class MessageStore {
  constructor() {
    this.conversations = new Map()  // 会话列表
    this.messages = new Map()       // 消息缓存
    this.db = null                  // IndexedDB
    this.initDB()
  }

  // 初始化 IndexedDB
  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('IMDatabase', 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        // 创建消息存储
        if (!db.objectStoreNames.contains('messages')) {
          const messageStore = db.createObjectStore('messages', {
            keyPath: 'id'
          })
          messageStore.createIndex('conversationId', 'conversationId')
          messageStore.createIndex('timestamp', 'timestamp')
        }

        // 创建会话存储
        if (!db.objectStoreNames.contains('conversations')) {
          db.createObjectStore('conversations', { keyPath: 'id' })
        }
      }
    })
  }

  // 发送消息
  async sendMessage(message) {
    // 生成消息ID (客户端临时ID)
    const clientMsgId = this.generateId()

    const msg = {
      id: clientMsgId,
      ...message,
      status: 'sending',  // sending | sent | delivered | read | failed
      timestamp: Date.now(),
      isLocal: true
    }

    // 1. 先存本地 (乐观更新)
    await this.saveMessage(msg)

    // 2. 发送到服务器
    try {
      const response = await this.wsManager.sendAndWait({
        type: 'message',
        data: msg
      })

      // 3. 更新消息状态
      msg.status = 'sent'
      msg.serverMsgId = response.serverMsgId
      await this.updateMessage(msg)

    } catch (error) {
      // 4. 发送失败
      msg.status = 'failed'
      await this.updateMessage(msg)
      throw error
    }

    return msg
  }

  // 接收消息
  async receiveMessage(message) {
    // 去重检查
    const existing = await this.getMessageById(message.id)
    if (existing) return existing

    // 保存消息
    await this.saveMessage({
      ...message,
      status: 'delivered'
    })

    // 更新会话
    await this.updateConversation(message)

    return message
  }

  // 保存消息到 IndexedDB
  async saveMessage(message) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['messages'], 'readwrite')
      const store = transaction.objectStore('messages')
      const request = store.add(message)

      request.onsuccess = () => resolve(message)
      request.onerror = () => reject(request.error)
    })
  }

  // 更新消息
  async updateMessage(message) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['messages'], 'readwrite')
      const store = transaction.objectStore('messages')
      const request = store.put(message)

      request.onsuccess = () => resolve(message)
      request.onerror = () => reject(request.error)
    })
  }

  // 获取历史消息 (支持分页)
  async getMessages(conversationId, options = {}) {
    const { limit = 20, beforeTimestamp } = options

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['messages'], 'readonly')
      const store = transaction.objectStore('messages')
      const index = store.index('conversationId')

      const messages = []
      const range = IDBKeyRange.only(conversationId)
      const request = index.openCursor(range, 'prev')  // 倒序

      request.onsuccess = (event) => {
        const cursor = event.target.result

        if (cursor && messages.length < limit) {
          const msg = cursor.value

          // 时间过滤
          if (!beforeTimestamp || msg.timestamp < beforeTimestamp) {
            messages.push(msg)
          }

          cursor.continue()
        } else {
          resolve(messages.reverse())  // 恢复正序
        }
      }

      request.onerror = () => reject(request.error)
    })
  }

  // 生成消息ID
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}
```

#### 3. 消息渲染优化

```vue
<template>
  <div class="message-list" ref="listRef" @scroll="handleScroll">
    <!-- 虚拟列表 -->
    <div class="list-phantom" :style="{ height: totalHeight + 'px' }"></div>
    <div class="list-content" :style="{ transform: `translateY(${offset}px)` }">
      <div
        v-for="msg in visibleMessages"
        :key="msg.id"
        :class="['message-item', msg.isSelf ? 'self' : 'other']"
        :ref="el => setItemRef(msg.id, el)"
      >
        <!-- 时间分割线 -->
        <div v-if="msg.showTime" class="time-divider">
          {{ formatTime(msg.timestamp) }}
        </div>

        <!-- 消息气泡 -->
        <div class="message-bubble">
          <img v-if="!msg.isSelf" :src="msg.avatar" class="avatar" />

          <div class="content">
            <!-- 不同消息类型 -->
            <TextMessage v-if="msg.type === 'text'" :content="msg.content" />
            <ImageMessage v-else-if="msg.type === 'image'" :content="msg.content" />
            <FileMessage v-else-if="msg.type === 'file'" :content="msg.content" />
            <VoiceMessage v-else-if="msg.type === 'voice'" :content="msg.content" />

            <!-- 消息状态 -->
            <div class="status">
              <span v-if="msg.status === 'sending'" class="sending">发送中...</span>
              <span v-else-if="msg.status === 'failed'" class="failed" @click="resend(msg)">
                发送失败,点击重试
              </span>
              <span v-else-if="msg.status === 'read'" class="read">已读</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'

const props = defineProps({
  messages: Array,
  estimatedItemHeight: { type: Number, default: 80 }
})

const listRef = ref(null)
const scrollTop = ref(0)
const itemHeights = ref(new Map())  // 存储实际高度

// 计算总高度
const totalHeight = computed(() => {
  let height = 0
  for (const msg of props.messages) {
    height += itemHeights.value.get(msg.id) || props.estimatedItemHeight
  }
  return height
})

// 计算可见消息
const visibleMessages = computed(() => {
  if (!listRef.value) return []

  const viewportHeight = listRef.value.clientHeight
  const buffer = 5  // 缓冲区

  let startIndex = 0
  let endIndex = props.messages.length
  let accHeight = 0

  // 找起始索引
  for (let i = 0; i < props.messages.length; i++) {
    const height = itemHeights.value.get(props.messages[i].id) || props.estimatedItemHeight
    if (accHeight + height > scrollTop.value) {
      startIndex = Math.max(0, i - buffer)
      break
    }
    accHeight += height
  }

  // 找结束索引
  for (let i = startIndex; i < props.messages.length; i++) {
    const height = itemHeights.value.get(props.messages[i].id) || props.estimatedItemHeight
    accHeight += height
    if (accHeight > scrollTop.value + viewportHeight) {
      endIndex = Math.min(props.messages.length, i + buffer)
      break
    }
  }

  return props.messages.slice(startIndex, endIndex)
})

// 计算偏移
const offset = computed(() => {
  let height = 0
  for (const msg of props.messages) {
    if (msg.id === visibleMessages.value[0]?.id) break
    height += itemHeights.value.get(msg.id) || props.estimatedItemHeight
  }
  return height
})

// 设置元素引用,更新高度
function setItemRef(id, el) {
  if (el) {
    const height = el.offsetHeight
    if (itemHeights.value.get(id) !== height) {
      itemHeights.value.set(id, height)
    }
  }
}

// 滚动处理
function handleScroll(e) {
  scrollTop.value = e.target.scrollTop
}

// 滚动到底部
async function scrollToBottom() {
  await nextTick()
  if (listRef.value) {
    listRef.value.scrollTop = listRef.value.scrollHeight
  }
}

// 新消息自动滚动
watch(() => props.messages.length, (newLen, oldLen) => {
  if (newLen > oldLen) {
    // 判断是否在底部附近
    const isNearBottom = listRef.value.scrollHeight - listRef.value.scrollTop - listRef.value.clientHeight < 100
    if (isNearBottom) {
      scrollToBottom()
    }
  }
})
</script>
```

---

## 二、在线文档协同编辑

### 需求分析

```javascript
/**
 * 在线文档核心需求:
 * 1. 多人实时协作
 * 2. 光标位置同步
 * 3. 冲突解决
 * 4. 版本历史
 * 5. 评论批注
 * 6. 权限控制
 */
```

### OT 算法 (Operational Transformation)

```javascript
/**
 * OT 算法核心思想:
 * 1. 将所有编辑操作转换为三种原子操作: insert, delete, retain
 * 2. 当两个用户同时编辑时,通过转换函数解决冲突
 * 3. 保证最终一致性
 */

class OTDocument {
  constructor(initialContent = '') {
    this.content = initialContent
    this.version = 0
    this.pendingOperations = []
    this.acknowledgedOperations = []
  }

  // 操作定义
  // { type: 'insert', position: 5, text: 'hello' }
  // { type: 'delete', position: 5, length: 3 }
  // { type: 'retain', position: 5 }

  // 应用操作
  applyOperation(op) {
    switch (op.type) {
      case 'insert':
        this.content =
          this.content.slice(0, op.position) +
          op.text +
          this.content.slice(op.position)
        break
      case 'delete':
        this.content =
          this.content.slice(0, op.position) +
          this.content.slice(op.position + op.length)
        break
    }
    this.version++
  }

  // 操作转换 (Transform)
  // 当 op1 和 op2 并发时,转换 op2 使其在 op1 之后应用能得到正确结果
  transform(op1, op2) {
    // insert vs insert
    if (op1.type === 'insert' && op2.type === 'insert') {
      if (op1.position <= op2.position) {
        // op1 在前,op2 位置后移
        return {
          ...op2,
          position: op2.position + op1.text.length
        }
      } else {
        // op2 在前,不变
        return op2
      }
    }

    // insert vs delete
    if (op1.type === 'insert' && op2.type === 'delete') {
      if (op1.position <= op2.position) {
        return {
          ...op2,
          position: op2.position + op1.text.length
        }
      } else if (op1.position >= op2.position + op2.length) {
        return op2
      } else {
        // 插入点在删除范围内
        return {
          ...op2,
          length: op2.length + op1.text.length
        }
      }
    }

    // delete vs insert
    if (op1.type === 'delete' && op2.type === 'insert') {
      if (op1.position >= op2.position) {
        return op2
      } else if (op1.position + op1.length <= op2.position) {
        return {
          ...op2,
          position: op2.position - op1.length
        }
      } else {
        return {
          ...op2,
          position: op1.position
        }
      }
    }

    // delete vs delete
    if (op1.type === 'delete' && op2.type === 'delete') {
      if (op1.position >= op2.position + op2.length) {
        return {
          ...op2
        }
      } else if (op1.position + op1.length <= op2.position) {
        return {
          ...op2,
          position: op2.position - op1.length
        }
      } else {
        // 重叠删除
        const start = Math.min(op1.position, op2.position)
        const end1 = op1.position + op1.length
        const end2 = op2.position + op2.length

        if (op1.position <= op2.position && end1 >= end2) {
          // op1 包含 op2
          return { type: 'noop' }
        }

        return {
          type: 'delete',
          position: start,
          length: Math.max(end1, end2) - start - op1.length
        }
      }
    }

    return op2
  }
}

// 客户端协同编辑
class CollaborativeEditor {
  constructor(options) {
    this.docId = options.docId
    this.userId = options.userId
    this.ws = options.ws
    this.document = new OTDocument(options.initialContent)

    this.state = 'synchronized'  // synchronized | waiting | buffering
    this.pendingOperation = null
    this.buffer = null

    this.setupListeners()
  }

  // 本地编辑
  localEdit(operation) {
    // 应用到本地文档
    this.document.applyOperation(operation)

    switch (this.state) {
      case 'synchronized':
        // 直接发送
        this.sendOperation(operation)
        this.state = 'waiting'
        this.pendingOperation = operation
        break

      case 'waiting':
        // 缓冲操作
        if (this.buffer) {
          this.buffer = this.compose(this.buffer, operation)
        } else {
          this.buffer = operation
        }
        this.state = 'buffering'
        break

      case 'buffering':
        // 合并到缓冲区
        this.buffer = this.compose(this.buffer, operation)
        break
    }
  }

  // 收到服务器确认
  serverAck() {
    switch (this.state) {
      case 'waiting':
        this.state = 'synchronized'
        this.pendingOperation = null
        break

      case 'buffering':
        this.sendOperation(this.buffer)
        this.state = 'waiting'
        this.pendingOperation = this.buffer
        this.buffer = null
        break
    }
  }

  // 收到其他用户的操作
  remoteOperation(operation) {
    switch (this.state) {
      case 'synchronized':
        this.document.applyOperation(operation)
        this.renderContent()
        break

      case 'waiting':
      case 'buffering':
        // 转换操作
        const [transformedRemote, transformedPending] = this.transformPair(
          operation,
          this.pendingOperation
        )

        this.document.applyOperation(transformedRemote)
        this.pendingOperation = transformedPending

        if (this.buffer) {
          const [, transformedBuffer] = this.transformPair(
            transformedRemote,
            this.buffer
          )
          this.buffer = transformedBuffer
        }

        this.renderContent()
        break
    }
  }

  // 双向转换
  transformPair(op1, op2) {
    const transformed1 = this.document.transform(op2, op1)
    const transformed2 = this.document.transform(op1, op2)
    return [transformed1, transformed2]
  }

  // 发送操作
  sendOperation(operation) {
    this.ws.send({
      type: 'operation',
      docId: this.docId,
      userId: this.userId,
      version: this.document.version,
      operation
    })
  }

  // 渲染内容
  renderContent() {
    // 触发编辑器更新
    this.emit('contentChange', this.document.content)
  }

  // 合并操作
  compose(op1, op2) {
    // 简化实现: 返回操作序列
    return { type: 'compound', operations: [op1, op2] }
  }
}
```

### CRDT 算法 (Conflict-free Replicated Data Type)

```javascript
/**
 * CRDT 与 OT 的区别:
 * - OT: 需要中心服务器协调,操作需要转换
 * - CRDT: 无需中心协调,操作可交换,最终一致
 *
 * CRDT 文本编辑常用方案: YATA、RGA、Logoot
 */

// 简化的 CRDT 实现 (基于唯一位置标识)
class CRDTDocument {
  constructor(siteId) {
    this.siteId = siteId
    this.clock = 0
    this.characters = []  // [{ id, char, visible }]
  }

  // 生成唯一ID
  generateId(index) {
    this.clock++
    const leftId = this.characters[index - 1]?.id || { site: 0, clock: 0 }
    const rightId = this.characters[index]?.id || { site: Infinity, clock: 0 }

    return {
      site: this.siteId,
      clock: this.clock,
      // 位置在 left 和 right 之间
      position: (leftId.position || 0) + (rightId.position || 1) / 2
    }
  }

  // 插入字符
  insert(index, char) {
    const id = this.generateId(index)
    const charObj = { id, char, visible: true }

    // 按位置插入
    this.insertAtPosition(charObj)

    return { type: 'insert', id, char }
  }

  // 删除字符 (标记删除,不真正移除)
  delete(index) {
    const charObj = this.characters.filter(c => c.visible)[index]
    if (charObj) {
      charObj.visible = false
      return { type: 'delete', id: charObj.id }
    }
    return null
  }

  // 应用远程操作
  applyRemote(operation) {
    if (operation.type === 'insert') {
      const charObj = { id: operation.id, char: operation.char, visible: true }
      this.insertAtPosition(charObj)
    } else if (operation.type === 'delete') {
      const charObj = this.characters.find(c =>
        c.id.site === operation.id.site && c.id.clock === operation.id.clock
      )
      if (charObj) {
        charObj.visible = false
      }
    }
  }

  // 按位置插入
  insertAtPosition(charObj) {
    const index = this.findInsertIndex(charObj.id)
    this.characters.splice(index, 0, charObj)
  }

  // 找插入位置 (二分查找)
  findInsertIndex(id) {
    let left = 0
    let right = this.characters.length

    while (left < right) {
      const mid = Math.floor((left + right) / 2)
      if (this.compareIds(this.characters[mid].id, id) < 0) {
        left = mid + 1
      } else {
        right = mid
      }
    }

    return left
  }

  // 比较ID
  compareIds(id1, id2) {
    if (id1.position !== id2.position) {
      return id1.position - id2.position
    }
    if (id1.site !== id2.site) {
      return id1.site - id2.site
    }
    return id1.clock - id2.clock
  }

  // 获取文档内容
  getContent() {
    return this.characters
      .filter(c => c.visible)
      .map(c => c.char)
      .join('')
  }
}
```

---

## 三、前端权限系统设计

### 整体架构

```javascript
/**
 * 权限系统核心功能:
 * 1. 路由权限 - 控制页面访问
 * 2. 按钮权限 - 控制操作权限
 * 3. 数据权限 - 控制数据范围
 * 4. 菜单权限 - 动态生成菜单
 */

class PermissionSystem {
  constructor() {
    this.roles = []          // 用户角色
    this.permissions = []    // 权限列表
    this.routes = []         // 路由配置
    this.menus = []          // 菜单配置
  }
}
```

### 路由权限控制

```javascript
// 方式1: 前端定义全部路由,根据权限过滤
const asyncRoutes = [
  {
    path: '/dashboard',
    component: Dashboard,
    meta: { roles: ['admin', 'editor'] }
  },
  {
    path: '/user',
    component: UserManage,
    meta: { roles: ['admin'] }
  },
  {
    path: '/article',
    component: Article,
    meta: { permissions: ['article:read'] }
  }
]

// 过滤有权限的路由
function filterAsyncRoutes(routes, roles, permissions) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }

    if (hasPermission(tmp, roles, permissions)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles, permissions)
      }
      res.push(tmp)
    }
  })

  return res
}

function hasPermission(route, roles, permissions) {
  if (route.meta?.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  }
  if (route.meta?.permissions) {
    return permissions.some(perm => route.meta.permissions.includes(perm))
  }
  return true
}

// 方式2: 后端返回路由配置,前端动态添加
async function initRoutes() {
  const { routes } = await api.getUserRoutes()

  // 将后端路由配置转换为 Vue Router 格式
  const asyncRoutes = routes.map(route => ({
    path: route.path,
    name: route.name,
    component: loadComponent(route.component),
    meta: route.meta,
    children: route.children?.map(/* 递归处理 */)
  }))

  // 动态添加路由
  asyncRoutes.forEach(route => {
    router.addRoute(route)
  })
}

// 动态加载组件
function loadComponent(componentPath) {
  return () => import(`@/views/${componentPath}.vue`)
}
```

### 按钮权限控制

```javascript
// 方式1: 自定义指令
// v-permission="['user:add', 'user:edit']"
app.directive('permission', {
  mounted(el, binding) {
    const { value } = binding
    const permissions = store.getters.permissions

    if (value && value instanceof Array) {
      const hasPermission = value.some(perm => permissions.includes(perm))

      if (!hasPermission) {
        el.parentNode?.removeChild(el)
      }
    }
  }
})

// 使用
<button v-permission="['user:add']">新增用户</button>

// 方式2: 组件封装
<template>
  <slot v-if="hasPermission"></slot>
</template>

<script setup>
import { computed } from 'vue'
import { usePermissionStore } from '@/stores/permission'

const props = defineProps({
  permission: {
    type: [String, Array],
    required: true
  }
})

const permissionStore = usePermissionStore()

const hasPermission = computed(() => {
  const permissions = permissionStore.permissions
  const required = Array.isArray(props.permission)
    ? props.permission
    : [props.permission]

  return required.some(perm => permissions.includes(perm))
})
</script>

// 使用
<Permission permission="user:add">
  <button>新增用户</button>
</Permission>

// 方式3: 函数式
const checkPermission = (permission) => {
  const permissions = store.getters.permissions
  return permissions.includes(permission)
}

// 模板中使用
<button v-if="checkPermission('user:add')">新增用户</button>
```

### 菜单权限

```javascript
// Pinia Store
export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: [],
    menus: [],
    permissions: []
  }),

  actions: {
    async generateRoutes() {
      // 获取用户信息和权限
      const { roles, permissions } = await api.getUserInfo()
      this.permissions = permissions

      // 过滤路由
      const accessedRoutes = filterAsyncRoutes(asyncRoutes, roles, permissions)
      this.routes = accessedRoutes

      // 生成菜单
      this.menus = this.generateMenus(accessedRoutes)

      return accessedRoutes
    },

    generateMenus(routes) {
      return routes
        .filter(route => !route.hidden)
        .map(route => ({
          path: route.path,
          title: route.meta?.title,
          icon: route.meta?.icon,
          children: route.children ? this.generateMenus(route.children) : []
        }))
    }
  }
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const token = getToken()

  if (token) {
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      const permissionStore = usePermissionStore()

      if (permissionStore.routes.length === 0) {
        try {
          // 获取权限并生成路由
          const accessRoutes = await permissionStore.generateRoutes()

          // 动态添加路由
          accessRoutes.forEach(route => {
            router.addRoute(route)
          })

          // 重新导航
          next({ ...to, replace: true })
        } catch (error) {
          // 获取权限失败,跳转登录
          removeToken()
          next(`/login?redirect=${to.path}`)
        }
      } else {
        next()
      }
    }
  } else {
    // 白名单
    const whiteList = ['/login', '/register', '/404']
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
    }
  }
})
```

---

## 四、大文件上传系统

### 完整实现

```javascript
class FileUploader {
  constructor(options = {}) {
    this.chunkSize = options.chunkSize || 5 * 1024 * 1024  // 5MB
    this.concurrency = options.concurrency || 3
    this.retryCount = options.retryCount || 3
    this.uploadUrl = options.uploadUrl
    this.mergeUrl = options.mergeUrl
  }

  // 计算文件 hash (使用 Web Worker)
  async calculateHash(file) {
    return new Promise((resolve) => {
      const worker = new Worker('/hash-worker.js')

      worker.postMessage({ file })

      worker.onmessage = (e) => {
        const { hash, progress } = e.data

        if (progress !== undefined) {
          this.onHashProgress?.(progress)
        }

        if (hash) {
          resolve(hash)
          worker.terminate()
        }
      }
    })
  }

  // 文件切片
  createChunks(file, hash) {
    const chunks = []
    let cur = 0
    let index = 0

    while (cur < file.size) {
      chunks.push({
        index,
        hash: `${hash}-${index}`,
        chunk: file.slice(cur, cur + this.chunkSize),
        progress: 0
      })
      cur += this.chunkSize
      index++
    }

    return chunks
  }

  // 检查已上传的分片
  async checkUploadedChunks(hash, filename) {
    const response = await fetch('/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hash, filename })
    })

    const { uploaded, uploadedChunks } = await response.json()
    return { uploaded, uploadedChunks }
  }

  // 上传单个分片
  async uploadChunk(chunk, hash, filename) {
    const formData = new FormData()
    formData.append('chunk', chunk.chunk)
    formData.append('hash', chunk.hash)
    formData.append('fileHash', hash)
    formData.append('filename', filename)
    formData.append('index', chunk.index)

    let retries = 0

    while (retries < this.retryCount) {
      try {
        const response = await fetch(this.uploadUrl, {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          return true
        }
        throw new Error('Upload failed')
      } catch (error) {
        retries++
        if (retries >= this.retryCount) {
          throw error
        }
        // 等待后重试
        await this.sleep(1000 * retries)
      }
    }
  }

  // 并发上传控制
  async uploadChunksWithConcurrency(chunks, hash, filename, uploadedChunks) {
    // 过滤已上传的分片
    const pendingChunks = chunks.filter(chunk =>
      !uploadedChunks.includes(chunk.hash)
    )

    if (pendingChunks.length === 0) {
      return
    }

    // 并发上传
    const pool = []
    let completed = chunks.length - pendingChunks.length

    for (const chunk of pendingChunks) {
      const task = this.uploadChunk(chunk, hash, filename)
        .then(() => {
          completed++
          this.onProgress?.((completed / chunks.length) * 100)

          // 移出任务池
          const index = pool.indexOf(task)
          if (index > -1) pool.splice(index, 1)
        })
        .catch(error => {
          this.onError?.(error, chunk)
          throw error
        })

      pool.push(task)

      // 控制并发数
      if (pool.length >= this.concurrency) {
        await Promise.race(pool)
      }
    }

    // 等待所有任务完成
    await Promise.all(pool)
  }

  // 合并分片
  async mergeChunks(hash, filename, totalChunks) {
    const response = await fetch(this.mergeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hash,
        filename,
        totalChunks,
        chunkSize: this.chunkSize
      })
    })

    return response.json()
  }

  // 主上传方法
  async upload(file) {
    // 1. 计算文件 hash
    this.onStatus?.('计算文件hash中...')
    const hash = await this.calculateHash(file)

    // 2. 检查秒传
    this.onStatus?.('检查文件状态...')
    const { uploaded, uploadedChunks } = await this.checkUploadedChunks(hash, file.name)

    if (uploaded) {
      this.onStatus?.('文件已存在,秒传成功')
      this.onProgress?.(100)
      return { success: true, hash }
    }

    // 3. 文件切片
    this.onStatus?.('准备上传...')
    const chunks = this.createChunks(file, hash)

    // 4. 并发上传
    this.onStatus?.('上传中...')
    await this.uploadChunksWithConcurrency(chunks, hash, file.name, uploadedChunks)

    // 5. 合并分片
    this.onStatus?.('合并文件中...')
    const result = await this.mergeChunks(hash, file.name, chunks.length)

    this.onStatus?.('上传完成')
    return result
  }

  // 暂停上传
  pause() {
    this.isPaused = true
  }

  // 恢复上传
  resume() {
    this.isPaused = false
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// hash-worker.js
self.importScripts('https://cdn.bootcss.com/spark-md5/3.0.0/spark-md5.min.js')

self.onmessage = async (e) => {
  const { file } = e.data
  const chunkSize = 5 * 1024 * 1024
  const chunks = Math.ceil(file.size / chunkSize)
  const spark = new self.SparkMD5.ArrayBuffer()
  const reader = new FileReader()
  let currentChunk = 0

  const loadNext = () => {
    const start = currentChunk * chunkSize
    const end = Math.min(start + chunkSize, file.size)
    reader.readAsArrayBuffer(file.slice(start, end))
  }

  reader.onload = (e) => {
    spark.append(e.target.result)
    currentChunk++

    // 上报进度
    self.postMessage({ progress: (currentChunk / chunks) * 100 })

    if (currentChunk < chunks) {
      loadNext()
    } else {
      // 计算完成
      self.postMessage({ hash: spark.end() })
    }
  }

  loadNext()
}

// 使用示例
const uploader = new FileUploader({
  uploadUrl: '/api/upload',
  mergeUrl: '/api/merge',
  chunkSize: 5 * 1024 * 1024,
  concurrency: 3
})

uploader.onProgress = (progress) => {
  console.log('上传进度:', progress + '%')
}

uploader.onStatus = (status) => {
  console.log('状态:', status)
}

uploader.onError = (error, chunk) => {
  console.error('分片上传失败:', chunk.index, error)
}

// 上传
const fileInput = document.querySelector('#file')
fileInput.onchange = async (e) => {
  const file = e.target.files[0]
  const result = await uploader.upload(file)
  console.log('上传结果:', result)
}
```

---

## 五、前端埋点系统设计

### 完整实现

```javascript
class TrackingSystem {
  constructor(options = {}) {
    this.appId = options.appId
    this.userId = options.userId
    this.reportUrl = options.reportUrl
    this.batchSize = options.batchSize || 10
    this.flushInterval = options.flushInterval || 5000

    this.queue = []
    this.sessionId = this.generateSessionId()

    this.init()
  }

  init() {
    // 自动采集
    this.autoTrackPageView()
    this.autoTrackClick()
    this.autoTrackExposure()
    this.autoTrackError()
    this.autoTrackPerformance()

    // 定时上报
    this.startFlushTimer()

    // 页面卸载时上报
    this.trackBeforeUnload()
  }

  // 手动埋点
  track(eventName, properties = {}) {
    this.addToQueue({
      type: 'track',
      event: eventName,
      properties: {
        ...this.getCommonProperties(),
        ...properties
      }
    })
  }

  // 页面浏览埋点
  trackPageView(pageName, properties = {}) {
    this.addToQueue({
      type: 'pageview',
      page: pageName || location.pathname,
      referrer: document.referrer,
      properties: {
        ...this.getCommonProperties(),
        ...properties
      }
    })
  }

  // 自动页面浏览
  autoTrackPageView() {
    // 首次加载
    this.trackPageView()

    // SPA 路由变化
    let lastPath = location.pathname

    // 监听 history 变化
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    history.pushState = (...args) => {
      originalPushState.apply(history, args)
      this.onRouteChange(lastPath)
      lastPath = location.pathname
    }

    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args)
      this.onRouteChange(lastPath)
      lastPath = location.pathname
    }

    window.addEventListener('popstate', () => {
      this.onRouteChange(lastPath)
      lastPath = location.pathname
    })
  }

  onRouteChange(previousPath) {
    this.trackPageView(location.pathname, {
      previousPath
    })
  }

  // 自动点击埋点
  autoTrackClick() {
    document.addEventListener('click', (event) => {
      const target = event.target

      // 只采集带有 data-track 属性的元素
      const trackElement = target.closest('[data-track]')
      if (!trackElement) return

      const trackData = trackElement.dataset

      this.track('click', {
        elementId: trackElement.id,
        elementClass: trackElement.className,
        elementText: trackElement.textContent?.slice(0, 50),
        trackName: trackData.track,
        trackExtra: this.parseJSON(trackData.trackExtra),
        position: {
          x: event.pageX,
          y: event.pageY
        }
      })
    }, true)
  }

  // 曝光埋点
  autoTrackExposure() {
    const exposedElements = new WeakSet()

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !exposedElements.has(entry.target)) {
          exposedElements.add(entry.target)

          const trackData = entry.target.dataset

          this.track('exposure', {
            elementId: entry.target.id,
            trackName: trackData.trackExposure,
            trackExtra: this.parseJSON(trackData.trackExtra),
            visibleRatio: entry.intersectionRatio
          })
        }
      })
    }, {
      threshold: 0.5  // 50% 可见时触发
    })

    // 监听带有 data-track-exposure 属性的元素
    const observeElements = () => {
      document.querySelectorAll('[data-track-exposure]').forEach(el => {
        observer.observe(el)
      })
    }

    // 初始监听
    observeElements()

    // DOM 变化时重新监听
    const mutationObserver = new MutationObserver(observeElements)
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  // 错误埋点
  autoTrackError() {
    // JS 错误
    window.addEventListener('error', (event) => {
      this.track('error', {
        errorType: 'js',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      })
    })

    // Promise 错误
    window.addEventListener('unhandledrejection', (event) => {
      this.track('error', {
        errorType: 'promise',
        reason: String(event.reason),
        stack: event.reason?.stack
      })
    })

    // 资源加载错误
    window.addEventListener('error', (event) => {
      if (event.target && (event.target.src || event.target.href)) {
        this.track('error', {
          errorType: 'resource',
          resourceUrl: event.target.src || event.target.href,
          resourceTag: event.target.tagName
        })
      }
    }, true)
  }

  // 性能埋点
  autoTrackPerformance() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const timing = performance.timing

        this.track('performance', {
          // DNS 解析时间
          dnsTime: timing.domainLookupEnd - timing.domainLookupStart,
          // TCP 连接时间
          tcpTime: timing.connectEnd - timing.connectStart,
          // 首字节时间
          ttfb: timing.responseStart - timing.navigationStart,
          // DOM 解析时间
          domParseTime: timing.domInteractive - timing.responseEnd,
          // DOM 加载完成
          domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
          // 页面完全加载
          loadTime: timing.loadEventEnd - timing.navigationStart
        })

        // Core Web Vitals
        this.trackWebVitals()
      }, 0)
    })
  }

  trackWebVitals() {
    // LCP
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]

      this.track('webvital', {
        name: 'LCP',
        value: lastEntry.renderTime || lastEntry.loadTime
      })
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // FID
    new PerformanceObserver((list) => {
      const entry = list.getEntries()[0]

      this.track('webvital', {
        name: 'FID',
        value: entry.processingStart - entry.startTime
      })
    }).observe({ entryTypes: ['first-input'] })

    // CLS
    let clsValue = 0
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      }

      this.track('webvital', {
        name: 'CLS',
        value: clsValue
      })
    }).observe({ entryTypes: ['layout-shift'] })
  }

  // 获取通用属性
  getCommonProperties() {
    return {
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      appId: this.appId,
      url: location.href,
      path: location.pathname,
      userAgent: navigator.userAgent,
      screenWidth: screen.width,
      screenHeight: screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      language: navigator.language
    }
  }

  // 添加到队列
  addToQueue(data) {
    this.queue.push(data)

    // 达到批量大小立即上报
    if (this.queue.length >= this.batchSize) {
      this.flush()
    }
  }

  // 上报数据
  flush() {
    if (this.queue.length === 0) return

    const data = this.queue.splice(0, this.batchSize)
    this.send(data)
  }

  // 发送数据
  send(data) {
    // 优先使用 sendBeacon
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        this.reportUrl,
        JSON.stringify(data)
      )
    } else {
      // 降级使用 fetch
      fetch(this.reportUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true
      }).catch(console.error)
    }
  }

  // 定时上报
  startFlushTimer() {
    setInterval(() => {
      this.flush()
    }, this.flushInterval)
  }

  // 页面卸载前上报
  trackBeforeUnload() {
    window.addEventListener('beforeunload', () => {
      this.flush()
    })

    window.addEventListener('pagehide', () => {
      this.flush()
    })
  }

  // 生成会话ID
  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // 解析 JSON
  parseJSON(str) {
    try {
      return JSON.parse(str || '{}')
    } catch {
      return {}
    }
  }
}

// 使用
const tracker = new TrackingSystem({
  appId: 'my-app',
  userId: 'user-123',
  reportUrl: '/api/track'
})

// 手动埋点
tracker.track('button_click', {
  buttonName: 'submit',
  formId: 'login-form'
})

// 声明式埋点
// <button data-track="submit_btn" data-track-extra='{"formId":"login"}'>提交</button>
// <div data-track-exposure="banner_1" data-track-extra='{"position":1}'>...</div>
```

---

## 常见面试题

### 1. 设计一个前端监控系统,你会考虑哪些方面?

<details>
<summary>点击查看答案</summary>

**监控维度:**

1. **性能监控**
   - 页面加载性能 (FCP, LCP, FID, CLS)
   - 资源加载性能
   - API 响应时间
   - 长任务监控

2. **错误监控**
   - JS 运行时错误
   - Promise 异常
   - 资源加载错误
   - API 请求错误
   - 框架错误 (Vue/React)

3. **行为监控**
   - 页面访问 (PV/UV)
   - 用户点击
   - 路由变化
   - 页面停留时长

4. **技术方案**
```javascript
// 数据采集
- Performance API
- Error 事件监听
- IntersectionObserver
- MutationObserver

// 数据上报
- navigator.sendBeacon (推荐)
- fetch keepalive
- 图片打点 (降级)

// 数据处理
- 批量上报
- 数据压缩
- 采样率控制
- 失败重试
```

5. **面试加分点**
- 有 SourceMap 还原错误堆栈
- 用户行为回放
- 性能基线告警
- 自定义指标扩展
</details>

### 2. 如何设计一个支持撤销/重做的编辑器?

<details>
<summary>点击查看答案</summary>

**命令模式 + 操作栈:**

```javascript
class Editor {
  constructor() {
    this.content = ''
    this.undoStack = []
    this.redoStack = []
  }

  // 执行命令
  execute(command) {
    command.execute()
    this.undoStack.push(command)
    this.redoStack = []  // 清空重做栈
  }

  // 撤销
  undo() {
    if (this.undoStack.length === 0) return

    const command = this.undoStack.pop()
    command.undo()
    this.redoStack.push(command)
  }

  // 重做
  redo() {
    if (this.redoStack.length === 0) return

    const command = this.redoStack.pop()
    command.execute()
    this.undoStack.push(command)
  }
}

// 命令基类
class Command {
  constructor(editor) {
    this.editor = editor
  }
  execute() {}
  undo() {}
}

// 插入命令
class InsertCommand extends Command {
  constructor(editor, position, text) {
    super(editor)
    this.position = position
    this.text = text
  }

  execute() {
    const { content } = this.editor
    this.editor.content =
      content.slice(0, this.position) +
      this.text +
      content.slice(this.position)
  }

  undo() {
    const { content } = this.editor
    this.editor.content =
      content.slice(0, this.position) +
      content.slice(this.position + this.text.length)
  }
}

// 删除命令
class DeleteCommand extends Command {
  constructor(editor, position, length) {
    super(editor)
    this.position = position
    this.length = length
    this.deletedText = ''
  }

  execute() {
    const { content } = this.editor
    this.deletedText = content.slice(this.position, this.position + this.length)
    this.editor.content =
      content.slice(0, this.position) +
      content.slice(this.position + this.length)
  }

  undo() {
    const { content } = this.editor
    this.editor.content =
      content.slice(0, this.position) +
      this.deletedText +
      content.slice(this.position)
  }
}
```
</details>

### 3. WebSocket 断线重连如何实现?

<details>
<summary>点击查看答案</summary>

**核心要点:**

1. **心跳检测**: 定时发送 ping,检测连接状态
2. **断线检测**: 监听 close/error 事件
3. **重连策略**: 指数退避算法
4. **消息缓存**: 断线期间消息入队,重连后发送
5. **状态同步**: 重连后同步数据

```javascript
class ReconnectingWebSocket {
  constructor(url, options = {}) {
    this.url = url
    this.reconnectInterval = options.reconnectInterval || 1000
    this.maxReconnectInterval = options.maxReconnectInterval || 30000
    this.reconnectDecay = options.reconnectDecay || 1.5
    this.maxReconnectAttempts = options.maxReconnectAttempts || Infinity

    this.reconnectAttempts = 0
    this.messageQueue = []
    this.ws = null

    this.connect()
  }

  connect() {
    this.ws = new WebSocket(this.url)

    this.ws.onopen = () => {
      this.reconnectAttempts = 0
      this.flushQueue()
      this.startHeartbeat()
    }

    this.ws.onclose = () => {
      this.stopHeartbeat()
      this.reconnect()
    }

    this.ws.onerror = () => {
      this.ws.close()
    }
  }

  reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return

    const timeout = Math.min(
      this.reconnectInterval * Math.pow(this.reconnectDecay, this.reconnectAttempts),
      this.maxReconnectInterval
    )

    this.reconnectAttempts++

    setTimeout(() => {
      this.connect()
    }, timeout)
  }

  send(data) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      this.messageQueue.push(data)
    }
  }

  flushQueue() {
    while (this.messageQueue.length > 0) {
      this.send(this.messageQueue.shift())
    }
  }
}
```
</details>

---

## 总结

### 答题技巧

1. **需求分析**: 先理清核心功能和边界
2. **方案设计**: 画出系统架构图
3. **技术选型**: 说明为什么选择这个方案
4. **核心实现**: 写出关键代码
5. **优化思路**: 考虑性能、安全、扩展性
6. **实际经验**: 结合项目经验说明踩过的坑

### 加分项

- 有完整的系统设计经验
- 能从用户角度考虑体验
- 了解前沿技术方案
- 能权衡不同方案的优缺点
- 考虑异常情况和边界条件
