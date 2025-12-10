# Module Federation

## 什么是 Module Federation?
Webpack 5 的模块联邦功能，实现运行时共享模块。

## 配置
```javascript
// 远程应用
new ModuleFederationPlugin({
  name: 'remote',
  filename: 'remoteEntry.js',
  exposes: {
    './Button': './src/Button'
  },
  shared: ['react', 'react-dom']
})

// 主应用
new ModuleFederationPlugin({
  name: 'host',
  remotes: {
    remote: 'remote@http://localhost:3001/remoteEntry.js'
  },
  shared: ['react', 'react-dom']
})
```

## 使用
```javascript
import React, { lazy } from 'react'

const RemoteButton = lazy(() => import('remote/Button'))

function App() {
  return (
    <Suspense fallback="Loading...">
      <RemoteButton />
    </Suspense>
  )
}
```
