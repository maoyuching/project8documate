@echo off
chcp 65001 >nul
echo ==============================
echo 材料写作辅助器 - 启动脚本
echo ==============================
echo.

REM 检查 Node.js 是否安装
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 错误: 未检测到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

node -v
npm -v
echo.

REM 安装后端依赖
echo 正在安装后端依赖...
cd backend
if not exist "node_modules" (
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo 错误: 后端依赖安装失败
        pause
        exit /b 1
    )
)
echo 后端依赖安装完成
echo.

REM 安装前端依赖
echo 正在安装前端依赖...
cd ..\frontend
if not exist "node_modules" (
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo 错误: 前端依赖安装失败
        pause
        exit /b 1
    )
)
echo 前端依赖安装完成
echo.

REM 启动后端服务
echo 正在启动后端服务 (端口 3000)...
cd ..\backend
start "后端服务" cmd /k npm start
echo.

REM 等待后端启动
timeout /t 2 /nobreak >nul

REM 启动前端服务
echo 正在启动前端服务 (端口 5173)...
cd ..\frontend
start "前端服务" cmd /k npm run dev
echo.

echo ==============================
echo 服务已启动!
echo ==============================
echo 后端服务: http://localhost:3000
echo 前端页面: http://localhost:5173
echo.
echo 请在各自的窗口中按 Ctrl+C 停止服务
echo.
pause
