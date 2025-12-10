# React Router

## 基本使用
```jsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  )
}
```

## 路由参数
```jsx
<Route path="/user/:id" element={<User />} />

function User() {
  const { id } = useParams()
  return <div>User {id}</div>
}
```

## 编程式导航
```jsx
const navigate = useNavigate()
navigate('/about')
```
