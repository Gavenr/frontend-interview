# Micro App

## 什么是 Micro App?
基于 WebComponent 的微前端框架。

## 特点
- 零依赖
- 接入简单
- 性能更好

## 基本使用
```javascript
// 主应用
import microApp from '@micro-zoe/micro-app'
microApp.start()

// 使用
<micro-app name="app1" url="http://localhost:3000"></micro-app>
```

## 通信
```javascript
// 主应用发送
<micro-app name="app1" :data="data"></micro-app>

// 子应用接收
window.addEventListener('datachange', (e) => {
  console.log(e.detail.data)
})

// 子应用发送
window.microApp.dispatch({ msg: 'hello' })
```
