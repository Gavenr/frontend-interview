# 大模型应用开发

## 概述

本文详细介绍如何在前端开发大语言模型（LLM）应用，包括 Prompt Engineering、LangChain.js、Vercel AI SDK、RAG 实现等核心技术。

---

## LLM 应用开发基础

### Prompt Engineering 技巧

#### 1. 基本原则

**清晰明确**
```javascript
// ❌ 模糊的提示
const prompt = "翻译这个";

// ✅ 清晰的提示
const prompt = `
将以下英文翻译成中文：
- 保持专业术语的准确性
- 使用简体中文
- 保留原文的段落格式

原文：
${englishText}
`;
```

**提供上下文**
```javascript
// ❌ 缺少上下文
const prompt = "这段代码有什么问题？";

// ✅ 提供充足上下文
const prompt = `
我正在开发一个 React 应用，使用 TypeScript。
以下代码在生产环境中性能很差：

\`\`\`typescript
${code}
\`\`\`

请分析：
1. 性能瓶颈在哪里？
2. 如何优化？
3. 给出优化后的代码
`;
```

**指定输出格式**
```javascript
// ✅ 结构化输出
const prompt = `
分析以下用户反馈，按 JSON 格式输出：

{
  "sentiment": "positive|negative|neutral",
  "category": "bug|feature|question",
  "priority": "high|medium|low",
  "summary": "简短总结",
  "action": "建议的后续行动"
}

用户反馈：
${userFeedback}
`;
```

#### 2. Few-Shot Learning（少样本学习）

```javascript
/**
 * Few-Shot Learning 示例
 */
async function extractProductInfo(description) {
  const prompt = `
从商品描述中提取结构化信息：

示例 1:
输入: "iPhone 14 Pro 256GB 深空黑色，全新未拆封，价格 7999 元"
输出: {
  "brand": "Apple",
  "model": "iPhone 14 Pro",
  "storage": "256GB",
  "color": "深空黑色",
  "condition": "全新未拆封",
  "price": 7999,
  "currency": "CNY"
}

示例 2:
输入: "二手 MacBook Air M1 8GB+256GB 银色 9 成新 5800"
输出: {
  "brand": "Apple",
  "model": "MacBook Air M1",
  "memory": "8GB",
  "storage": "256GB",
  "color": "银色",
  "condition": "9成新",
  "price": 5800,
  "currency": "CNY"
}

现在提取:
输入: "${description}"
输出:
  `;

  const response = await callLLM(prompt);
  return JSON.parse(response);
}

// 使用
const info = await extractProductInfo(
  "全新 AirPods Pro 2 白色 原装正品 1799 包邮"
);
console.log(info);
// {
//   "brand": "Apple",
//   "model": "AirPods Pro 2",
//   "color": "白色",
//   "condition": "全新",
//   "price": 1799,
//   "currency": "CNY"
// }
```

#### 3. Zero-Shot Learning（零样本学习）

```javascript
/**
 * Zero-Shot Learning - 不提供示例，依靠模型的理解能力
 */
async function classifyText(text, categories) {
  const prompt = `
将以下文本分类到最合适的类别。

可选类别：
${categories.map((c, i) => `${i + 1}. ${c}`).join('\n')}

文本：
"${text}"

输出格式：
{
  "category": "类别名称",
  "confidence": 0-1 之间的置信度,
  "reason": "分类理由"
}
  `;

  const response = await callLLM(prompt);
  return JSON.parse(response);
}

// 使用
const result = await classifyText(
  "我的订单已经 3 天了还没发货，什么时候能到？",
  ["咨询", "投诉", "建议", "表扬"]
);

console.log(result);
// {
//   "category": "投诉",
//   "confidence": 0.85,
//   "reason": "用户对订单延迟发货表示不满"
// }
```

#### 4. Chain of Thought（思维链）

```javascript
/**
 * Chain of Thought - 引导 LLM 一步步思考
 */
async function solveComplexProblem(problem) {
  const prompt = `
问题：${problem}

请按以下步骤思考并解决：

1. 理解问题
   - 问题的核心是什么？
   - 需要哪些信息？

2. 分析思路
   - 有哪些可能的解决方案？
   - 各有什么优缺点？

3. 选择方案
   - 哪个方案最合适？为什么？

4. 实现步骤
   - 具体怎么做？
   - 每一步的目的是什么？

5. 代码实现
   - 给出完整可运行的代码
   - 添加必要的注释

请逐步思考并给出详细答案。
  `;

  return await callLLM(prompt);
}

// 使用
const solution = await solveComplexProblem(
  "如何实现一个支持撤销/重做功能的富文本编辑器？"
);
```

#### 5. 角色扮演（Role Playing）

```javascript
/**
 * 角色扮演 - 让 LLM 扮演特定角色
 */
class AIAssistant {
  constructor(role) {
    this.systemPrompt = this.getRolePrompt(role);
  }

  getRolePrompt(role) {
    const roles = {
      architect: `
你是一个资深的前端架构师，拥有 10 年以上的大型项目经验。
你的职责是：
- 设计可扩展、可维护的系统架构
- 权衡技术方案的利弊
- 给出专业的技术建议
- 考虑性能、安全性、可维护性

回答风格：
- 专业、严谨
- 考虑实际工程问题
- 提供具体可行的方案
- 说明技术选择的理由
      `,

      mentor: `
你是一个经验丰富的前端导师，擅长教学。
你的职责是：
- 用简单易懂的方式解释技术概念
- 从基础到高级循序渐进
- 提供实际例子帮助理解
- 鼓励学习和探索

回答风格：
- 友好、耐心
- 循序渐进
- 多举例子
- 鼓励提问
      `,

      reviewer: `
你是一个严格的代码审查者。
你的职责是：
- 检查代码质量和规范
- 发现潜在的 bug 和性能问题
- 提出改进建议
- 确保最佳实践

回答风格：
- 严谨、细致
- 指出具体问题
- 给出改进方案
- 解释原因
      `
    };

    return roles[role] || roles.mentor;
  }

  async ask(question) {
    const response = await callLLM([
      {
        role: 'system',
        content: this.systemPrompt
      },
      {
        role: 'user',
        content: question
      }
    ]);

    return response;
  }
}

// 使用不同角色
const architect = new AIAssistant('architect');
const answer1 = await architect.ask('应该选择 Redux 还是 MobX？');

const mentor = new AIAssistant('mentor');
const answer2 = await mentor.ask('什么是闭包？');

const reviewer = new AIAssistant('reviewer');
const answer3 = await reviewer.ask('审查这段代码：' + code);
```

---

## LangChain.js 使用

### 基本概念

LangChain 是一个用于构建 LLM 应用的框架，提供了：
- Chains（链）：组合多个操作
- Agents（代理）：自主决策和行动
- Memory（记忆）：保持对话上下文
- Tools（工具）：扩展 LLM 能力

### 安装

```bash
npm install langchain
npm install @langchain/openai
```

### Chains（链）

```javascript
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from 'langchain/prompts';
import { LLMChain } from 'langchain/chains';

// 1. 简单的 Chain
async function createSimpleChain() {
  const model = new ChatOpenAI({
    modelName: 'gpt-4',
    temperature: 0.7
  });

  const prompt = PromptTemplate.fromTemplate(
    '将以下内容翻译成{language}：\n\n{text}'
  );

  const chain = new LLMChain({
    llm: model,
    prompt
  });

  const result = await chain.call({
    language: '法语',
    text: 'Hello, how are you?'
  });

  return result.text;
}

// 2. Sequential Chain（顺序链）
import { SimpleSequentialChain } from 'langchain/chains';

async function createSequentialChain() {
  const model = new ChatOpenAI({ modelName: 'gpt-4' });

  // Chain 1: 生成故事大纲
  const outlinePrompt = PromptTemplate.fromTemplate(
    '为一个关于{topic}的故事创建大纲'
  );
  const outlineChain = new LLMChain({
    llm: model,
    prompt: outlinePrompt
  });

  // Chain 2: 基于大纲写故事
  const storyPrompt = PromptTemplate.fromTemplate(
    '基于以下大纲写一个故事：\n\n{outline}'
  );
  const storyChain = new LLMChain({
    llm: model,
    prompt: storyPrompt
  });

  // 组合两个 Chain
  const sequentialChain = new SimpleSequentialChain({
    chains: [outlineChain, storyChain]
  });

  const result = await sequentialChain.run('人工智能');
  return result;
}

// 3. Router Chain（路由链）
import { RouterChain } from 'langchain/chains';

async function createRouterChain() {
  const model = new ChatOpenAI({ modelName: 'gpt-4' });

  // 定义不同的目标链
  const techChain = new LLMChain({
    llm: model,
    prompt: PromptTemplate.fromTemplate(
      '作为技术专家回答：{question}'
    )
  });

  const businessChain = new LLMChain({
    llm: model,
    prompt: PromptTemplate.fromTemplate(
      '作为商业顾问回答：{question}'
    )
  });

  // 路由逻辑
  const routerChain = RouterChain.fromLLM(model, {
    destinations: [
      {
        name: 'tech',
        description: '技术相关问题',
        chain: techChain
      },
      {
        name: 'business',
        description: '商业相关问题',
        chain: businessChain
      }
    ]
  });

  // 自动路由到合适的链
  const result = await routerChain.call({
    question: '如何优化 React 应用性能？'
  }); // 会路由到 techChain

  return result;
}
```

### Agents（代理）

```javascript
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { Calculator } from 'langchain/tools/calculator';
import { WebBrowser } from 'langchain/tools/webbrowser';

/**
 * Agent - 可以自主决策和使用工具
 */
async function createAgent() {
  const model = new ChatOpenAI({
    modelName: 'gpt-4',
    temperature: 0
  });

  // 定义工具
  const tools = [
    new Calculator(), // 计算器
    new WebBrowser(), // 网页浏览
    {
      name: 'get_weather',
      description: '获取指定城市的天气信息。输入应该是城市名称。',
      func: async (city) => {
        // 模拟调用天气 API
        return `${city}的天气：晴天，温度 25°C`;
      }
    },
    {
      name: 'search_database',
      description: '在数据库中搜索用户信息。输入应该是用户 ID。',
      func: async (userId) => {
        // 模拟数据库查询
        return JSON.stringify({
          id: userId,
          name: '张三',
          email: 'zhangsan@example.com'
        });
      }
    }
  ];

  // 创建 Agent
  const agent = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: 'openai-functions',
    verbose: true // 显示思考过程
  });

  return agent;
}

// 使用 Agent
async function useAgent() {
  const agent = await createAgent();

  // Agent 会自动决定使用哪些工具
  const result = await agent.call({
    input: '北京的天气怎么样？如果温度超过 20 度，计算 20 * 3.14 的值'
  });

  console.log(result.output);
  // Agent 思考过程：
  // 1. 使用 get_weather 工具查询北京天气 → 25°C
  // 2. 判断 25 > 20，需要计算
  // 3. 使用 Calculator 工具计算 20 * 3.14 → 62.8
  // 4. 生成回答
}
```

### Memory（记忆）

```javascript
import { BufferMemory } from 'langchain/memory';
import { ConversationChain } from 'langchain/chains';

/**
 * Memory - 保持对话上下文
 */
class ChatBot {
  constructor() {
    this.model = new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0.7
    });

    // 1. Buffer Memory - 保存所有消息
    this.memory = new BufferMemory();

    this.chain = new ConversationChain({
      llm: this.model,
      memory: this.memory
    });
  }

  async chat(message) {
    const response = await this.chain.call({ input: message });
    return response.response;
  }

  // 获取对话历史
  async getHistory() {
    return await this.memory.loadMemoryVariables({});
  }

  // 清除记忆
  async clearMemory() {
    await this.memory.clear();
  }
}

// 使用
const bot = new ChatBot();

await bot.chat('我叫张三');
// "你好，张三！很高兴认识你。"

await bot.chat('我刚才说我叫什么？');
// "你说你叫张三。"

// 2. Window Memory - 只保留最近 N 条消息
import { BufferWindowMemory } from 'langchain/memory';

const windowMemory = new BufferWindowMemory({
  k: 5 // 只保留最近 5 条消息
});

// 3. Summary Memory - 总结历史对话
import { ConversationSummaryMemory } from 'langchain/memory';

const summaryMemory = new ConversationSummaryMemory({
  llm: new ChatOpenAI({ modelName: 'gpt-3.5-turbo' }),
  maxTokenLimit: 100 // 总结后的最大 token 数
});
```

---

## Vercel AI SDK

Vercel AI SDK 提供了简单易用的 AI 集成方案，特别适合流式 UI。

### 安装

```bash
npm install ai
npm install openai
```

### useChat Hook

```jsx
import { useChat } from 'ai/react';

function ChatComponent() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error
  } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: '1',
        role: 'system',
        content: '你是一个有帮助的助手'
      }
    ],
    onResponse: (response) => {
      console.log('收到响应:', response);
    },
    onFinish: (message) => {
      console.log('完成:', message);
    },
    onError: (error) => {
      console.error('错误:', error);
    }
  });

  return (
    <div className="chat">
      {/* 消息列表 */}
      <div className="messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.role}`}>
            <div className="content">{message.content}</div>
          </div>
        ))}

        {isLoading && <div className="loading">AI 正在思考...</div>}
        {error && <div className="error">错误: {error.message}</div>}
      </div>

      {/* 输入框 */}
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="输入消息..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          发送
        </button>
      </form>
    </div>
  );
}

export default ChatComponent;
```

### 后端 API Route

```javascript
// app/api/chat/route.ts
import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    stream: true,
    messages
  });

  // 转换为流式响应
  const stream = OpenAIStream(response);

  return new StreamingTextResponse(stream);
}
```

### useCompletion Hook

```jsx
import { useCompletion } from 'ai/react';

function CompletionComponent() {
  const {
    completion,
    input,
    handleInputChange,
    handleSubmit,
    isLoading
  } = useCompletion({
    api: '/api/completion'
  });

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={handleInputChange}
          placeholder="输入提示..."
        />
        <button type="submit">生成</button>
      </form>

      {completion && (
        <div className="result">
          <h3>生成结果：</h3>
          <p>{completion}</p>
        </div>
      )}
    </div>
  );
}
```

### 流式 UI

```jsx
import { useChat } from 'ai/react';
import { StreamableUI } from 'ai/rsc';

function StreamingUIChat() {
  const { messages, append } = useChat({
    api: '/api/chat/ui'
  });

  return (
    <div>
      {messages.map((message) => (
        <div key={message.id}>
          {/* 渲染流式 UI 组件 */}
          {message.ui}
        </div>
      ))}
    </div>
  );
}

// API Route
export async function POST(req: Request) {
  const { messages } = await req.json();

  const ui = createStreamableUI();

  (async () => {
    ui.update(<div>思考中...</div>);

    const response = await getAIResponse(messages);

    ui.update(<div>生成结果：{response}</div>);
    ui.done();
  })();

  return ui.value;
}
```

---

## RAG 实现

RAG（Retrieval-Augmented Generation）通过检索相关文档增强 LLM 的回答质量。

### 文档切分

```javascript
/**
 * 文档切分策略
 */
class DocumentSplitter {
  // 1. 固定大小切分
  splitBySize(text, chunkSize = 500, overlap = 50) {
    const chunks = [];

    for (let i = 0; i < text.length; i += chunkSize - overlap) {
      const chunk = text.slice(i, i + chunkSize);
      chunks.push({
        content: chunk,
        metadata: {
          start: i,
          end: i + chunk.length
        }
      });
    }

    return chunks;
  }

  // 2. 按段落切分
  splitByParagraph(text) {
    return text
      .split(/\n\s*\n/)
      .filter(p => p.trim())
      .map((content, index) => ({
        content: content.trim(),
        metadata: { index }
      }));
  }

  // 3. 语义切分（保持语义完整性）
  splitBySemantic(text, maxSize = 500) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      const trimmed = sentence.trim();

      if ((currentChunk + trimmed).length > maxSize && currentChunk) {
        chunks.push({
          content: currentChunk.trim(),
          metadata: {
            sentences: currentChunk.split(/[.!?]+/).length
          }
        });
        currentChunk = trimmed;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + trimmed;
      }
    }

    if (currentChunk) {
      chunks.push({
        content: currentChunk.trim(),
        metadata: {
          sentences: currentChunk.split(/[.!?]+/).length
        }
      });
    }

    return chunks;
  }

  // 4. Markdown 切分（保持结构）
  splitMarkdown(markdown) {
    const sections = [];
    const lines = markdown.split('\n');
    let currentSection = { title: '', content: '', level: 0 };

    for (const line of lines) {
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);

      if (headerMatch) {
        // 保存上一个 section
        if (currentSection.content) {
          sections.push({ ...currentSection });
        }

        // 开始新 section
        currentSection = {
          title: headerMatch[2],
          content: '',
          level: headerMatch[1].length
        };
      } else {
        currentSection.content += line + '\n';
      }
    }

    // 保存最后一个 section
    if (currentSection.content) {
      sections.push(currentSection);
    }

    return sections.map((section, index) => ({
      content: `# ${section.title}\n\n${section.content}`,
      metadata: {
        title: section.title,
        level: section.level,
        index
      }
    }));
  }
}

// 使用
const splitter = new DocumentSplitter();

const text = `
React 是一个用于构建用户界面的 JavaScript 库。它由 Facebook 开发和维护。

React 的主要特点包括：
1. 组件化
2. 虚拟 DOM
3. 单向数据流

React Hooks 是 React 16.8 引入的新特性。它让你在函数组件中使用 state 和其他 React 特性。
`;

const chunks = splitter.splitBySemantic(text, 200);
console.log(chunks);
```

### 向量化存储

```javascript
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

/**
 * 向量存储
 */
class VectorStore {
  constructor(apiKey) {
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: apiKey,
      modelName: 'text-embedding-3-small'
    });
    this.store = null;
  }

  // 添加文档
  async addDocuments(documents) {
    if (!this.store) {
      this.store = await MemoryVectorStore.fromTexts(
        documents.map(d => d.content),
        documents.map(d => d.metadata),
        this.embeddings
      );
    } else {
      await this.store.addDocuments(
        documents.map(d => ({
          pageContent: d.content,
          metadata: d.metadata
        }))
      );
    }
  }

  // 相似度搜索
  async search(query, k = 5) {
    if (!this.store) {
      return [];
    }

    const results = await this.store.similaritySearchWithScore(query, k);

    return results.map(([doc, score]) => ({
      content: doc.pageContent,
      metadata: doc.metadata,
      similarity: score
    }));
  }

  // 带过滤的搜索
  async searchWithFilter(query, filter, k = 5) {
    if (!this.store) {
      return [];
    }

    const results = await this.store.similaritySearch(query, k, filter);

    return results.map(doc => ({
      content: doc.pageContent,
      metadata: doc.metadata
    }));
  }
}

// 使用
const store = new VectorStore(process.env.OPENAI_API_KEY);

// 添加文档
await store.addDocuments([
  {
    content: 'React 是一个用于构建用户界面的 JavaScript 库',
    metadata: { category: 'React', type: 'introduction' }
  },
  {
    content: 'Vue 是一个渐进式 JavaScript 框架',
    metadata: { category: 'Vue', type: 'introduction' }
  },
  {
    content: 'React Hooks 让你在函数组件中使用 state',
    metadata: { category: 'React', type: 'feature' }
  }
]);

// 搜索
const results = await store.search('如何在 React 中使用状态？', 2);
console.log(results);
// [
//   {
//     content: 'React Hooks 让你在函数组件中使用 state',
//     metadata: { category: 'React', type: 'feature' },
//     similarity: 0.89
//   },
//   {
//     content: 'React 是一个用于构建用户界面的 JavaScript 库',
//     metadata: { category: 'React', type: 'introduction' },
//     similarity: 0.72
//   }
// ]

// 带过滤的搜索
const reactDocs = await store.searchWithFilter(
  '框架特点',
  { category: 'React' },
  3
);
```

### 相似度检索

```javascript
/**
 * 混合检索（向量 + 关键词）
 */
class HybridRetriever {
  constructor(vectorStore) {
    this.vectorStore = vectorStore;
  }

  // BM25 关键词检索
  bm25Search(query, documents, k = 5) {
    const queryTerms = this.tokenize(query);
    const scores = documents.map(doc => {
      const docTerms = this.tokenize(doc.content);
      return {
        doc,
        score: this.calculateBM25(queryTerms, docTerms, documents.length)
      };
    });

    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map(item => item.doc);
  }

  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  calculateBM25(queryTerms, docTerms, totalDocs, k1 = 1.5, b = 0.75) {
    // 简化的 BM25 实现
    const avgDocLen = 50;
    const docLen = docTerms.length;

    let score = 0;
    for (const term of queryTerms) {
      const tf = docTerms.filter(t => t === term).length;
      if (tf === 0) continue;

      const idf = Math.log((totalDocs - 1 + 0.5) / (1 + 0.5));
      score += idf * ((tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (docLen / avgDocLen))));
    }

    return score;
  }

  // 混合检索（RRF - Reciprocal Rank Fusion）
  async hybridSearch(query, documents, k = 5) {
    // 向量检索
    const vectorResults = await this.vectorStore.search(query, k * 2);

    // 关键词检索
    const keywordResults = this.bm25Search(query, documents, k * 2);

    // RRF 合并
    const scores = new Map();
    const rrf_k = 60;

    // 向量检索的分数
    vectorResults.forEach((doc, rank) => {
      const id = this.getDocId(doc);
      scores.set(id, (scores.get(id) || 0) + 1 / (rrf_k + rank + 1));
    });

    // 关键词检索的分数
    keywordResults.forEach((doc, rank) => {
      const id = this.getDocId(doc);
      scores.set(id, (scores.get(id) || 0) + 1 / (rrf_k + rank + 1));
    });

    // 排序并返回 top k
    const allDocs = [...vectorResults, ...keywordResults];
    const uniqueDocs = Array.from(
      new Map(allDocs.map(doc => [this.getDocId(doc), doc])).values()
    );

    return uniqueDocs
      .map(doc => ({
        ...doc,
        rrfScore: scores.get(this.getDocId(doc))
      }))
      .sort((a, b) => b.rrfScore - a.rrfScore)
      .slice(0, k);
  }

  getDocId(doc) {
    return doc.metadata?.id || doc.content;
  }
}
```

### 完整 RAG 系统

```javascript
/**
 * 完整的 RAG 系统
 */
class RAGSystem {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.splitter = new DocumentSplitter();
    this.vectorStore = new VectorStore(apiKey);
    this.retriever = null;
    this.model = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: 'gpt-4'
    });
  }

  // 添加文档
  async addDocuments(documents) {
    const allChunks = [];

    for (const doc of documents) {
      // 切分文档
      const chunks = this.splitter.splitBySemantic(doc.content, 500);

      // 添加元数据
      const chunksWithMetadata = chunks.map((chunk, index) => ({
        content: chunk.content,
        metadata: {
          ...doc.metadata,
          ...chunk.metadata,
          chunkIndex: index,
          totalChunks: chunks.length
        }
      }));

      allChunks.push(...chunksWithMetadata);
    }

    // 存储到向量数据库
    await this.vectorStore.addDocuments(allChunks);

    // 初始化混合检索器
    this.retriever = new HybridRetriever(this.vectorStore);
  }

  // 问答
  async ask(question, options = {}) {
    const {
      topK = 3,
      temperature = 0.7,
      includeSource = true
    } = options;

    // 1. 检索相关文档
    const relevantDocs = await this.vectorStore.search(question, topK);

    if (relevantDocs.length === 0) {
      return {
        answer: '抱歉，我无法找到相关信息来回答这个问题。',
        sources: []
      };
    }

    // 2. 构建增强的 prompt
    const context = relevantDocs
      .map((doc, i) => `【文档 ${i + 1}】\n${doc.content}`)
      .join('\n\n');

    const prompt = `
基于以下文档回答问题。如果文档中没有相关信息，请明确说明。

文档：
${context}

问题：${question}

要求：
1. 只基于提供的文档回答
2. 如果文档中没有答案，明确说明
3. 引用具体的文档编号
4. 回答要准确、简洁

回答：
    `;

    // 3. 调用 LLM 生成答案
    const response = await this.model.call([
      {
        role: 'system',
        content: '你是一个知识问答助手，只基于提供的文档回答问题。'
      },
      {
        role: 'user',
        content: prompt
      }
    ]);

    const answer = response.content;

    // 4. 返回结果
    return {
      answer,
      sources: includeSource
        ? relevantDocs.map(doc => ({
            content: doc.content,
            metadata: doc.metadata,
            similarity: doc.similarity
          }))
        : []
    };
  }

  // 对话式问答（保持上下文）
  async chat(question, conversationHistory = []) {
    // 1. 基于对话历史和当前问题生成搜索查询
    const searchQuery = conversationHistory.length > 0
      ? await this.generateSearchQuery(question, conversationHistory)
      : question;

    // 2. 检索相关文档
    const relevantDocs = await this.vectorStore.search(searchQuery, 3);

    // 3. 构建 prompt
    const context = relevantDocs
      .map(doc => doc.content)
      .join('\n\n');

    const messages = [
      {
        role: 'system',
        content: `你是一个知识问答助手。基于以下文档回答用户问题：\n\n${context}`
      },
      ...conversationHistory,
      {
        role: 'user',
        content: question
      }
    ];

    // 4. 生成回答
    const response = await this.model.call(messages);

    return {
      answer: response.content,
      sources: relevantDocs
    };
  }

  async generateSearchQuery(question, history) {
    const prompt = `
基于对话历史，将用户的问题重写为独立的搜索查询。

对话历史：
${history.map(m => `${m.role}: ${m.content}`).join('\n')}

用户问题：${question}

独立的搜索查询：
    `;

    const response = await this.model.call([
      { role: 'user', content: prompt }
    ]);

    return response.content;
  }
}

// 使用示例
const rag = new RAGSystem(process.env.OPENAI_API_KEY);

// 添加文档
await rag.addDocuments([
  {
    content: `
React 是一个用于构建用户界面的 JavaScript 库。

主要特点：
1. 组件化：将 UI 分解为独立、可复用的组件
2. 虚拟 DOM：通过虚拟 DOM 提高性能
3. 单向数据流：数据从父组件流向子组件

React Hooks 是 16.8 版本引入的特性，主要包括：
- useState：在函数组件中使用状态
- useEffect：处理副作用
- useContext：使用 Context
- useMemo：性能优化
    `,
    metadata: {
      title: 'React 基础',
      category: 'React',
      url: '/docs/react/basics'
    }
  },
  {
    content: `
Vue 是一个渐进式 JavaScript 框架。

核心特性：
1. 响应式数据绑定
2. 组件系统
3. 虚拟 DOM

Vue 3 的新特性：
- Composition API：更灵活的代码组织方式
- 更好的 TypeScript 支持
- 性能提升
- Tree-shaking 支持
    `,
    metadata: {
      title: 'Vue 基础',
      category: 'Vue',
      url: '/docs/vue/basics'
    }
  }
]);

// 单次问答
const result1 = await rag.ask('React 有哪些主要特点？');
console.log('答案:', result1.answer);
console.log('来源:', result1.sources);

// 对话式问答
let history = [];

const answer1 = await rag.chat('Vue 3 有什么新特性？', history);
history.push(
  { role: 'user', content: 'Vue 3 有什么新特性？' },
  { role: 'assistant', content: answer1.answer }
);

const answer2 = await rag.chat('和 React Hooks 有什么区别？', history);
console.log(answer2.answer);
```

---

## 前端 AI 应用案例

### 1. 智能客服

```jsx
import { useChat } from 'ai/react';
import { useState } from 'react';

function SmartCustomerService() {
  const [userInfo, setUserInfo] = useState({
    orderId: null,
    productId: null
  });

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/customer-service',
    body: {
      context: userInfo
    },
    onResponse: async (response) => {
      // 提取用户信息
      const data = await response.json();
      if (data.extractedInfo) {
        setUserInfo(prev => ({ ...prev, ...data.extractedInfo }));
      }
    }
  });

  return (
    <div className="customer-service">
      <div className="header">
        <h2>智能客服</h2>
        {userInfo.orderId && (
          <span>订单号: {userInfo.orderId}</span>
        )}
      </div>

      <div className="messages">
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="请描述您的问题..."
        />
        <button type="submit">发送</button>
      </form>

      {/* 快捷回复 */}
      <QuickReplies
        onSelect={(text) => {
          handleInputChange({ target: { value: text } });
          handleSubmit(new Event('submit'));
        }}
      />
    </div>
  );
}

function QuickReplies({ onSelect }) {
  const replies = [
    '查询订单状态',
    '申请退款',
    '修改收货地址',
    '联系人工客服'
  ];

  return (
    <div className="quick-replies">
      {replies.map((reply) => (
        <button key={reply} onClick={() => onSelect(reply)}>
          {reply}
        </button>
      ))}
    </div>
  );
}

// API Route
export async function POST(req: Request) {
  const { messages, context } = await req.json();

  // 系统提示词
  const systemPrompt = `
你是一个专业的客服助手。

当前用户信息：
${context.orderId ? `订单号: ${context.orderId}` : ''}
${context.productId ? `商品ID: ${context.productId}` : ''}

你的职责：
1. 友好、专业地回答用户问题
2. 从用户消息中提取订单号、商品ID等信息
3. 根据问题类型提供相应解决方案
4. 必要时转接人工客服

常见问题处理：
- 查询订单：调用订单查询接口
- 退款申请：引导用户填写退款表单
- 修改地址：提醒注意事项
- 其他问题：提供解决方案或转人工
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages
    ]
  });

  const stream = OpenAIStream(response, {
    onFinal: async (completion) => {
      // 提取信息
      const extractedInfo = extractInfo(completion);
      // 存储到数据库
      await saveConversation(context, messages, completion);
    }
  });

  return new StreamingTextResponse(stream);
}

function extractInfo(text: string) {
  const orderIdMatch = text.match(/订单号[:：]\s*(\d+)/);
  const productIdMatch = text.match(/商品ID[:：]\s*(\d+)/);

  return {
    orderId: orderIdMatch?.[1],
    productId: productIdMatch?.[1]
  };
}
```

### 2. 代码解释器

```jsx
import { useState } from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js';

function CodeExplainer() {
  const [code, setCode] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);

  const explainCode = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/explain-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      const data = await response.json();
      setExplanation(data.explanation);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="code-explainer">
      <div className="input-section">
        <h3>输入代码：</h3>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="粘贴代码..."
          rows={15}
        />
        <button onClick={explainCode} disabled={!code || loading}>
          {loading ? '分析中...' : '解释代码'}
        </button>
      </div>

      {explanation && (
        <div className="explanation-section">
          <h3>代码解释：</h3>
          <div
            className="markdown"
            dangerouslySetInnerHTML={{
              __html: marked(explanation)
            }}
          />
        </div>
      )}
    </div>
  );
}

// API
export async function POST(req: Request) {
  const { code } = await req.json();

  const prompt = `
请详细解释以下代码：

\`\`\`
${code}
\`\`\`

请按以下格式回答：

## 功能概述
[简要说明代码的主要功能]

## 逐行解释
[逐行或逐块解释代码]

## 关键概念
[解释用到的重要概念、模式或技术]

## 潜在问题
[指出可能存在的问题或改进点]

## 优化建议
[给出优化建议和示例代码]
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: '你是一个资深的程序员，擅长解释代码和教学。'
      },
      {
        role: 'user',
        content: prompt
      }
    ]
  });

  return Response.json({
    explanation: response.choices[0].message.content
  });
}
```

### 3. 文档问答

```jsx
function DocQA() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/doc-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });

      const data = await response.json();
      setAnswer(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="doc-qa">
      <div className="search-box">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
          placeholder="问我任何关于文档的问题..."
        />
        <button onClick={askQuestion} disabled={!question || loading}>
          搜索
        </button>
      </div>

      {answer && (
        <div className="answer-section">
          <h3>回答：</h3>
          <div className="answer">{answer.answer}</div>

          <h4>相关文档：</h4>
          <div className="sources">
            {answer.sources.map((source, i) => (
              <SourceCard key={i} source={source} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SourceCard({ source }) {
  return (
    <div className="source-card">
      <h5>{source.metadata.title}</h5>
      <p className="excerpt">{source.content.slice(0, 150)}...</p>
      <div className="metadata">
        <span>相似度: {(source.similarity * 100).toFixed(1)}%</span>
        <a href={source.metadata.url} target="_blank">
          查看完整文档 →
        </a>
      </div>
    </div>
  );
}
```

### 4. 图片生成应用

```jsx
import { useState } from 'react';

function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateImage = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          n: 4, // 生成 4 张图片
          size: '1024x1024'
        })
      });

      const data = await response.json();
      setImages(data.images);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="image-generator">
      <div className="input-section">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="描述你想要生成的图片..."
          rows={4}
        />

        <div className="controls">
          <button onClick={generateImage} disabled={!prompt || loading}>
            {loading ? '生成中...' : '生成图片'}
          </button>
        </div>
      </div>

      <div className="images-grid">
        {images.map((image, i) => (
          <div key={i} className="image-card">
            <img src={image.url} alt={`Generated ${i + 1}`} />
            <div className="actions">
              <button onClick={() => downloadImage(image.url)}>
                下载
              </button>
              <button onClick={() => regenerate(i)}>
                重新生成
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// API
export async function POST(req: Request) {
  const { prompt, n = 1, size = '1024x1024' } = await req.json();

  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt,
    n,
    size
  });

  return Response.json({
    images: response.data
  });
}
```

---

## 本地部署 LLM（Ollama）

### 安装 Ollama

```bash
# macOS / Linux
curl https://ollama.ai/install.sh | sh

# Windows
# 下载安装包：https://ollama.ai/download
```

### 使用 Ollama

```bash
# 下载模型
ollama pull llama2
ollama pull codellama
ollama pull mistral

# 运行模型
ollama run llama2

# 查看已安装的模型
ollama list
```

### 在前端使用 Ollama

```javascript
/**
 * Ollama API 客户端
 */
class OllamaClient {
  constructor(baseURL = 'http://localhost:11434') {
    this.baseURL = baseURL;
  }

  async chat(messages, model = 'llama2') {
    const response = await fetch(`${this.baseURL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: false
      })
    });

    const data = await response.json();
    return data.message.content;
  }

  async chatStream(messages, onChunk, model = 'llama2') {
    const response = await fetch(`${this.baseURL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: true
      })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (data.message?.content) {
            onChunk(data.message.content);
          }
        } catch (e) {
          console.error('Parse error:', e);
        }
      }
    }
  }

  async generate(prompt, model = 'llama2') {
    const response = await fetch(`${this.baseURL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false
      })
    });

    const data = await response.json();
    return data.response;
  }
}

// 使用
const ollama = new OllamaClient();

// 普通对话
const answer = await ollama.chat([
  { role: 'user', content: '什么是 React？' }
], 'llama2');

// 流式对话
await ollama.chatStream(
  [{ role: 'user', content: '解释闭包' }],
  (chunk) => {
    console.log(chunk);
  },
  'llama2'
);

// 代码生成
const code = await ollama.generate(
  '用 JavaScript 实现一个防抖函数',
  'codellama'
);
```

---

## 面试题

**1. 什么是 RAG？它解决了什么问题？**

答案要点：
- RAG（Retrieval-Augmented Generation）检索增强生成
- 解决 LLM 知识更新和幻觉问题
- 工作流程：检索相关文档 → 增强 Prompt → 生成答案
- 优势：最新知识、减少幻觉、可追溯来源

**2. 如何实现一个文档问答系统？**

关键步骤：
1. 文档预处理和切分
2. 向量化存储
3. 相似度检索
4. 构建增强 Prompt
5. LLM 生成答案

**3. LangChain 的 Chain、Agent、Memory 分别是什么？**

- Chain：组合多个操作的流程
- Agent：可以自主决策使用工具的智能体
- Memory：保持对话上下文的机制

**4. 如何优化 RAG 系统的检索质量？**

- 文档切分策略优化
- 混合检索（向量 + 关键词）
- Reranking 重排序
- Query 改写
- 元数据过滤

**5. 本地部署 LLM 的优缺点？**

优点：
- 数据隐私
- 无需网络
- 成本可控

缺点：
- 需要硬件资源
- 性能可能不如云端模型
- 模型更新滞后

---

## 总结

本文介绍了：

1. **Prompt Engineering**
   - Few-Shot / Zero-Shot Learning
   - Chain of Thought
   - 角色扮演

2. **LangChain.js**
   - Chains（链）
   - Agents（代理）
   - Memory（记忆）

3. **Vercel AI SDK**
   - useChat / useCompletion
   - 流式 UI

4. **RAG 实现**
   - 文档切分
   - 向量化存储
   - 相似度检索

5. **实际应用**
   - 智能客服
   - 代码解释器
   - 文档问答
   - 图片生成

6. **本地部署**
   - Ollama 使用

掌握这些技术，你就能构建强大的 AI 应用！
