# TypeScript 高级类型

## 联合类型与交叉类型

```typescript
// 联合类型 - 多选一
type StringOrNumber = string | number;

function printId(id: StringOrNumber) {
  if (typeof id === 'string') {
    console.log(id.toUpperCase());
  } else {
    console.log(id);
  }
}

// 交叉类型 - 合并所有
interface Person {
  name: string;
}

interface Employee {
  employeeId: number;
}

type Staff = Person & Employee;

const staff: Staff = {
  name: 'Alice',
  employeeId: 123
};
```

## 类型守卫

```typescript
// typeof 守卫
function padLeft(value: string, padding: string | number) {
  if (typeof padding === 'number') {
    return ' '.repeat(padding) + value;
  }
  return padding + value;
}

// instanceof 守卫
class Bird { fly() {} }
class Fish { swim() {} }

function move(animal: Bird | Fish) {
  if (animal instanceof Bird) {
    animal.fly();
  } else {
    animal.swim();
  }
}

// in 守卫
interface Circle { kind: 'circle'; radius: number; }
interface Square { kind: 'square'; size: number; }

function getArea(shape: Circle | Square) {
  if ('radius' in shape) {
    return Math.PI * shape.radius ** 2;
  }
  return shape.size ** 2;
}

// 自定义类型守卫
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function processValue(value: unknown) {
  if (isString(value)) {
    console.log(value.toUpperCase());  // 类型收窄为 string
  }
}
```

## 映射类型

```typescript
// 基本映射
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

// 键重映射 (TS 4.1+)
type Getters<T> = {
  [P in keyof T as \`get\${Capitalize<string & P>}\`]: () => T[P];
};

interface Person {
  name: string;
  age: number;
}

type PersonGetters = Getters<Person>;
// { getName: () => string; getAge: () => number; }

// 条件映射
type NonNullable<T> = T extends null | undefined ? never : T;
```

## 模板字面量类型

```typescript
// 基本模板字面量
type Greeting = \`Hello, \${string}\`;
const g1: Greeting = 'Hello, World';  // OK
// const g2: Greeting = 'Hi, World';  // Error

// 联合类型组合
type Direction = 'top' | 'right' | 'bottom' | 'left';
type Margin = \`margin-\${Direction}\`;
// 'margin-top' | 'margin-right' | 'margin-bottom' | 'margin-left'

// 内置字符串操作类型
type Upper = Uppercase<'hello'>;      // 'HELLO'
type Lower = Lowercase<'HELLO'>;      // 'hello'
type Cap = Capitalize<'hello'>;       // 'Hello'
type Uncap = Uncapitalize<'Hello'>;   // 'hello'
```

## 递归类型

```typescript
// JSON 类型
type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

// 深度只读
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

// 深度可选
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
};
```

## 可辨识联合

```typescript
// 使用公共属性区分类型
interface Circle {
  kind: 'circle';
  radius: number;
}

interface Rectangle {
  kind: 'rectangle';
  width: number;
  height: number;
}

interface Triangle {
  kind: 'triangle';
  base: number;
  height: number;
}

type Shape = Circle | Rectangle | Triangle;

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'rectangle':
      return shape.width * shape.height;
    case 'triangle':
      return (shape.base * shape.height) / 2;
  }
}

// 穷尽检查
function assertNever(x: never): never {
  throw new Error('Unexpected: ' + x);
}

function getAreaExhaustive(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'rectangle':
      return shape.width * shape.height;
    case 'triangle':
      return (shape.base * shape.height) / 2;
    default:
      return assertNever(shape);  // 确保处理所有情况
  }
}
```

## 常见面试题

### 1. 如何实现 DeepRequired？

```typescript
type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object
    ? DeepRequired<T[P]>
    : T[P];
};
```

### 2. 如何获取对象所有值的类型？

```typescript
type ValueOf<T> = T[keyof T];

interface Config {
  name: string;
  count: number;
  enabled: boolean;
}

type ConfigValue = ValueOf<Config>;  // string | number | boolean
```

### 3. 如何实现 Flatten 类型？

```typescript
type Flatten<T> = T extends Array<infer U> ? U : T;

type Num = Flatten<number[]>;  // number
type Str = Flatten<string>;    // string
```
