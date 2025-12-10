import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '前端面试宝典',
  description: '前端工程师面试知识体系',
  lang: 'zh-CN',
  base: '/frontend-interview/',  // 改为你的仓库名

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '基础', items: [{ text: 'HTML', link: '/html/' }, { text: 'CSS', link: '/css/' }, { text: 'JavaScript', link: '/javascript/' }, { text: 'TypeScript', link: '/typescript/' }] },
      { text: '框架', items: [{ text: 'Vue', link: '/vue/' }, { text: 'React', link: '/react/' }] },
      { text: '网络与浏览器', items: [{ text: '网络协议', link: '/network/' }, { text: '浏览器原理', link: '/browser/' }] },
      { text: '工程化', items: [{ text: '构建工具', link: '/engineering/' }, { text: '性能优化', link: '/performance/' }, { text: '微前端', link: '/micro-frontend/' }] },
      { text: '进阶', items: [{ text: '设计模式', link: '/design-patterns/' }, { text: '场景题', link: '/scenarios/' }, { text: '算法', link: '/algorithm/' }, { text: '跨端开发', link: '/cross-platform/' }, { text: 'AI', link: '/ai/' }] }
    ],

    sidebar: {
      '/javascript/': [
        {
          text: 'JavaScript 核心',
          items: [
            { text: '基础概念', link: '/javascript/' },
            { text: '数据类型与类型转换', link: '/javascript/data-types' },
            { text: '作用域与闭包', link: '/javascript/scope-closure' },
            { text: '原型与继承', link: '/javascript/prototype' },
            { text: 'this 指向', link: '/javascript/this' },
            { text: '异步编程', link: '/javascript/async' },
            { text: 'ES6+ 新特性', link: '/javascript/es6' },
            { text: '手写代码实现', link: '/javascript/handwriting' }
          ]
        }
      ],

      '/typescript/': [
        {
          text: 'TypeScript',
          items: [
            { text: 'TypeScript 基础', link: '/typescript/' },
            { text: '类型系统', link: '/typescript/type-system' },
            { text: '高级类型', link: '/typescript/advanced-types' },
            { text: '泛型', link: '/typescript/generics' },
            { text: '工程实践', link: '/typescript/practice' }
          ]
        }
      ],

      '/vue/': [
        {
          text: 'Vue 框架',
          items: [
            { text: 'Vue 核心原理', link: '/vue/' },
            { text: '响应式原理', link: '/vue/reactivity' },
            { text: '虚拟 DOM 与 Diff', link: '/vue/virtual-dom' },
            { text: '组件通信', link: '/vue/communication' },
            { text: '生命周期', link: '/vue/lifecycle' },
            { text: 'Composition API', link: '/vue/composition-api' },
            { text: 'Vue Router', link: '/vue/router' },
            { text: 'Pinia/Vuex', link: '/vue/state-management' },
            { text: 'Vue 3 vs Vue 2', link: '/vue/vue3-vs-vue2' },
            { text: 'Nuxt.js', link: '/vue/nuxt' }
          ]
        }
      ],

      '/react/': [
        {
          text: 'React 框架',
          items: [
            { text: 'React 核心原理', link: '/react/' },
            { text: 'Fiber 架构', link: '/react/fiber' },
            { text: 'Hooks 原理', link: '/react/hooks' },
            { text: '状态管理', link: '/react/state-management' },
            { text: '性能优化', link: '/react/optimization' },
            { text: 'React Router', link: '/react/router' },
            { text: 'Next.js', link: '/react/nextjs' }
          ]
        }
      ],

      '/network/': [
        {
          text: '网络与HTTP',
          items: [
            { text: '网络协议', link: '/network/' },
            { text: 'HTTP/HTTPS', link: '/network/http' },
            { text: 'TCP/UDP', link: '/network/tcp-udp' },
            { text: 'WebSocket', link: '/network/websocket' },
            { text: '跨域解决方案', link: '/network/cors' },
            { text: '网络安全', link: '/network/security' }
          ]
        }
      ],

      '/browser/': [
        {
          text: '浏览器原理',
          items: [
            { text: '浏览器架构', link: '/browser/' },
            { text: '渲染原理', link: '/browser/rendering' },
            { text: '事件循环', link: '/browser/event-loop' },
            { text: '浏览器缓存', link: '/browser/cache' },
            { text: '浏览器存储', link: '/browser/storage' },
            { text: 'Observer API', link: '/browser/observer-api' }
          ]
        }
      ],

      '/performance/': [
        {
          text: '性能优化',
          items: [
            { text: '性能优化概述', link: '/performance/' },
            { text: '加载性能优化', link: '/performance/loading' },
            { text: '运行时性能优化', link: '/performance/runtime' },
            { text: '构建优化', link: '/performance/build' },
            { text: '性能监控', link: '/performance/monitoring' }
          ]
        }
      ],

      '/engineering/': [
        {
          text: '工程化',
          items: [
            { text: '工程化概述', link: '/engineering/' },
            { text: 'Webpack', link: '/engineering/webpack' },
            { text: 'Vite', link: '/engineering/vite' },
            { text: 'Babel', link: '/engineering/babel' },
            { text: 'CI/CD', link: '/engineering/cicd' },
            { text: 'Monorepo', link: '/engineering/monorepo' },
            { text: '代码规范', link: '/engineering/code-style' }
          ]
        }
      ],

      '/micro-frontend/': [
        {
          text: '微前端',
          items: [
            { text: '微前端架构', link: '/micro-frontend/' },
            { text: 'qiankun', link: '/micro-frontend/qiankun' },
            { text: 'wujie 无界', link: '/micro-frontend/wujie' },
            { text: 'Micro App', link: '/micro-frontend/micro-app' },
            { text: 'Module Federation', link: '/micro-frontend/module-federation' }
          ]
        }
      ],

      '/cross-platform/': [
        {
          text: '跨端开发',
          items: [
            { text: '跨端方案对比', link: '/cross-platform/' },
            { text: 'uni-app', link: '/cross-platform/uniapp' },
            { text: 'Taro', link: '/cross-platform/taro' },
            { text: '小程序原理', link: '/cross-platform/miniprogram' }
          ]
        }
      ],

      '/ai/': [
        {
          text: 'AI 与前端',
          items: [
            { text: 'AI 前端应用', link: '/ai/' },
            { text: 'ChatGPT 集成', link: '/ai/chatgpt' },
            { text: 'AI 辅助开发', link: '/ai/ai-coding' },
            { text: '大模型应用', link: '/ai/llm' }
          ]
        }
      ],

      '/scenarios/': [
        {
          text: '场景题',
          items: [
            { text: '场景题概述', link: '/scenarios/' },
            { text: '系统设计', link: '/scenarios/system-design' },
            { text: '问题排查', link: '/scenarios/debugging' },
            { text: '架构设计', link: '/scenarios/architecture' },
            { text: '大文件上传', link: '/scenarios/file-upload' }
          ]
        }
      ],

      
      '/design-patterns/': [
        {
          text: '设计模式',
          items: [
            { text: '设计模式概述', link: '/design-patterns/' },
            { text: '单例模式', link: '/design-patterns/singleton' },
            { text: '观察者模式', link: '/design-patterns/observer' },
            { text: '工厂模式', link: '/design-patterns/factory' },
            { text: '策略模式', link: '/design-patterns/strategy' },
            { text: '代理模式', link: '/design-patterns/proxy' },
            { text: '装饰器模式', link: '/design-patterns/decorator' }
          ]
        }
      ],

'/algorithm/': [
        {
          text: '算法与数据结构',
          items: [
            { text: '算法基础', link: '/algorithm/' },
            { text: '数据结构', link: '/algorithm/data-structure' },
            { text: '常见算法', link: '/algorithm/common' },
            { text: '前端算法题', link: '/algorithm/frontend' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com' }
    ],

    search: {
      provider: 'local'
    },

    outline: {
      level: [2, 3],
      label: '目录'
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    lastUpdated: {
      text: '最后更新于'
    }
  }
})
