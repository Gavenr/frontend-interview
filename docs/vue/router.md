# Vue Router

## 基本使用
```javascript
const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})
```

## 路由导航
```vue
<router-link to="/about">About</router-link>
```

## 编程式导航
```javascript
router.push('/about')
router.replace('/about')
router.go(-1)
```

## 路由守卫
```javascript
router.beforeEach((to, from, next) => {
  // 权限验证
  next()
})
```
