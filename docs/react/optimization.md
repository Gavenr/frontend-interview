# React 性能优化

## React.memo
```jsx
const MyComponent = React.memo(function MyComponent(props) {
  return <div>{props.value}</div>
})
```

## useMemo
```jsx
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b])
```

## useCallback
```jsx
const memoizedCallback = useCallback(() => {
  doSomething(a, b)
}, [a, b])
```

## 懒加载
```jsx
const OtherComponent = React.lazy(() => import('./OtherComponent'))

<Suspense fallback={<div>Loading...</div>}>
  <OtherComponent />
</Suspense>
```

## 虚拟列表
使用 react-window 或 react-virtualized
