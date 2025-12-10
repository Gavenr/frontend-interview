# 小程序原理

## 双线程架构
- 渲染层 - WebView
- 逻辑层 - JSCore

## 生命周期
```javascript
// 页面生命周期
Page({
  onLoad() {},
  onShow() {},
  onReady() {},
  onHide() {},
  onUnload() {}
})

// 组件生命周期
Component({
  lifetimes: {
    created() {},
    attached() {},
    ready() {},
    detached() {}
  }
})
```

## 通信
- setData
- 事件系统
- 页面间通信
