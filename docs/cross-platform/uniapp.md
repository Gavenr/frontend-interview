# uni-app 跨端开发

## 什么是 uni-app?

### 官方定义
uni-app 是一个使用 Vue.js 开发所有前端应用的框架,开发者编写一套代码,可发布到iOS、Android、Web(响应式)、各种小程序(微信/支付宝/百度/头条/飞书/QQ/快手/钉钉/淘宝)、快应用等多个平台。

### 核心特点

```javascript
/*
1. 一套代码,多端发布
   - 10+ 个平台
   - 降低开发成本

2. 基于 Vue.js
   - 熟悉的语法
   - 丰富的生态

3. 完整的组件库
   - 内置组件
   - 插件市场

4. 条件编译
   - 平台差异处理
   - 灵活的代码组织
*/
```

## 目录结构

```
uni-app项目
├── pages                // 页面文件
│   ├── index
│   │   └── index.vue
│   └── detail
│       └── detail.vue
├── components           // 组件
│   └── my-component.vue
├── static              // 静态资源
│   └── logo.png
├── uni_modules         // uni_modules 模块
├── App.vue             // 应用配置
├── main.js             // 入口文件
├── manifest.json       // 应用配置
└── pages.json          // 页面路由配置
```

## 核心配置

### pages.json

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "首页",
        "enablePullDownRefresh": true
      }
    },
    {
      "path": "pages/detail/detail",
      "style": {
        "navigationBarTitleText": "详情"
      }
    }
  ],
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "uni-app",
    "navigationBarBackgroundColor": "#F8F8F8",
    "backgroundColor": "#F8F8F8"
  },
  "tabBar": {
    "color": "#7A7E83",
    "selectedColor": "#3cc51f",
    "borderStyle": "black",
    "backgroundColor": "#ffffff",
    "list": [
      {
        "pagePath": "pages/index/index",
        "iconPath": "static/home.png",
        "selectedIconPath": "static/home-active.png",
        "text": "首页"
      },
      {
        "pagePath": "pages/my/my",
        "iconPath": "static/my.png",
        "selectedIconPath": "static/my-active.png",
        "text": "我的"
      }
    ]
  }
}
```

## 条件编译

### 平台判断

```vue
<template>
  <view>
    <!-- #ifdef MP-WEIXIN -->
    <view>微信小程序特有</view>
    <!-- #endif -->

    <!-- #ifdef H5 -->
    <view>H5特有</view>
    <!-- #endif -->

    <!-- #ifdef APP-PLUS -->
    <view>App特有</view>
    <!-- #endif -->

    <!-- #ifndef H5 -->
    <view>除H5外的平台</view>
    <!-- #endif -->
  </view>
</template>

<script>
export default {
  onLoad() {
    // #ifdef MP-WEIXIN
    console.log('微信小程序')
    // #endif

    // #ifdef H5
    console.log('H5')
    // #endif
  }
}
</script>

<style>
/* #ifdef MP-WEIXIN */
.weixin-only {
  color: red;
}
/* #endif */

/* #ifdef H5 */
.h5-only {
  color: blue;
}
/* #endif */
</style>
```

### 组合条件

```javascript
// #ifdef MP-WEIXIN || MP-ALIPAY
console.log('微信或支付宝小程序')
// #endif

// #ifdef MP-WEIXIN && !H5
console.log('微信小程序且不是H5')
// #endif
```

## 生命周期

### 应用生命周期

```javascript
// App.vue
export default {
  onLaunch(options) {
    console.log('App Launch', options)
    // 应用启动
  },

  onShow(options) {
    console.log('App Show', options)
    // 应用显示
  },

  onHide() {
    console.log('App Hide')
    // 应用隐藏
  }
}
```

### 页面生命周期

```javascript
export default {
  onLoad(options) {
    console.log('Page Load', options)
    // 页面加载,接收参数
  },

  onShow() {
    console.log('Page Show')
    // 页面显示
  },

  onReady() {
    console.log('Page Ready')
    // 页面初次渲染完成
  },

  onHide() {
    console.log('Page Hide')
    // 页面隐藏
  },

  onUnload() {
    console.log('Page Unload')
    // 页面卸载
  },

  // 下拉刷新
  onPullDownRefresh() {
    console.log('Pull Down Refresh')
    setTimeout(() => {
      uni.stopPullDownRefresh()
    }, 1000)
  },

  // 上拉加载
  onReachBottom() {
    console.log('Reach Bottom')
    this.loadMore()
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '分享标题',
      path: '/pages/index/index'
    }
  }
}
```

## 路由与导航

```javascript
// 跳转到非tabBar页面
uni.navigateTo({
  url: '/pages/detail/detail?id=123',
  success: (res) => {
    console.log('跳转成功')
  }
})

// 跳转到tabBar页面
uni.switchTab({
  url: '/pages/index/index'
})

// 关闭当前页面,跳转
uni.redirectTo({
  url: '/pages/detail/detail'
})

// 返回上一页
uni.navigateBack({
  delta: 1  // 返回的页面数
})

// 关闭所有页面,打开某页面
uni.reLaunch({
  url: '/pages/index/index'
})

// 预加载页面
uni.preloadPage({
  url: '/pages/detail/detail'
})
```

## API 使用

### 网络请求

```javascript
// 封装请求
class Request {
  constructor(baseURL) {
    this.baseURL = baseURL
  }

  request(options) {
    return new Promise((resolve, reject) => {
      uni.request({
        url: this.baseURL + options.url,
        method: options.method || 'GET',
        data: options.data || {},
        header: {
          'Content-Type': 'application/json',
          'Authorization': uni.getStorageSync('token') || '',
          ...options.header
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(res)
          }
        },
        fail: reject
      })
    })
  }

  get(url, data) {
    return this.request({ url, data, method: 'GET' })
  }

  post(url, data) {
    return this.request({ url, data, method: 'POST' })
  }
}

// 使用
const request = new Request('https://api.example.com')

request.get('/users', { page: 1 })
  .then(data => console.log(data))
  .catch(err => console.error(err))
```

### 数据缓存

```javascript
// 同步存储
uni.setStorageSync('key', 'value')
const value = uni.getStorageSync('key')
uni.removeStorageSync('key')
uni.clearStorageSync()

// 异步存储
uni.setStorage({
  key: 'user',
  data: { name: 'Alice', age: 18 },
  success: () => {
    console.log('存储成功')
  }
})

uni.getStorage({
  key: 'user',
  success: (res) => {
    console.log('用户信息:', res.data)
  }
})

// 封装存储工具
const Storage = {
  set(key, value) {
    try {
      uni.setStorageSync(key, JSON.stringify(value))
    } catch (e) {
      console.error('存储失败:', e)
    }
  },

  get(key) {
    try {
      const value = uni.getStorageSync(key)
      return value ? JSON.parse(value) : null
    } catch (e) {
      return null
    }
  },

  remove(key) {
    uni.removeStorageSync(key)
  },

  clear() {
    uni.clearStorageSync()
  }
}
```

### 文件上传

```javascript
// 选择图片
uni.chooseImage({
  count: 1,
  sizeType: ['compressed'],
  sourceType: ['album', 'camera'],
  success: (res) => {
    const tempFilePath = res.tempFilePaths[0]

    // 上传文件
    uni.uploadFile({
      url: 'https://api.example.com/upload',
      filePath: tempFilePath,
      name: 'file',
      formData: {
        user: 'test'
      },
      success: (uploadRes) => {
        console.log('上传成功:', uploadRes.data)
      }
    })
  }
})

// 封装上传
function uploadImage() {
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count: 1,
      success: (chooseRes) => {
        uni.showLoading({ title: '上传中' })

        uni.uploadFile({
          url: 'https://api.example.com/upload',
          filePath: chooseRes.tempFilePaths[0],
          name: 'file',
          success: (uploadRes) => {
            uni.hideLoading()
            const data = JSON.parse(uploadRes.data)
            resolve(data.url)
          },
          fail: (err) => {
            uni.hideLoading()
            reject(err)
          }
        })
      },
      fail: reject
    })
  })
}

// 使用
uploadImage()
  .then(url => {
    console.log('图片URL:', url)
  })
  .catch(err => {
    console.error('上传失败:', err)
  })
```

## 性能优化

### 分包加载

```json
// pages.json
{
  "pages": [
    {
      "path": "pages/index/index"
    }
  ],
  "subPackages": [
    {
      "root": "pages-sub",
      "pages": [
        {
          "path": "detail/detail"
        }
      ]
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["pages-sub"]
    }
  }
}
```

### 图片优化

```vue
<template>
  <!-- 懒加载 -->
  <image
    :src="imageUrl"
    mode="aspectFill"
    lazy-load
    @load="onImageLoad"
    @error="onImageError"
  ></image>
</template>

<script>
export default {
  data() {
    return {
      imageUrl: ''
    }
  },

  methods: {
    onImageLoad() {
      console.log('图片加载成功')
    },

    onImageError() {
      // 加载失败,使用默认图
      this.imageUrl = '/static/default.png'
    }
  }
}
</script>
```

### 长列表优化

```vue
<template>
  <scroll-view
    scroll-y
    :scroll-top="scrollTop"
    @scrolltolower="loadMore"
  >
    <view v-for="item in list" :key="item.id">
      {{ item.title }}
    </view>
  </scroll-view>
</template>

<script>
export default {
  data() {
    return {
      list: [],
      page: 1,
      loading: false
    }
  },

  methods: {
    async loadMore() {
      if (this.loading) return

      this.loading = true
      const data = await this.fetchData(this.page)
      this.list.push(...data)
      this.page++
      this.loading = false
    }
  }
}
</script>
```

## 常见问题

### 1. 如何实现跨端兼容?

```javascript
// 使用条件编译
// #ifdef MP-WEIXIN
wx.scanCode()
// #endif

// #ifdef H5
// H5 使用第三方库
// #endif

// 封装统一接口
const scan = {
  // #ifdef MP-WEIXIN
  scanCode() {
    return new Promise((resolve, reject) => {
      wx.scanCode({
        success: resolve,
        fail: reject
      })
    })
  }
  // #endif

  // #ifdef H5
  scanCode() {
    // H5 实现
  }
  // #endif
}
```

### 2. 如何调试?

```javascript
// 1. 使用 console.log
console.log('调试信息')

// 2. 使用 HBuilderX 真机调试

// 3. 小程序开发者工具调试

// 4. Chrome DevTools (H5)

// 5. vconsole
// #ifdef H5
import VConsole from 'vconsole'
new VConsole()
// #endif
```

## 总结

### 核心要点
1. **一套代码,多端发布**
2. **条件编译处理平台差异**
3. **完整的组件和API**
4. **性能优化很重要**

### 面试加分项
- 有实际uni-app项目经验
- 了解条件编译机制
- 掌握性能优化技巧
- 熟悉各平台差异
