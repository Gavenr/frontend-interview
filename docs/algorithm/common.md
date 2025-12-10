# 常见算法

## 排序

### 冒泡排序
```javascript
function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
      }
    }
  }
  return arr
}
```

### 快速排序
```javascript
function quickSort(arr) {
  if (arr.length <= 1) return arr
  const pivot = arr[0]
  const left = arr.slice(1).filter(x => x <= pivot)
  const right = arr.slice(1).filter(x => x > pivot)
  return [...quickSort(left), pivot, ...quickSort(right)]
}
```

## 搜索

### 二分查找
```javascript
function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1
  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    if (arr[mid] === target) return mid
    if (arr[mid] < target) left = mid + 1
    else right = mid - 1
  }
  return -1
}
```

## 链表

### 反转链表
```javascript
function reverseList(head) {
  let prev = null, curr = head
  while (curr) {
    const next = curr.next
    curr.next = prev
    prev = curr
    curr = next
  }
  return prev
}
```

## 树

### 二叉树遍历
```javascript
// 前序遍历
function preorder(root) {
  if (!root) return []
  return [root.val, ...preorder(root.left), ...preorder(root.right)]
}

// 中序遍历
function inorder(root) {
  if (!root) return []
  return [...inorder(root.left), root.val, ...inorder(root.right)]
}

// 后序遍历
function postorder(root) {
  if (!root) return []
  return [...postorder(root.left), ...postorder(root.right), root.val]
}

// 层序遍历
function levelOrder(root) {
  if (!root) return []
  const queue = [root], result = []
  while (queue.length) {
    const level = []
    const size = queue.length
    for (let i = 0; i < size; i++) {
      const node = queue.shift()
      level.push(node.val)
      if (node.left) queue.push(node.left)
      if (node.right) queue.push(node.right)
    }
    result.push(level)
  }
  return result
}
```
