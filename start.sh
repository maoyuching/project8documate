#!/bin/bash

echo "=============================="
echo "材料写作辅助器 - 启动脚本"
echo "=============================="
echo ""

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "错误: 未检测到 Node.js，请先安装 Node.js"
    exit 1
fi

echo "Node.js 版本: $(node -v)"
echo "npm 版本: $(npm -v)"
echo ""

# 安装后端依赖
echo "正在安装后端依赖..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo "错误: 后端依赖安装失败"
        exit 1
    fi
fi
echo "后端依赖安装完成"
echo ""

# 安装前端依赖
echo "正在安装前端依赖..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo "错误: 前端依赖安装失败"
        exit 1
    fi
fi
echo "前端依赖安装完成"
echo ""

# 启动后端服务
echo "正在启动后端服务 (端口 3000)..."
cd ../backend
npm start &
BACKEND_PID=$!
echo "后端服务 PID: $BACKEND_PID"
echo ""

# 等待后端启动
sleep 2

# 启动前端服务
echo "正在启动前端服务 (端口 5173)..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!
echo "前端服务 PID: $FRONTEND_PID"
echo ""

echo "=============================="
echo "服务已启动!"
echo "=============================="
echo "后端服务: http://localhost:3000"
echo "前端页面: http://localhost:5173"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

# 等待进程
wait $BACKEND_PID $FRONTEND_PID
