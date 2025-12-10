# 虚拟 DOM 与 Diff

## 什么是虚拟DOM?
虚拟DOM是用JavaScript对象描述真实DOM的结构。

## VNode
```javascript
{
  tag: 'div',
  props: { class: 'container' },
  children: [
    { tag: 'span', props: {}, children: ['Hello'] }
  ]
}
```

## Diff 算法
- 同层比较
- key 的作用
- 最小化DOM操作

## 为什么需要虚拟DOM?
- 跨平台
- 性能优化
- 声明式编程

---

## 高频面试题

### 1. 什么是虚拟 DOM？为什么需要它？

**一句话答案：**
虚拟 DOM 是用 JavaScript 对象来描述真实 DOM 结构的技术，通过对比新旧虚拟 DOM 的差异来最小化真实 DOM 操作。

**详细解答：**

虚拟 DOM（Virtual DOM）本质上是一个轻量级的 JavaScript 对象，它是真实 DOM 的抽象表示。

```javascript
// 真实 DOM
<div class="container">
  <h1>标题</h1>
  <p>内容</p>
</div>

// 对应的虚拟 DOM
{
  tag: 'div',
  props: { class: 'container' },
  children: [
    { tag: 'h1', props: {}, children: ['标题'] },
    { tag: 'p', props: {}, children: ['内容'] }
  ]
}
```

**为什么需要虚拟 DOM：**

1. **性能优化**：直接操作 DOM 成本很高，虚拟 DOM 可以批量更新
```javascript
// 不使用虚拟 DOM - 每次都操作真实 DOM
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  div.innerHTML = i;
  document.body.appendChild(div); // 触发 1000 次重排重绘
}

// 使用虚拟 DOM - 先在内存中计算差异，最后一次性更新
// Vue/React 会先对比新旧虚拟 DOM，计算最小差异集，然后批量更新
```

2. **跨平台能力**：虚拟 DOM 本质是 JS 对象，可以渲染到不同平台
```javascript
// 同一套虚拟 DOM 可以渲染到：
// - Web 浏览器（DOM）
// - 移动端（React Native）
// - 服务端（SSR）
// - Canvas、WebGL 等
```

3. **声明式编程**：开发者只需关心数据状态，不用手动操作 DOM
```javascript
// 命令式（手动操作 DOM）
const div = document.getElementById('app');
div.textContent = '新内容';
div.style.color = 'red';

// 声明式（虚拟 DOM）
<div id="app" style="color: red">{{ content }}</div>
// 数据变化自动更新视图
```

4. **便于实现 Diff 算法**：通过对比新旧虚拟 DOM，精准找到变化点

**面试口语化回答模板：**

"虚拟 DOM 就是用 JavaScript 对象来描述页面结构，而不是直接操作真实 DOM。

我们需要它主要有几个原因：第一是性能考虑，因为直接操作 DOM 代价很高，会触发重排重绘，而虚拟 DOM 可以先在内存中计算出差异，然后一次性批量更新，减少不必要的 DOM 操作。

第二是跨平台，因为虚拟 DOM 本质是 JS 对象，所以同一套代码可以渲染到浏览器、移动端甚至服务端。

第三是开发体验更好，我们只需要关心数据变化，框架会自动帮我们更新视图，不用手动去操作 DOM。

不过也要客观说，虚拟 DOM 并不是所有场景下都比原生 DOM 快，它的优势在于合理的更新策略和良好的开发体验。"

---

### 2. 虚拟 DOM 的优缺点？

**一句话答案：**
虚拟 DOM 的优点是跨平台、声明式编程、批量更新优化；缺点是首次渲染慢、内存占用高、不一定比原生操作快。

**详细解答：**

**优点：**

1. **跨平台抽象**
```javascript
// 同一个组件可以运行在不同平台
const MyComponent = () => <div>Hello</div>;

// Web
ReactDOM.render(<MyComponent />, container);

// Native
AppRegistry.registerComponent('App', () => MyComponent);

// SSR
const html = ReactDOMServer.renderToString(<MyComponent />);
```

2. **声明式 UI，提升开发体验**
```javascript
// 命令式（jQuery 时代）
$('#list').empty();
data.forEach(item => {
  const li = $('<li>').text(item.name);
  $('#list').append(li);
});

// 声明式（Vue/React）
<ul>
  <li v-for="item in data" :key="item.id">{{ item.name }}</li>
</ul>
```

3. **合理的性能优化**
```javascript
// 虚拟 DOM 会智能对比差异
// 只更新变化的部分
const oldVNode = {
  tag: 'div',
  children: [
    { tag: 'p', children: ['A'] },
    { tag: 'p', children: ['B'] }, // 不变
    { tag: 'p', children: ['C'] }
  ]
};

const newVNode = {
  tag: 'div',
  children: [
    { tag: 'p', children: ['A changed'] }, // 更新
    { tag: 'p', children: ['B'] }, // 复用
    { tag: 'p', children: ['C changed'] }  // 更新
  ]
};
// Diff 算法只会更新第 1 和第 3 个 p 标签
```

4. **便于实现 SSR、时间旅行等高级特性**

**缺点：**

1. **首次渲染更慢**
```javascript
// 首次渲染流程
// 1. 创建虚拟 DOM 对象（额外开销）
// 2. 遍历虚拟 DOM 创建真实 DOM
// 3. 挂载到页面

// 而原生操作可以直接：
// 1. innerHTML = template（一步到位）

// 性能对比：
// 原生：innerHTML 直接渲染，浏览器底层优化
// 虚拟 DOM：JS 对象创建 + 遍历 + DOM 创建（多层抽象）
```

2. **内存占用更高**
```javascript
// 需要维护两棵树
const oldVNode = { /* 旧的虚拟 DOM 树 */ };
const newVNode = { /* 新的虚拟 DOM 树 */ };

// 大型应用中，虚拟 DOM 树可能很大
// 占用额外内存空间
```

3. **不一定比原生 DOM 操作快**
```javascript
// 简单场景：修改单个文本
// 原生
document.getElementById('text').textContent = '新文本'; // 最快

// 虚拟 DOM
// 1. 创建新虚拟 DOM
// 2. 对比新旧虚拟 DOM（Diff）
// 3. 找到差异
// 4. 更新真实 DOM
// 明显多了很多步骤

// 虚拟 DOM 的优势在于「复杂场景的批量更新」
// 而不是「单点更新」
```

4. **需要额外的学习成本和框架依赖**

**面试口语化回答模板：**

"虚拟 DOM 的优点主要有三个：一是跨平台，因为它是 JS 对象，可以渲染到不同环境；二是开发体验好，声明式编程让我们专注于数据而不是 DOM 操作；三是在复杂场景下的性能优化，通过 Diff 算法减少不必要的 DOM 更新。

但是也要客观看待它的缺点：首先，首次渲染会比原生慢，因为多了创建虚拟 DOM 和遍历的过程；其次，需要维护虚拟 DOM 树，会占用额外内存；最重要的是，虚拟 DOM 并不是在所有场景下都快，比如简单的单点更新，直接操作 DOM 反而更快。

虚拟 DOM 的价值在于它提供了一个合理的性能上限和下限，同时带来了更好的开发体验和可维护性。对于复杂应用来说，这个权衡是值得的。"

---

### 3. Vue 的 Diff 算法是怎么工作的？

**一句话答案：**
Vue 的 Diff 算法采用双端比较策略，通过同层比较、头尾指针对撞的方式，高效地找出新旧虚拟 DOM 的最小差异。

**详细解答：**

Vue 2.x 使用的是经典的**双端 Diff 算法**，Vue 3.x 进一步优化为**快速 Diff 算法**。

**核心原则：**

1. **同层比较**：只比较同一层级，不跨层级对比
```javascript
// 只会比较同层节点
<div>           <div>
  <p>    VS       <span>
</div>           </div>

// 不会尝试移动 p 到其他层级，而是直接删除 p，创建 span
```

2. **类型不同直接替换**
```javascript
// 旧节点
<div>content</div>

// 新节点
<p>content</p>

// 结果：直接删除 div，创建新的 p（不会复用）
```

3. **使用 key 优化列表对比**

**Vue 2 双端 Diff 算法流程：**

```javascript
// 示例：对比两个列表
const oldChildren = [
  { key: 'A', text: 'A' },
  { key: 'B', text: 'B' },
  { key: 'C', text: 'C' },
  { key: 'D', text: 'D' }
];

const newChildren = [
  { key: 'D', text: 'D' },
  { key: 'A', text: 'A' },
  { key: 'B', text: 'B' },
  { key: 'C', text: 'C' }
];

// 双端比较步骤：
function updateChildren(oldCh, newCh) {
  let oldStartIdx = 0;
  let oldEndIdx = oldCh.length - 1;
  let newStartIdx = 0;
  let newEndIdx = newCh.length - 1;

  let oldStartVNode = oldCh[0];      // A
  let oldEndVNode = oldCh[3];        // D
  let newStartVNode = newCh[0];      // D
  let newEndVNode = newCh[3];        // C

  // 四种快速比较（头头、尾尾、头尾、尾头）
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (oldStartVNode.key === newStartVNode.key) {
      // 头头相同：都后移
      patch(oldStartVNode, newStartVNode);
      oldStartVNode = oldCh[++oldStartIdx];
      newStartVNode = newCh[++newStartIdx];
    }
    else if (oldEndVNode.key === newEndVNode.key) {
      // 尾尾相同：都前移
      patch(oldEndVNode, newEndVNode);
      oldEndVNode = oldCh[--oldEndIdx];
      newEndVNode = newCh[--newEndIdx];
    }
    else if (oldStartVNode.key === newEndVNode.key) {
      // 头尾相同：旧头移到旧尾后面
      patch(oldStartVNode, newEndVNode);
      nodeOps.insertBefore(parentElm, oldStartVNode.elm, oldEndVNode.elm.nextSibling);
      oldStartVNode = oldCh[++oldStartIdx];
      newEndVNode = newCh[--newEndIdx];
    }
    else if (oldEndVNode.key === newStartVNode.key) {
      // 尾头相同：旧尾移到旧头前面
      patch(oldEndVNode, newStartVNode);
      nodeOps.insertBefore(parentElm, oldEndVNode.elm, oldStartVNode.elm);
      oldEndVNode = oldCh[--oldEndIdx];
      newStartVNode = newCh[++newStartIdx];
    }
    else {
      // 四种都没匹配：查找 key 映射
      const idxInOld = findIdxInOld(newStartVNode, oldCh, oldStartIdx, oldEndIdx);
      if (!idxInOld) {
        // 新节点，创建
        createElm(newStartVNode);
      } else {
        // 找到了，移动
        const vnodeToMove = oldCh[idxInOld];
        patch(vnodeToMove, newStartVNode);
        oldCh[idxInOld] = undefined;
        nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVNode.elm);
      }
      newStartVNode = newCh[++newStartIdx];
    }
  }

  // 处理剩余节点
  if (oldStartIdx > oldEndIdx) {
    // 旧节点遍历完，新节点有剩余 -> 新增
    addVnodes(newCh, newStartIdx, newEndIdx);
  } else if (newStartIdx > newEndIdx) {
    // 新节点遍历完，旧节点有剩余 -> 删除
    removeVnodes(oldCh, oldStartIdx, oldEndIdx);
  }
}
```

**图解双端比较：**

```
旧：[A, B, C, D]
新：[D, A, B, C]

第 1 轮：
oldStart(A) vs newStart(D) ❌
oldEnd(D) vs newEnd(C) ❌
oldStart(A) vs newEnd(C) ❌
oldEnd(D) vs newStart(D) ✅  -> D 移到最前面

旧：[A, B, C, _]
新：[_, A, B, C]

第 2 轮：
oldStart(A) vs newStart(A) ✅  -> A 位置不变

第 3 轮：
oldStart(B) vs newStart(B) ✅  -> B 位置不变

第 4 轮：
oldStart(C) vs newStart(C) ✅  -> C 位置不变

完成！只移动了 1 次 DOM
```

**Vue 3 快速 Diff 优化：**

```javascript
// Vue 3 新增了最长递增子序列算法
// 进一步减少移动次数

旧：[A, B, C, D, E, F, G]
新：[A, B, E, C, D, H, F, G]

// 1. 预处理：从头部开始比较相同节点
// A, B 相同，跳过

// 2. 预处理：从尾部开始比较相同节点
// F, G 相同，跳过

// 3. 中间部分 [C, D, E] vs [E, C, D, H]
// 使用最长递增子序列找出最少移动方案
// [C, D] 是递增的，只需移动 E 和新增 H
```

**面试口语化回答模板：**

"Vue 的 Diff 算法主要是同层比较，不会跨层级对比，这样可以将复杂度从 O(n³) 降到 O(n)。

具体来说，Vue 2 使用的是双端 Diff 算法，会同时从新旧子节点列表的头尾两端进行比较。它会尝试四种快速匹配：头头、尾尾、头尾、尾头。如果这四种都没匹配上，就会通过 key 去建立映射表查找。这种方式在处理列表顺序变化时非常高效，比如一个节点从尾部移到头部，可以很快识别出来。

Vue 3 做了进一步优化，引入了最长递增子序列算法，可以更精准地找出哪些节点需要移动，哪些可以保持不动，进一步减少了 DOM 操作次数。

这也是为什么我们在写列表时一定要加 key，而且不能用 index，因为 Diff 算法依赖 key 来快速判断节点是否可以复用。"

---

### 4. key 的作用是什么？为什么不能用 index 作为 key？

**一句话答案：**
key 是虚拟 DOM 节点的唯一标识，用于 Diff 算法快速判断节点是否可复用；使用 index 作为 key 会导致错误的节点复用和性能问题。

**详细解答：**

**key 的作用：**

1. **准确识别节点**：帮助 Diff 算法快速判断新旧节点是否相同

```javascript
// 没有 key：按顺序对比
旧：<li>A</li> <li>B</li> <li>C</li>
新：<li>D</li> <li>A</li> <li>B</li> <li>C</li>

// Vue 会认为：
// 第1个 li: A -> D (更新文本)
// 第2个 li: B -> A (更新文本)
// 第3个 li: C -> B (更新文本)
// 第4个 li: 新增 C
// 结果：3次更新 + 1次新增 = 4次操作

// 有 key：精准匹配
旧：<li key="a">A</li> <li key="b">B</li> <li key="c">C</li>
新：<li key="d">D</li> <li key="a">A</li> <li key="b">B</li> <li key="c">C</li>

// Vue 会认为：
// key="d": 新增 D
// key="a","b","c": 复用
// 结果：1次新增 + 0次更新 = 1次操作
```

2. **触发过渡效果**
```vue
<transition-group>
  <div v-for="item in list" :key="item.id">
    {{ item.name }}
  </div>
</transition-group>

<!-- 有 key 时，Vue 能追踪每个元素的移动，触发过渡动画 -->
```

3. **强制替换元素**
```vue
<!-- 切换组件时，使用不同 key 强制重新渲染 -->
<MyComponent :key="currentTab" />
```

**为什么不能用 index 作为 key：**

**问题 1：状态错乱**

```vue
<template>
  <div>
    <div v-for="(item, index) in list" :key="index">
      <input :value="item.name" />
      <button @click="deleteItem(index)">删除</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      list: [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
        { id: 3, name: 'C' }
      ]
    }
  },
  methods: {
    deleteItem(index) {
      this.list.splice(index, 1);
    }
  }
}
</script>
```

**演示问题：**
```
初始状态（用户在每个 input 中输入了内容）：
index=0  <input value="A" /> 用户输入：AAA
index=1  <input value="B" /> 用户输入：BBB
index=2  <input value="C" /> 用户输入：CCC

点击删除第一项后：
list = [{ id: 2, name: 'B' }, { id: 3, name: 'C' }]

使用 index 作为 key：
index=0  <input value="B" /> 但 input 实际显示：AAA ❌ (复用了原 index=0 的 DOM)
index=1  <input value="C" /> 但 input 实际显示：BBB ❌ (复用了原 index=1 的 DOM)

使用 id 作为 key：
key=2  <input value="B" /> input 正确显示：BBB ✅
key=3  <input value="C" /> input 正确显示：CCC ✅
```

**问题 2：性能问题**

```javascript
// 列表顺序变化
旧：[A(0), B(1), C(2), D(3)]
新：[D(0), A(1), B(2), C(3)]

// 使用 index 作为 key
// Diff 算法会认为：
// index=0: A -> D (更新)
// index=1: B -> A (更新)
// index=2: C -> B (更新)
// index=3: D -> C (更新)
// 结果：4 次更新

// 使用唯一 id 作为 key
// key=d: 移动到最前面
// key=a, b, c: 不变
// 结果：1 次移动，0 次更新
```

**问题 3：导致不必要的重渲染**

```vue
<template>
  <transition-group>
    <div v-for="(item, index) in list" :key="index" class="item">
      {{ item.name }}
    </div>
  </transition-group>
</template>

<!--
反转列表时：
使用 index：所有节点的 key 都对应不同内容，全部重新渲染
使用 id：节点只是移动位置，可以复用 DOM
-->
```

**什么时候可以用 index：**

```javascript
// 1. 静态列表，永远不会改变
const staticList = ['React', 'Vue', 'Angular'];

// 2. 列表只做展示，不涉及：
//    - 删除/插入/排序操作
//    - 有状态的子组件（如 input）
//    - 过渡动画

// 3. 列表只会在末尾追加
list.push(newItem); // 这种情况 index 影响较小
```

**正确做法：**

```vue
<template>
  <!-- ✅ 使用唯一且稳定的 id -->
  <div v-for="item in list" :key="item.id">
    {{ item.name }}
  </div>

  <!-- ✅ 如果没有 id，可以生成唯一标识 -->
  <div v-for="item in list" :key="`${item.category}-${item.name}`">
    {{ item.name }}
  </div>

  <!-- ❌ 不要用 index -->
  <div v-for="(item, index) in list" :key="index">
    {{ item.name }}
  </div>

  <!-- ❌ 不要用随机数 -->
  <div v-for="item in list" :key="Math.random()">
    {{ item.name }}
  </div>
</template>
```

**面试口语化回答模板：**

"key 的作用主要是给虚拟 DOM 节点一个唯一标识，让 Vue 的 Diff 算法能够准确判断哪些节点可以复用，哪些需要重新创建。

为什么不能用 index 作为 key 呢？主要有三个问题：

第一是状态错乱。比如列表中有 input 输入框，用户输入了内容，如果用 index 作为 key，删除第一项后，原本第二项的 DOM 会复用第一项的 DOM，导致输入框的值对不上。

第二是性能问题。如果列表顺序发生变化，比如反转列表，用 index 的话，Vue 会认为每个位置的内容都变了，导致全部重新渲染。而用唯一 id 的话，Vue 知道只是节点移动了位置，可以直接复用，性能更好。

第三是会影响过渡动画，因为 Vue 无法正确追踪元素的移动。

所以正确做法是使用数据的唯一标识，比如后端返回的 id。只有在静态列表、纯展示的场景下，才可以考虑用 index，但一般不建议这么做。"
