# 类型系统

## 基础类型
- number, string, boolean
- null, undefined
- any, unknown, never, void

## 对象类型
```typescript
type User = {
  name: string
  age: number
}
```

## 数组和元组
```typescript
let arr: number[] = [1, 2, 3]
let tuple: [string, number] = ['hello', 1]
```

## 函数类型
```typescript
type AddFn = (a: number, b: number) => number
```
