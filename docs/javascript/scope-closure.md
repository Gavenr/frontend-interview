# 作用域与闭包

## 1. 什么是作用域?

### 官方答案
作用域(Scope)是指程序中定义变量的区域,它决定了变量的可访问性和生命周期。JavaScript 采用**词法作用域(Lexical Scope)**,也叫静态作用域,即作用域在代码编写时就已经确定。

作用域类型:
- **全局作用域**: 在代码任何地方都能访问
- **函数作用域**: 只在函数内部可访问
- **块级作用域**: ES6 引入,由 `{}` 包裹,let/const 声明的变量

### 通俗理解
作用域就像是**权限管理系统**:
- **全局作用域**像公司的公共区域,所有人都能进
- **函数作用域**像某个部门的办公室,只有部门内的人能进
- **块级作用域**像办公室内的小隔间,更加私密

变量就像是物品,放在不同的"房间"(作用域)里,决定了谁能访问它。

### 详细说明

#### 全局作用域
```javascript
// 全局变量
var globalVar = 'I am global';
let globalLet = 'I am also global';

function test() {
  console.log(globalVar);  // 可以访问
  console.log(globalLet);  // 可以访问
}

// 浏览器环境中,var 声明的全局变量会挂载到 window
console.log(window.globalVar);  // 'I am global'
console.log(window.globalLet);  // undefined - let 不会挂载到 window

// Node.js 环境中,全局对象是 global
```

#### 函数作用域
```javascript
function outer() {
  var functionScoped = 'I am in function';

  console.log(functionScoped);  // 可以访问

  function inner() {
    console.log(functionScoped);  // 可以访问外部函数的变量
  }

  inner();
}

outer();
console.log(functionScoped);  // ReferenceError - 外部无法访问

// var 没有块级作用域
if (true) {
  var a = 1;
}
console.log(a);  // 1 - 可以访问!

for (var i = 0; i < 3; i++) {
  // ...
}
console.log(i);  // 3 - 循环后 i 依然存在!
```

#### 块级作用域 (ES6)
```javascript
// let 和 const 有块级作用域
{
  let blockScoped = 'I am in block';
  const alsoBlock = 'Me too';

  console.log(blockScoped);  // 可以访问
}

console.log(blockScoped);  // ReferenceError - 块外无法访问

// if 语句块
if (true) {
  let b = 2;
}
console.log(b);  // ReferenceError

// for 循环块
for (let j = 0; j < 3; j++) {
  setTimeout(() => {
    console.log(j);  // 0, 1, 2 - 每次循环 j 都是新的变量
  }, 100);
}

// 对比 var
for (var k = 0; k < 3; k++) {
  setTimeout(() => {
    console.log(k);  // 3, 3, 3 - k 是同一个变量!
  }, 100);
}
```

#### 作用域链
```javascript
var a = 1;

function first() {
  var b = 2;

  function second() {
    var c = 3;

    function third() {
      var d = 4;

      // 作用域链: third -> second -> first -> global
      console.log(a, b, c, d);  // 1, 2, 3, 4 - 都能访问
    }

    third();
    console.log(d);  // ReferenceError - 无法访问内层变量
  }

  second();
}

first();

// 查找规则:
// 1. 先在当前作用域查找
// 2. 找不到就去父作用域查找
// 3. 一层层向上,直到全局作用域
// 4. 全局也没有,报 ReferenceError
```

---

## 2. 什么是闭包?

### 官方答案
闭包(Closure)是指有权访问另一个函数作用域中变量的函数。即使外部函数已经返回,闭包仍然可以访问外部函数的变量。

**形成条件**:
1. 函数嵌套
2. 内部函数引用了外部函数的变量
3. 内部函数被返回或以某种方式被外部引用

### 通俗理解
闭包就像是一个**背包**:

当内部函数被创建时,它会把需要用到的外部变量"装进背包"带走。即使外部函数已经执行完毕,"背包"里的东西依然保留着,内部函数随时可以拿出来用。

```javascript
function 外部函数() {
  let 食物 = '三明治';

  function 内部函数() {
    console.log(食物);  // 把食物装进了"背包"
  }

  return 内部函数;
}

const 我的背包 = 外部函数();
我的背包();  // '三明治' - 虽然外部函数已经执行完了,但食物还在!
```

### 详细说明

#### 基础闭包示例
```javascript
function createCounter() {
  let count = 0;  // 私有变量

  return function() {
    count++;
    return count;
  };
}

const counter = createCounter();
console.log(counter());  // 1
console.log(counter());  // 2
console.log(counter());  // 3

// count 变量被"封闭"在闭包中,外部无法直接访问
console.log(count);  // ReferenceError

// 创建新的计数器,有独立的 count
const counter2 = createCounter();
console.log(counter2());  // 1 - 全新的开始
```

#### 闭包的实际应用

**1. 数据私有化 / 模块化**
```javascript
const BankAccount = (function() {
  // 私有变量,外部无法访问
  let balance = 0;

  // 公开的接口
  return {
    deposit(amount) {
      if (amount > 0) {
        balance += amount;
        return `存入 ${amount} 元,余额 ${balance} 元`;
      }
    },

    withdraw(amount) {
      if (amount > 0 && amount <= balance) {
        balance -= amount;
        return `取出 ${amount} 元,余额 ${balance} 元`;
      }
      return '余额不足';
    },

    getBalance() {
      return balance;
    }
  };
})();

console.log(BankAccount.deposit(100));   // '存入 100 元,余额 100 元'
console.log(BankAccount.withdraw(30));   // '取出 30 元,余额 70 元'
console.log(BankAccount.getBalance());   // 70
console.log(BankAccount.balance);        // undefined - 无法直接访问
```

**2. 函数柯里化**
```javascript
// 普通函数
function add(a, b, c) {
  return a + b + c;
}
console.log(add(1, 2, 3));  // 6

// 柯里化版本 - 使用闭包
function curry(a) {
  return function(b) {
    return function(c) {
      return a + b + c;
    };
  };
}

const add1 = curry(1);
const add1And2 = add1(2);
console.log(add1And2(3));  // 6

// 或者链式调用
console.log(curry(1)(2)(3));  // 6

// 通用柯里化函数
function curryify(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    } else {
      return function(...nextArgs) {
        return curried.apply(this, args.concat(nextArgs));
      };
    }
  };
}

const sum = (a, b, c) => a + b + c;
const curriedSum = curryify(sum);

console.log(curriedSum(1)(2)(3));      // 6
console.log(curriedSum(1, 2)(3));      // 6
console.log(curriedSum(1)(2, 3));      // 6
```

**3. 防抖和节流**
```javascript
// 防抖(debounce): 一定时间内只执行最后一次
function debounce(func, wait) {
  let timeout;  // 闭包保存 timer

  return function(...args) {
    const context = this;

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

// 使用场景:搜索框输入
const searchInput = document.querySelector('#search');
const search = debounce(function(e) {
  console.log('搜索:', e.target.value);
}, 500);

searchInput.addEventListener('input', search);

// 节流(throttle): 一定时间内只执行一次
function throttle(func, wait) {
  let timeout;
  let previous = 0;

  return function(...args) {
    const context = this;
    const now = Date.now();

    if (now - previous > wait) {
      func.apply(context, args);
      previous = now;
    }
  };
}

// 使用场景:滚动事件
window.addEventListener('scroll', throttle(function() {
  console.log('滚动位置:', window.scrollY);
}, 200));
```

**4. 事件监听器**
```javascript
function createButton(label) {
  let clickCount = 0;  // 每个按钮独立的计数

  const button = document.createElement('button');
  button.textContent = label;

  button.addEventListener('click', function() {
    clickCount++;
    console.log(`${label} 被点击了 ${clickCount} 次`);
  });

  return button;
}

const btn1 = createButton('按钮1');
const btn2 = createButton('按钮2');

document.body.append(btn1, btn2);
// 每个按钮有独立的 clickCount 闭包变量
```

**5. 循环中的闭包问题**
```javascript
// ❌ 经典错误
for (var i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i);  // 3, 3, 3 - 都是 3!
  }, 100);
}
// 原因: 所有回调共享同一个 i,循环结束时 i = 3

// ✅ 解决方案1: 使用 let
for (let i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i);  // 0, 1, 2 - 每次循环 i 是新的
  }, 100);
}

// ✅ 解决方案2: IIFE 创建闭包
for (var i = 0; i < 3; i++) {
  (function(j) {  // 立即执行函数
    setTimeout(function() {
      console.log(j);  // 0, 1, 2
    }, 100);
  })(i);
}

// ✅ 解决方案3: setTimeout 的第三个参数
for (var i = 0; i < 3; i++) {
  setTimeout(function(j) {
    console.log(j);  // 0, 1, 2
  }, 100, i);
}
```

---

## 3. 闭包的优缺点

### 优点
1. **数据私有化**: 创建私有变量,外部无法直接访问
2. **保持变量**: 变量不会被垃圾回收,可以长期保持
3. **模块化**: 可以创建独立的模块,避免全局污染
4. **函数工厂**: 可以创建具有特定行为的函数

### 缺点
1. **内存泄漏**: 闭包会使变量一直保存在内存中,不当使用可能导致内存泄漏
2. **性能问题**: 过度使用闭包会增加内存开销
3. **调试困难**: 闭包中的变量在外部不可见,增加调试难度

### 内存管理示例
```javascript
// ❌ 内存泄漏风险
function createLargeArray() {
  const largeArray = new Array(1000000).fill('data');  // 占用大量内存

  return function() {
    console.log(largeArray.length);  // 闭包引用了大数组
  };
}

const fn = createLargeArray();
// largeArray 一直保存在内存中,即使只用到了它的 length

// ✅ 改进: 只保留需要的数据
function createLength() {
  const largeArray = new Array(1000000).fill('data');
  const length = largeArray.length;  // 只保存长度

  return function() {
    console.log(length);  // 只引用 length,数组可以被回收
  };
}

const fn2 = createLength();

// ✅ 手动释放闭包
let counter = (function() {
  let count = 0;
  return {
    increment: () => ++count,
    destroy: function() {
      count = null;  // 释放引用
    }
  };
})();

// 使用完后
counter.destroy();
counter = null;  // 彻底释放
```

---

## 4. 经典面试题

### 题目1: 连续调用
```javascript
// 实现一个函数,可以这样调用: add(1)(2)(3)
function add(a) {
  // 你的代码
}

console.log(add(1)(2)(3));  // 6
console.log(add(1)(2)(3)(4));  // 10
```

<details>
<summary>点击查看答案</summary>

```javascript
function add(a) {
  function sum(b) {
    a = a + b;  // 累加
    return sum;  // 返回自身,支持继续调用
  }

  // 重写 toString,在需要转换为原始值时调用
  sum.toString = function() {
    return a;
  };

  return sum;
}

console.log(add(1)(2)(3).toString());  // '6'
console.log(+add(1)(2)(3));  // 6 - 一元加号触发 valueOf/toString

// 或者使用 valueOf
function add2(a) {
  function sum(b) {
    a = a + b;
    return sum;
  }

  sum.valueOf = function() {
    return a;
  };

  return sum;
}
```

**考察点**: 闭包、函数式编程、类型转换
</details>

### 题目2: 创建10个按钮
```javascript
// 创建10个按钮,点击时分别弹出 0-9
for (var i = 0; i < 10; i++) {
  const btn = document.createElement('button');
  btn.textContent = i;

  btn.onclick = function() {
    alert(i);  // ❌ 都会弹出 10
  };

  document.body.appendChild(btn);
}

// 如何修复?
```

<details>
<summary>点击查看答案</summary>

**方案1: 使用 let**
```javascript
for (let i = 0; i < 10; i++) {  // var 改为 let
  const btn = document.createElement('button');
  btn.textContent = i;
  btn.onclick = function() {
    alert(i);
  };
  document.body.appendChild(btn);
}
```

**方案2: IIFE**
```javascript
for (var i = 0; i < 10; i++) {
  (function(num) {
    const btn = document.createElement('button');
    btn.textContent = num;
    btn.onclick = function() {
      alert(num);
    };
    document.body.appendChild(btn);
  })(i);
}
```

**方案3: 使用 dataset**
```javascript
for (var i = 0; i < 10; i++) {
  const btn = document.createElement('button');
  btn.textContent = i;
  btn.dataset.index = i;  // 存储到 DOM 属性
  btn.onclick = function() {
    alert(this.dataset.index);
  };
  document.body.appendChild(btn);
}
```

**方案4: bind**
```javascript
for (var i = 0; i < 10; i++) {
  const btn = document.createElement('button');
  btn.textContent = i;
  btn.onclick = (function(num) {
    return function() {
      alert(num);
    };
  })(i);
  document.body.appendChild(btn);
}
```
</details>

### 题目3: 输出结果
```javascript
function test() {
  var a = 1;

  return function() {
    console.log(a++);
  };
}

var fn = test();
fn();  // ?
fn();  // ?
var fn2 = test();
fn2();  // ?
```

<details>
<summary>点击查看答案</summary>

**答案**:
```
1
2
1
```

**解析**:
- `fn` 和 `fn2` 是两个独立的闭包
- 每个闭包都有自己独立的 `a` 变量
- `fn()` 第一次输出 1,然后 a 变成 2
- `fn()` 第二次输出 2,然后 a 变成 3
- `fn2()` 是新的闭包,a 从 1 开始
</details>

---

## 5. 常见面试题

### 问题1: 闭包是什么？有什么用？

#### 一句话答案
闭包是函数和其词法作用域的组合，可以让函数访问其定义时所在作用域的变量，主要用于数据私有化、函数柯里化、防抖节流等场景。

#### 详细解答

**闭包的定义**：
- 闭包是指一个函数能够访问其外部函数作用域中的变量，即使外部函数已经执行完毕
- 从技术角度讲，闭包 = 函数 + 函数能够访问的自由变量

**形成闭包的条件**：
1. 函数嵌套（内部函数和外部函数）
2. 内部函数引用了外部函数的变量
3. 内部函数被外部引用或返回

**闭包的作用**：
1. **数据私有化/封装**：创建私有变量，防止全局污染
   ```javascript
   function createPerson(name) {
     let age = 0;  // 私有变量
     return {
       getName: () => name,
       getAge: () => age,
       growUp: () => ++age
     };
   }
   ```

2. **保持变量状态**：让变量持久保存在内存中
   ```javascript
   function createCounter() {
     let count = 0;
     return () => ++count;
   }
   ```

3. **函数柯里化**：将多参数函数转换为单参数函数序列
   ```javascript
   function curry(a) {
     return function(b) {
       return a + b;
     };
   }
   ```

4. **防抖节流**：通过闭包保存timer和状态
   ```javascript
   function debounce(fn, delay) {
     let timer;
     return function(...args) {
       clearTimeout(timer);
       timer = setTimeout(() => fn(...args), delay);
     };
   }
   ```

5. **模块化开发**：创建独立的模块，避免变量冲突
   ```javascript
   const module = (function() {
     let private = 'private';
     return {
       getPrivate: () => private
     };
   })();
   ```

#### 面试回答模板

> 闭包简单说就是函数能访问它定义时所在作用域的变量，即使这个函数在其他地方执行也能访问。形成闭包需要两个条件：一是函数嵌套，二是内部函数引用外部函数的变量。
>
> 闭包的作用主要有这么几个：一是做数据私有化，比如创建一个计数器，外部不能直接修改count变量，只能通过提供的方法去操作；二是保持变量状态，像防抖节流里就用闭包保存timer；三是函数柯里化，把多参数函数变成单参数的；还有就是模块化开发，避免全局污染。
>
> 需要注意的是闭包会让变量一直在内存中，用不好可能造成内存泄漏。比如在循环里创建闭包，或者闭包引用了大对象但只用了其中一小部分，这些都要小心处理。

---

### 问题2: 闭包会造成内存泄漏吗？

#### 一句话答案
闭包本身不会造成内存泄漏，但不当使用闭包（如过度使用、引用大对象、忘记清理）会导致内存无法被回收，从而造成内存泄漏。

#### 详细解答

**内存泄漏的定义**：
内存泄漏是指程序中已分配的内存无法被回收，导致可用内存不断减少。

**闭包与内存的关系**：
1. **闭包的内存特性**：
   - 闭包会保持对外部变量的引用
   - 只要闭包存在，被引用的变量就不会被垃圾回收
   - 这是闭包的特性，不是bug

2. **正常使用不会泄漏**：
   ```javascript
   function createCounter() {
     let count = 0;
     return () => ++count;
   }

   let counter = createCounter();
   // count 被保持在内存中，这是预期行为，不是泄漏

   counter = null;  // 解除引用后，count 可以被回收
   ```

3. **可能导致内存泄漏的场景**：

   **场景1：闭包引用了大对象，但只用其中一小部分**
   ```javascript
   // ❌ 内存浪费
   function getData() {
     const largeData = new Array(1000000).fill('data');
     return function() {
       return largeData.length;  // 只用length，但整个数组都保留了
     };
   }

   // ✅ 优化：只保留需要的
   function getData() {
     const largeData = new Array(1000000).fill('data');
     const length = largeData.length;
     return function() {
       return length;  // 数组可以被回收
     };
   }
   ```

   **场景2：循环中创建大量闭包**
   ```javascript
   // ❌ 可能的问题
   for (let i = 0; i < 10000; i++) {
     const element = document.getElementById(`item-${i}`);
     const largeData = fetchData(i);  // 假设返回大量数据

     element.addEventListener('click', function() {
       console.log(largeData);  // 每个闭包都保存了 largeData
     });
   }

   // ✅ 优化：只保存必要信息
   for (let i = 0; i < 10000; i++) {
     const element = document.getElementById(`item-${i}`);
     const id = i;  // 只保存ID

     element.addEventListener('click', function() {
       const data = fetchData(id);  // 需要时再获取
       console.log(data);
     });
   }
   ```

   **场景3：DOM 引用 + 闭包导致的循环引用**
   ```javascript
   // ❌ 循环引用
   function bindEvent() {
     const element = document.getElementById('btn');
     const data = { /* 大量数据 */ };

     element.onclick = function() {
       console.log(data);  // 闭包引用 data
       // element 也被引用，即使从 DOM 移除也无法回收
     };
   }

   // ✅ 手动清理
   function bindEvent() {
     const element = document.getElementById('btn');
     const data = { /* 大量数据 */ };

     element.onclick = function() {
       console.log(data);
     };

     // 清理函数
     return function cleanup() {
       element.onclick = null;
       // 此时闭包和 DOM 都能被回收
     };
   }

   const cleanup = bindEvent();
   // 不需要时调用
   cleanup();
   ```

   **场景4：定时器未清理**
   ```javascript
   // ❌ 定时器持续引用
   function startTimer() {
     const data = new Array(1000000);

     setInterval(function() {
       console.log(data.length);
     }, 1000);
     // data 永远不会被释放
   }

   // ✅ 保存定时器ID，提供清理方法
   function startTimer() {
     const data = new Array(1000000);

     const timerId = setInterval(function() {
       console.log(data.length);
     }, 1000);

     return function stop() {
       clearInterval(timerId);
       // 清除后 data 可以被回收
     };
   }
   ```

**如何避免内存泄漏**：
1. 及时清理不需要的闭包引用
2. 避免在闭包中引用大对象的全部内容
3. 使用完后将闭包赋值为 null
4. 清理定时器、事件监听器等
5. 使用 WeakMap、WeakSet 存储对象引用

#### 面试回答模板

> 闭包本身不会造成内存泄漏，但确实需要注意内存管理。闭包的特点是会保持对外部变量的引用，只要闭包还在，这些变量就不会被垃圾回收，这是它的正常特性。
>
> 但在一些场景下可能会有问题。比如闭包引用了一个很大的对象，但实际只用了其中一小部分，这时候整个对象都会被保留在内存里，就造成浪费了。还有就是在循环里创建大量闭包，每个都保存了大量数据。或者DOM元素被移除了，但事件监听器里的闭包还引用着它，导致无法回收。
>
> 避免这些问题的话，一是只在闭包里保留真正需要的数据；二是用完后及时清理，比如把闭包赋值为null，或者清除定时器和事件监听；三是可以用WeakMap这种弱引用的数据结构。总之就是要有意识地管理闭包的生命周期。

---

### 问题3: 闭包的应用场景有哪些？

#### 一句话答案
闭包的应用场景主要包括：数据私有化/模块化、防抖节流、函数柯里化、单例模式、缓存优化、偏函数等。

#### 详细解答

**1. 数据私有化和模块化**

最经典的应用，创建私有变量，只暴露公共接口：

```javascript
// 单例模式
const UserManager = (function() {
  let instance;
  let users = [];  // 私有数据

  function init() {
    return {
      addUser(user) {
        users.push(user);
      },
      getUsers() {
        return [...users];  // 返回副本，保护原数据
      },
      getUserCount() {
        return users.length;
      }
    };
  }

  return {
    getInstance() {
      if (!instance) {
        instance = init();
      }
      return instance;
    }
  };
})();

const manager = UserManager.getInstance();
manager.addUser({ name: 'Alice' });
```

**2. 防抖和节流**

通过闭包保存定时器ID和上次执行时间：

```javascript
// 防抖：最后一次触发后才执行
function debounce(fn, delay) {
  let timer = null;

  return function(...args) {
    if (timer) clearTimeout(timer);

    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// 节流：固定时间间隔执行
function throttle(fn, delay) {
  let lastTime = 0;

  return function(...args) {
    const now = Date.now();

    if (now - lastTime >= delay) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}

// 实际应用
const searchInput = document.querySelector('#search');
searchInput.addEventListener('input', debounce(function(e) {
  console.log('搜索:', e.target.value);
}, 300));

window.addEventListener('scroll', throttle(function() {
  console.log('滚动位置:', window.scrollY);
}, 200));
```

**3. 函数柯里化**

将多参数函数转换为一系列单参数函数：

```javascript
// 手动柯里化
function curry(a) {
  return function(b) {
    return function(c) {
      return a + b + c;
    };
  };
}

curry(1)(2)(3);  // 6

// 通用柯里化函数
function currying(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    } else {
      return function(...nextArgs) {
        return curried.apply(this, [...args, ...nextArgs]);
      };
    }
  };
}

// 使用示例
function sum(a, b, c) {
  return a + b + c;
}

const curriedSum = currying(sum);
curriedSum(1)(2)(3);     // 6
curriedSum(1, 2)(3);     // 6
curriedSum(1)(2, 3);     // 6
```

**4. 缓存/记忆化**

利用闭包缓存计算结果，避免重复计算：

```javascript
function memoize(fn) {
  const cache = {};

  return function(...args) {
    const key = JSON.stringify(args);

    if (key in cache) {
      console.log('从缓存获取');
      return cache[key];
    }

    console.log('计算结果');
    const result = fn.apply(this, args);
    cache[key] = result;
    return result;
  };
}

// 计算斐波那契数列
const fibonacci = memoize(function(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

fibonacci(10);  // 计算
fibonacci(10);  // 从缓存获取
```

**5. 偏函数**

固定函数的部分参数：

```javascript
function partial(fn, ...fixedArgs) {
  return function(...remainingArgs) {
    return fn.apply(this, [...fixedArgs, ...remainingArgs]);
  };
}

// 使用示例
function multiply(a, b, c) {
  return a * b * c;
}

const double = partial(multiply, 2);  // 固定第一个参数为 2
console.log(double(3, 4));  // 2 * 3 * 4 = 24

const tripleOfTen = partial(multiply, 3, 10);  // 固定前两个参数
console.log(tripleOfTen(5));  // 3 * 10 * 5 = 150
```

**6. 延迟执行/惰性函数**

```javascript
// 延迟执行
function lazy(fn) {
  let result;
  let executed = false;

  return function(...args) {
    if (!executed) {
      result = fn.apply(this, args);
      executed = true;
    }
    return result;
  };
}

const expensiveOperation = lazy(function() {
  console.log('执行复杂计算...');
  return 42;
});

expensiveOperation();  // 执行复杂计算...
expensiveOperation();  // 直接返回结果，不再执行
```

**7. 事件处理器工厂**

```javascript
function createButtonHandler(buttonId, config) {
  let clickCount = 0;
  const maxClicks = config.maxClicks || Infinity;

  return function(event) {
    if (clickCount < maxClicks) {
      clickCount++;
      console.log(`${buttonId} 被点击第 ${clickCount} 次`);

      if (config.onClick) {
        config.onClick(event, clickCount);
      }

      if (clickCount >= maxClicks) {
        console.log(`${buttonId} 已达到最大点击次数`);
        this.disabled = true;
      }
    }
  };
}

// 使用
const btn = document.querySelector('#submit');
btn.addEventListener('click', createButtonHandler('提交按钮', {
  maxClicks: 1,
  onClick: (e, count) => {
    console.log('处理提交...');
  }
}));
```

**8. 迭代器和生成器**

```javascript
function createIterator(array) {
  let index = 0;

  return {
    next() {
      if (index < array.length) {
        return { value: array[index++], done: false };
      }
      return { done: true };
    },
    reset() {
      index = 0;
    }
  };
}

const iterator = createIterator([1, 2, 3]);
console.log(iterator.next());  // { value: 1, done: false }
console.log(iterator.next());  // { value: 2, done: false }
iterator.reset();
console.log(iterator.next());  // { value: 1, done: false }
```

#### 面试回答模板

> 闭包的应用场景其实挺多的，我平时开发中经常用到。
>
> 最常见的就是数据私有化，比如做一个用户管理模块，不想让外部直接访问用户数组，就用闭包把数据保护起来，只暴露addUser、getUsers这些方法。还有单例模式也是这样实现的。
>
> 然后就是防抖节流，这个在处理输入框搜索、滚动事件时特别有用。通过闭包保存timer或者上次执行时间，来控制函数执行频率。
>
> 函数柯里化也会用到，就是把多参数函数变成单参数的，方便函数复用。比如有个三个参数的add函数，柯里化后可以先固定一个参数，返回新函数继续接收剩余参数。
>
> 还有缓存优化，像计算斐波那契数列这种递归函数，用闭包把计算结果缓存起来，避免重复计算，性能提升很明显。
>
> 实际项目里还会用闭包做偏函数、延迟执行、事件处理器工厂这些。总之闭包的核心价值就是能保持状态和实现数据封装，很多设计模式都离不开它。

---

## 总结

### 核心要点
1. **作用域**: 变量的可访问范围,JS 使用词法作用域
2. **作用域链**: 从内到外逐层查找变量
3. **闭包**: 函数 + 其词法环境的组合
4. **闭包应用**: 数据私有、柯里化、防抖节流、模块化
5. **注意内存**: 避免不必要的闭包,及时释放引用

### 面试加分项
- 能用代码演示闭包的实际应用
- 了解闭包的内存模型
- 知道如何避免内存泄漏
- 理解 V8 中的上下文和作用域链
- 能手写防抖、节流、柯里化等工具函数
