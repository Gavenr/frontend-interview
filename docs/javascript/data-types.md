# 数据类型与类型转换

## 1. JavaScript 有哪些数据类型?

### 官方答案
JavaScript 数据类型分为两大类:
- **基本类型(Primitive Types)**: Number、String、Boolean、Undefined、Null、Symbol、BigInt
- **引用类型(Reference Types)**: Object(包括 Array、Function、Date、RegExp 等)

### 通俗理解
可以这样记忆:**基本类型**就像是"值"本身,比如数字 1、字符串 "hello"。它们存储在**栈内存**中,体积小、访问快。

**引用类型**就像是一个"容器",里面可以装很多东西。它们存储在**堆内存**中,变量保存的只是一个地址(引用)。

### 详细说明

#### 基本类型特点
```javascript
// 基本类型 - 值的拷贝
let a = 10;
let b = a;
b = 20;
console.log(a); // 10 - a 没有变化

// 引用类型 - 地址的拷贝
let obj1 = { name: 'Alice' };
let obj2 = obj1;
obj2.name = 'Bob';
console.log(obj1.name); // 'Bob' - obj1 也变了!
```

#### 各类型详解

**Number (数字类型)**
```javascript
let num1 = 42;           // 整数
let num2 = 3.14;         // 浮点数
let num3 = NaN;          // Not a Number
let num4 = Infinity;     // 无穷大

// 特殊值判断
console.log(typeof NaN);        // 'number' - NaN 也是数字类型
console.log(NaN === NaN);       // false - NaN 不等于任何值,包括它自己
console.log(isNaN(NaN));        // true
console.log(Number.isNaN(NaN)); // true - 更严格,推荐使用

// 浮点数精度问题
console.log(0.1 + 0.2);         // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3); // false
```

**BigInt (大整数)**
```javascript
// 用于表示超过 Number 安全范围的整数
const bigNum = 9007199254740991n;  // 或者 BigInt(9007199254740991)
const anotherBig = BigInt("9007199254740991");

// 不能与 Number 混用
// bigNum + 10; // 报错!
bigNum + 10n;   // 正确
```

**Symbol (符号)**
```javascript
// 创建唯一标识符
const sym1 = Symbol('description');
const sym2 = Symbol('description');
console.log(sym1 === sym2); // false - 每次创建都是唯一的

// 常用于对象属性,避免命名冲突
const obj = {
  [Symbol('id')]: 1,
  name: 'test'
};
```

**Null vs Undefined**
```javascript
// undefined - 变量声明了但未赋值
let a;
console.log(a); // undefined
console.log(typeof a); // 'undefined'

// null - 明确表示"空值"
let b = null;
console.log(b); // null
console.log(typeof b); // 'object' - 这是一个历史遗留 bug!

// 使用场景
let user = null;  // 用户未登录,明确设置为 null
let config;       // 配置还未初始化,默认 undefined
```

---

## 2. 如何准确判断数据类型?

### 官方答案
- `typeof` 运算符 - 适合基本类型,但 null 返回 'object'
- `instanceof` 运算符 - 判断对象类型,检查原型链
- `Object.prototype.toString.call()` - 最准确的方法
- `Array.isArray()` - 判断数组

### 通俗理解
就像医生诊断病人,有不同的检查方法:
- `typeof` 是**快速问诊**,适合简单情况
- `instanceof` 是**看家族病史**,检查对象是不是某个"家族"的
- `Object.prototype.toString.call()` 是**全面体检**,最准确但稍显复杂

### 详细说明

#### typeof 的使用和局限
```javascript
// typeof 的正常使用
console.log(typeof 42);          // 'number'
console.log(typeof 'hello');     // 'string'
console.log(typeof true);        // 'boolean'
console.log(typeof undefined);   // 'undefined'
console.log(typeof Symbol());    // 'symbol'
console.log(typeof 123n);        // 'bigint'
console.log(typeof function(){}); // 'function'

// typeof 的坑
console.log(typeof null);        // 'object' ❌ 历史 bug
console.log(typeof []);          // 'object' - 无法区分数组
console.log(typeof {});          // 'object' - 无法区分普通对象
console.log(typeof new Date());  // 'object' - 无法识别具体类型
```

#### instanceof 的原理和使用
```javascript
// instanceof 检查原型链
console.log([] instanceof Array);        // true
console.log({} instanceof Object);       // true
console.log(function(){} instanceof Function); // true

// 原理:检查右边构造函数的 prototype 是否在左边对象的原型链上
class Animal {}
class Dog extends Animal {}
const dog = new Dog();

console.log(dog instanceof Dog);      // true
console.log(dog instanceof Animal);   // true
console.log(dog instanceof Object);   // true

// instanceof 的局限
console.log(null instanceof Object);  // false
console.log('hello' instanceof String); // false - 基本类型返回 false

// 跨 iframe 问题
const iframe = document.createElement('iframe');
document.body.appendChild(iframe);
const iframeArray = window.frames[0].Array;
const arr = new iframeArray();
console.log(arr instanceof Array); // false - 不同的 Array 构造函数!
```

#### Object.prototype.toString - 最准确的方法
```javascript
// 万能类型检测方法
function getType(value) {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}

console.log(getType(123));           // 'number'
console.log(getType('hello'));       // 'string'
console.log(getType(true));          // 'boolean'
console.log(getType(null));          // 'null' ✅
console.log(getType(undefined));     // 'undefined'
console.log(getType(Symbol()));      // 'symbol'
console.log(getType(123n));          // 'bigint'
console.log(getType([]));            // 'array' ✅
console.log(getType({}));            // 'object'
console.log(getType(function(){}));  // 'function'
console.log(getType(new Date()));    // 'date' ✅
console.log(getType(/regex/));       // 'regexp' ✅
console.log(getType(new Map()));     // 'map' ✅
console.log(getType(new Set()));     // 'set' ✅
```

#### 工具函数封装
```javascript
// 完整的类型判断工具
const typeUtils = {
  // 基础类型检查
  isNumber: (val) => typeof val === 'number' && !isNaN(val),
  isString: (val) => typeof val === 'string',
  isBoolean: (val) => typeof val === 'boolean',
  isUndefined: (val) => val === undefined,
  isNull: (val) => val === null,
  isSymbol: (val) => typeof val === 'symbol',
  isBigInt: (val) => typeof val === 'bigint',

  // 引用类型检查
  isObject: (val) => val !== null && typeof val === 'object',
  isPlainObject: (val) => Object.prototype.toString.call(val) === '[object Object]',
  isArray: (val) => Array.isArray(val),
  isFunction: (val) => typeof val === 'function',
  isDate: (val) => val instanceof Date,
  isRegExp: (val) => val instanceof RegExp,
  isMap: (val) => val instanceof Map,
  isSet: (val) => val instanceof Set,

  // 特殊检查
  isNaN: (val) => Number.isNaN(val),
  isNil: (val) => val === null || val === undefined,
  isEmpty: (val) => {
    if (val === null || val === undefined) return true;
    if (Array.isArray(val) || typeof val === 'string') return val.length === 0;
    if (val instanceof Map || val instanceof Set) return val.size === 0;
    if (typeof val === 'object') return Object.keys(val).length === 0;
    return false;
  }
};

// 使用示例
console.log(typeUtils.isNumber(123));      // true
console.log(typeUtils.isArray([]));        // true
console.log(typeUtils.isEmpty({}));        // true
console.log(typeUtils.isEmpty([1, 2]));    // false
```

---

## 3. 类型转换机制是怎样的?

### 官方答案
JavaScript 中的类型转换分为:
- **显式转换(强制转换)**: 通过 Number()、String()、Boolean() 等方法主动转换
- **隐式转换(自动转换)**: 在运算或比较时自动发生的转换

### 通俗理解
**显式转换**就像你明确告诉 JavaScript:"我要把这个东西变成数字!"

**隐式转换**就像 JavaScript 自作主张:"我看你要做加法,我帮你把字符串变成数字吧。"

有时候这种"自作主张"会导致意外的结果,比如 `'2' + 1` 变成 `'21'` 而不是 `3`。

### 详细说明

#### 转换为数字 (Number)
```javascript
// 显式转换
console.log(Number('123'));      // 123
console.log(Number('12.5'));     // 12.5
console.log(Number(''));         // 0
console.log(Number('  '));       // 0
console.log(Number('123abc'));   // NaN
console.log(Number(true));       // 1
console.log(Number(false));      // 0
console.log(Number(null));       // 0
console.log(Number(undefined));  // NaN

// 其他转数字方法
console.log(parseInt('123abc'));     // 123 - 从左到右解析
console.log(parseFloat('12.5rem'));  // 12.5
console.log(+'123');                 // 123 - 一元加号
console.log('123' - 0);              // 123 - 减法触发转换

// 隐式转换
console.log('6' / '2');    // 3 - 除法转数字
console.log('6' * '2');    // 12 - 乘法转数字
console.log('6' - '2');    // 4 - 减法转数字
console.log('6' + '2');    // '62' ❗ 加法优先字符串拼接
```

#### 转换为字符串 (String)
```javascript
// 显式转换
console.log(String(123));        // '123'
console.log(String(true));       // 'true'
console.log(String(null));       // 'null'
console.log(String(undefined));  // 'undefined'
console.log(String([1, 2, 3]));  // '1,2,3'
console.log(String({a: 1}));     // '[object Object]'

// 其他方法
console.log((123).toString());   // '123'
console.log(`${123}`);           // '123' - 模板字符串

// 隐式转换
console.log(123 + '');           // '123'
console.log('' + true);          // 'true'
console.log('value: ' + null);   // 'value: null'
```

#### 转换为布尔值 (Boolean)
```javascript
// 显式转换
console.log(Boolean(1));          // true
console.log(Boolean(0));          // false
console.log(Boolean('hello'));    // true
console.log(Boolean(''));         // false
console.log(Boolean(null));       // false
console.log(Boolean(undefined));  // false
console.log(Boolean(NaN));        // false
console.log(Boolean({}));         // true
console.log(Boolean([]));         // true

// 隐式转换
console.log(!!'hello');           // true - 双重否定
console.log(!'');                 // true

// 假值(Falsy)列表 - 只有这 8 个!
/*
  false
  0
  -0
  0n (BigInt 零)
  '' (空字符串)
  null
  undefined
  NaN
*/

// 条件判断中的隐式转换
if ('0') {
  console.log('字符串 "0" 是真值!'); // 会执行
}

if ([]) {
  console.log('空数组是真值!'); // 会执行
}
```

#### == 的复杂转换规则
```javascript
// == 会进行类型转换,=== 不会
console.log(1 == '1');        // true
console.log(1 === '1');       // false

// null 和 undefined 的特殊规则
console.log(null == undefined);  // true ✅
console.log(null === undefined); // false

// 布尔值转换
console.log(true == 1);       // true - true 转为 1
console.log(false == 0);      // true - false 转为 0
console.log('1' == true);     // true - 都转为数字 1

// 对象转换
console.log([1] == 1);        // true - [1] 转为 '1',再转为 1
console.log([1, 2] == '1,2'); // true - [1,2] 调用 toString()

// 容易出错的情况
console.log([] == false);     // true ❗ [] 转为 '','' 转为 0
console.log([] == ![]);       // true ❗ ![] 是 false,[] 转为 ''
console.log('' == 0);         // true
console.log(' ' == 0);        // true - 空格字符串转为 0

// 最佳实践:优先使用 ===
console.log(1 === 1);         // 推荐
console.log('1' === '1');     // 推荐
```

#### 对象转原始类型
```javascript
// 对象转换调用顺序: Symbol.toPrimitive > valueOf > toString
const obj = {
  value: 100,

  // 方法1: Symbol.toPrimitive (优先级最高)
  [Symbol.toPrimitive](hint) {
    console.log('hint:', hint); // 'number', 'string', 'default'
    if (hint === 'number') return this.value;
    if (hint === 'string') return `值是 ${this.value}`;
    return this.value;
  },

  // 方法2: valueOf
  valueOf() {
    console.log('调用 valueOf');
    return this.value;
  },

  // 方法3: toString
  toString() {
    console.log('调用 toString');
    return String(this.value);
  }
};

console.log(obj + 1);      // Symbol.toPrimitive with hint 'default'
console.log(+obj);         // Symbol.toPrimitive with hint 'number'
console.log(`${obj}`);     // Symbol.toPrimitive with hint 'string'

// 实际例子
const price = {
  value: 100,
  valueOf() {
    return this.value;
  },
  toString() {
    return `¥${this.value}`;
  }
};

console.log(price + 50);    // 150 - 调用 valueOf
console.log(`价格: ${price}`); // '价格: ¥100' - 调用 toString
```

---

## 4. 常见面试题

### 题目1: 输出结果
```javascript
console.log(typeof typeof 1);
```
<details>
<summary>点击查看答案</summary>

**答案**: `'string'`

**解析**:
1. `typeof 1` 返回 `'number'`(字符串)
2. `typeof 'number'` 返回 `'string'`

任何 `typeof` 操作都返回字符串类型。
</details>

### 题目2: 比较结果
```javascript
console.log([] == ![]);
```
<details>
<summary>点击查看答案</summary>

**答案**: `true`

**解析**:
1. `![]` 先执行,空数组是真值,取反得 `false`
2. 变成 `[] == false`
3. `[]` 调用 `toString()` 得到 `''`
4. `''` 和 `false` 都转为数字 `0`
5. `0 == 0` 为 `true`

这是一个经典的"坑",实际开发中永远不要这样写,用 `===`!
</details>

### 题目3: 输出结果
```javascript
console.log(1 + '1');
console.log(1 - '1');
console.log(1 * '2');
console.log(1 / '2');
```
<details>
<summary>点击查看答案</summary>

**答案**:
```javascript
'11'   // 字符串拼接
0      // 减法转数字
2      // 乘法转数字
0.5    // 除法转数字
```

**解析**: 只有 `+` 运算符在遇到字符串时会进行拼接,其他算术运算符都会将操作数转为数字。
</details>

---

## 总结

### 核心要点
1. JavaScript 有 7 种基本类型和 1 种引用类型
2. 使用 `Object.prototype.toString.call()` 最准确
3. 理解显式转换和隐式转换的区别
4. 掌握假值列表(8个)
5. 优先使用 `===` 避免类型转换的坑

### 面试加分项
- 能说出 `typeof null` 返回 `'object'` 的历史原因
- 了解 V8 引擎中的 Smi 和 HeapNumber
- 理解 Symbol 和 BigInt 的使用场景
- 掌握对象转原始类型的完整流程
