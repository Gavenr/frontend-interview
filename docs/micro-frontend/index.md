# 微前端架构

## 概述

微前端是一种将单体前端应用拆分成多个独立的、可独立开发和部署的小型前端应用的架构风格,是微服务理念在前端的延伸。

## 什么是微前端?

### 官方定义
微前端(Micro Frontends)是一种将多个可以独立交付的前端应用组合成一个更大整体的架构风格。各个前端应用可以独立开发、独立测试、独立部署。

### 通俗理解
想象一个大型电商网站:
- **首页**由团队 A 负责,用 Vue 开发
- **商品页**由团队 B 负责,用 React 开发
- **购物车**由团队 C 负责,用 Angular 开发

微前端让这三个团队可以**独立工作**,最后**组合**成一个完整的网站,用户感觉不到任何区别。

## 为什么需要微前端?

### 解决的问题

```javascript
// 单体应用的问题:
/*
1. 代码耦合严重
   - 一个 bug 可能影响整个应用
   - 代码冲突频繁

2. 技术栈锁定
   - 无法使用新技术
   - 迁移成本高

3. 团队协作困难
   - 多个团队修改同一个代码库
   - 部署相互阻塞

4. 构建部署慢
   - 改一行代码要重新构建整个应用
   - 部署风险高
*/

// 微前端的优势:
/*
1. 技术栈无关
   - 各个子应用可以使用不同的技术栈
   - 可以渐进式迁移

2. 独立开发部署
   - 团队独立工作
   - 快速迭代

3. 增量升级
   - 可以逐步替换老系统
   - 降低风险

4. 代码隔离
   - 样式隔离
   - JS 沙箱隔离
*/
```

---

## 主流方案

### 1. qiankun (蚂蚁金服)

#### 特点
- 基于 single-spa 封装
- 开箱即用
- HTML Entry 接入方式
- 样式隔离、JS 沙箱
- 资源预加载

#### 基础使用

```javascript
// 主应用 (main.js)
import { registerMicroApps, start } from 'qiankun';

// 注册子应用
registerMicroApps([
  {
    name: 'vue-app',              // 子应用名称
    entry: '//localhost:8080',    // 子应用入口
    container: '#subapp-viewport', // 挂载容器
    activeRule: '/vue',           // 激活路由
  },
  {
    name: 'react-app',
    entry: '//localhost:3000',
    container: '#subapp-viewport',
    activeRule: '/react',
  }
]);

// 启动 qiankun
start({
  prefetch: true,      // 预加载
  sandbox: {
    strictStyleIsolation: true,  // 样式严格隔离
    experimentalStyleIsolation: true
  }
});

// 主应用 HTML
/*
<div id="app">
  <nav>
    <router-link to="/vue">Vue子应用</router-link>
    <router-link to="/react">React子应用</router-link>
  </nav>
  <div id="subapp-viewport"></div>
</div>
*/
```

```javascript
// Vue 子应用改造 (main.js)
let instance = null;

function render(props = {}) {
  const { container } = props;

  instance = new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount(container ? container.querySelector('#app') : '#app');
}

// 独立运行
if (!window.__POWERED_BY_QIANKUN__) {
  render();
}

// 生命周期: bootstrap
export async function bootstrap() {
  console.log('vue app bootstraped');
}

// 生命周期: mount
export async function mount(props) {
  console.log('vue app mounted', props);
  render(props);
}

// 生命周期: unmount
export async function unmount() {
  instance.$destroy();
  instance.$el.innerHTML = '';
  instance = null;
}

// 配置 webpack (vue.config.js)
module.exports = {
  devServer: {
    port: 8080,
    headers: {
      'Access-Control-Allow-Origin': '*'  // 允许跨域
    }
  },
  configureWebpack: {
    output: {
      library: 'vueApp',
      libraryTarget: 'umd',
      jsonpFunction: `webpackJsonp_vueApp`
    }
  }
};
```

#### 通信方案

```javascript
// 方式1: Props 传递
registerMicroApps([
  {
    name: 'vue-app',
    entry: '//localhost:8080',
    container: '#subapp-viewport',
    activeRule: '/vue',
    props: {
      data: { user: 'Alice' },
      onGlobalStateChange: () => {},
      setGlobalState: () => {}
    }
  }
]);

// 方式2: 全局状态管理
import { initGlobalState } from 'qiankun';

// 主应用
const actions = initGlobalState({
  user: 'Alice',
  token: 'xxx'
});

actions.onGlobalStateChange((state, prev) => {
  console.log('State changed:', state, prev);
});

actions.setGlobalState({
  user: 'Bob'
});

// 子应用
export function mount(props) {
  props.onGlobalStateChange((state, prev) => {
    console.log('Sub app state:', state);
  });

  props.setGlobalState({
    user: 'Charlie'
  });
}

// 方式3: 自定义事件总线
// 主应用
window.eventBus = new Vue();

// 子应用
window.eventBus.$emit('event', data);
window.eventBus.$on('event', handler);
```

---

### 2. Micro App (京东)

#### 特点
- 基于 WebComponent
- 零依赖
- 接入简单
- 性能更好

#### 基础使用

```javascript
// 1. 安装
npm install @micro-zoe/micro-app

// 2. 主应用注册 (main.js)
import microApp from '@micro-zoe/micro-app';

microApp.start();

// 3. 使用子应用 (直接使用标签)
<template>
  <div>
    <micro-app
      name="vue-app"
      url="http://localhost:8080"
      baseroute="/vue"
    ></micro-app>
  </div>
</template>

// 4. 子应用无需改造!
// 只需配置跨域即可
module.exports = {
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
};
```

#### 通信方案

```javascript
// 主应用发送数据
<micro-app
  name="vue-app"
  url="http://localhost:8080"
  :data="microAppData"
></micro-app>

export default {
  data() {
    return {
      microAppData: { msg: 'Hello' }
    };
  }
};

// 子应用接收数据
// 方式1: 监听 datachange 事件
window.addEventListener('datachange', (e) => {
  console.log('来自主应用的数据:', e.detail.data);
});

// 方式2: 主动获取
const data = window.microApp.getData();

// 子应用向主应用发送数据
window.microApp.dispatch({ msg: 'Hello from sub app' });

// 主应用接收
<micro-app
  name="vue-app"
  url="http://localhost:8080"
  @datachange="handleDataChange"
></micro-app>

methods: {
  handleDataChange(e) {
    console.log('来自子应用的数据:', e.detail.data);
  }
}
```

---

### 3. Module Federation (Webpack 5)

#### 特点
- Webpack 5 原生支持
- 运行时加载
- 共享依赖
- 适合同技术栈

#### 基础使用

```javascript
// 远程应用 (remote-app)
// webpack.config.js
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'remoteApp',
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/components/Button',
        './utils': './src/utils'
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true }
      }
    })
  ]
};

// 主应用 (host-app)
// webpack.config.js
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'hostApp',
      remotes: {
        remoteApp: 'remoteApp@http://localhost:3001/remoteEntry.js'
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true }
      }
    })
  ]
};

// 使用远程组件
import React, { lazy, Suspense } from 'react';

const RemoteButton = lazy(() => import('remoteApp/Button'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RemoteButton />
    </Suspense>
  );
}
```

---

## 核心问题解决

### 1. 样式隔离

```javascript
// qiankun 方案1: Scoped CSS
start({
  sandbox: {
    strictStyleIsolation: true  // Shadow DOM 严格隔离
  }
});

// qiankun 方案2: CSS Modules
start({
  sandbox: {
    experimentalStyleIsolation: true  // 添加特定前缀
  }
});

// 自定义方案: CSS Namespace
// 主应用
.main-app {
  .button { color: red; }
}

// 子应用
.sub-app-vue {
  .button { color: blue; }
}

// 自定义方案: CSS-in-JS
const Button = styled.button`
  color: ${props => props.color};
`;
```

### 2. JS 沙箱隔离

```javascript
// qiankun 内置三种沙箱:

// 1. SnapshotSandbox (快照沙箱)
// - 浏览器不支持 Proxy 时使用
// - 激活时记录 window 快照
// - 失活时恢复快照

// 2. LegacySandbox (代理沙箱)
// - 使用 Proxy 代理 window
// - 记录新增和修改的属性
// - 失活时清理

// 3. ProxySandbox (新代理沙箱)
// - 创建 fakeWindow
// - 完全隔离

// 简易沙箱实现
class Sandbox {
  constructor() {
    this.proxy = null;
    this.running = false;
    this.init();
  }

  init() {
    const fakeWindow = Object.create(null);
    const originalWindow = window;

    this.proxy = new Proxy(fakeWindow, {
      get(target, key) {
        // 优先从 fakeWindow 取
        if (key in target) {
          return target[key];
        }
        // 否则从真实 window 取
        return originalWindow[key];
      },

      set(target, key, value) {
        if (this.running) {
          target[key] = value;
        }
        return true;
      }
    });
  }

  active() {
    this.running = true;
  }

  inactive() {
    this.running = false;
  }
}

// 使用
const sandbox = new Sandbox();
sandbox.active();

// 在沙箱中执行代码
(function(window) {
  window.globalVar = 'sub app';
  console.log(window.globalVar);
}).call(sandbox.proxy, sandbox.proxy);

sandbox.inactive();
```

### 3. 路由同步

```javascript
// 主应用路由配置
const routes = [
  { path: '/', component: Home },
  {
    path: '/vue/*',
    component: MicroAppContainer,
    meta: { microApp: 'vue-app' }
  },
  {
    path: '/react/*',
    component: MicroAppContainer,
    meta: { microApp: 'react-app' }
  }
];

// 子应用路由配置 (base 模式)
const router = new VueRouter({
  mode: 'history',
  base: window.__POWERED_BY_QIANKUN__ ? '/vue' : '/',
  routes
});

// 监听主应用路由变化
export function mount(props) {
  props.onGlobalStateChange((state) => {
    // 同步路由
    const { route } = state;
    router.push(route);
  });
}
```

---

## 实战案例

### 渐进式迁移老系统

```javascript
// 场景: 将 jQuery 老系统迁移到 Vue

// 1. 主应用(新系统) - Vue
const app = createApp(App);
app.mount('#app');

// 2. 注册老系统为子应用
registerMicroApps([
  {
    name: 'legacy-app',
    entry: '//localhost:8081',
    container: '#legacy-container',
    activeRule: '/legacy'
  }
]);

// 3. 逐步迁移
// 先迁移一个页面到 Vue
// 测试稳定后,再迁移下一个页面
// 最终完全替换

// 优势:
// - 无需一次性重写
// - 降低风险
// - 业务不中断
```

---

## 总结

### 核心要点
1. **技术选型**: qiankun 适合中大型项目,Micro App 更轻量
2. **样式隔离**: Shadow DOM、Scoped CSS、CSS Namespace
3. **JS 隔离**: Proxy 沙箱、快照沙箱
4. **通信方案**: Props、全局状态、事件总线
5. **路由管理**: 主子应用路由同步

### 面试加分项
- 有微前端实际项目经验
- 了解不同方案的优缺点
- 能解释沙箱隔离原理
- 知道如何处理公共依赖
- 理解微前端的适用场景
