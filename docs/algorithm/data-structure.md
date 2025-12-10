# 数据结构

## 数组
```javascript
const arr = [1, 2, 3]
arr.push(4)
arr.pop()
```

## 链表
```javascript
class ListNode {
  constructor(val) {
    this.val = val
    this.next = null
  }
}
```

## 栈
```javascript
class Stack {
  constructor() {
    this.items = []
  }
  push(item) {
    this.items.push(item)
  }
  pop() {
    return this.items.pop()
  }
}
```

## 队列
```javascript
class Queue {
  constructor() {
    this.items = []
  }
  enqueue(item) {
    this.items.push(item)
  }
  dequeue() {
    return this.items.shift()
  }
}
```

## 树
```javascript
class TreeNode {
  constructor(val) {
    this.val = val
    this.left = null
    this.right = null
  }
}
```

## 哈希表
```javascript
const map = new Map()
map.set('key', 'value')
```
