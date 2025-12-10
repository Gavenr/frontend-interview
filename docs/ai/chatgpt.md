# ChatGPT / LLM 集成

## 概述

本文详细介绍如何在前端应用中集成 ChatGPT 和其他大语言模型（LLM），包括 API 使用、流式响应处理、实际应用案例等。

---

## OpenAI API 使用

### API Key 配置

#### 1. 获取 API Key

1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 注册/登录账号
3. 进入 API Keys 页面
4. 创建新的 API Key

#### 2. 安全存储

```javascript
// ❌ 错误：直接在前端代码中使用
const OPENAI_API_KEY = 'sk-xxx'; // 永远不要这样做！

// ✅ 正确：使用环境变量（后端）
// .env.local
OPENAI_API_KEY=sk-xxx

// 后端代码
const apiKey = process.env.OPENAI_API_KEY;
```

#### 3. 后端代理设置

```javascript
// Next.js API Route: pages/api/chat.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages
      })
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

### Chat Completions API

#### 基础调用

```javascript
/**
 * 基础的 Chat Completions API 调用
 */
async function chat(messages) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: messages,
      temperature: 0.7,        // 随机性：0-2，越低越确定
      max_tokens: 2000,        // 最大输出 token 数
      top_p: 1,                // 核采样
      frequency_penalty: 0,    // 频率惩罚：-2.0 到 2.0
      presence_penalty: 0      // 存在惩罚：-2.0 到 2.0
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// 使用示例
const messages = [
  {
    role: 'system',
    content: '你是一个专业的前端开发助手'
  },
  {
    role: 'user',
    content: '解释一下 React 的 useEffect'
  }
];

const reply = await chat(messages);
console.log(reply);
```

#### 参数详解

```javascript
const requestBody = {
  // 必需参数
  model: 'gpt-4',              // 模型：gpt-4, gpt-3.5-turbo 等
  messages: [],                // 消息数组

  // 可选参数
  temperature: 0.7,            // 温度：0-2
                               // 0: 确定性强，适合代码生成
                               // 0.7: 平衡创造力和准确性
                               // 1.5+: 高创造力，可能不准确

  max_tokens: 2000,            // 最大输出 token 数

  top_p: 1,                    // 核采样：0-1
                               // 与 temperature 二选一使用

  n: 1,                        // 生成几个回复

  stop: ['\n', 'END'],        // 停止序列

  presence_penalty: 0,         // 存在惩罚：-2.0 到 2.0
                               // 正值鼓励谈论新话题

  frequency_penalty: 0,        // 频率惩罚：-2.0 到 2.0
                               // 正值降低重复内容

  user: 'user-123'            // 用户标识（用于监控和限流）
};
```

#### 消息格式

```javascript
const messages = [
  // 1. System Message（系统消息）
  // 定义 AI 的角色和行为
  {
    role: 'system',
    content: '你是一个资深的前端架构师，擅长 React、Vue 和性能优化。'
  },

  // 2. User Message（用户消息）
  // 用户的输入
  {
    role: 'user',
    content: '如何优化 React 应用的首屏加载速度？'
  },

  // 3. Assistant Message（助手消息）
  // AI 的回复，用于多轮对话
  {
    role: 'assistant',
    content: '可以从以下几个方面优化...'
  },

  // 继续对话
  {
    role: 'user',
    content: '能给个代码示例吗？'
  }
];
```

### 流式响应（SSE）

#### 前端实现

```javascript
/**
 * 流式获取 ChatGPT 响应
 */
async function streamChat(messages, onChunk, onComplete, onError) {
  try {
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ messages })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        onComplete?.();
        break;
      }

      // 解码数据块
      buffer += decoder.decode(value, { stream: true });

      // 按行分割
      const lines = buffer.split('\n');

      // 保留最后一个不完整的行
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed || trimmed === 'data: [DONE]') {
          continue;
        }

        if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            const content = data.choices[0]?.delta?.content;

            if (content) {
              onChunk(content);
            }
          } catch (e) {
            console.error('Parse error:', e, trimmed);
          }
        }
      }
    }
  } catch (error) {
    console.error('Stream error:', error);
    onError?.(error);
  }
}

// 使用示例
let fullResponse = '';

await streamChat(
  messages,
  // onChunk: 每次接收到新内容
  (chunk) => {
    fullResponse += chunk;
    console.log('收到:', chunk);
    // 更新 UI
  },
  // onComplete: 完成
  () => {
    console.log('完整响应:', fullResponse);
  },
  // onError: 错误处理
  (error) => {
    console.error('错误:', error);
  }
);
```

#### 后端实现（Next.js）

```javascript
// pages/api/chat/stream.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  // 设置 SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages,
        stream: true  // 开启流式响应
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    // 转发流
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        res.write('data: [DONE]\n\n');
        res.end();
        break;
      }

      const chunk = decoder.decode(value);
      res.write(chunk);
    }
  } catch (error) {
    console.error('Stream error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
}

// 禁用 Next.js 的自动 body 解析
export const config = {
  api: {
    bodyParser: true,
    responseLimit: false
  }
};
```

### Function Calling

Function Calling 允许 GPT 调用你定义的函数，实现更复杂的交互。

#### 定义函数

```javascript
const functions = [
  {
    name: 'get_weather',
    description: '获取指定城市的天气信息',
    parameters: {
      type: 'object',
      properties: {
        city: {
          type: 'string',
          description: '城市名称，例如：北京、上海'
        },
        unit: {
          type: 'string',
          enum: ['celsius', 'fahrenheit'],
          description: '温度单位'
        }
      },
      required: ['city']
    }
  },
  {
    name: 'search_products',
    description: '搜索商品',
    parameters: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description: '搜索关键词'
        },
        category: {
          type: 'string',
          description: '商品分类'
        },
        priceRange: {
          type: 'object',
          properties: {
            min: { type: 'number' },
            max: { type: 'number' }
          }
        }
      },
      required: ['keyword']
    }
  }
];
```

#### 实现函数

```javascript
// 实际的函数实现
const availableFunctions = {
  get_weather: async ({ city, unit = 'celsius' }) => {
    // 调用天气 API
    const response = await fetch(`https://api.weather.com/${city}`);
    const data = await response.json();
    return {
      city,
      temperature: data.temp,
      unit,
      condition: data.condition
    };
  },

  search_products: async ({ keyword, category, priceRange }) => {
    // 调用商品搜索 API
    const params = new URLSearchParams({
      q: keyword,
      category: category || '',
      minPrice: priceRange?.min || 0,
      maxPrice: priceRange?.max || 99999
    });

    const response = await fetch(`/api/products?${params}`);
    const data = await response.json();
    return data.products;
  }
};
```

#### 使用 Function Calling

```javascript
async function chatWithFunctions(messages) {
  // 第一次调用：GPT 决定是否调用函数
  let response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages,
      functions,
      function_call: 'auto'  // 'auto' | 'none' | { name: 'function_name' }
    })
  });

  let data = await response.json();
  let message = data.choices[0].message;

  // 检查是否需要调用函数
  if (message.function_call) {
    const functionName = message.function_call.name;
    const functionArgs = JSON.parse(message.function_call.arguments);

    console.log(`调用函数: ${functionName}`);
    console.log('参数:', functionArgs);

    // 执行函数
    const functionResponse = await availableFunctions[functionName](functionArgs);

    // 将函数结果添加到消息历史
    messages.push(message);  // GPT 的 function_call 消息
    messages.push({
      role: 'function',
      name: functionName,
      content: JSON.stringify(functionResponse)
    });

    // 第二次调用：让 GPT 基于函数结果生成回复
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages
      })
    });

    data = await response.json();
    message = data.choices[0].message;
  }

  return message.content;
}

// 使用示例
const messages = [
  {
    role: 'system',
    content: '你是一个智能助手，可以查询天气和搜索商品。'
  },
  {
    role: 'user',
    content: '北京今天天气怎么样？'
  }
];

const reply = await chatWithFunctions(messages);
console.log(reply);
// GPT 会自动调用 get_weather 函数，然后基于结果回答
// 输出："北京今天天气晴朗，温度 25°C。"
```

### Vision API（图片理解）

GPT-4 Vision 可以理解图片内容。

```javascript
/**
 * 图片理解
 */
async function analyzeImage(imageUrl, question) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: question || '请描述这张图片'
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'high'  // 'low' | 'high' | 'auto'
              }
            }
          ]
        }
      ],
      max_tokens: 500
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

// 使用示例
const description = await analyzeImage(
  'https://example.com/screenshot.png',
  '这个界面有什么问题？如何改进？'
);

console.log(description);
```

#### 上传本地图片

```javascript
/**
 * 将图片转换为 base64
 */
function imageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * 分析本地图片
 */
async function analyzeLocalImage(file, question) {
  const base64Image = await imageToBase64(file);

  const response = await fetch('/api/vision', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      image: base64Image,
      question
    })
  });

  const data = await response.json();
  return data.result;
}

// 使用示例（React）
function ImageAnalyzer() {
  const [result, setResult] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const description = await analyzeLocalImage(
        file,
        '这张图片显示的是什么？'
      );
      setResult(description);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <p>{result}</p>
    </div>
  );
}
```

---

## 前端集成实践

### React 中集成 ChatGPT

#### 完整的聊天组件

```jsx
import React, { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

// 配置 marked
marked.setOptions({
  highlight: (code, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
  breaks: true,
  gfm: true
});

function ChatApp() {
  const [messages, setMessages] = useState([
    {
      role: 'system',
      content: '你是一个专业的前端开发助手'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // 发送消息
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input.trim()
    };

    // 添加用户消息
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setStreamingContent('');

    try {
      // 调用流式 API
      await streamChat(
        newMessages,
        (chunk) => {
          setStreamingContent(prev => prev + chunk);
        },
        () => {
          // 完成时添加到消息列表
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: streamingContent
            }
          ]);
          setStreamingContent('');
          setLoading(false);
        },
        (error) => {
          console.error('Error:', error);
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: '抱歉，发生了错误，请稍后重试。'
            }
          ]);
          setStreamingContent('');
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Send message error:', error);
      setLoading(false);
      setStreamingContent('');
    }
  };

  // 流式响应函数
  const streamChat = async (msgs, onChunk, onComplete, onError) => {
    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: msgs })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          onComplete();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;

          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              const content = data.choices[0]?.delta?.content;
              if (content) onChunk(content);
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      }
    } catch (error) {
      onError(error);
    }
  };

  return (
    <div className="chat-container">
      {/* 消息列表 */}
      <div className="messages">
        {messages.slice(1).map((msg, index) => (
          <Message key={index} message={msg} />
        ))}

        {/* 流式响应中的消息 */}
        {streamingContent && (
          <Message
            message={{
              role: 'assistant',
              content: streamingContent
            }}
            streaming
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div className="input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="输入消息... (Shift+Enter 换行)"
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()}>
          {loading ? '发送中...' : '发送'}
        </button>
      </div>
    </div>
  );
}

// 消息组件
function Message({ message, streaming }) {
  const isUser = message.role === 'user';

  return (
    <div className={`message ${isUser ? 'user' : 'assistant'}`}>
      <div className="avatar">
        {isUser ? '👤' : '🤖'}
      </div>
      <div className="content">
        {isUser ? (
          <div className="text">{message.content}</div>
        ) : (
          <div
            className="text markdown"
            dangerouslySetInnerHTML={{
              __html: marked(message.content)
            }}
          />
        )}
        {streaming && <span className="cursor">▊</span>}
      </div>
    </div>
  );
}

export default ChatApp;
```

#### 样式

```css
/* styles/chat.css */
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 900px;
  margin: 0 auto;
  background: #fff;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f5f5f5;
}

.message {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.user {
  flex-direction: row-reverse;
}

.avatar {
  font-size: 32px;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  position: relative;
}

.message.user .content {
  background: #007bff;
  color: white;
  border-bottom-right-radius: 4px;
}

.message.assistant .content {
  background: white;
  border: 1px solid #e0e0e0;
  border-bottom-left-radius: 4px;
}

.markdown {
  line-height: 1.6;
}

.markdown h1,
.markdown h2,
.markdown h3 {
  margin-top: 16px;
  margin-bottom: 8px;
}

.markdown code {
  background: #f4f4f4;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.markdown pre {
  background: #1e1e1e;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 12px 0;
}

.markdown pre code {
  background: none;
  padding: 0;
  color: #d4d4d4;
}

.markdown ul,
.markdown ol {
  padding-left: 24px;
}

.markdown blockquote {
  border-left: 4px solid #ddd;
  padding-left: 16px;
  margin: 12px 0;
  color: #666;
}

.cursor {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.input-area {
  display: flex;
  gap: 12px;
  padding: 20px;
  background: white;
  border-top: 1px solid #e0e0e0;
}

textarea {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  resize: none;
  font-size: 14px;
  font-family: inherit;
  min-height: 60px;
  max-height: 200px;
}

textarea:focus {
  outline: none;
  border-color: #007bff;
}

textarea:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

button {
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
}

button:hover:not(:disabled) {
  background: #0056b3;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
```

### Vue 3 中集成 ChatGPT

```vue
<template>
  <div class="chat-container">
    <!-- 消息列表 -->
    <div ref="messagesContainer" class="messages">
      <div
        v-for="(msg, index) in displayMessages"
        :key="index"
        :class="['message', msg.role]"
      >
        <div class="avatar">
          {{ msg.role === 'user' ? '👤' : '🤖' }}
        </div>
        <div class="content">
          <div v-if="msg.role === 'user'" class="text">
            {{ msg.content }}
          </div>
          <div
            v-else
            class="text markdown"
            v-html="renderMarkdown(msg.content)"
          ></div>
          <span v-if="msg.streaming" class="cursor">▊</span>
        </div>
      </div>
    </div>

    <!-- 输入框 -->
    <div class="input-area">
      <textarea
        v-model="input"
        @keydown.enter.exact.prevent="sendMessage"
        placeholder="输入消息... (Shift+Enter 换行)"
        :disabled="loading"
      ></textarea>
      <button @click="sendMessage" :disabled="loading || !input.trim()">
        {{ loading ? '发送中...' : '发送' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue';
import { marked } from 'marked';
import hljs from 'highlight.js';

// 配置 marked
marked.setOptions({
  highlight: (code, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
  breaks: true,
  gfm: true
});

const messages = ref([
  {
    role: 'system',
    content: '你是一个专业的前端开发助手'
  }
]);

const input = ref('');
const loading = ref(false);
const streamingContent = ref('');
const messagesContainer = ref(null);

// 显示的消息（包括流式内容）
const displayMessages = computed(() => {
  const msgs = messages.value.slice(1); // 排除 system message

  if (streamingContent.value) {
    return [
      ...msgs,
      {
        role: 'assistant',
        content: streamingContent.value,
        streaming: true
      }
    ];
  }

  return msgs;
});

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

// 监听消息变化，自动滚动
watch(
  () => [messages.value.length, streamingContent.value],
  () => {
    scrollToBottom();
  }
);

// 渲染 Markdown
const renderMarkdown = (content) => {
  return marked(content);
};

// 发送消息
const sendMessage = async () => {
  if (!input.value.trim() || loading.value) return;

  const userMessage = {
    role: 'user',
    content: input.value.trim()
  };

  messages.value.push(userMessage);
  input.value = '';
  loading.value = true;
  streamingContent.value = '';

  try {
    await streamChat(
      messages.value,
      (chunk) => {
        streamingContent.value += chunk;
      },
      () => {
        messages.value.push({
          role: 'assistant',
          content: streamingContent.value
        });
        streamingContent.value = '';
        loading.value = false;
      },
      (error) => {
        console.error('Error:', error);
        messages.value.push({
          role: 'assistant',
          content: '抱歉，发生了错误，请稍后重试。'
        });
        streamingContent.value = '';
        loading.value = false;
      }
    );
  } catch (error) {
    console.error('Send message error:', error);
    loading.value = false;
    streamingContent.value = '';
  }
};

// 流式响应
const streamChat = async (msgs, onChunk, onComplete, onError) => {
  try {
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: msgs })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        onComplete();
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;

        if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            const content = data.choices[0]?.delta?.content;
            if (content) onChunk(content);
          } catch (e) {
            console.error('Parse error:', e);
          }
        }
      }
    }
  } catch (error) {
    onError(error);
  }
};
</script>

<style scoped>
/* 使用之前的 CSS 样式 */
</style>
```

### 聊天界面实现

#### 打字机效果实现

```javascript
/**
 * 打字机效果组件
 */
import React, { useState, useEffect } from 'react';

function TypewriterText({ text, speed = 30 }) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed]);

  return <span>{displayText}<span className="cursor">▊</span></span>;
}

// 使用
function Message({ content, streaming }) {
  if (streaming) {
    return <TypewriterText text={content} speed={30} />;
  }
  return <div>{content}</div>;
}
```

### Markdown 渲染

已在上面的组件中包含，使用 `marked` 和 `highlight.js`。

### 代码高亮

```javascript
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css'; // 选择主题

// 配置 marked
import { marked } from 'marked';

marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch (err) {
        console.error(err);
      }
    }
    return hljs.highlightAuto(code).value;
  },
  langPrefix: 'hljs language-', // highlight.js css uses this prefix
  breaks: true, // 支持 GFM 换行
  gfm: true // 启用 GitHub Flavored Markdown
});
```

---

## 其他 LLM API

### Claude API

```javascript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function chatWithClaude(messages) {
  const response = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 1024,
    messages: messages.map(msg => ({
      role: msg.role === 'system' ? 'user' : msg.role,
      content: msg.content
    }))
  });

  return response.content[0].text;
}
```

### 文心一言（百度）

```javascript
async function chatWithErnie(messages) {
  // 1. 获取 access_token
  const authResponse = await fetch(
    `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${API_KEY}&client_secret=${SECRET_KEY}`,
    { method: 'POST' }
  );
  const { access_token } = await authResponse.json();

  // 2. 调用 API
  const response = await fetch(
    `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions_pro?access_token=${access_token}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    }
  );

  const data = await response.json();
  return data.result;
}
```

### 通义千问（阿里）

```javascript
async function chatWithQwen(messages) {
  const response = await fetch(
    'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DASHSCOPE_API_KEY}`
      },
      body: JSON.stringify({
        model: 'qwen-max',
        input: {
          messages
        }
      })
    }
  );

  const data = await response.json();
  return data.output.text;
}
```

---

## Token 计算和成本控制

### Token 计数

```javascript
import { encoding_for_model } from 'tiktoken';

class TokenCounter {
  constructor(model = 'gpt-4') {
    this.model = model;
    this.encoding = encoding_for_model(model);
  }

  // 计算文本的 token 数
  count(text) {
    return this.encoding.encode(text).length;
  }

  // 计算消息数组的 token 数
  countMessages(messages) {
    let total = 3; // 每个对话都有固定的 3 个 token 开销

    for (const message of messages) {
      total += 3; // 每条消息 3 个 token
      total += this.count(message.content);

      if (message.name) {
        total += this.count(message.name) + 1;
      }
    }

    return total;
  }

  // 释放资源
  free() {
    this.encoding.free();
  }
}

// 使用
const counter = new TokenCounter('gpt-4');
const tokens = counter.countMessages(messages);
console.log(`Total tokens: ${tokens}`);
counter.free();
```

### 成本估算

```javascript
class CostEstimator {
  constructor() {
    // 价格表（美元/1K tokens）
    this.pricing = {
      'gpt-4': {
        input: 0.03,
        output: 0.06
      },
      'gpt-4-turbo': {
        input: 0.01,
        output: 0.03
      },
      'gpt-3.5-turbo': {
        input: 0.0015,
        output: 0.002
      }
    };
  }

  // 估算单次对话成本
  estimateCost(model, inputTokens, outputTokens) {
    const price = this.pricing[model];
    if (!price) {
      throw new Error(`Unknown model: ${model}`);
    }

    const inputCost = (inputTokens / 1000) * price.input;
    const outputCost = (outputTokens / 1000) * price.output;

    return {
      inputCost,
      outputCost,
      totalCost: inputCost + outputCost,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens
    };
  }

  // 格式化成本
  formatCost(cost) {
    return `$${cost.toFixed(4)}`;
  }
}

// 使用
const estimator = new CostEstimator();
const cost = estimator.estimateCost('gpt-4', 1000, 500);

console.log(`输入成本: ${estimator.formatCost(cost.inputCost)}`);
console.log(`输出成本: ${estimator.formatCost(cost.outputCost)}`);
console.log(`总成本: ${estimator.formatCost(cost.totalCost)}`);
```

### 成本控制策略

```javascript
class CostController {
  constructor(maxTokens = 4000, maxCostPerRequest = 0.1) {
    this.maxTokens = maxTokens;
    this.maxCostPerRequest = maxCostPerRequest;
    this.tokenCounter = new TokenCounter();
    this.costEstimator = new CostEstimator();
  }

  // 限制消息历史长度
  limitMessages(messages, systemMessage) {
    const result = systemMessage ? [systemMessage] : [];
    let totalTokens = systemMessage ? this.tokenCounter.count(systemMessage.content) : 0;

    // 从最新消息开始添加
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      const tokens = this.tokenCounter.count(msg.content);

      if (totalTokens + tokens > this.maxTokens) {
        break;
      }

      result.unshift(msg);
      totalTokens += tokens;
    }

    return { messages: result, totalTokens };
  }

  // 估算并控制成本
  checkCost(inputTokens, estimatedOutputTokens = 1000) {
    const cost = this.costEstimator.estimateCost(
      'gpt-4',
      inputTokens,
      estimatedOutputTokens
    );

    if (cost.totalCost > this.maxCostPerRequest) {
      throw new Error(
        `预估成本 ${cost.totalCost.toFixed(4)} 超过限制 ${this.maxCostPerRequest}`
      );
    }

    return cost;
  }
}

// 使用
const controller = new CostController(4000, 0.1);

// 限制消息
const { messages: limited, totalTokens } = controller.limitMessages(
  allMessages,
  systemMessage
);

// 检查成本
try {
  const cost = controller.checkCost(totalTokens, 1000);
  console.log('预估成本:', cost);
  // 继续调用 API
} catch (error) {
  console.error('成本超限:', error.message);
  // 提示用户或减少 token 使用
}
```

---

## 安全注意事项

### 1. API Key 保护

```javascript
// ❌ 错误做法
const OPENAI_API_KEY = 'sk-xxx'; // 永远不要在前端代码中硬编码

// ❌ 错误做法
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}` // 暴露在前端
  }
});

// ✅ 正确做法：使用后端代理
// 前端调用后端
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ messages })
});

// 后端存储 API Key
const apiKey = process.env.OPENAI_API_KEY;
```

### 2. 输入验证和过滤

```javascript
class InputValidator {
  // 验证用户输入
  validate(input) {
    // 1. 长度限制
    if (input.length > 5000) {
      throw new Error('输入过长');
    }

    // 2. 内容过滤（敏感词）
    const bannedWords = ['敏感词1', '敏感词2'];
    for (const word of bannedWords) {
      if (input.includes(word)) {
        throw new Error('输入包含敏感内容');
      }
    }

    // 3. 格式检查
    if (/<script/i.test(input)) {
      throw new Error('输入包含不安全内容');
    }

    return true;
  }

  // 清理输入
  sanitize(input) {
    return input
      .trim()
      .replace(/<script.*?>.*?<\/script>/gi, '') // 移除 script 标签
      .replace(/[<>]/g, ''); // 移除尖括号
  }
}

// 使用
const validator = new InputValidator();

try {
  validator.validate(userInput);
  const cleanInput = validator.sanitize(userInput);
  // 继续处理
} catch (error) {
  console.error('输入验证失败:', error.message);
}
```

### 3. 访问控制和限流

```javascript
// 限流中间件（Express）
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 最多 100 次请求
  message: '请求过于频繁，请稍后再试'
});

app.use('/api/chat', limiter);

// 用户身份验证
app.post('/api/chat', authenticateUser, async (req, res) => {
  // 验证用户身份
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // 检查用户配额
  const usage = await getUserUsage(req.user.id);
  if (usage > MAX_USAGE) {
    return res.status(429).json({ error: 'Quota exceeded' });
  }

  // 继续处理
});
```

### 4. 输出过滤

```javascript
class OutputFilter {
  // 过滤敏感信息
  filter(output) {
    // 1. 移除可能的敏感数据
    return output
      .replace(/\b\d{11}\b/g, '***手机号***') // 手机号
      .replace(/\b\d{15,18}\b/g, '***身份证***') // 身份证
      .replace(/sk-[a-zA-Z0-9]{48}/g, '***API_KEY***'); // API Key
  }

  // 检测不当内容
  hasInappropriateContent(output) {
    const patterns = [
      /暴力/i,
      /色情/i,
      // 更多模式...
    ];

    return patterns.some(pattern => pattern.test(output));
  }
}

// 使用
const filter = new OutputFilter();

let response = await getAIResponse(messages);

// 过滤输出
response = filter.filter(response);

// 检查内容
if (filter.hasInappropriateContent(response)) {
  response = '抱歉，无法提供相关内容';
}
```

---

## 面试题

**1. 如何实现 ChatGPT 的流式响应？**

关键点：
- 使用 Server-Sent Events (SSE)
- ReadableStream API
- 逐块解析和显示

**2. 如何保护 API Key 不被泄露？**

答案：
- 永远不在前端暴露 API Key
- 使用后端代理
- 环境变量存储
- 访问控制和限流

**3. 如何计算和控制 API 调用成本？**

答案：
- 使用 tiktoken 计算 token 数
- 限制消息历史长度
- 设置成本上限
- 监控 API 使用情况

**4. Function Calling 的应用场景是什么？**

答案：
- 调用外部 API（天气、搜索等）
- 数据库查询
- 执行计算
- 与现有系统集成

**5. 如何优化聊天应用的用户体验？**

答案：
- 流式响应（打字机效果）
- Markdown 渲染
- 代码高亮
- 自动滚动
- 加载状态
- 错误处理

---

## 总结

本文介绍了：
1. OpenAI API 的完整使用方法
2. 流式响应的实现
3. Function Calling 的应用
4. React/Vue 集成实践
5. Token 计算和成本控制
6. 安全注意事项

掌握这些内容，你就能在项目中成功集成 ChatGPT 和其他 LLM！
