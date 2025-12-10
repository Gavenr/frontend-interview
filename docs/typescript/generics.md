# TypeScript 泛型

## 什么是泛型？

泛型是一种创建可重用组件的工具，它可以支持多种类型而不是单一类型，同时保持类型安全。

```typescript
// 不使用泛型 - 失去类型信息
function identity(arg: any): any {
  return arg;
}

// 使用泛型 - 保持类型安全
function identity<T>(arg: T): T {
  return arg;
}

// 使用
const num = identity<number>(42);        // 显式指定类型
const str = identity('hello');           // 类型推断
```

## 泛型函数

```typescript
// 基本泛型函数
function getFirst<T>(arr: T[]): T | undefined {
  return arr[0];
}

// 多个类型参数
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

// 箭头函数泛型
const getLength = <T extends { length: number }>(arg: T): number => {
  return arg.length;
};

// 在 TSX 中需要加逗号避免与 JSX 混淆
const fn = <T,>(arg: T): T => arg;
```

## 泛型接口

```typescript
// 泛型接口
interface Container<T> {
  value: T;
  getValue(): T;
}

// 泛型接口实现
class Box<T> implements Container<T> {
  constructor(public value: T) {}
  getValue(): T {
    return this.value;
  }
}

// 泛型函数接口
interface GenericFn<T> {
  (arg: T): T;
}

const myIdentity: GenericFn<number> = (arg) => arg;
```

## 泛型类

```typescript
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }
}

const numberStack = new Stack<number>();
numberStack.push(1);
numberStack.push(2);

const stringStack = new Stack<string>();
stringStack.push('hello');
```

## 泛型约束

```typescript
// 基本约束
interface Lengthwise {
  length: number;
}

function logLength<T extends Lengthwise>(arg: T): number {
  return arg.length;
}

logLength('hello');      // OK
logLength([1, 2, 3]);    // OK
logLength({ length: 5 }); // OK
// logLength(42);        // Error: number 没有 length 属性

// 使用 keyof 约束
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person = { name: 'Alice', age: 25 };
getProperty(person, 'name');  // OK
// getProperty(person, 'email'); // Error

// 多重约束
interface HasId { id: number; }
interface HasName { name: string; }

function process<T extends HasId & HasName>(obj: T): string {
  return `${obj.id}: ${obj.name}`;
}
```

## 泛型条件类型

```typescript
// 条件类型
type IsString<T> = T extends string ? 'yes' : 'no';

type A = IsString<string>;  // 'yes'
type B = IsString<number>;  // 'no'

// infer 关键字 - 类型推断
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type FnReturn = ReturnType<() => string>;  // string

// 获取数组元素类型
type ArrayElement<T> = T extends (infer E)[] ? E : never;

type Elem = ArrayElement<string[]>;  // string

// 获取 Promise 值类型
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type PromiseValue = UnwrapPromise<Promise<number>>;  // number
```

## 泛型工具类型

```typescript
// Partial - 所有属性可选
type Partial<T> = {
  [P in keyof T]?: T[P];
};

// Required - 所有属性必填
type Required<T> = {
  [P in keyof T]-?: T[P];
};

// Readonly - 所有属性只读
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

// Pick - 选取部分属性
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// Omit - 排除部分属性
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

// Record - 构造对象类型
type Record<K extends keyof any, T> = {
  [P in K]: T;
};

// 使用示例
interface User {
  id: number;
  name: string;
  email: string;
}

type PartialUser = Partial<User>;
type UserName = Pick<User, 'name'>;
type UserWithoutId = Omit<User, 'id'>;
```

## 实际应用

### API 响应封装

```typescript
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

async function fetchData<T>(url: string): Promise<ApiResponse<T>> {
  const res = await fetch(url);
  return res.json();
}

// 使用
interface User {
  id: number;
  name: string;
}

const response = await fetchData<User>('/api/user/1');
console.log(response.data.name);  // 类型安全
```

### 状态管理

```typescript
function createStore<T>(initialState: T) {
  let state = initialState;
  const listeners: Array<(state: T) => void> = [];

  return {
    getState: () => state,
    setState: (newState: Partial<T>) => {
      state = { ...state, ...newState };
      listeners.forEach(listener => listener(state));
    },
    subscribe: (listener: (state: T) => void) => {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        listeners.splice(index, 1);
      };
    }
  };
}

// 使用
const userStore = createStore({ name: '', age: 0 });
userStore.setState({ name: 'Alice' });  // 类型检查
```

## 常见面试题

### 1. 泛型和 any 的区别？

```typescript
// any - 放弃类型检查
function fn1(arg: any): any {
  return arg;
}
const a = fn1(42);  // a 是 any，失去类型信息

// 泛型 - 保持类型关系
function fn2<T>(arg: T): T {
  return arg;
}
const b = fn2(42);  // b 是 number，类型安全
```

### 2. 什么是泛型约束？

```typescript
// 泛型约束用于限制泛型参数必须满足某些条件
// 使用 extends 关键字

interface HasLength {
  length: number;
}

// T 必须有 length 属性
function getLength<T extends HasLength>(arg: T): number {
  return arg.length;
}
```

### 3. 解释 infer 关键字

```typescript
// infer 用于在条件类型中推断类型
// 只能在 extends 子句中使用

// 提取函数返回类型
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// 提取函数参数类型
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

// 提取构造函数实例类型
type InstanceType<T> = T extends new (...args: any[]) => infer R ? R : never;
```
