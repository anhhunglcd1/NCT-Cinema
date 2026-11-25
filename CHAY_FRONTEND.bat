@echo off
setlocal EnableExtensions
title NCT Cinema - Frontend
set "TOOLS=%~dp0tools"
cd /d "%~dp0frontend"

rem Uu tien Node portable trong tools\node; tu tai neu may chua co Node va repo da co script setup.
if not exist "%TOOLS%\node\node.exe" (
  where node >nul 2>nul
  if errorlevel 1 if exist "%~dp0scripts\setup-portable.ps1" (
    echo Chua co Node, dang tai Node portable vao thu muc tools\...
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\setup-portable.ps1"
  )
)
if not exist "%TOOLS%\node\node.exe" goto :check_node
set "PATH=%TOOLS%\node;%PATH%"

:check_node
where node >nul 2>nul
if errorlevel 1 (
  echo [LOI] Chua co Node.js. Chay scripts\setup-portable.ps1 de tai Node portable vao thu muc tools\.
  pause
  exit /b 1
)

rem Cache npm de trong tools\npm-cache, khong ghi vao thu muc nguoi dung.
set "npm_config_cache=%TOOLS%\npm-cache"

if not exist "node_modules\.bin\next.cmd" (
  echo Dang cai thu vien lan dau ^(npm ci^)...
  call npm.cmd ci --no-audit --no-fund
  if errorlevel 1 (
    echo [LOI] Cai thu vien that bai. Kiem tra ket noi Internet.
    pause
    exit /b 1
  )
)

echo Frontend: http://localhost:3000  ^(can backend dang chay tai 127.0.0.1:8080^)
call npm.cmd run dev
pause
