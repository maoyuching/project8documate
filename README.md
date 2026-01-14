# 写材料助手 (Material Writing Assistant)

一个基于 Electron 的 AI 辅助写作工具，帮助用户快速生成高质量的材料文档。

## 技术栈

- **Node.js** - JavaScript 运行时
- **Electron** - 跨平台桌面应用框架
- **Electron Forge** - Electron 应用打包工具
- **Vite** - 现代前端构建工具
- **Vue 3** - 渐进式 JavaScript 框架
- **Element Plus** - Vue 3 UI 组件库
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Lucide Icons** - 美观的图标库

## 功能特性

### 📝 会话管理
- 创建、选择和删除会话
- 每个会话独立保存任务目标、参考资料和生成结果
- 自动保存到本地存储

### 🎯 任务配置
- **任务目标**：描述要生成的材料
- **参考资料**：添加多个参考文档，指定用途
- **风格参考**：添加风格示例，保持文档风格一致

### 🤖 AI 生成
- 支持多种 AI 服务（OpenAI、Claude、国内大模型等）
- 可配置 API URL、API Key 和模型
- 测试连接功能确保配置正确
- 模拟数据模式用于测试

### 📊 结果管理
- 保存历史生成版本
- 版本选择和对比
- 一键复制生成内容

## 安装和运行

### 前置要求
- Node.js 16.x 或更高版本
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm start
```

### 打包应用

```bash
# 打包当前平台
npm run package

# 制作安装包
npm run make
```

## 使用指南

### 1. 配置 AI 服务

首次使用时，点击右上角的设置按钮（齿轮图标），配置 AI 服务：

- **API URL**：AI 服务的 API 端点地址
- **API Key**：您的 API 密钥
- **模型**：要使用的模型名称（如 gpt-4）

配置完成后，可以点击"测试连接"按钮验证配置是否正确。

### 2. 创建会话

点击左侧边栏顶部的"新建会话"按钮创建新会话。

### 3. 输入任务信息

- **任务目标**：详细描述您要生成的材料内容和要求
- **参考资料**：添加相关参考文档，说明用途（如：作为论据支持、参考文风等）
- **风格参考**：添加风格示例，AI 将模仿该风格生成内容

### 4. 生成材料

点击"生成材料"按钮，AI 将根据您提供的信息生成材料。

如果只是想测试功能，可以勾选"使用模拟数据"选项。

### 5. 查看和管理结果

- 生成结果会显示在右侧面板
- 可以通过版本选择器切换不同的生成版本
- 点击"复制"按钮将内容复制到剪贴板

## 项目结构

```
project8documate/
├── src/
│   ├── main/           # Electron 主进程
│   │   └── index.js    # 主进程入口，IPC 处理
│   ├── preload/        # 预加载脚本
│   │   └── preload.js  # 上下文隔离桥接
│   └── renderer/       # 渲染进程（Vue 应用）
│       ├── components/ # Vue 组件
│       │   ├── MaterialForm.vue      # 材料输入表单
│       │   ├── ReferenceList.vue     # 参考资料列表
│       │   ├── ResultDisplay.vue     # 结果展示
│       │   └── SettingsModal.vue     # 设置对话框
│       ├── App.vue     # 主应用组件
│       ├── main.js     # Vue 应用入口
│       ├── index.html  # HTML 模板
│       └── style.css   # 全局样式
├── forge.config.js     # Electron Forge 配置
├── vite.*.config.js    # Vite 配置文件
├── tailwind.config.js  # Tailwind CSS 配置
└── package.json        # 项目配置和依赖
```

## 数据存储

所有数据都存储在浏览器的 localStorage 中：

- **sessions**：会话列表和内容
- **aiSettings**：AI 服务配置

数据仅存储在本地，不会上传到任何服务器。

## 安全说明

- API Key 仅存储在本地，不会发送到除 AI 服务提供商以外的任何服务器
- 所有数据处理都在本地完成
- 请妥善保管您的 API Key

## 许可证

ISC

## 贡献

欢迎提交 Issue 和 Pull Request！

