# Taro

## 什么是 Taro?
多端统一开发框架，支持 React/Vue。

## 基本使用
```jsx
import { View, Text } from '@tarojs/components'

function App() {
  return (
    <View>
      <Text>Hello Taro!</Text>
    </View>
  )
}
```

## 配置
```javascript
// config/index.js
export default {
  projectName: 'myApp',
  framework: 'react',
  outputRoot: 'dist',
  plugins: [],
  defineConstants: {},
  mini: {},
  h5: {}
}
```

## 路由
```javascript
import Taro from '@tarojs/taro'

Taro.navigateTo({ url: '/pages/detail/index' })
```
