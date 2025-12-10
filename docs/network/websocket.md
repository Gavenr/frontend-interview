# WebSocket

## 基本使用
```javascript
const ws = new WebSocket('ws://localhost:8080')

ws.onopen = () => {
  console.log('连接成功')
  ws.send('Hello')
}

ws.onmessage = (event) => {
  console.log('收到消息:', event.data)
}

ws.onclose = () => {
  console.log('连接关闭')
}
```
