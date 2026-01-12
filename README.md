# 材料写作辅助器 (Documate)

一个基于 Node.js 和 Vue 3 的材料写作辅助工具，通过 AI 服务帮助用户生成高质量的文档材料。

## 功能特点

- ✅ **任务目标设定**：明确定义写作任务和目标
- ✅ **参考资料管理**：添加多个参考资料，并说明其用途
- ✅ **风格参考管理**：添加风格参考示例，指导 AI 生成符合要求的内容
- ✅ **AI 服务集成**：支持配置任意兼容 OpenAI API 格式的 AI 服务
- ✅ **可折叠界面**：所有输入区域均可折叠，便于管理
- ✅ **自动编号**：列表项自动编号
- ✅ **结果复制**：一键复制生成结果

## 技术栈

- **后端**: Node.js + Express
- **前端**: Vue 3 + Vite
- **HTTP 客户端**: Axios
- **样式**: 原生 CSS

## 系统要求

- Node.js 14+ 
- npm 6+

## 快速开始

### 方式一：使用启动脚本（推荐）

**Linux/Mac:**
```bash
./start.sh
```

**Windows:**
```bash
start.bat
```

启动脚本会自动：
1. 检查 Node.js 环境
2. 安装必要的依赖（首次运行）
3. 启动后端服务（端口 3000）
4. 启动前端服务（端口 5173）

### 方式二：手动启动

**安装依赖:**
```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

**启动服务:**

在两个终端窗口中分别运行：

```bash
# 终端 1: 启动后端
cd backend
npm start

# 终端 2: 启动前端
cd frontend
npm run dev
```

## 访问应用

服务启动后，在浏览器中访问：

- 前端页面：http://localhost:5173
- 后端 API：http://localhost:3000

## 使用说明

1. **配置 AI 服务**：
   - 在"AI 服务配置"区域填写：
     - API URL（例如：https://api.openai.com/v1/chat/completions）
     - API Key
     - Model（例如：gpt-3.5-turbo）

2. **填写任务目标**：
   - 在"任务目标"区域描述您要完成的写作任务

3. **添加参考资料**（可选）：
   - 点击"+ 添加参考资料"按钮
   - 填写参考内容和用途说明
   - 可添加多个参考资料

4. **添加风格参考**（可选）：
   - 点击"+ 添加风格参考"按钮
   - 填写风格示例和用途说明
   - 可添加多个风格参考

5. **生成内容**：
   - 点击"生成内容"按钮
   - 等待 AI 生成结果
   - 查看生成结果并可一键复制

## 项目结构

```
project8documate/
├── backend/              # 后端服务
│   ├── package.json     # 后端依赖配置
│   └── server.js        # Express 服务器
├── frontend/            # 前端应用
│   ├── src/
│   │   ├── App.vue     # 主应用组件
│   │   └── main.js     # 应用入口
│   ├── index.html      # HTML 模板
│   ├── package.json    # 前端依赖配置
│   └── vite.config.js  # Vite 配置
├── start.sh            # Linux/Mac 启动脚本
├── start.bat           # Windows 启动脚本
└── README.md           # 项目文档
```

## API 接口

### POST /api/generate

生成材料内容

**请求体:**
```json
{
  "taskGoal": "任务目标描述",
  "referenceMaterials": [
    {
      "content": "参考材料内容",
      "usage": "参考用途说明"
    }
  ],
  "styleReferences": [
    {
      "content": "风格参考内容",
      "usage": "参考用途说明"
    }
  ],
  "aiConfig": {
    "url": "https://api.openai.com/v1/chat/completions",
    "apiKey": "your-api-key",
    "model": "gpt-3.5-turbo"
  }
}
```

**响应:**
```json
{
  "success": true,
  "result": "生成的内容..."
}
```

### GET /api/health

健康检查接口

**响应:**
```json
{
  "status": "ok"
}
```

## 注意事项

- 确保您的 AI 服务 API 支持 OpenAI 兼容的接口格式
- API Key 请妥善保管，不要泄露给他人
- 生成时间取决于 AI 服务的响应速度和内容复杂度
- 后端服务超时时间设置为 60 秒

## 故障排查

**Q: 服务启动失败？**
- 检查 Node.js 是否正确安装（运行 `node -v` 和 `npm -v`）
- 检查端口 3000 和 5173 是否被占用

**Q: 生成失败？**
- 检查 AI 服务配置是否正确
- 检查网络连接是否正常
- 检查 API Key 是否有效
- 查看浏览器控制台和后端日志获取详细错误信息

**Q: 前端无法连接后端？**
- 确保后端服务已启动（访问 http://localhost:3000/api/health）
- 检查是否有 CORS 问题（后端已配置 CORS）

## 许可证

ISC
