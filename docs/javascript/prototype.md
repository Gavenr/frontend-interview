# 原型与继承

## 原型链

### 核心概念

```javascript
// 每个对象都有 __proto__ 属性,指向其构造函数的 prototype
// 每个函数都有 prototype 属性,包含 constructor 属性

function Person(name) {
  this.name = name
}

Person.prototype.sayHello = function() {
  console.log(`Hello, I'm ${this.name}`)
}

const person = new Person('Alice')

console.log(person.__proto__ === Person.prototype)  // true
console.log(Person.prototype.constructor === Person)  // true
console.log(person.__proto__.__proto__ === Object.prototype)  // true
console.log(Object.prototype.__proto__)  // null

// 原型链: person → Person.prototype → Object.prototype → null
```

### 完整原型链图

```javascript
/*
person
  ↓ __proto__
Person.prototype {
  constructor: Person,
  sayHello: function
}
  ↓ __proto__
Object.prototype {
  toString: function,
  valueOf: function,
  hasOwnProperty: function
}
  ↓ __proto__
null
*/
```

## 继承方式

### 1. 原型链继承

```javascript
function Parent() {
  this.name = 'parent'
  this.colors = ['red', 'blue']
}

Parent.prototype.getName = function() {
  return this.name
}

function Child() {
  this.type = 'child'
}

// 继承
Child.prototype = new Parent()
Child.prototype.constructor = Child

const child1 = new Child()
const child2 = new Child()

// ❌ 问题1: 引用类型共享
child1.colors.push('green')
console.log(child2.colors)  // ['red', 'blue', 'green']

// ❌ 问题2: 无法向父类构造函数传参
```

### 2. 构造函数继承

```javascript
function Parent(name) {
  this.name = name
  this.colors = ['red', 'blue']
}

Parent.prototype.getName = function() {
  return this.name
}

function Child(name, age) {
  Parent.call(this, name)  // 调用父类构造函数
  this.age = age
}

const child1 = new Child('Alice', 18)
const child2 = new Child('Bob', 20)

// ✅ 解决了引用类型共享问题
child1.colors.push('green')
console.log(child2.colors)  // ['red', 'blue']

// ✅ 可以传参
console.log(child1.name)  // 'Alice'

// ❌ 问题: 无法继承父类原型上的方法
console.log(child1.getName)  // undefined
```

### 3. 组合继承 (推荐)

```javascript
function Parent(name) {
  this.name = name
  this.colors = ['red', 'blue']
}

Parent.prototype.getName = function() {
  return this.name
}

function Child(name, age) {
  Parent.call(this, name)  // 第二次调用 Parent
  this.age = age
}

Child.prototype = new Parent()  // 第一次调用 Parent
Child.prototype.constructor = Child

const child = new Child('Alice', 18)

// ✅ 既能继承实例属性,又能继承原型方法
console.log(child.colors)  // ['red', 'blue']
console.log(child.getName())  // 'Alice'

// ❌ 问题: 调用了两次父类构造函数
```

### 4. 寄生组合继承 (最优)

```javascript
function Parent(name) {
  this.name = name
  this.colors = ['red', 'blue']
}

Parent.prototype.getName = function() {
  return this.name
}

function Child(name, age) {
  Parent.call(this, name)
  this.age = age
}

// 关键: 使用 Object.create
Child.prototype = Object.create(Parent.prototype)
Child.prototype.constructor = Child

const child = new Child('Alice', 18)

// ✅ 完美继承,只调用一次父类构造函数
console.log(child.colors)  // ['red', 'blue']
console.log(child.getName())  // 'Alice'
console.log(child instanceof Child)  // true
console.log(child instanceof Parent)  // true
```

### 5. ES6 Class 继承

```javascript
class Parent {
  constructor(name) {
    this.name = name
    this.colors = ['red', 'blue']
  }

  getName() {
    return this.name
  }
}

class Child extends Parent {
  constructor(name, age) {
    super(name)  // 必须先调用 super
    this.age = age
  }

  getAge() {
    return this.age
  }
}

const child = new Child('Alice', 18)
console.log(child.getName())  // 'Alice'
console.log(child.getAge())  // 18
```

## 手写实现

### 手写 new

```javascript
function myNew(constructor, ...args) {
  // 1. 创建新对象,原型指向构造函数的 prototype
  const obj = Object.create(constructor.prototype)

  // 2. 执行构造函数,绑定 this
  const result = constructor.apply(obj, args)

  // 3. 如果构造函数返回对象,则返回该对象,否则返回新对象
  return result instanceof Object ? result : obj
}

// 测试
function Person(name, age) {
  this.name = name
  this.age = age
}

Person.prototype.sayHello = function() {
  console.log(`Hello, I'm ${this.name}`)
}

const person = myNew(Person, 'Alice', 18)
person.sayHello()  // Hello, I'm Alice
```

### 手写 instanceof

```javascript
function myInstanceof(obj, constructor) {
  // 基本类型返回 false
  if (typeof obj !== 'object' || obj === null) {
    return false
  }

  // 获取对象的原型
  let proto = Object.getPrototypeOf(obj)

  // 循环查找原型链
  while (proto !== null) {
    if (proto === constructor.prototype) {
      return true
    }
    proto = Object.getPrototypeOf(proto)
  }

  return false
}

// 测试
console.log(myInstanceof([], Array))  // true
console.log(myInstanceof([], Object))  // true
console.log(myInstanceof('', String))  // false (基本类型)
```

### 手写 Object.create

```javascript
function myCreate(proto) {
  function F() {}
  F.prototype = proto
  return new F()
}

// 测试
const parent = { name: 'parent' }
const child = myCreate(parent)
console.log(child.__proto__ === parent)  // true
```

## 常见面试题

### 1. 说说原型链

<details>
<summary>点击查看答案</summary>

**一句话答案**: 原型链是 JavaScript 实现继承的机制，每个对象都有 `__proto__` 指向其构造函数的 `prototype`，形成一条链，直到 `null`。

**详细答案**:

```javascript
// 原型链示意图
/*
实例对象 person
    ↓ __proto__
Person.prototype  { constructor: Person, sayHello: fn }
    ↓ __proto__
Object.prototype  { toString: fn, valueOf: fn, hasOwnProperty: fn }
    ↓ __proto__
null
*/

// 代码验证
function Person(name) {
  this.name = name
}
const person = new Person('Alice')

console.log(person.__proto__ === Person.prototype)  // true
console.log(Person.prototype.__proto__ === Object.prototype)  // true
console.log(Object.prototype.__proto__ === null)  // true
```

**口语化回答**:
"原型链是 JS 实现继承的方式。简单说，每个对象都有一个隐藏属性 `__proto__`，指向创建它的构造函数的 `prototype`。当访问对象的属性时，如果对象本身没有，就会顺着 `__proto__` 往上找，一直找到 `Object.prototype`，再往上就是 `null` 了。这个链条就叫原型链。"

</details>

### 2. 如何判断属性是自身的还是原型上的?

<details>
<summary>点击查看答案</summary>

**一句话答案**: 用 `hasOwnProperty` 判断是否是自身属性，用 `in` 操作符判断包括原型链。

```javascript
const obj = { name: 'Alice' }

// hasOwnProperty - 只检查自身属性
console.log(obj.hasOwnProperty('name'))  // true
console.log(obj.hasOwnProperty('toString'))  // false

// in 运算符 - 包括原型链
console.log('name' in obj)  // true
console.log('toString' in obj)  // true

// Object.hasOwn (ES2022，推荐)
console.log(Object.hasOwn(obj, 'name'))  // true
console.log(Object.hasOwn(obj, 'toString'))  // false

// Object.keys - 只返回自身可枚举属性
console.log(Object.keys(obj))  // ['name']

// Object.getOwnPropertyNames - 自身所有属性（包括不可枚举）
console.log(Object.getOwnPropertyNames(obj))  // ['name']
```

**口语化回答**:
"用 `hasOwnProperty` 或者 ES2022 的 `Object.hasOwn` 可以判断属性是不是对象自己的。`in` 操作符会把原型链上的属性也算进去。一般遍历对象时用 `Object.keys` 就只会拿到自身的可枚举属性。"

</details>

### 3. `__proto__` 和 `prototype` 的区别？

<details>
<summary>点击查看答案</summary>

**一句话答案**: `prototype` 是函数独有的属性，`__proto__` 是所有对象都有的属性。

**对比**:

| 属性 | 所属 | 作用 |
|------|------|------|
| `prototype` | 函数 | 定义实例的原型 |
| `__proto__` | 所有对象 | 指向对象的原型 |
| `constructor` | prototype 对象 | 指向构造函数 |

```javascript
function Person() {}
const person = new Person()

// prototype 是函数的属性
console.log(Person.prototype)  // { constructor: Person }

// __proto__ 是实例的属性
console.log(person.__proto__ === Person.prototype)  // true

// constructor 指向构造函数
console.log(Person.prototype.constructor === Person)  // true

// 函数也是对象，也有 __proto__
console.log(Person.__proto__ === Function.prototype)  // true
console.log(Function.prototype.__proto__ === Object.prototype)  // true
```

**口语化回答**:
"`prototype` 是函数才有的属性，用来给实例提供原型。`__proto__` 是每个对象都有的，指向它的原型。当我们 `new` 一个构造函数时，新对象的 `__proto__` 就会指向构造函数的 `prototype`。这样实例就能访问原型上的方法了。"

</details>

### 4. new 操作符做了什么？

<details>
<summary>点击查看答案</summary>

**一句话答案**: 创建空对象、设置原型、执行构造函数、返回对象。

**四个步骤**:
1. 创建一个空对象
2. 将空对象的 `__proto__` 指向构造函数的 `prototype`
3. 将构造函数的 `this` 指向这个空对象，执行构造函数
4. 如果构造函数返回对象则返回该对象，否则返回新创建的对象

```javascript
// 手写 new
function myNew(Constructor, ...args) {
  // 1. 创建空对象，原型指向构造函数的 prototype
  const obj = Object.create(Constructor.prototype)

  // 2. 执行构造函数，绑定 this
  const result = Constructor.apply(obj, args)

  // 3. 如果构造函数返回对象，则返回该对象；否则返回新对象
  return result instanceof Object ? result : obj
}

// 测试
function Person(name) {
  this.name = name
}
const p = myNew(Person, 'Alice')
console.log(p.name)  // 'Alice'
console.log(p instanceof Person)  // true
```

**口语化回答**:
"`new` 做了四件事：第一，创建一个空对象；第二，把这个对象的原型指向构造函数的 `prototype`；第三，用这个对象作为 `this` 执行构造函数；第四，如果构造函数返回了一个对象就用那个，否则返回新创建的对象。"

</details>

### 5. ES6 class 和 ES5 构造函数的区别？

<details>
<summary>点击查看答案</summary>

**一句话答案**: class 是语法糖，本质还是原型继承，但有一些差异。

**主要区别**:

| 特性 | ES5 构造函数 | ES6 class |
|------|-------------|-----------|
| 调用方式 | 可以不用 new | 必须用 new |
| 方法枚举 | 可枚举 | 不可枚举 |
| 严格模式 | 需要手动开启 | 默认严格模式 |
| 变量提升 | 有提升 | 无提升（暂时性死区） |
| 静态方法 | 需手动添加 | 直接用 static |

```javascript
// ES5
function Person(name) {
  this.name = name
}
Person.prototype.sayHello = function() {
  console.log(`Hello, ${this.name}`)
}
Person.create = function(name) {  // 静态方法
  return new Person(name)
}

// ES6
class Person {
  constructor(name) {
    this.name = name
  }
  sayHello() {
    console.log(`Hello, ${this.name}`)
  }
  static create(name) {  // 静态方法
    return new Person(name)
  }
}

// 区别验证
// 1. 必须用 new
// Person()  // TypeError: Class constructor cannot be invoked without 'new'

// 2. 方法不可枚举
console.log(Object.keys(Person.prototype))  // []

// 3. 无变量提升
// const p = new Person()  // ReferenceError（如果写在 class 定义前）
```

**口语化回答**:
"class 本质上是构造函数的语法糖，但有一些区别。class 必须用 new 调用，不能直接当函数调。class 里的方法默认不可枚举。class 没有变量提升，必须先定义再使用。另外 class 内部默认是严格模式。"

</details>

### 6. 如何实现继承？各种方式的优缺点？

<details>
<summary>点击查看答案</summary>

**一句话答案**: 推荐使用 ES6 class extends 或寄生组合继承。

| 方式 | 优点 | 缺点 |
|------|------|------|
| 原型链继承 | 简单 | 引用类型共享、无法传参 |
| 构造函数继承 | 可传参、引用独立 | 无法继承原型方法 |
| 组合继承 | 功能完整 | 调用两次父构造函数 |
| 寄生组合继承 | 完美 | 写法稍复杂 |
| ES6 class | 简洁、官方推荐 | 需要编译 |

```javascript
// 寄生组合继承（最优方案）
function Parent(name) {
  this.name = name
  this.colors = ['red', 'blue']
}

Parent.prototype.getName = function() {
  return this.name
}

function Child(name, age) {
  Parent.call(this, name)  // 继承实例属性
  this.age = age
}

// 关键：使用 Object.create 而不是 new Parent()
Child.prototype = Object.create(Parent.prototype)
Child.prototype.constructor = Child

// ES6 class 继承（推荐）
class Parent {
  constructor(name) {
    this.name = name
  }
  getName() {
    return this.name
  }
}

class Child extends Parent {
  constructor(name, age) {
    super(name)  // 必须先调用 super
    this.age = age
  }
}
```

**口语化回答**:
"JS 继承有好几种方式。原型链继承最简单但有引用类型共享问题。构造函数继承能传参但继承不了原型方法。组合继承结合了两者但会调用两次父构造函数。寄生组合继承是 ES5 的最佳方案，用 `Object.create` 代替 `new Parent()` 来设置原型。现在最推荐的是 ES6 的 class extends，简洁明了。"

</details>

### 7. 如何实现多重继承?

<details>
<summary>点击查看答案</summary>

**一句话答案**: JavaScript 不支持多重继承，但可以用 Mixin 模式模拟。

```javascript
// Mixin 模式
const FlyMixin = {
  fly() {
    console.log(`${this.name} is flying`)
  }
}

const SwimMixin = {
  swim() {
    console.log(`${this.name} is swimming`)
  }
}

class Animal {
  constructor(name) {
    this.name = name
  }
}

// 混入多个功能
Object.assign(Animal.prototype, FlyMixin, SwimMixin)

const duck = new Animal('Duck')
duck.fly()   // Duck is flying
duck.swim()  // Duck is swimming

// 更优雅的写法：高阶函数
function withFly(Base) {
  return class extends Base {
    fly() {
      console.log(`${this.name} is flying`)
    }
  }
}

function withSwim(Base) {
  return class extends Base {
    swim() {
      console.log(`${this.name} is swimming`)
    }
  }
}

// 组合使用
class Duck extends withSwim(withFly(Animal)) {}

const duck2 = new Duck('Donald')
duck2.fly()   // Donald is flying
duck2.swim()  // Donald is swimming
```

**口语化回答**:
"JavaScript 原生不支持多重继承，但可以用 Mixin 模式来模拟。简单的方式是用 `Object.assign` 把多个对象的方法混入原型。更优雅的方式是用高阶函数，每个函数接收一个基类返回一个扩展后的类，然后嵌套调用实现多重混入。"

</details>

### 8. `Object.create(null)` 和 `{}` 的区别？

<details>
<summary>点击查看答案</summary>

**一句话答案**: `Object.create(null)` 创建的对象没有原型，是真正的空对象。

```javascript
// 普通对象
const obj1 = {}
console.log(obj1.__proto__ === Object.prototype)  // true
console.log(obj1.toString)  // function toString()
console.log(obj1.hasOwnProperty)  // function hasOwnProperty()

// Object.create(null)
const obj2 = Object.create(null)
console.log(obj2.__proto__)  // undefined
console.log(obj2.toString)  // undefined
console.log(obj2.hasOwnProperty)  // undefined

// 使用场景：纯净的字典/Map
const dict = Object.create(null)
dict['__proto__'] = 'value'  // 不会有问题
dict['constructor'] = 'value'  // 不会有问题

// 用 {} 的话
const obj = {}
obj['__proto__'] = 'value'  // 可能有问题
```

**口语化回答**:
"`Object.create(null)` 创建的是一个完全空的对象，没有原型链，没有 `toString`、`hasOwnProperty` 这些继承来的方法。普通的 `{}` 会继承 `Object.prototype` 上的所有方法。`Object.create(null)` 常用于创建纯净的字典对象，避免键名和原型属性冲突，比如用 `__proto__` 或 `constructor` 作为键名时不会出问题。"

</details>
