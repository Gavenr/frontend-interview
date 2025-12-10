# TypeScript 工程实践

## tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "esModuleInterop": true
  }
}
```

## 类型声明
```typescript
declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent
  export default component
}
```

## 实用工具类型
```typescript
Partial<T>  // 所有属性可选
Required<T>  // 所有属性必填
Readonly<T>  // 所有属性只读
Pick<T, K>  // 选择部分属性
Omit<T, K>  // 忽略部分属性
```
