@echo off
setlocal
title NCT Cinema - Cai dat cong cu portable
echo Tai JDK 21 (va Node.js neu may chua co) vao thu muc tools\ cua du an.
echo Khong cai vao he thong, khong sua PATH. Can Internet, khoang 200-250 MB.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\setup-portable.ps1" %*
set CODE=%ERRORLEVEL%
if not "%CODE%"=="0" echo [LOI] Cai dat that bai ^(ma %CODE%^).
pause
exit /b %CODE%
