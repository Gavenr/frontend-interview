# React 核心原理

## React 特点
- 声明式编程
- 组件化
- 虚拟DOM
- 单向数据流

## JSX
```jsx
const element = <h1>Hello, {name}!</h1>
```

## 组件
```jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>
}

class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>
  }
}
```

## State
```jsx
const [count, setCount] = useState(0)
```

## Props
```jsx
<Welcome name="Alice" />
```
