# Quiet Crow - 端到端加密聊天应用

基于 Electron + Vue 3 + TypeScript 的安全聊天应用

## 📚 文档导航

**[📖 完整文档](./docs/README.md)** - 查看所有项目文档

### 快速链接

- [API 集成指南](./docs/API集成指南.md) - API 使用详细指南
- [API 测试指南](./docs/API测试指南.md) - API 功能测试方法
- [CSP 问题修复说明](./docs/CSP问题修复说明.md) - Content Security Policy 配置

## 🚀 快速开始

### 环境要求

- Node.js 20.x+
- npm 10.x+

### 安装依赖

```bash
npm install
```

### 配置环境

复制环境变量模板：

```bash
cp .env.example .env.development
```

编辑 `.env.development` 配置开发环境后端地址：

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080/ws
```

### 开发模式

```bash
npm run dev
```

### 生产构建

配置生产环境（编辑 `.env.production`）：

```env
VITE_API_BASE_URL=https://api.your-domain.com
VITE_WS_URL=wss://api.your-domain.com/ws
```

构建应用：

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

## 🎯 主要功能

- ✅ 用户认证（注册/登录）
- ✅ 端到端加密消息
- ✅ 实时通讯（WebSocket）
- ✅ 会话管理（私聊/群聊）
- ✅ 好友管理
- ✅ 消息历史
- ⏳ 文件传输
- ⏳ 语音/视频通话

## 🛠️ 技术栈

### 前端

- **框架**: Electron + Vue 3
- **语言**: TypeScript
- **状态管理**: Pinia
- **路由**: Vue Router
- **样式**: Tailwind CSS
- **HTTP**: Axios
- **WebSocket**: SockJS + STOMP
- **加密**: crypto-js

### 后端

- **框架**: Spring Boot
- **数据库**: MySQL
- **缓存**: Redis
- **WebSocket**: Spring WebSocket
- **加密**: AES-ECB

## 📁 项目结构

```
src/
├── main/                   # Electron 主进程
├── preload/               # 预加载脚本
└── renderer/              # 渲染进程（Vue 应用）
    └── src/
        ├── app/           # 应用配置
        ├── entities/      # 实体和状态管理
        ├── features/      # 功能模块
        ├── pages/         # 页面组件
        ├── shared/        # 共享资源
        │   ├── api/       # API 服务
        │   ├── config/    # 配置文件
        │   ├── lib/       # 工具库
        │   └── types/     # 类型定义
        └── widgets/       # 复合组件
```

## 🔧 开发工具

### 推荐 IDE

- [VSCode](https://code.visualstudio.com/)

### 推荐插件

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
- [Vue DevTools](https://devtools.vuejs.org/)

### 可用脚本

```bash
# 开发
npm run dev

# 类型检查
npm run typecheck

# 代码检查
npm run lint

# 代码格式化
npm run format

# 构建
npm run build

# 打包
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

## 🔐 安全特性

- 端到端加密（AES-ECB）
- Token 认证
- 安全存储
- HTTPS/WSS 支持

## 📖 详细文档

查看 [文档导航.md](./文档导航.md) 获取完整文档列表

## 🤝 贡献

欢迎提交 Issue 和 Pull Request

## 📄 许可证

MIT License

---

**开发状态**: 🚧 开发中  
**最后更新**: 2024-02-27
